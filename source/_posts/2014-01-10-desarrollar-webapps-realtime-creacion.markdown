---
layout: post
title: "Desarrollar webapps realtime: Creación"
date: 2014-01-10 10:30:09 +0100
comments: false
categories: NodeJS
tags:
- javascript
- heroku
- sails
- framework
- realtime
- webapp
---
{% img center http://sailsjs.org/images/image_squidhome.png 'Designed for developers by Giant Squid' 'Giant Squid' %}

* list element with functor item
{:toc}

Hace unos meses descubrí Sails, un framework MVC para Node basado en Express que te facilita la creación de aplicaciones web realtime mediante Websockets. Así que no me extraña que el slogan sea:
{% blockquote Mike McNeil, http://sailsjs.org/ Creator of sails.js %}
THE WEB FRAMEWORK OF YOUR DREAMS.
Designed for developers by Giant Squid.
{% endblockquote %}
<!-- more -->

## Crear proyecto con Sails.js

<div class="alert alert-info">
    Podrás encontrar el código fuente de este artículo en: <a href="https://github.com/jorgecasar/building-realtime-webapp">building-realtime-webapp en GitHub</a>
</div>

### Requisitos
{% img pull-right dark http://nodejs.org/images/logo.png 'Node.js'%}
Obviamente necesitamos tener [Node.js](http://nodejs.org/). En mi caso, tengo la ultima versión estable, la 0.10.24, puesto que voy a desplegar en Heroku y acepta cualquier versión superior a la 0.8.5. Os recomiendo revisar qué versión hay instalada en el servidor donde vayáis a hacer despligue de producción. Para comprobar la versión que tienes en local ejecuta en la consola: ```node -v```. Para gestionar la versión de node os recomiendo el paquete [```n``` de npm](https://npmjs.org/package/n). Lo instalais globalmente para tenerlo disponible desde cualquier parte y luego podrás instalar la versión última versión estable con el comando ```sudo n stable```

### Instalación
Para instalar [Sails.js](http://sailsjs.org/) simplemente instalamos globalmente el paquete

{% highlight plain %}
$ sudo npm -g install sails
{% endhighlight %}

### Crear un nuevo proyecto
Para hacerlo simplemente tendremos que llamar al commando ```new``` el cual nos creará un proyecto sails en la carpeta ```<appName>``` en el directorio desde donde ejecutemos el comando.

{% highlight plain %}
$ sails new <appName> [--linker]
$ cd <appName>
{% endhighlight %}

También existe la opción de usar un enlazador de recursos automático añadiendo la flag ```--linker```. Esto instalará una tarea de [Grunt](http://gruntjs.com/) llamada [grunt-sails-linker](https://github.com/balderdashy/grunt-sails-linker) que automatiza la adición de etiquetas html basadas en ficheros. Incluyendo la flag sails creará el ```Gruntfile.js``` implementando esta tarea de Grunt.

Una vez tenemos el proyecto y en el directorio del proyecto simplemente tenemos que lanzar el servidor:

{% highlight plain %}
$ sails lift
{% endhighlight %}

Una vez lanzado vemos que el barco ha zarpado y podemos ver nuestra web app en <http://localhost:1337>

## Crear un repositorio git
{% img pull-right http://git-scm.com/images/logo@2x.png 'Git'%}
Es muy recomendable tener un control de versiones aunque sea simplemente en local para poder desacer cambios y tener un flujo de trabajo controlado.

{% highlight plain %}
$ git init
{% endhighlight %}

Además, quien sabe si mañana no eres tu solo el que toca el código. Así que inicializamos nuestro git y enviamos nuestro lo que llevamos. Os recomiendo echarle un ojo al [modelo de ramificación Git acertado](http://nvie.com/posts/a-successful-git-branching-model/).

{% img center http://nvie.com/img/2009/12/Screen-shot-2009-12-24-at-11.32.03.png 'A successful Git branching model' %}

De momento vamos a crear únicamente las ramas ```master``` y ```develop``` para nuestro proyecto y según vayamos necesitando las demás las vamos creado a partir de la rama que corresponda.

{% highlight plain %}
$ git checkout -b master && git checkout -b develop
{% endhighlight %}

De esta manera nos quedamos en la rama ```develop``` para empezar ahí nuestro proyecto y cuando tengamos algo estable lo combinaremos con la rama ```master```.

### Repositorio git remoto en GitHub
En mi caso voy a usar [GitHub](http://github.com) para compartir mi código con todos vosotros. Creamos nuestro nuevo repositorio en GitHub e incluimos la url del repositorio a nuestro proyecto:

{% highlight plain %}
$ git remote add origin <git_url>
{% endhighlight %}

### Primer commit
Ahora que tenemos nuestro repositorio git es hora de hacer nuestro primer commit:

{% highlight plain %}
$ git add .
$ git commit -m "First commit"
$ git push -u origin develop
{% endhighlight %}

## Despliegue en Heroku
{% img pull-right https://d1lpkba4w1baqt.cloudfront.net/heroku-logo-light-300x100.png 'Heroku'%}
Una vez tenemos nuestro proyecto funcionando vamos a ver si nos funciona correctamente en el servidor de producción, en mi caso [Heroku](http://heroku.com). Voy a describir los pasos claves, pero si tienes algún problema puedes echarle un ojo [Empezar con Node.js en Heroku](https://devcenter.heroku.com/articles/getting-started-with-nodejs) y [Desplegando con git](https://devcenter.heroku.com/articles/git) para obtener información adicional.

### Requisitos
Antes de empezar necesitaremos un par de cosas primero:

1. [Crear una cuenta en Heroku](https://id.heroku.com/signup/devcenter)
2. Instalar las [Heroku Toolbelt](https://toolbelt.heroku.com/)

### Configuración local
Después de instalar las Toolbelt podrás usar el comando ```heroku``` en tu consola. Así vamos a registrarnos en heroku y configurar nuestro entorno:

{% highlight shell %}
$ heroku login
{% endhighlight %}

Nos pedirá nuestro nombre de usuario, contraseña y si queremos crear una llave pública SSH (_SSH public key_) para poder publicar nuestro código posteriormente.

Es recomendable indicar en el ```package.json`` la versión de node que queremos utilizar para evitar problemas y asegurarnos que estamos usando una versión que soportomos.

~~~ json
"engines": {
    "node": "0.10.x"
}
~~

Heroku usa el fichero _Procfile_ para indicar los comandos que va a ejecutar tu aplicación, así que le tenemos que indicar que queremos un comando de tipo web y que ejecute nuestro script node:

{% highlight plain %}
web: node app.js
{% endhighlight %}

Ahora podemos arrancar nuestra aplicación usando [Foreman](https://github.com/ddollar/foreman), que lo tendrás instalado como parte de las ToolBelt:

{% highlight shell %}
$ foreman start
{% endhighlight %}

Seguramente te de un error porque no encuentra el módulo ```sails```, así que instala las dependencias para tener una copia de sails en node_modules, puesto que al tenerlo instalado globalmente foreman no lo encuentra.

{% highlight shell %}
$ npm install
{% endhighlight %}

Si todo funciona correctamente, subimos nuestro nuevo fichero al repositorio:

{% highlight plain %}
$ git add .
$ git commit -m "Added Procfile"
$ git push origin develop
{% endhighlight %}

### Crear una aplicación en Heroku
Heroku utiliza git para la gestión del código, así que tendremos que crear la aplicación en Heroku y poner una referencia en nuestra lista de repositorios remotos.

{% highlight shell %}
$ heroku apps:create <appName> -remote <remote> --region eu
{% endhighlight %}

Esto creará una aplicación ```<appName>``` en Heroku, creará un repositorio remoto llamado ```<remote>``` (por defecto, heroku) e indicamos que nuestra región es Europa.

Si tenemos la aplicación creada en Heroku, podemos añadirla como repositorio remoto:
{% highlight shell %}
$ heroku git:remote -a <appName>
{% endhighlight %}

Debido a que tenemos la rama maestra y la de desarrollo, y Heroku sólo tiene en cuenta la rama master para los despliegues en sus servidores, recomiendo crear otra app en Heroku para desarrollo. Yo lo he hecho añadiendo ```-dev``` tanto al nombre de la app con al nombre del repositorio remoto.

{% highlight shell %}
$ heroku apps:create <appName>-dev -remote <remote>-dev --region eu
{% endhighlight %}

### Desplegar el código
{% img pull-left no-border http://sailsjs.org/images/image_devInTub.png 'Sails lift'%}
Hasta ahora solo hemos subido el código a la rama ```develop``` por lo que tendremos que desplegar en la rama master de ```heroku-dev```.

{% highlight shell %}
$ git push heroku-dev develop:master
{% endhighlight %}

Veremos como detecta que es una aplicación Node.js, instala las dependencias, cachea node_modules para futuros despliegues, construye el entorno, parsea el Procfile comprime y lanza. Ahora podemos ver nuestra webapp en el entorno de pre-producción <http://building-realtime-webapp-dev.herokuapp.com>