require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const GooglePlacesService = require('./GooglePlaces');
const GooglePlacesConnector = require('./GooglePlaces/v2');

const app = express();
app.use(bodyParser.json());

// Ruta POST para búsqueda cercana
app.post('/nearby-search', async (req, res) => {
    const { location, radius, type, keyword, rows = 5, fields, rankby = 'prominence' } = req.body;

    // Validar los parámetros requeridos
    if (!location) {
        return res.status(400).json({
            error: "Los parámetros 'location' son obligatorios. Ejemplo: { location: '37.7749,-122.4194' }"
        });
    }

    try {
        const apiKey = process.env.GOOGLE_PLACES_API_KEY;
        const googlePlacesService = new GooglePlacesService(apiKey)

        const params = {
            location, radius, type, keyword, rankby
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
        const errorMessage = error.message ?? 'Ocurrió un error interno';
        const stackTrace = error.stack;
        res.status(500).json({ error: { message: errorMessage, stackTrace } });
    }
});

app.post('/v2/nearby-search', async (req, res) => {
    try {
        const { location, radius, includedTypes, includedPrimaryTypes, excludedTypes, excludedPrimaryTypes, maxResultCount = 5, fields = 'places.id,places.name', rankPreference = 'POPULARITY' } = req.body;

        if (!location || !radius || !fields) {
            return res.status(400).json({
                error: "Los parámetros 'location, radius, fields' son obligatorios. Ejemplo: { location: '37.7749,-122.4194', fields: 'places.id,places.name', radius: 150 }"
            });
        }

        const [latitude, longitude] = location.split(',');
        const apiKey = process.env.GOOGLE_PLACES_API_KEY;
        const googlePlacesConnector = new GooglePlacesConnector(apiKey);
        const { places } = await googlePlacesConnector.getPlacesList({
            fields,
            radius,
            location: { latitude, longitude },
            maxResultCount,
            rankPreference,
            includedTypes, includedPrimaryTypes, excludedTypes, excludedPrimaryTypes
        });

        res.json({
            message: "Lugares cercanos destacados",
            data: places
        });
    } catch (error) {
        const statusCode = error.response?.status ?? 500;
        const errorData = error.response?.data ?? {};
        const errorMessage = error.message ?? 'Ocurrió un error interno';
        const stackTrace = error.stack;
        res.status(statusCode).json({ error: { message: errorMessage, stackTrace, data: errorData } });
    }
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
