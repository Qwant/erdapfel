const App = require( './../../bin/app');
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


global.appServer = new App(config);

module.exports = async function() {
  /* eslint-disable no-console */
  console.log(`Start test on PORT : ${config.PORT}`);
  await global.appServer.start(config.PORT);
};
