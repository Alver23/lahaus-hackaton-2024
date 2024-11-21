const axios = require("axios");

class PlacesConnector {
    constructor(apiKey, languageCode = 'es', regionCode = 'CO') {
        this.apiKey = apiKey;
        this.baseUrl = 'https://places.googleapis.com/v1/places';
        this.languageCode = languageCode;
        this.regionCode = regionCode;
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': this.apiKey
        }
    }

    async getPlacesList (params) {
        const { location, fields, radius, includedTypes, includedPrimaryTypes, excludedTypes, excludedPrimaryTypes, maxResultCount, rankPreference } = params;
        const { latitude, longitude } = location
        const locationRestriction = {
            circle: {
                radius,
                center: { latitude, longitude },
            }
        }

        const requestUrl = `${this.baseUrl}:searchNearby`
        const requestHeaders = {...this.defaultHeaders, 'X-Goog-FieldMask': fields }
        const requestPayload = { locationRestriction, maxResultCount, rankPreference, languageCode: this.languageCode, regionCode: this.regionCode }
        if (includedTypes?.length > 0) requestPayload.includedTypes = includedTypes;
        if (includedPrimaryTypes?.length > 0) requestPayload.includedPrimaryTypes = includedPrimaryTypes;
        if (excludedTypes?.length > 0) requestPayload.excludedTypes = excludedTypes;
        if (excludedPrimaryTypes?.length > 0) requestPayload.excludedPrimaryTypes = excludedPrimaryTypes;
        return axios.post(requestUrl, requestPayload, { headers: requestHeaders })
            .then(response => response.data);
    }

    async getPlaceDetails(params) {
        const { placeId, fields } = params;

        const requestUrl = `${this.baseUrl}/${placeId}`
        const requestHeaders = {...this.defaultHeaders, 'X-Goog-FieldMask': fields }
        const requestPayload = { languageCode: this.languageCode, regionCode: this.regionCode }
        return axios.get(requestUrl, { params: requestPayload, headers: requestHeaders })
            .then(response => response.data);
    }
}

module.exports = PlacesConnector;
