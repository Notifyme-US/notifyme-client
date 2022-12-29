'use strict';

const supertest = require('supertest');
const request = supertest(server);

beforeAll( async () => {
  await db.sync();
});

afterAll( async () => {
  await db.drop();
});

describe('Auth Tests', () => {
  test('allows user to signup with a POST to the /signup route', async () => {
    let response = await request.post('/signup').send({
      username: 'tester',
      password: 'pass',
      role: 'admin',
    });

    expect(response.status).toBe(201);
    expect(response.body.user.username).toEqual('tester');
    expect(response.body.user.password).toBeTruthy();
    expect(response.body.user.password).not.toEqual('pass');
  });
  test('allows user to signup with a POST to the /signin route', async () => {
    let response = await request.post('/signin').set('Authorization', 'Basic dGVzdGVyOnBhc3M=');
    expect(response.status).toBe(200);
    expect(response.body.user.username).toEqual('tester');
    expect(response.body.user.password).toBeTruthy();
    expect(response.body.user.password).not.toEqual('pass');
  });

});