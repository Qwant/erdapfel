import request from 'supertest';
import wait from '../tools';

let server

beforeAll(async () => {
  server = request('http://localhost:3000')
})

test('responds to /', done => {
  server
    .get('/')
    .expect(200, done)
});

test('responds to /statics', done => {
  server
    .get('/statics/images/qwant-logo.svg')
    .expect('Content-Type', 'image/svg+xml')
    .expect(200, done)
});

test('responds to logs', done => {
  server
    .post('/logs')
    .set('Content-Type', 'application/json')
    .send('{"key":"value"}')
    .expect(204, done)
});

test('responds to events and update metrics', done => {
  server
    .get('/metrics')
    .expect(200)
    .then(response => {
      let currentFavSaveCount = parseInt(response.text.match(/\nerdapfel_favorite_save_count (\d*)/)[1])
      server
        .post('/events')
        .set('Content-Type', 'application/json')
        .send('{"type":"favorite_save"}')
        .expect(204, () => {
          server.get('/metrics')
            .expect(200)
            .then(response => {
              let newSaveCount = parseInt(response.text.match(/\nerdapfel_favorite_save_count (\d*)/)[1])
              expect(newSaveCount).toBeGreaterThan(currentFavSaveCount)
            })
            .then(done)
        })
    })
});

test('refuses unknown events', done => {
  server
    .post('/events')
    .set('Content-Type', 'application/json')
    .send('{"type":"unknown"}')
    .expect(400, done)
});
