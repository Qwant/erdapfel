import request from 'supertest';

let server;

beforeAll(async () => {
  server = request(APP_URL);
});

test('responds to /', done => {
  server.get('/').expect(200, done);
});

test('responds to /statics', done => {
  server
    .get('/statics/images/qwant-logo.svg')
    .expect('Content-Type', 'image/svg+xml')
    .expect(200, done);
});

test('responds to logs', done => {
  server
    .post('/logs')
    .set('Content-Type', 'application/json')
    .send('{"key":"value"}')
    .expect(204, done);
});

test('responds to events and update metrics', done => {
  server
    .get('/metrics')
    .expect(200)
    .then(response => {
      const currentFavSaveCount = parseInt(
        response.text.match(/\nerdapfel_favorite_open_count (\d*)/)[1]
      );
      server
        .post('/events')
        .set('Content-Type', 'application/json')
        .send('{"type":"favorite_open"}')
        .expect(204, () => {
          server
            .get('/metrics')
            .expect(200)
            .then(response => {
              const newSaveCount = parseInt(
                response.text.match(/\nerdapfel_favorite_open_count (\d*)/)[1]
              );
              expect(newSaveCount).toBeGreaterThan(currentFavSaveCount);
            })
            .then(done);
        });
    });
});

test('refuses unknown events', done => {
  server
    .post('/events')
    .set('Content-Type', 'application/json')
    .send('{"type":"unknown"}')
    .expect(400, done);
});

test('refuses array in telemetry type', done => {
  server
    .post('/events')
    .set('Content-Type', 'application/json')
    .send('{"type":["localise_trigger"]}')
    .expect(400, done);
});

describe('get style.json', () => {
  test('without parameter', done => {
    server
      .get('/style.json')
      .expect(200, /name:en/)
      .then(response => {
        expect(response.body.layers.map(l => l.id)).toContain('poi-level-1');
        done();
      });
  });

  test('with nopoi layers', done => {
    server
      .get('/style.json?layers=nopoi')
      .expect(200, /name:en/)
      .then(response => {
        expect(response.body.layers.map(l => l.id)).not.toContain('poi-level-1');
        done();
      });
  });

  test('with lang=fr', done => {
    server
      .get('/style.json?lang=fr')
      .expect(200, /name:fr/)
      .then(response => {
        expect(response.body.layers.map(l => l.id)).toContain('poi-level-1');
        done();
      });
  });

  test('with unknown lang, fallback to en', done => {
    server
      .get('/style.json?lang=abc')
      .expect(200, /name:en/)
      .then(response => {
        expect(response.body.layers.map(l => l.id)).toContain('poi-level-1');
        done();
      });
  });

  test('with explicit layers and lang', done => {
    server
      .get('/style.json?layers=nopoi&lang=fr')
      .expect(200, /name:fr/)
      .then(response => {
        expect(response.body.layers.map(l => l.id)).not.toContain('poi-level-1');
        done();
      });
  });

  test('invalid value for layers leads to 400', done => {
    server.get('/style.json?layers=invalid').expect(400, done);
  });
});

describe('Full text queries (?q= param)', () => {
  function getSearchParams(url = '') {
    return new URLSearchParams((url.split('?')[1] || '').split('#')[0]);
  }

  // Server-side calls to Idunn autocomplete are mocked in ../server_start.js

  test('can redirect to the no result state', done => {
    server
      .get('/?q=gibberish')
      .expect(307)
      .expect('Location', /\/noresult/, done);
  });

  test('Intention: redirect to a multiple result with bbox and type', done => {
    server
      .get('/?q=restonice')
      .expect(307)
      .expect('Location', /\/places\//)
      .expect(res => {
        const redirectUrl = res.get('Location');
        const params = getSearchParams(redirectUrl);
        if (!params.has('type') || params.get('type') !== 'restaurant') {
          throw new Error(`Bad "type" param ${redirectUrl}`);
        }
        if (!params.has('bbox') || params.get('bbox') !== [7.0, 43.5, 7.5, 44.0].join(',')) {
          throw new Error(`Bad "bbox" param ${redirectUrl}`);
        }
      })
      .end(done);
  });

  test('No intention: redirect to the first matching POI', done => {
    server
      .get('/?q=single')
      .expect(307)
      .expect(res => {
        const redirectUrl = res.get('Location');
        const [, poiID] = /\/place\/([^?]*)/.exec(redirectUrl) || [];
        if (poiID !== 'addr:4.359352;43.84274')
          throw new Error(`Bad POI redirection ${redirectUrl}`);
      })
      .end(done);
  });
});
