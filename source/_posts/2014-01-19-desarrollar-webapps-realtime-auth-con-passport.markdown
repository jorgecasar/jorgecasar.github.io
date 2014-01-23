---
layout: post
title: "Desarrollar Webapps Realtime: Auth con Passport"
date: 2014-01-19 19:39:54 +0100
comments: true
categories: SailsJS
tags:
- Javascript
- NodeJS
- Framework
- Real-time
- Webapp
- Auth
- Passport
---

<div class="alert alert-info">
	<p>Código en GitHub: <a href="https://github.com/jorgecasar/building-realtime-webapp">building-realtime-webapp</a>. Release: <code>auth-passport</code>.</p>
	<p>Entorno de desarrollo en Heroku: <a href="http://building-realtime-webapp-dev.herokuapp.com/">building-realtime-webapp</a>.</p>
</div>

{% img center http://sailsjs.org/images/image_squidhome.png 'Designed for developers by Giant Squid' 'Giant Squid' %}

* list element with functor item
{:toc}

En el artículo anterior vimos [cómo implementar un sistema de autenticación básica](/blog/desarrollar-webapps-realtime-auth/), y en esta ocasión vamos a implementar el sistema de autenticación usando [Passport](http://passportjs.org/). Passport es un middleware de autenticación para Node nos permitirá modularizar la autenticación de usuarios en nuestra aplicación y realizar inicio de sesión único con OAuth como Facebook o Twitter.

<!-- more -->

## Instalar y configurar Passport

Lo primero que tenemos que hacer es instalar Passport y los módulos que vayamos a utilizar. Empezaremos con una autenticación contra nuestra base de datos, así que necesitamos:

	npm install --save passport passport-local

Passport por defecto buscará en las peticiones el parámetro `username` y `password`, aunque podríamos cambiarlo, hemos optado por incluir el atributo `username` al modelo `User` (queda mejor que mostrar el email y podremos jugar con las rutas y el user name más adelante).

<div class="alert alert-success">
	<p>Recomiendo echarle un ojo a la <a href="http://passportjs.org/guide/username-password/">Documentación de Passport local</a>.</p>
</div>

Una vez instalado creamos un fichero de configuración en el directorio `config`llamado `passport.js`, el cual será cargado por Sails automáticamente al lanzar el servidor. Para no copiar todo el fichero aquí puesto que está disponible en GitHub voy a destacar lo más importante. Indicamos a passport que use una estrategia local, buscando un usuario cuyo `username` o `email` coincida con el campo username de nuestro fomulario de login. Una vez encontrado el usuario comparamos las contraseñas y devolvemos el usuario.

```javascript config/passport.js
passport.use(new LocalStrategy(
	// options by default not needed.
	//{
	//	usernameField: 'username',
	//	passwordField: 'password'
	//},
	function(username, password, done) {
		process.nextTick(function () {
			User.findOne().where({
				or: [
					{ username: username },
					{ email: username }
				]
			}).done(function(err, user) {
				if (err) { return done(null, err); }
				if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
				bcrypt.compare(password, user.password, function(err, res) {
					if (!res) return done(null, false, { message: 'Invalid Password'});
					return done(null, user, { message: 'Logged In Successfully'} );
				});
			})
		});
	}
));
```
Unas lineas más abajo cerramos el fichero `passport.js` declarando el middleware de Express y asignando a las variables locales el usuario que devolvimos en el fragmento de código anterior:

```javascript auth/passport.js
module.exports = {
	express: {
		customMiddleware: function(app){
			sails.log.info('Express midleware for passport');
			app.use(passport.initialize());
			app.use(passport.session());
			app.use(function(req,res,next){
				res.locals.loggedUser = req.user;
				next();
			});
		}
	}
};
```

## Acciones `Login` y `Logout`

Ahora que tenemos configurado Sails para usar Passport realizamos los cambios en el controlador `UserController` para utilizar este nuevo medio de autenticación. Nuestras acciones `login` y `logout`quedan mucho más reducidas puesto que gran parte del trabajo lo hace Passport con las funciones `login` y `logout` que trae implementadas.

```javascript api/controllers/UserController.js
[…]
login: function(req, res, next) {
	// Use Passport LocalStrategy
	require('passport').authenticate('local', function(err, user, info){
		if ((err) || (!user)) next(err);
		req.login(user, function(err){
			if (err) return res.redirect('/user/auth');
			// Redirect to the user page.
			return res.redirect('/user/' + user.id);
		});
	})(req, res);
},
logout: function(req, res){
	// Call Passport method to destroy the session.
	req.logout();
	// Redirect to home page.
	return res.redirect('/');
}
[…]
```

## Políticas

Como Passport nos facilita unos cuantos métodos para gestionar la autenticación del usuario vamos a aprovecharlos para usarlos en nuestras políticas. El primero de ellos es el método `isAuthenticated()`, el cual utilizaremos en la política con dicho nombre:

```javascript api/policies/isAuthenticated.js
module.exports = function(req, res, next) {
	if ( req.isAuthenticated() ) return next();
	return res.forbidden('You are not permitted to perform this action.');
};
```

Y otra de las tareas que automatiza es guardar el usuario registrado en la variable `req.user`, la cual usaremos para comprobar si puede administrar un usuario concreto.

```javascript api/policies/canAdminUser.js
module.exports = function(req, res, next) {
	if (req.param('id') === req.user.id) return next();
	return res.forbidden('You are not permitted to perform this action.');
};
```

## Actualización de vistas

Y los últimos cambios que debemos realizar son en las vistas, los cuales enumero:

* En los condicionales ya no usaremos `session.authenticated`, si no `loggedUser`.
* Para obtener los datos del usuario registrado utilizaremos `loggedUser` en lugar de `session.user`.
* En el formulario de autenticación, utilizaremos los campos `username` y `password`, indicando que el nombre de usuario puede ser también el correo-e.
* Añadiremos el campo `username` al formulario de registro y de edición.
* Mostraremos el nombre de usuario en lugar del mail en la ficha de usuario y en la barra de navegación.


<div class="alert alert-info">
	<p>Commit en GitHub: <a href="https://github.com/jorgecasar/building-realtime-webapp/commit/0c201f963d93f667622a7eb923ff9315a5503e4d">0c201f963d: Auth with Passport. Username attr added.</a></p>
	<p>Commit en GitHub: <a href="https://github.com/jorgecasar/building-realtime-webapp/commit/34736d85b48333b0b17bb614f965bce351a0fb5a">34736d85b4: Fix session.canAdminUser using req.user. And login user on create.</a></p>
</div>

<div class="alert alert-info">
	<p>Código en GitHub: <a href="https://github.com/jorgecasar/building-realtime-webapp">building-realtime-webapp</a>. Release: <code>auth-passport</code>.</p>
	<p>Entorno de desarrollo en Heroku: <a href="http://building-realtime-webapp-dev.herokuapp.com/">building-realtime-webapp</a>.</p>
</div>

