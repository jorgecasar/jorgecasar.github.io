---
layout: post
title: "Desarrollar Webapps Realtime: Auth"
date: 2014-01-18 12:40:04 +0100
comments: true
categories: NodeJS
tags:
- javascript
- Heroku
- sails
- framework
- realtime
- webapp
- auth
---

<div class="alert alert-info">
	<p>Código en GitHub: <a href="https://github.com/jorgecasar/building-realtime-webapp">building-realtime-webapp</a>. Release: <code>auth</code>.</p>
	<p>Entorno de desarrollo en Heroku: <a href="http://building-realtime-webapp-dev.herokuapp.com/">building-realtime-webapp</a>.</p>
</div>

{% img center http://sailsjs.org/images/image_squidhome.png 'Designed for developers by Giant Squid' 'Giant Squid' %}

* list element with functor item
{:toc}

Siguiendo con la saga de "Desarrollar Webapps Realtime" y depués de haber visto [Cómo empezar a crear un Webapp real-time](/blog/desarrollar-webapps-realtime-creacion) y [cómo crear usuarios siguiendo el patrón MVC](/blog/desarrollar-webapps-realtime-usuarios), le toca el turno a cómo autenticar a los usuarios en nuestra plataforma. Para ello vamos a hacerlo primero con nuestros propios medios para entender algunos conceptos y después lo haremos usando [Passport for Node](http://passportjs.org/).
<!-- more -->

## Cambios en el layout

Lo primero que vamos a hacer es cambiar la barra de navegación añadiendo el botón de login cuando el usuario no esté autenticado y su correo y el boton de logout cuando si lo esté. Para ello debemos comprobar la variable `session.authenticated` que estableceremos en el controlador. Estas líneas las añadimos después de nuestro menú de navegación, `<ul class="nav navbar-nav">[…]</ul>`:

```html layout.ejs
<% if( session.authenticated ) { %>
<ul class="nav navbar-nav navbar-right">
	<li><a href="/user/<%= session.user.id %>"><%= session.user.email %></a></li>
	<li>
		<form class="navbar-form" action="/user/logout" method="POST">
			<button type="submit" class="btn btn-danger" title="<%= __('Logout')%>">
				<%= __('Logout')%>
				<span class="glyphicon glyphicon-log-out"></span>
			</button>
		</form>
	</li>
</ul>
<% } else { %>
<ul class="nav navbar-nav navbar-right">
	<li><a href="/user/new"><span class="glyphicon glyphicon-edit"></span> Sign up</a></li>
	<li><a href="/user/auth"><span class="glyphicon glyphicon-log-in"></span> Login</a></li>
</ul>
<% } %>
```

Si os fijáis para crear un nuevo usuario y para la página de autenticación he usado enlaces pero para el log out he usado un formulario con un botón. Esto es porque en los enlaces se utilizan para navegar y los botones para acciones.

## Autenticación básica

Para gestionar las sesiones necesitaremos las acciones `auth`, `login` y `logout`. Estas acciones las vamos a añadir en `UserController`, aunque podrían ir en un nuevo controlador llamado `SessionController`. Como posteriormente vamos a implementar la autenticación con Passport lo moveremos a un controlador especifico llamado `AuthController`.

### Acción `auth`

Esta acción simplemente nos devolverá una vista con el formulario de autenticación. Así que habrá que crear la vista `/view/user/auth.ejs` en la que le solicitaremos el email y la contraseña. Esta vista es muy similar a `/view/user/new.ejs`, así que podemos copiar y pegar el contenido y hacemos un par de cambios:

* El action del from ya no es `/user/create` sino `/user/login`.
* Los 3 textos (migas de pan, título y botón) donde pone 'Create user' ponemos 'Auth user'.

Y en el controlador copiamos la acción new sin hacer ningún cambio.

```javascript auth action in UserController.js
auth: function(req, res) {
	return res.view();
}
```

Ahora podemos lanzar el servidor y comprobar que la url [http://localhost:1337/user/auth](http://localhost:1337/user/auth) funciona correctamente.

### Acción `Login`

En esta acción hay un poco más de chicha, ya que tendremos que buscar el usuario mediante el email, comparar la contraseña y guardar una variable de sessión.

```javascript login action in UserController.js
login: function(req, res) {
	User.findOne({email: req.param('email')}).done(function foundUser(err, user){
		if ( err || !user ) return res.redirect('/auth');
		require('bcrypt').compare(req.param('password'), user.password, function(err, valid){
			if(err || !valid ) return res.redirect('/auth');
			req.session.authenticated = true;
			req.session.user = user;
			return res.redirect('/user/' + user.id);
		});
	});
}
```

Si lanzamos el servidor de nuevo y probamos a rellenar el formulario con uno de los usuarios previamente creados, vemos como nos redirecciona a la página del usuario y nos reemplaza los botones de 'Ingresar' y 'Resistrarse' por el email del usuario y un botón de 'Desconectar'.

Tenemos que tener en cuenta que cunado se crea un usuario podemos considerarlo autenticado. O bien esperar a que verifique su mail, pero como de momento no enviamos mail. Consideraremos al usuario autenticado al crear la nueva cuenta, asignando los valores a la sesión antes de enviar la respuesta:

```javascript create action in UserController.js
create: function(req, res, next) {
	User.create( req.params.all(), function createdUser(err, user){
		[…]
		req.session.authenticated = true;
		req.session.user = user;
		[…]
	});
}
```

### Acción `Logout`

En este caso, es mucho más facil, simplemente destruimos la sesión y redirigimos al usuario a la home.

```javascript logout action in UserController.js
logout: function(req, res){
	req.session.destroy();
	return res.redirect('/');
}
```

Volvemos a lanzar el servidor, hacemos login y una vez en la página del usuario pulsamos el botón de 'Desconectar' para ver como salimos de la sessión y vuelven a aparecer los botones de 'Ingresar' y 'Resistrarse'.

<div class="alert alert-info">
	<p>Commit en GitHub: <a href="https://github.com/jorgecasar/building-realtime-webapp/commit/01e14ef420a8d238c08f9ee4ece91f3df8b08737">01e14ef420: Authentication on UserController: auth, login and logout actions</a>.</p>
</div>

## Políticas de acceso

<div class="alert alert-success">
	<p>Recomiendo echarle un ojo a la <a href="http://sailsjs.org/#!documentation/policies">Documentación de Sails sobre Políticas</a>.</p>
</div>

Autenticar a un usuario tiene la misión principal de conceder o denegar el acceso a algunas partes de nuestra aplicación. Para ello haremos uso de las políticas (policies). Estas políticas las declaramos en el directorio `/api/policies`.

### Política usuario autenticado

Por defecto Sails nos incluye la política `isAuthenticated.js`. La cual hace uso de la variable de sessión que establecemos a `true` cuando el usuario se identifica. Una politica se declara como un módudo y ejecuta la función de callbac `next` cunado se concede acceso o devuelve forbidden en caso contrario.

```javascript /api/policies/isAuthenticated.js
module.exports = function(req, res, next) {
	if (req.session.authenticated)
		return next();
	return res.forbidden('You are not permitted to perform this action.');
};
```

Ahora que tenemos la políca definida debemos aplicarla a alguna URL o acción del controlador. Para ello accedemos a `/config/policies.js` donde definiremos las políticas que se aplcian en cada caso.

```javascript /config/policies.js
module.exports.policies = {
	'*': true,
	UserController: {
		'*': true,
		find: 'isAuthenticated',
		update: 'isAuthenticated',
		destroy: 'isAuthenticated',
		edit: 'isAuthenticated',
		logout: 'isAuthenticated'
	}
}
```

Con esto estamos permitiendo el acceso a todas las acciones del `UserController`, y en algunos casos (find, update, destroy, edit, logut), le pedimos que estén autenticados. Personalmente prefiero aplicar las políticas partiendo de la restricción, es decir, para todas las acciones hay que estar autenticado salvo para las que definamos como abiertas. Quedaría de esta manera:

```javascript /config/policies.js
module.exports.policies = {
	'*': true,
	UserController: {
		'*': 'isAuthenticated',
		create: true,
		new: true,
		auth: true,
		login: true
	}
}
```

En ambos casos permitimos el acceso a las mismas url, pero si añadimos una acción al controlador, estará protegida por defecto.

<div class="alert alert-info">
	<p>Commit en GitHub: <a href="https://github.com/jorgecasar/building-realtime-webapp/commit/e58ea71cc3f566287e67e64eaabbf1838652912c">e58ea71cc3: isAuthenticated policy</a>.</p>
</div>

### Política de poder Administar usuario

Para los casos de editar y eliminar, debemos asegurarnos de que el usuario es él mismo, para evitar que un usuario pueda editar o eliminar cuentas que no son la suya. Más adelante podremos establecer perfiles administradores que también puedan realizar esas acciones, por eso vamos a llamar a la política `canAdminUser`:

```javascript /api/policies/canAdminUser.js
module.exports = function(req, res, next) {
	if (req.param('id') === req.session.user.id)
		return next();
	return res.forbidden('You are not permitted to perform this action.');
};
```

Además tendremos que actualizar nuestras políticas:

```javascript /config/policies.js
[…]
UserController: {
	'*': ['isAuthenticated', 'canAdminUser'],
	find: 'isAuthenticated',
	update: 'isAuthenticated',
	logout: 'isAuthenticated',
	create: true,
	new: true,
	auth: true,
	login: true
}
[…]
```

Ahora si intentamos editar o eliminar un usuario no podremos. Así que deberíamos quitar los botones de la interfaz de usuario para reducir la generación de errores. Por lo que añadimos este condicional para mostrar las opciones sólo en caso necesario.

```html /views/user/find.ejs
[…]
<%
if ( session.user.id === user.id ) {
// There logged user and showed user is the same.
%>
<form action="/user/destroy/<%= user.id %>" method="POST">[…]</form>
<% } %>
[…]
```

Una solución más elegante para no tener que aplicar esta lógica en la template sería utilizar la variable session.canAdminUser. Una forma más elegante, que delega la responsibilidad de la lógica al controlador, que es quien lo debe hacer.

```javascript find action in UserController.js 
find: {
	[…]
	if ( isShortcut(id) ) return next();

	req.session.canAdminUser = canAdminUser(id, req.session.user);

	[…]

	function canAdminUser(id, sessionUser){
		return sessionUser && sessionUser.id === id;
	};
}
```

De esta forma si cambiamos las políticas de acceso a la página de listado de usuarios nos aseguramos que solo verán las acciones editar y eliminar aquellos que puedan ejecutarlas.

<div class="alert alert-info">
	<p>Commit en GitHub: <a href="https://github.com/jorgecasar/building-realtime-webapp/commit/01a7287d07509d9f90cb440cb6af828847ece9fe">01a7287d07: Can Admin User Policy</a>.</p>
</div>

<div class="alert alert-info">
	<p>Código en GitHub: <a href="https://github.com/jorgecasar/building-realtime-webapp">building-realtime-webapp</a>. Release: <code>auth</code>.</p>
	<p>Entorno de desarrollo en Heroku: <a href="http://building-realtime-webapp-dev.herokuapp.com/">building-realtime-webapp</a>.</p>
</div>