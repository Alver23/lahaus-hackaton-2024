**Places API**

Este proyecto es un servicio en Node.js para listar lugares de acuerdo a coordenadas geográficas y filtros adicionales como tipo de lugar, radio de búsqueda, etc. La aplicación requiere Node.js versión 21.5.0 o superior.



**Requisitos Previos**

Node.js: La versión debe ser 21.5.0 o superior. Verifica tu versión actual con:

```bash
node -v
```


Nodemon (opcional): Herramienta para reiniciar automáticamente el servidor durante el desarrollo. Para instalarla globalmente:

```bash
npm install -g nodemon
```


**Instalación**

Clona este repositorio:

```bash
git clone git@github.com:Alver23/lahaus-hackaton-2024.git
cd lahaus-hackaton-2024
```

Instala las dependencias:

```bash
npm install
```

** Ejecución de la Aplicación**
Usando Node.js
Para iniciar el servicio usando Node.js:

```bash
node app.js
```
Usando Nodemon
Para iniciar el servicio usando nodemon (recomendado en desarrollo):

```bash
nodemon app.js
```

Uso del Servicio

La API ofrece un endpoint para buscar lugares cercanos basado en coordenadas y otros parámetros opcionales.

