---
layout: post
title: "Desarrollar Webapps Realtime: Usuarios"
date: 2014-01-16 09:28:14 +0100
comments: true
categories: NodeJS
tags:
- javascript
- Heroku
- sails
- framework
- realtime
- webapp
---
<div class="alert alert-info">
	<p>Código en GitHub: <a href="https://github.com/jorgecasar/building-realtime-webapp">building-realtime-webapp</a>. Release: <code>users</code>.</p>
	<p>Entorno de desarrollo en Heroku: <a href="http://building-realtime-webapp-dev.herokuapp.com/">building-realtime-webapp</a>.</p>
</div>

{% img center http://sailsjs.org/images/image_squidhome.png 'Designed for developers by Giant Squid' 'Giant Squid' %}

* list element with functor item
{:toc}

Hace unos días vimos [cómo crear webapps realtime](/blog/desarrollar-webapps-realtime-creacion/) y hoy vamos a implementar la gestión de usuarios. Podemos hacerlo de forma básica o usando algun middleware como [Passport](https://github.com/jaredhanson/passport) o [Everyauth](https://github.com/bnoguchi/everyauth). En este artículo empezaremos creando el controlador y el modelo `User` y posterior mente haremos la integración con un middleware para ampliar y mejorar la gestión de usuarios.
<!-- more -->

Si quieres empezar desde este punto y seguir el manual paso a paso puedes clonar el repositorio desde la release [init](https://github.com/jorgecasar/building-realtime-webapp/releases/tag/init):

	$ git clone https://github.com/jorgecasar/building-realtime-webapp.git
	$ git checkout init


## Configuración del almacenamiento

{% img pull-right dark http://media.mongodb.org/logo-mongodb.png 'MongoDB'%}

Sails proporciona un ORM (Object Relational Mapping) llamado [Waterline](https://github.com/balderdashy/waterline) para normalizar las interacciones con modelos. De esta forma nos podemos olvidar del origen de los datos (una vez configurado, claro). Nosotros atacamos al modelo con los métods que veremos a continuación y el waterline se encargará de almacenarlos y recuperarlos del origen. De esta forma especificamos el esquema de nuestra base de datos y podremos utilizar PostgreSQL, MySQL, MongoDB, Memory, Disk, Redis, Riak, IRC, Twitter, JSDom o cualquiera que nos desarrollemos como fuente de nuestros datos.

Nosotros vamos a utiliar [MongoDB](http://www.mongodb.org/) para almacenar nuestros datos. Si no tenéis instalado MongoDB podéis consultar el [manual de instalación de MongoDB](http://docs.mongodb.org/manual/installation/). Después tenemos que incluir el paquete de node `sails-mongo`, que nos incluirá el waterline [sails-mongo](https://github.com/balderdashy/sails-mongo) y eliminar la dependencia de `sails-disk`.Añadimos el flag `--save` para que modifique las dependencias de `package.json`, añadiendo y quitando, respectivamente:

	$ npm install --save sails-mongo
	$ npm uninstall --save sails-disk

 Ahora tenemos que pasar por la configuración puesto que por defecto utiliza el Waterline Disk. Abrimos el fichero: `confi/adapters.js` y añadimos lo siguiente:

	'default': 'mongo',
	[…]
	mongo: {
		module: 'sails-mongo',
		url: process.env.DB_URL, // variable de entorno.
		schema: true
	}

Como véis hemos utilizado una variable de entorno para no exponer nuestros datos de configuración de producción si subimos el código a algún repositorio público.

Todo el proyecto lo vamos subiendo a un entorno en la nube, en mi caso Heroku, así que vamos a ver cómo dar de alta un _Add-on_:

### Configuración en Heroku

<div class="alert alert-success">
	<p>Recomiendo echarle un ojo a la <a href="https://devcenter.heroku.com/articles/config-vars">documentación de Heroku sobre variables de configuración</a>.</p>
</div>


Para añadir complementos a Heroku podmeos hacerlo desde el panel de control de heroku entrando en nuestra aplicación y en la sección recursos hacemos click en [Get Add-ons](https://addons.heroku.com/?app=building-realtime-webapp-dev). Aquí podemos buscar el complemento que necesitamos, en este caso buscando por Mongo nos aparen dos: [MongoHQ](https://addons.heroku.com/mongohq#sandbox) y [MongoLab](https://addons.heroku.com/mongolab#sandbox). Como MongoHQ no está disponible en Europa, no nos queda otra que optar por MongoLab. La versión gratuita es muy parecida en ambos y da de sobra para entornos de desarrollo, así que nos facilitan la elección. Al final de la tabla de características encontráis la posibiliad de incluir el complemento a alguna de vuestras aplicaciones y el código para ejecutarlo en consola.

	$ heroku addons:add mongolab --app building-realtime-webapp-dev

Hemos incluido el nombre de la app porque en el directorio tenemos 2 aplicaciones Heroku, la de producción y la de desarrollo, así que de momento lo incluímos en la desarrollo.

Heroku nos incluye una variable de entorno con la cadena de conexión a la base de datos llamada `MONGOLAB_URI`, podemos usar esa directamente en nuestro `adapter.js` o bien crearnos la que habíamos elegido, `DB_URL`. Para obtener la url podemos copiar la que nos incluye Heroku y luego añadir la nuestra:
	
	$ heroku config --app building-realtime-webapp-dev
	MONGOLAB_URI: mongodb://[user]:[password]@[host]:[port]/[database]
	$ heroku config:set DB_URL=mongodb://[user]:[password]@[host]:[port]/[database] --app building-realtime-webapp-dev

Podemos sobrescribir esta configuración para que nos funcione en local modificando el fichero `config/local.js`. La configuración pude hacerse indicando cada una de los atributos por separado o mediante la [cadena de conexión](http://docs.mongodb.org/manual/reference/connection-string/) que aglutina todos los atributos en un solo script.

	adapters: {
		'default': 'mongo',
		mongo: {
			module: 'sails-mongo',
			// Config by parts. Sails will generate the connection uri
			host: 'localhost',
			user: '',
			password: '',
			database: 'building-realtime-webapp',
			schema: true
			// Config by connection URI.
			// url: mongodb://localhost/building-realtime-webapp
		}
	}

Antes de seguir, vamos a comprobar que todo funciona correctamente. Debemos abrir 2 consolas para:

* El demonio de MongoDB:

		$ mongod
		all output going to: /usr/local/var/log/mongodb/mongo.log
* Levantar el proyecto, como ya sabemos: `$ sails lift` o `$ foreman start

<div class="alert alert-info">
	<p>Commit en GitHub: <a href="https://github.com/jorgecasar/building-realtime-webapp/commit/5f34185918b05b3648f14213f23ae32b88404262">5f34185918: Config MongoDB as default adapter</a>.</p>
</div>

### Admin UI para MongoDB
MongoDB no incluye por defecto ningún administrador de bases de datos visual. Con el comando `mongo` entramos en la consola de MongoDB y podemos realizar consultas. Como no tenemos ningún modelo, Sails todavía no ha crado la base de datos ni las colecciones, así que no os asustéis si véis la base de datos vacía.

Personalmente, opino que la línea de comandos está muy bien y recomiendo que siempre le echéis un ojo y la conozcáis antes de pasar a herramientas con Interfaz de Usuario. En [Mongo Administration Interfaces](http://docs.mongodb.org/ecosystem/tools/administration-interfaces/) tenéis unas cuantas herramientas. Para visualizar la base de datos suelo usar [Genghis](http://genghisapp.com/) y si voy a tener que administrarla, haciendo consultas, exportaciones, etc… uso [MongoHub](https://github.com/fotonauts/MongoHub-Mac).

## Generar MVC para `User`

Sails.js ofrece una serie de generadores como ya vimos en el artículo anterior y esta vez vamos a utilizar el generador de modelo y controlador. Si quisiéramos sólo crear el modelo o el controllador especificaríamos `model` o `controlller` después de `generate`, respectivamente. Pero en este caso necesitaremos ambos:

	$ sails generate user
	info: Generating model and controller for user...

Si nos fijamos en el directorio `/api` veremos que contiene las siguientes carpetas:

* adapters
* controllers
* models
* policies
* services

Como os podéis imaginar el comando anterior nos ha creado los ficheros `/api/models/User.js` y `/api/controllers/UserController.js`.

Sails por defecto tiene una serie de blueprints, todos activados por defecto.

* Action: Todas las acciones creadas en el controlador serán accesibles mediante la url: `/<controller>/<action>`.
	* /user -> UserController.index
	* /user/index -> UserController.index
	* /user/sendEmail -> UserController.sendEmail
	* /user/[action] -> UserController[action]
* REST: Expone un API REST convencional por encima del controlador con las acciones: `find`, `create`, `update`, and `destroy` asociados a sus respectivos verbos:
	* GET -> /user/:id? -> UserController.find
	* POST -> /user -> UserController.create
	* PUT -> /user/:id -> UserController.update
	* DELETE -> /user/:id -> UserController.destroy
* Shortcuts: Nos permite acceder a los _métods CRUD_ (Create, Read, Update y Delete) desde la barra de direcciones del navegador:
	* /user/find/[id] -> Devuelve la información del usuario con id = [id]
	* /user/create?name=<name> -> Crea un nuevo usuario
	* /user/update/[id]?name=<newName> -> Actualiza el nombre del usuario con id = [id]
	* /user/delete/[id] -> Elimina el usuario con id = [id]

Todas estas acciones podemos dejarlas activadas en desarrollo para facilitarlos algunas tareas. Pero en el entorno de producción, las acciones y el API REST podemos dejarlos activados, pero los atajos habrá que deshabilitarlos. Esta configuración puedes modificarla en cada _Controller_ o de manera global en `config/controllers.js`.

### Probar BD y API
Ahora si volvemos a lanzar nuestro servidor (`sails lift`) podemos realizar algunas pruebas y ver la potencia de Sails recién salido de la caja. La primera es comprobar que la base de datos se ha crado correctamente.

* Por línea de comandos:
		
		$ mongo
		> use building-realtime-webapp
		switched to db building-realtime-webapp
		> show collections
		system.indexes
		user
* Con Genghis:
		
		$ genghisapp
		Starting 'genghisapp'...
		'genghisapp' is already running at http://0.0.0.0:5678
	
	Entramos en [http://0.0.0.0:5678](http://0.0.0.0:5678) y navegamos por nuestro servidor [localhost](http://0.0.0.0:5678/servers/localhost) > [building-realtime-webapp](http://0.0.0.0:5678/servers/localhost/databases/building-realtime-webapp) > [user](http://0.0.0.0:5678/servers/localhost/databases/building-realtime-webapp/collections/user)

Parece que todo funciona, ahora le toca el turno a los _blueprints_. Antes de probar las siguientes URLs, debéis hacer un cambio en `config/local.js` y poner a `schema: false`. Esto hará que no tengamos un esquema de la base de datos definido y podamos introductir cualquier atributo a la colección. Con `schema: true`, sólo se guradarán los atributos que hayamos definido en `/api/models/User.js`. Os recomiendo que probéis a cambiar la configuración de los _blueprints_ en `config/controllers` y la del esquema para ver las diferentes configuraciones y podáis entender qué sucede con nuestro velero. Recordad que hay que alzar las velas (`sails lift`) con cada cambio de configuración.

* Mostrar la lista de usuarios: [http://localhost:1337/user](http://localhost:1337/user).
* Añadir el usuario "Jorge": [http://localhost:1337/user/create?name=Jorge](http://localhost:1337/user/create?name=Jorge).
* Buscar el usuarios con nombre "Jorge": [http://localhost:1337/user?name=Jorge](http://localhost:1337/user?name=Jorge).
* Modificar el usuario "Jorge" (usar el id de la consulta anterior): [http://localhost:1337/user/update/[id]?name=Jorge del Casar](http://localhost:1337/user/update/[id]?name=Jorge del Casar)

<div class="alert alert-info">
	<p>Commit en GitHub: <a href="https://github.com/jorgecasar/building-realtime-webapp/commit/153a53883a8a4c209ac3a5aa3bc8f0e6f9633eba">153a53883a: Create Model and Controller for User</a>.</p>
</div>

### Modelo `User`

<div class="alert alert-success">
	<p>Recomiendo echarle un ojo a la <a href="http://sailsjs.org/#!documentation/models">Documentación de Sails sobre Modelos</a>.</p>
</div>

En el archivo `/api/model/User.js` especificamos los atributos necesarios. Empezaremos simplemente con email y contraseña:

```javascript User Model
module.exports = {
	attributes: {
		email: {
			type: 'string',
			required: true,
			email: true,
			unique: true
		},
		password: {
			type: 'string',
			required: true
		}
	}
}
```

Salis nos permite crear nuestros propios métodos y sobrescribir los métodos `toObject` y `toJSON` (se especifican en attributes). Veamos un ejemplo de ambos para evitar que la contraseña llegue al cliente:

```javascript User Model
attributes: {
	[…]
	// Override toJSON instance method to remove password value
	toJSON: function() {
		var obj = this.toObject();
		delete obj.password;
		return obj;
	}
}
```
Ahora si volvemos a levantar el servidor y probamos introducir un nuevo usuario: [http://localhost:1337/user/create?email=someone@somewhere.com&password=securePass007](http://localhost:1337/user/create?email=someone@somewhere.com&password=securePass007). Vemos que el JSON que nos devuelve el servidor no incluye el atributo password, pero si visualizamos la base de datos ([http://localhost:5678/servers/localhost/databases/building-realtime-webapp/collections/user](http://localhost:5678/servers/localhost/databases/building-realtime-webapp/collections/user), vemos que si se ha guardado correctamente.

#### Encriptar contraseña
Guardar la contraseña directamente en la base de datos es una mala práctica, así que vamos a ver cómo encriptarla usando el paquete `bcrypt`. Instalamos y guardamos la dependencia ejecutando:
	
	$ npm install --save bcrypt

Sails nos ofrece una serie de _callbacks_ del ciclo de vida del modelo para que podamos unirnos en cualquier parte del proceso de la consulta:

* Callbacks al crear:
	- beforeValidation: `fn(values, cb)`
	- beforeCreate: `fn(values, cb)`
	- afterCreate: `fn(newlyInsertedRecord, cb)`
* Callbacks al actualizar:
	- beforeValidation: `fn(valuesToUpdate, cb)`
	- beforeUpdate: `fn(valuesToUpdate, cb)`
	- afterUpdate: `fn(updatedRecord, cb)`
* Callbacks al eliminar:
	- beforeDestroy: `fn(criteria, cb)`
	- afterDestroy: `fn(cb)`

En nuestro caso necesitamos ejecutarla al crear, aunque más adelante tendremos que dar la posibilidad al usuario de actualizar su contraseña y por tanto debemos encriptarla al actualizar también:

```javascript User Model
module.export = {
	[…]
	// Lifecycle Callbacks
	beforeCreate: function(values, next) {
		hashPassword(values, next);
	},
	beforeUpdate: function(values, next) {
		if(values.password) hashPassword(values, next);
		else next();
	}
};

var bcrypt = require('bcrypt');
 
function hashPassword(values, next) {
	bcrypt.hash(values.password, 10, function(err, hash) {
		if (err) return next(err);

		values.password = hash;
		next();
	});
}
```

Ahora si volvemos a levantar el servidor y probamos introducir un nuevo usuario: [http://localhost:1337/user/create?email=other@somewhere.com&password=securePass007](http://localhost:1337/user/create?email=other@somewhere.com&password=securePass007). Vemos que la contraseña es una cadena de caracteres inlegible ([http://localhost:5678/servers/localhost/databases/building-realtime-webapp/collections/user](http://localhost:5678/servers/localhost/databases/building-realtime-webapp/collections/user).

<div class="alert alert-info">
	<p>Commit en GitHub: <a href="https://github.com/jorgecasar/building-realtime-webapp/commit/5137c5a1bb9cc3decb257da5ed6677e804ad487d">153a53883a: Define User Model and include bcryp package</a>.</p>
</div>

En el siguiente commit hemos añadido un método para verificar la contraseña, puesto que lo utilizaremos para comprobar que es correcta cuando queremos cambiarla. También hemos mejorado la callback beforeUpdate añadiendo la lógica necesaria para cambiar la contraseña, verificando que la anterior es correcta y que la nueva se introduce correctamente 2 veces. Por último hemos mejorado el método hashPassword generando un salt previo al hash. Están todas las lineas comentadas así que es fácil ver que se hace en cada una de ellas.

<div class="alert alert-info">
	<p>Commit en GitHub: <a href="https://github.com/jorgecasar/building-realtime-webapp/commit/e881b5cba8996ae883396ecb6c84e3758f984dbc">e881b5cba8: Added method validPassword, improved methods beforeUpdate and hashPassword</a>.</p>
</div>

<div class="alert alert-danger">
	<h5><a href="https://github.com/jorgecasar/building-realtime-webapp/issues/1">Issue #1: Check password beforeValidation instead of beforeUpdate</a>.</h5>
	<p>La contraseña es un atributo obligatorio en en el modelo del usuario, por lo tanto al comprobar la validez de los datos nos saltará un error si no la introducimos. Por ello, las comprobaciones que hacíamos en beforeUpdate hay que hacerlas en beforeValidation para evitar que falle al no introducir contraseña. Además hay que comprobar mediante el id si no esncontramos en una cración o en una actualización de usuario.</p> 
</div>


### Controlador `UserController`

<div class="alert alert-success">
	<p>Recomiendo echarle un ojo a la <a href="http://sailsjs.org/#!documentation/controllers">Documentación de Sails sobre Controladores</a>.</p>
</div>

Ahora que tenemos nuestro modelo `User` listo vamos a incluir unas acciones en nuestro `UserController` que nos permitirán interactuar con nuestros modelos de una forma más avanzada que las acciones por defecto. Se han mantenido las acciones estandar para estar en consonancia con la API REST y los Sortcurs CRUD, para evitar tener que cambiar routes, que ya veremos en siguientes artículos cómo hacerlo.

* Acciones REST:
	* __find__: Atenderá las peticiones `GET` a `/user/:id?`. La '?' significa que el parámetro `id` es opcional. Por lo que el controlador está preparado para buscar un usuario por id o varios en función de lo especificado en el where. Además se podrán limitar, saltar y ordenar los resultados.
	* __create__: Resolverá las peticiones `POST` a `/user`, creando un usuario y devolviendo la instancia creada.
	* __update__: Se encargará de las peticiones `PUT` a `/user/:id`. El parámetro id es obligatorio puesto que no se permite la edición múltiple de usuarios.
	* __destroy__: Eliminará el usuario con id especificado mediante la petición `DELETE` a `/user/:id`
* Acciones adicionales:
	* __edit__: Devolverá la vista `edit`, la cual contendrá el formulario de edición con los valores precargados.
	* __new__: devolverá la vista `new` con un formularo para la creación de un nuevo usuario.

Por no copiar todo el controlador aquí, voy a destacar las parte que me parecen más interesantes, puesto que el resto lo tenéis en GitHub. Vamos a empzar con un fragmento de la acción `find` que permite, filtrar y paginar los resultados. Gracias a estas 10 lineas podrás hacer consultas a urls como: [http://localhost:1337/user/?where={"email":{"contains":"somewhere.com"}}&limit=2&sort=email DESC](http://localhost:1337/user/?where={"email":{"contains":"somewhere.com"}}&limit=2&sort=email DESC) y obtener como máximo 2 usuarios ordenados de manera descendente cuyos emails contengan "somewhere.com".

```javascript User Controller
	find: function(req, res, next) {
		[…]
		// If we have a where param we will pase it as JSON.
		var where = req.param('where');
		if( _.isString(where)) {
			where = JSON.parse(where);
		}
		// Setting options from params.
		var filters = {
			limit: req.param('limit') || undefined,
			skip: req.param('skip')  || undefined,
			sort: req.param('sort') || undefined,
			where: where || undefined
		};
		// Find users according with filters
		User.find(filters).done(function foundUsers(err, users){
			[…]
		});
		[…]
	}
```

Otra parte interesante es la forma de devolver los resultados, ya que antes de hacerlo comprobamos qué tipo de respuesta se nos está solicitando. En caso de solicitar JSON devolvemos los resultados en JSON y en caso contraro le pasamos los resultados a la vista correspondiente.

```javascript User Controller
	[…]
	// Response JSON if needed.
	if (req.wantsJSON) return res.json(user);
	// Else response view with results 
	else return res.view({ user: user });
	[…]
```

<div class="alert alert-info">
	<p>Commit en GitHub: <a href="https://github.com/jorgecasar/building-realtime-webapp/commit/046d2301bf754f4b99c7abeb4b02faf137d4c502">046d2301bf: UsarController: API REST friendly</a>.</p>
</div>

### Vista `User`

<div class="alert alert-success">
	<p>Recomiendo echarle un ojo a la <a href="http://sailsjs.org/#!documentation/views">Documentación de Sails sobre vistas</a>.</p>
</div>

Por último, tendremos que crear una vista para mostrar los resultados. Si os fijáis no hemos definido el nombre de la vista ya que Sails asocia por defecto cada acción de un controlador a la vista localizada en `/views/[controlador]/[acción]`. Sabiendo esto debemos crear el directorio `/view/user` y los ficheros `find.ejs`, `new.ejs` y `edit.ejs`. El resto de acciones no se reflejarán en una vista por lo cual no las necesitamos.

Antes de enseñar las peculiaridades de las vistas he incluido [Bootstrap](http://getbootstrap.com/) y [jQuery](http://jquery.com/) (dependencia de Bootstrap) en el directorio `/assets/linker/js` y los estilos de Bootstrap en `assets/linker/styles/`. De esta manera se incluyen automáticamente en el layout. Para asegurarnos que el orden es el correcto abrimos el fichero `/Gruntfile.js` y lo modificamos indicando el orden de inclusión de los recursos:

```javascript Gruntfile.js
var cssFilesToInject = [
	'linker/styles/bootstrap.css',
	'linker/styles/bootstrap-theme.css',
	'linker/**/*.css'
];

var jsFilesToInject = [
	[…]
	// *->    put other dependencies here   <-*
	'linker/js/jquery.js',
	'linker/js/bootstrap.js',
	[…]
];
```
<div class="alert alert-info">
	<p>Commit en GitHub: <a href="https://github.com/jorgecasar/building-realtime-webapp/commit/e3479ce836a6baacd89491d893b43aeacf7d0452">e3479ce836: Include jQuery and Bootstrap. Modify GruntFile to set the order</a>.</p>
</div>

Las vistas en si no tienen mucho misterio. Destacar que Sails utiliza el motor de templates [EJS: Embebed Javascript](http://embeddedjs.com/), lo cual me recuerda mucho a PHP donde puedes mezclar código de scripting con HTML. Afortunadamente, todos sabemos que eso es una mala práctica y hay que dejarle la lógica al controlador y utilizar en las vistas la menor posible. Para este artículo, al no estar dedidaco a las vistas no he querido complicarlas mucho incluyendo partials, cambiando el layout o indicando la vista desde el controlador, pero que sepáis que se puede hacer y ya vermos cómo en otros artículos.

<div class="alert alert-info">
	<p>Commit en GitHub: <a href="https://github.com/jorgecasar/building-realtime-webapp/commit/3785bbe071dcf8cf4ee12cd75ac0ab5570dec342">3785bbe071: Included User views. Modified index and layout. Include some styles to customize Bootstrap</a>.</p>
</div>

Ahora que tenemos todo subido podemos hacer un push al entorno de desarrollo:

	$ git push heroku-dev develop:master

Y por último podemos ver el resultado en [http://building-realtime-webapp-dev.herokuapp.com/](http://building-realtime-webapp-dev.herokuapp.com/):