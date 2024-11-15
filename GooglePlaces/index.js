const axios = require('axios');

class GooglePlaces {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    async getNearbyPlaces(params) {
        const { location, radius, type, keyword } = params;
        const baseUrl = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';

        // Construir la URL de búsqueda
        const url = new URL(baseUrl);
        url.searchParams.append('location', location);
        url.searchParams.append('radius', radius);
        if (type) url.searchParams.append('type', type); // Tipo de lugar
        if (keyword) url.searchParams.append('keyword', keyword); // Palabra clave

        url.searchParams.append('key', this.apiKey);

        // Realizar la solicitud a Google Places API
        const response = await axios.get(url.toString());
        return response.data.results;
    }

    async getPlaceDetails(params) {
        const { placeId, fields } = params;

        const baseUrl = `https://maps.googleapis.com/maps/api/place/details/json`;
        const url = new URL(baseUrl);
        url.searchParams.append('place_id', placeId);
        url.searchParams.append('key', this.apiKey);
        if (fields) url.searchParams.append('fields', fields); // Campos que va devolver el servicio
        const response = await axios.get(url.toString());
        return response.data.result;
    }
}

module.exports = GooglePlaces;
