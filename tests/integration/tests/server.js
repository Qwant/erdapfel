import request from 'supertest';

let server;

beforeAll(async () => {
  server = request(APP_URL);
});

test('responds to /', done => {
  server
    .get('/')
    .expect(200, done);
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
      const currentFavSaveCount =
        parseInt(response.text.match(/\nerdapfel_favorite_open_count (\d*)/)[1]);
      server
        .post('/events')
        .set('Content-Type', 'application/json')
        .send('{"type":"favorite_open"}')
        .expect(204, () => {
          server.get('/metrics')
            .expect(200)
            .then(response => {
              const newSaveCount =
                parseInt(response.text.match(/\nerdapfel_favorite_open_count (\d*)/)[1]);
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
