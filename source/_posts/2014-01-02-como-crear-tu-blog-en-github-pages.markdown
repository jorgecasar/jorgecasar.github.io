---
layout: post
title: "Cómo crear tu blog en GitHub Pages"
date: 2013-12-18 10:20:12 +0100
comments: true
categories: webdevelop
tags:
- ruby
- github
- blog
---

Qué mejor manera de inaugurar este blog que contando cómo lo he hecho. [Github](http://github.com/) ofrece gratuitamente las [Github Pages](http://pages.github.com/), las cuales permiten crear páginas webs para tus proyectos, usuario y organizaciones. La mayoría de la gente conoce las páginas de los proyectos, pero también se pueden crear páginas de usuario y de organizaciones.
<!-- more -->

## Crear una GitHub Page
Las páginas de proyectos se pueden crear automáticamente desde los ajustes (*settings*) de tu proyecto presionando el botón *"Automatic Page Generator"* y siguiendo los pasos. Esto creará una nueva rama en tu proyecto llamada gh-page la cual se desplegará cada vez que hagas un push en dicha rama.  por lo que también puedes crearlas manualmente, sincronizar tu rama master con gh-pages o reemplazar la rama master por gh-pages. De una forma similar se pueden crear páginas para los usuarios y para las organizaciones, en este caso, hay que crear un repositorio llamado *username.github.io* dónde *username* es tu nombre de usuario o el nombre de la organización en GitHub. Asegurate de escribir correctamente el *username*, porque si no no funcionará. Lo que describo en este artículo también es aplicable a las páginas de proyecto, pero nos centraremos en las de usuario y organización.

Las GitHub Pages usan [Jekyll](http://jekyllrb.com/), un generador de sitios estáticos simple, con conciencia de blog, en Ruby. Para ello se necesita un directorio donde almacenar los ficheros de texto sin procesar y mediante conversores escupe una página estática completa lista para publicar en tu servidor. Los textos sin procesar utilizan sintaxis [Markdown](http://es.wikipedia.org/wiki/Markdown) y con ello nos olvidamos de las bases de datos pudiéndonos centrar en el contenido.

## Crear el entorno de desarrollo local
Antes de ponerse a subir contenido a las GitHub Pages es recomendable tener un entorno en local para previsualizar los cambios y así evitar hacer push innecesarios y esperar a que se actualice la GitHub Page para ver si lo hemos hecho bien. Para instalar Jekyll necesitamos:

1. [Ruby](http://www.ruby-lang.org/en/downloads/)
2. [RubyGems](http://rubygems.org/pages/download)

Una vez lo tenemos, instalamos la gema jekyll con `gem install jekyll`, la cual utilizará [Maruku](http://github.com/bhollis/maruku) para Markdown, pero si quieres puedes utilizar LaTeX, RDiscount o Kramdown, pero no obstante, recomiendo dejar Maruku.
El siguiente paso sería crear nuestro blog, para lo cual tenemos 2 opciones, utilizar Jekyll directamente o utilizar un framework como Octopress. Veamos cada una de las opciones.

### Crear tu blog con Jekyll
Jekyll nos ofrece la posibilidad de crear el esqueleto de nuestro blog mediante el comando `jekyll new username.github.io` y creará una carpeta llamada username.github.io, recordad que username es vuestro nombre de usuario u organización de GitHub. Esto genera la estructura siguiente:

{% highlight plain %}
.
├── _config.yml
├── _layouts
|   ├── default.html
|   └── post.html
├── _posts
|   └── 2013-12-18-welcome-to-jekyll.markdown
├── css
|   ├── main.css
|   └── syntax.css
└── index.html
{% endhighlight %}

Luego podemos ir creando más carpetas y ficheros, pero estos son los básicos para empezar:

- **_congi.yml**: almacena los datos de configuración. Muchas de estas opciones pueden ser especificadas desde la linea de comandos, pero es más fácil especificarlas aquí así no tienes que recordarlas.
- **layouts**: Son las plantillas [Liquid](http://wiki.shopify.com/Liquid) que envuelven los artículos. Las layouts se eligen en cada artículo mediantes la [información preeliminar en YAML](http://jekyllrb.com/docs/frontmatter/). El tag {{ content }} se usa para inyectar el contenido en la página web.
- **_posts**: Aqí se encuentra el contenido dinámico, por así decirlo. El formato de estos archivos es importante, y debe seguir el formato: año-mes-día-título.MARKUP. Los enlaces permanentes se pueden personalizar para cada artículo, pero la fecha y el lenguaje de marcado están determinados únicamente por el nombre del archivo.

Con esto es suficiente para empezar a crear tu blog, pero puedes aprender más sobre [plantillas](http://jekyllrb.com/docs/templates/), [enlaces permanentes](http://jekyllrb.com/docs/permalinks/), [paginación](http://jekyllrb.com/docs/pagination/) y [plugins](http://jekyllrb.com/docs/plugins/) leyendo la [documentación de Jekyll](http://jekyllrb.com/docs/home/).

### Crear tu blog con Octopress
Si no queremos empezar desde cero creando nuestras propias plantillas HTML, CSS y Javascript, podemos utilizar [Octopress](http://octopress.org/), un framework de blogs para hackers. Octopress viene con:

- Una plantilla HTML5 semántico
- Un diseño mobile first responsive
- Construido con soporte a para Twitter, Google Plus One, comentarios Disqus, Pinboard, Delicious y Google Analytics
- Una fácil estrategia de despliegue usando Github Pages o Rsync
- Construido en apoyo a los servidores POW y Rack
- Tematización fácil con Compass y Sass
- Un resaltado de sintaxis Beautiful Solarized

Además existen plugins creados por Octopress o por la comunidad de Jeklly con algunas mejoras. Puedes consultar el [listado de plugins](http://octopress.org/docs/plugins/) si quieres conocerlos.

Para empezar con Octupus debes comprobar que tienes Ruby 1.9.3 o superior, puedes comprobarlo escribiendo en la consola `ruby --version`. Una vez comprabdo ejecutamos los siguientes pasos:

- Clonamos el repositorio: {% highlight plain %}
git clone git://github.com/imathis/octopress.git username.github.io
{% endhighlight %}
- Instalamos las dependencias: {% highlight plain %}
gem install bundler
rbenv rehash  # Si usas rbenv, rehash para poder ejecutar el comando bundle
bundle install
{% endhighlight %}
- Instalar la plantilla por defecto: {% highlight plain %}
rake install
{% endhighlight %}

#### Plantillas Octopress
Si queremos instalar una plantilla diferente a la que viene por defecto puedes echar un ojo a lista de plantillas en [Opthemes](http://opthemes.com/) e instalarla siguiend estos pasos:

{% highlight plain %}
git clone GIT_URL .themes/THEME_NAME
rake install['THEME_NAME']
rake generate
{% endhighlight %}

### Desplegar en GitHub
Una vez que tenemos una primera versión de nuestro blog podemos desplegarlo en GitHub. Recuerda que primero has de crear el repositorio con nombre `username.github.io`. Una vez que lo tienes tendrás que configurar tu clon de Octopress para que puedas hacer los commits a tu repositorio. Para ello exite el comando, el cual te preguntará por la url de tu repositorio y configurará todo lo necesario para usar tu blog como GitHub Page.

{% highlight plain %}
rake setup_github_pages
{% endhighlight %}

Este comando realiza lo siguiente:

1. Solicita la url de tu repositorio (HTTP o SSH)
2. Cambia el nombre del puntero remoto *imathis/octopress* de `origen` a `octopress`
3. Añade tu repositorio Github Pages como `origin`
4. Cambia la rama activa de `master` a `source`
5. Configura la url de tu blog de ​​acuerdo a tu repositorio
6. Configura de una rama `master` en el directorio `_deploy` para el despliegue

Una vez configurado el entorno para trabajar con GitHub Pages podemos previsualizar el resultado ejecutando el comando:

{% highlight plain %}
rake preview
{% endhighlight %}

Y cuando hemos comprobado que está todo listo para subirlo a GitHub debemos generar el contenido estático y desplegarlo:

{% highlight plain %}
rake generate
rake deploy
{% endhighlight %}

Y no olvides subir el código fuente de tu blog:

{% highlight plain %}
git add .
git commit -m 'My new GitHub Page'
git push origin source
{% endhighlight %}