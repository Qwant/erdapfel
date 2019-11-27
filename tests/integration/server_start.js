const App = require( './../../bin/app');
const configBuilder = require('@qwant/nconf-builder');
const nock = require('nock');

const { ...poiNoName } = require('../__data__/poi.json');
/* default test with matching name & local_name */
poiNoName.id = 'osm:way:453204';
nock(/idunn_test\.test/)
  .persist(true)
  .get(/osm:way:453204/)
  .reply(200, JSON.stringify(poiNoName));

/* set mismatching local_name */
const { ...poiFullName } = require('../__data__/poi.json');
poiFullName.local_name = 'Orsay museum';
poiFullName.id = 'osm:way:453203';
nock(/idunn_test\.test/)
  .persist(true)
  .get(/osm:way:453203/)
  .reply(200, JSON.stringify(poiFullName));

nock(/idunn_test\.test/)
  .persist(true)
  .get(/osm:way:63178753.*/)
  .reply(200, JSON.stringify(require('../__data__/poi.json')));

nock(/idunn_test\.test/)
  .persist(true)
  .get(/osm:way:2403/)
  .reply(404);

const config = configBuilder.get_without_check();

// Specific config values for tests
config.mapStyle.baseMapUrl = '[]';
config.mapStyle.poiMapUrl = '[]';
config.services.idunn.url = 'http://idunn_test.test';
config.services.geocoder.url = 'http://geocoder.test/autocomplete';
config.direction.enabled = true;
config.direction.service.api = 'mapbox'; // Directions fixtures use mapbox format
config.category.enabled = true;
config.events.enabled = true;
config.masq.enabled = false;
config.system.baseUrl = '/maps/';
config.server.routerBaseUrl = '/maps/';

global.appServer = new App(config);

module.exports = async function() {
  /* eslint-disable no-console */
  console.log(`Start test on PORT : ${config.PORT}`);
  await global.appServer.start(config.PORT);
};
