---
layout: post
title: "Desarrollar Webapps Realtime: Auth con Passport y proveedores"
date: 2014-01-22 10:13:37 +0100
comments: true
categories: SailsJS
tags:
- Javascript
- SailsJS
- Framework
- Real-time
- Webapp
- Auth
- Passport
---


<div class="alert alert-info">
	<p>Código en GitHub: <a href="https://github.com/jorgecasar/building-realtime-webapp">building-realtime-webapp</a>. Release: <code>auth-passport-providers</code>.</p>
	<p>Entorno de desarrollo en Heroku: <a href="http://building-realtime-webapp-dev.herokuapp.com/">building-realtime-webapp</a>.</p>
</div>

{% img center http://sailsjs.org/images/image_squidhome.png 'Designed for developers by Giant Squid' 'Giant Squid' %}

* list element with functor item
{:toc}

Tras ver [cómo implementar un sistema de autenticación básica](/blog/desarrollar-webapps-realtime-auth/) y [cómo utilziar Passport para autenticar usuarios](/blog/desarrollar-webapps-realtime-auth-con-passport/) vamos a dar un poso más y ver cómo autenticar usuarios usando otros proveedores como Github, Facebook o Twitter.

<!-- more -->

## Instalar y configurar dependencias

Como hemos dicho Passport es un sistema de autenticación modular y nos permite ir ampliando las formas de autenticar a nuestros usuarios. Puedes consultar la [lista de proveedores de Passport](http://passportjs.org/guide/providers/) para ver todos los que están disponibles. Instalamos los paquetes que necesitemos:
	
	npm install --save passport-github passport-facebook passport-twitter

Una vez instalado los paquetes tenemos que configurar las estrategias. Como no quería depender de variables de entorno en local ni exponer las credenciales OAuth en un fichero de configuración, sin mencionar que necesitaremos credenciales diferentes para local y para producción. Por estas razones la solución que os planteo puede ser un poco rebuscada, pero por internet podéis encontrar formas más sencillas si no vais a hacer público vuestro código o decidis depender de variables de entorno.

### Fichero de configuración

Lo primero sería pensar en modificar el fichero de configuración. Pero hemos decidido dejar la configuración básica en este fichero y la declaración de estartegias externas en un servicio, debido a la necesidad de usar las variables de configuración de Sails (`sails.config`). Dado que la estrategia local funciona de fomra diferente y no requiere variables de configuración la hemos mantenido en el fichero de configuración. Los únicos cambios realizados a `/config/passport.js` son por temas de experiencia de usuario y para declarar los proveedores, que nos servirán para abstraer los proveedores que empleamos.

Pensando en el flujo de autenticación y que hacer cuando no se encuenta al usuario, independientemente del proveedor utilizado, la mejor solución es llevar al usuario a la página de registro, como veremos en el `UserController`. Si el usuario ha introducido su usuario (username o email) y contraseña, sería un detalle dejarle ese campo del formulario de registro relleno. Esto nos supone los siguientes cambios en nuestra estrategia local cuando no se encuenta el usuario:

```javascript config/passport.js
[…]
if (!user) {
	var user = {};
	var re_email = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	user[re_email.test(username)?'email':'username'] = username;
	return done(null, user, { message: 'Unknown user ' + username });
}
[…]
```

### Servicio con extrategias externas

Hemos creado un fichero en `/api/services/PassportService.js`, declarando las dependencias de proveedores de autenticación externos. Además declaramos la función, `providersHandler`, la cual se ejecutará una vez se haya autenticado en el servidor del proveedor. Esta función tiene como parámetros el token, el tokenSecret, el perfil de usuario y una función de callback que definimos cuando solicitamos la autenticación en nuestro controlador. En `providersHandler` se suele buscar o crear un usuario nuevo si no se encuentra, pero como nosotros tenemos nuestro sistema de usuarios y vamos a implementar varios proveedores, comprobaremos si el perfil está asociado a alguno de nuestros usuarios. Si el id del perfil está en nuestro Modelo devolvemos el usuario, en caso contraro, creamos un usuario un __usuario temporal__ (sin guardarlo en la base de datos). Este usuario lo pasaremos al controlador mediante la función de callback para mantenerlo mientras el usuario termina de registrarse en nuestra plataforma y así poder asociar el perfil recibido sin necesidad de solicitar de nuevo la autenticación al proveedor.

```javascript /api/services/PassportService.js
var passport         = require('passport'),
    GitHubStrategy   = require('passport-github').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy,
    TwitterStrategy  = require('passport-twitter').Strategy;

function providersHandler(token, tokenSecret, profile, done) {
	sails.log.verbose('config/passport providersHandler');
	process.nextTick(function () {
		User.findOne()
		.where({'profiles.id': profile.id})
		.done(function (err, user) {
			if (user) return done(null, user);
			
			var tempUser = {}
			tempUser.profiles = []
			[…]
			tempUser.profiles.push(profile);
			delete profile._raw;
			delete profile._json;
			return done(err, tempUser);
		});
	});
};
```

Por último, el servicio exporta un módulo con una función que configura los proveedores con las variables de entorno o las de configuración de sails. Lo hacemos dentro de una función para disponer del objeto `sails` y por tanto de la configuración declarada en `/config/local.js` (hay una copia de referencia en `/config/local.ex.js`). Estas propiedades y métodos estarán disponibles en `sails.config

```javascript /api/services/PassportService.js
module.exports = {
	configProviders: function(options, next) {
		passport.use(new GitHubStrategy(
			{
				clientID: process.env.GITHUB_CLIENT_ID || sails.config.providers.github.clientID,
				clientSecret: process.env.GITHUB_CLIENT_SECRET || sails.config.providers.github.clientSecret,
				callbackURL: process.env.GITHUB_CALLBACK_URL || sails.config.providers.github.callbackURL,
			},
			providersHandler
		));
		passport.use(new FacebookStrategy({
				[…]
			},
			providersHandler
		));
		passport.use(new TwitterStrategy({
				[…]
			},
			providersHandler
		));
	}
};
```

Esta nueva función, `configProviders` debemos llamarla al iniciar la aplicaicón para que se configuren nuestros proveedores de autenticación. Para ello incluimos la llamada en `/config/bootstrap.js`:

```javascript /config/bootstrap.js
module.exports.bootstrap = function (next) {
	PassportService.configProviders();
	next();
};
```

## Modificar Modelo `User`

En el modelo solo tendremos que añadir un atributo más que guarde los perfiles del usuario. Los resultados se normalizan siguiendo el esquema de contacto establecido por Portable Contacts y puedes consultar en el [perfil de usuario en Passport](http://passportjs.org/guide/profile/). De momento Sails no permite las asociaciones, disponibles en la versión 0.10, así definiremos un array y procuraremos mantener el schema. Cuando pasemos a Sails.js 0.10 implementaremos asociaciones las cuales nos permitirán crear un modelo Profile en el que definieremos este schema.

```javascript /api/models/User.js
module.exports = {
	attributes: {
		[…]
		profiles: {
			'array',
			defaultsTo: []
		}
		// Profiles object look like this:
		// provider: 'string',
		// id: 'string',
		// displayName: 'string',
		// name_familyName: 'string',
		// name_givenName: 'string',
		// name_middleName: 'string',
		// emails: 'array',
		// photos: 'array'
		[…]
	}
};
```

## Modificaciones en `UserController`

Vamos a ampliar la funcionalidad de las acciones `login` y `logout`, las cuales nos permitirán realizar el login de un usuario y unir un perfil con el usuario registrado. Obtenemos el proveedor por parámetro (ver [Personalización de rutas](#personalizacin-de-rutas)) y si es válido procederemos a la unión o eliminación del perfil. La url a la que haremos las peticiones será del tipo `/user/login/github`, siendo `github` lo que recibiremos como parámetro `provider`.

```javascript /api/controllers/UserController.js
login: function(req, res, next) {
	var provider = req.param('provider') || 'local';
	if ( provider === 'local' || isProvider(provider) ) return linkProfile(provider, req, res, next);
	return res.redirect('/auth');
},
logout: function(req, res, next){
	var provider = req.param('provider');
	if ( isProvider(provider) ) return unlinkProfile(provider, req, res, next);
	req.logout();
	return res.redirect('/');
}
```

Esto unido a tres funciones auxiliares resuelven de manera bastante elegante la autenticación de usuarios, enlace y desenlace de perfiles. La primera función auxiliar, `isProvider`, es para comprobar si es un proveedor de authenticación válido.

```javascript /api/controllers/UserController.js
function isProvider(id){
	return sails.config.providers[provider];
}
```
La segunda, `linkProfile`, es la encargada de gestionar el login con dicho proveedor. Tendrá en cuenta si el usuario está registrado, si hemos encontrado un usuario con dicho perfil en nuestra base de datos y actuará en consecuencia en cada uno de los 5 casos:

1. Usuario registrado, intenta enlazar de nuevo un perfil ya enlazado.
2. Usuario registrado, intenta enlazar un perfil asociado a otro usuario.
3. Usuario registrado, intenta enlazar un perfil no asociado a ningún usuario.
4. Usuario no registrado, se autentica con un perfil asociado a su usuario.
5. Usuario no registrado, se autentica con un perfil no asociado a ningún usuario.

## Personalización de rutas

Un fichero que no habíamos visto hasta hora `/config/routes.js` hace aparición para que definamos las url de `login` y `logout`. El indicar en la url `:provider` establecemos `provider` como un parámetro y con `?` lo hacemos opcional. De esta forma estas urls nos sirven para el login general y para el login con un proveedor concreto.

```javascript /config/routes.js
module.exports.routes = {
	'/': {
		view: 'home/index'
	},
	'/user/login/:provider?': 'UserController.login',
	'/user/logout/:provider?': 'UserController.logout'
};
```
## Cambios en las vistas

Ya tenemos toda la parte de lógica de negocio lista. Todo lo que hemos realizado en los controladores, modelos, cofig, servicios… tenemos que refejarlo en las vistas así que vamos a listar los cambios que hay que realizar.

### Formulario de autenticación

* Renombramos el fichero `/view/user/auth.ejs` a `/view/auth/index.ejs`.
* Cambiamos el action del formulario de autenticación a `/auth/login/local`.
* Añadimos los botones de autenticación de los diferentes proveedores que vamos a utilizar como formularios con action `/auth/login/[provider]`, siendo `[provider]` el proveedor que corresponda en cada caso. Para ello utilizamos utilizamos la variable `sails.config.providers` y un bucle `each`:

```html views/user/auth.ejs
<% if ( sails.config.providers ) { %>
<div class="form-center">
	<p class="text-center"><%= __('or Auth with...') %><p>
	<div class="row">
		<% _.each(sails.config.providers, function(provider, provider_id){ %>
		<form role="form" action="/user/login/<%= provider_id %>" method="POST" class="col-xs-4">
			<p>
				<button type="submit" class="btn btn-primary btn-block">
					<!--span class="glyphicon glyphicon-<%= provider_id %>"></span-->
					<%= __(provider_id) %>
				</button>
			</p>
		</form>
		<% }) %>
	</div>
</div>
<% } %>
```

### Nuevo usuario

Como hemos comentado guardamos un usuario temporal cuando no hemos encontrado el usuario en nuestra base de datos. Este es el momento de mostrarle al usuario los datos que había rellenado al intentar autenticarse. Hemos omitido poner la contraseña, porque es mejor introducirla de manera consciente. Este sería un ejemplo de como introducimos el valor del usuario temporal.

```html views/user/new.ejs
<input
	type="text"
	class="form-control"
	placeholder="<%= __('Username') %>"
	name="username"
	id="username"
	required
	<% if( session.tempUser && session.tempUser.username ) { %>
	value="<%= session.tempUser.username %>"
	<% } %>/>
```

### Mostrar usuario

En la vista del usuario ahora tendremos que informarle de qué perfiles ha unido a su cuenta y darle la posibilidad de unir nuevos o eliminar los que tenga unidos. Así que iteramos los proveedores, `sails.config.providers` y si encontramos un perfil de ese proveedor entre los perfiles del usuario ofrecemos la opción de eliminar y en caso contrario la de añadir. Solo vamos a mostrar el condicional para mostrar el uso del método find:

```html views/user/find.ejs
<% if( _.find(
	user.profiles,
	function(profile) {
		return profile.provider == provider_id;
	}
) ) { %>
```

Con esto hemos terminado nuestro sistema de autenticación con proveedores externos y creado un sistema que facilita el deshabilitar o habilitar nuevos sistemas de autenticación.

<div class="alert alert-info">
	<p>Commit en GitHub: <a href="https://github.com/jorgecasar/building-realtime-webapp/commit/c3e544e2ca9a890151959129f347667d43eb5209">c3e544e2ca: Auth with Passport and providers (GitHub, Facebook, Twitter).</a></p>
	<p>Commit en GitHub: <a href="https://github.com/jorgecasar/building-realtime-webapp/commit/7eb75b35f1c878bb1f94039edb94ced5f7c7913b">7eb75b35f1: Delete verb from login and logout routes.</a></p>
	<p>Commit en GitHub: <a href="https://github.com/jorgecasar/building-realtime-webapp/commit/0f78d3898b16702750d99a536434310ab3058a4f">0f78d3898b: Update read me and index to show read me info.</a></p>
</div>

<div class="alert alert-info">
	<p>Código en GitHub: <a href="https://github.com/jorgecasar/building-realtime-webapp">building-realtime-webapp</a>. Release: <code>auth-passport-providers</code>.</p>
	<p>Entorno de desarrollo en Heroku: <a href="http://building-realtime-webapp-dev.herokuapp.com/">building-realtime-webapp</a>.</p>
</div>


