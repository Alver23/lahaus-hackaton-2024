require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

// Ruta POST para búsqueda cercana
app.post('/nearby-search', async (req, res) => {
    const { location, radius, type, keyword, rows = 5 } = req.body;

    // Validar los parámetros requeridos
    if (!location || !radius) {
        return res.status(400).json({
            error: "Los parámetros 'location' y 'radius' son obligatorios. Ejemplo: { location: '37.7749,-122.4194', radius: 1500 }"
        });
    }

    try {
        const apiKey = process.env.GOOGLE_PLACES_API_KEY;
        const baseUrl = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';

        // Construir la URL de búsqueda
        const url = new URL(baseUrl);
        url.searchParams.append('location', location);
        url.searchParams.append('radius', radius);
        if (type) url.searchParams.append('type', type); // Tipo de lugar
        if (keyword) url.searchParams.append('keyword', keyword); // Palabra clave
        url.searchParams.append('key', apiKey);

        // Realizar la solicitud a Google Places API
        const path = url.toString()
        console.log('path', path)
        const response = await axios.get(url.toString());
        const data = response.data;

        const places = data.results
        // Selecciona los tres primeros lugares con mejor rating
        const topPlaces = places
            .slice(0, rows);


        const placeDetails = await Promise.all(topPlaces.map(async (place) => {
            const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&key=${apiKey}`;
            const detailsResponse = await axios.get(detailsUrl);
            const { reviews, ...details} = detailsResponse.data.result;

            const destination = `${place.geometry.location.lat},${place.geometry.location.lng}`;


            // Realiza la solicitud a Distance Matrix API para tiempo caminando
            const walkingUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${location}&destinations=${destination}&mode=walking&key=${apiKey}`;
            const walkingResponse = await axios.get(walkingUrl);
            const walkingData = walkingResponse.data.rows[0].elements[0];

            // Realiza la solicitud a Distance Matrix API para tiempo conduciendo
            const drivingUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${location}&destinations=${destination}&mode=driving&key=${apiKey}`;
            const drivingResponse = await axios.get(drivingUrl);
            const drivingData = drivingResponse.data.rows[0].elements[0];

            return {
                ...details,
                distance_text: walkingData.distance.text, // Distancia desde el punto de origen
                walking_time: walkingData.duration.text,  // Tiempo caminando
                driving_time: drivingData.duration.text   // Tiempo conduciendo
            };
        }));


        // Enviar los resultados al cliente
        res.json({
            message: "Lugares cercanos destacados",
            data: placeDetails
        });
    } catch (error) {
        console.error('Error al realizar la búsqueda:', error);
        res.status(500).json({ error: 'Ocurrió un error interno' });
    }
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
