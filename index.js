require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const GooglePlacesService = require('./GooglePlaces');

console.log('GooglePlacesService', GooglePlacesService)

const app = express();
app.use(bodyParser.json());

// Ruta POST para búsqueda cercana
app.post('/nearby-search', async (req, res) => {
    const { location, radius, type, keyword, rows = 5, fields } = req.body;

    // Validar los parámetros requeridos
    if (!location || !radius) {
        return res.status(400).json({
            error: "Los parámetros 'location' y 'radius' son obligatorios. Ejemplo: { location: '37.7749,-122.4194', radius: 1500 }"
        });
    }

    try {
        const apiKey = process.env.GOOGLE_PLACES_API_KEY;
        const googlePlacesService = new GooglePlacesService(apiKey)

        const params = {
            location, radius, type, keyword
        }
        const places = await googlePlacesService.getNearbyPlaces(params);
        const topPlaces = places
            .slice(0, rows);


        const placeDetails = await Promise.all(topPlaces.map(async (place) => {
            const details = await googlePlacesService.getPlaceDetails({
                placeId: place.place_id,
                fields: fields
            });

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
