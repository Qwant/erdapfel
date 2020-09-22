const configBuilder = require('@qwant/nconf-builder');
const config = configBuilder.get_without_check();

// Specific config values for tests
config.mapStyle.baseMapUrl = '[]';
config.mapStyle.poiMapUrl = '[]';
config.services.idunn.url = 'http://idunn_test.test';
config.services.geocoder.url = 'http://geocoder.test/autocomplete';
config.direction.enabled = true;
config.direction.service.api = 'mapbox'; // Directions fixtures use mapbox format
config.events.enabled = true;
config.system.baseUrl = '/maps/';
config.server.routerBaseUrl = '/maps/';

module.exports = config;
