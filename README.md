# Places API

Este proyecto es un servicio en Node.js para listar lugares de acuerdo a coordenadas geográficas y filtros adicionales como tipo de lugar, radio de búsqueda, etc. La aplicación requiere Node.js versión 21.5.0 o superior.



## Requisitos Previos

Node.js: La versión debe ser 21.5.0 o superior. Verifica tu versión actual con:

```bash
node -v
```


Nodemon (opcional): Herramienta para reiniciar automáticamente el servidor durante el desarrollo. Para instalarla globalmente:

```bash
npm install -g nodemon
```


## Instalación

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

## Uso del Servicio

La API ofrece un endpoint para buscar lugares cercanos basado en coordenadas y otros parámetros opcionales.


**Endpoint:** /nearby-search

**Método:** POST

**Descripción:** Devuelve una lista de lugares cercanos a las coordenadas proporcionadas y aplicando los filtros especificados.


### Parámetros de Consulta
- **location (requerido):** Coordenas geográficas del punto de referencia. EJ: "3.4426109,-76.5301356"
- **radius (requerido):** Radio de búsqueda en metros.
- **type (opcional):** Tipo de lugar a buscar (por ejemplo, restaurant, park, museum).
- **keyword (opcional):** Palabra clave para filtrar los resultados por nombre o descripción.
- **rows (opcional):** Cantidad de lugares a devolver (por defecto es 5).
- **fields (opcional):** Campos que se quieren devolver en la respuesta (por ejemplo, name, rating, price_level).


### Ejemplo de Solicitud

```bash
POST http://localhost:3000/nearby-search
```
**Request Body:**
```json
{
  "location": "3.4426109,-76.5301356",
  "radius": 150,
  "rows": 1,
  "fields": "name,rating,price_level",
  "type": "restaurant"
}
```

**Respuesta:**
```json
{
    "message": "Lugares cercanos destacados",
    "data": [
        
    ]
}
```
