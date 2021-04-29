const App = require('./../../bin/app');
const nock = require('nock');
const config = require('./test_config');

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

const noResultAutocomplete = require('../__data__/autocomplete_empty.json');
nock(/idunn_test\.test/)
  .persist(true)
  .get('/v1/autocomplete')
  .query(params => params.q === 'gibberish')
  .reply(200, JSON.stringify(noResultAutocomplete));

const intentionAutocomplete = require('../__data__/autocomplete.json');
nock(/idunn_test\.test/)
  .persist(true)
  .get('/v1/autocomplete')
  .query(params => params.q === 'restonice')
  .reply(200, JSON.stringify(intentionAutocomplete));

const noIntentionAutocomplete = require('../__data__/autocomplete_type.json');
nock(/idunn_test\.test/)
  .persist(true)
  .get('/v1/autocomplete')
  .query(params => params.q === 'single')
  .reply(200, JSON.stringify(noIntentionAutocomplete));

global.appServer = new App(config);

module.exports = async function () {
  /* eslint-disable no-console */
  console.log(`Start test on PORT : ${config.PORT}`);
  await global.appServer.start(config.PORT);
};
