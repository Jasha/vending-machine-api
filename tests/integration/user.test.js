const request = require('supertest');
const faker = require('faker');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { User } = require('../../src/models');
const { userOne, userTwo, insertUsers } = require('../fixtures/user.fixture');
const { userOneAccessToken } = require('../fixtures/token.fixture');

setupTestDB();

describe('User routes', () => {
  describe('POST /v1/user', () => {
    let newUser;
    beforeEach(() => {
      newUser = {
        username: faker.name.findName().toLowerCase(),
        password: 'password1',
        role: 'buyer',
      };
    });

    test('should return 201 and successfully register user if request data is ok', async () => {
      const res = await request(app).post('/v1/user').send(newUser).expect(httpStatus.CREATED);
      expect(res.body).not.toHaveProperty('password');
      expect(res.body).toEqual({
        id: expect.anything(),
        username: newUser.username,
        deposit: 0,
        role: 'buyer',
      });

      const dbUser = await User.findById(res.body.id);
      expect(dbUser).toBeDefined();
      expect(dbUser.password).not.toBe(newUser.password);
      expect(dbUser).toMatchObject({ username: newUser.username, deposit: 0, role: 'buyer' });
    });

    test('should return 400 error if username is already used', async () => {
      await insertUsers([userOne]);
      newUser.username = userOne.username;

      await request(app).post('/v1/user').send(newUser).expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if password length is less than 4 characters', async () => {
      newUser.password = 'p1';

      await request(app).post('/v1/user').send(newUser).expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if password does not contain both letters and numbers', async () => {
      newUser.password = 'password';

      await request(app).post('/v1/user').send(newUser).expect(httpStatus.BAD_REQUEST);

      newUser.password = '11111111';

      await request(app).post('/v1/user').send(newUser).expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('GET /v1/user', () => {
    test('should return 200 and apply the default query options', async () => {
      await insertUsers([userOne, userTwo]);

      const res = await request(app)
        .get('/v1/user')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(2);
      expect(res.body.results[0]).toEqual({
        id: userOne._id.toHexString(),
        username: userOne.username,
        role: userOne.role,
        deposit: userOne.deposit,
      });
    });

    test('should return 401 if access token is missing', async () => {
      await insertUsers([userOne, userTwo]);

      await request(app).get('/v1/user').send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should correctly apply filter on username field', async () => {
      await insertUsers([userOne, userTwo]);

      const res = await request(app)
        .get('/v1/user')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .query({ username: userOne.username })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 1,
      });
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].id).toBe(userOne._id.toHexString());
    });
  });

  describe('GET /v1/user/:userId', () => {
    test('should return 200 and the user object if data is ok', async () => {
      await insertUsers([userOne]);

      const res = await request(app)
        .get(`/v1/user/${userOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).not.toHaveProperty('password');
      expect(res.body).toEqual({
        id: userOne._id.toHexString(),
        username: userOne.username,
        role: userOne.role,
        deposit: userOne.deposit,
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne]);

      await request(app).get(`/v1/user/${userOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('DELETE /v1/user/:userId', () => {
    test('should return 204 if data is ok', async () => {
      await insertUsers([userOne]);

      await request(app)
        .delete(`/v1/user/${userOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbUser = await User.findById(userOne._id);
      expect(dbUser).toBeNull();
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne]);

      await request(app).delete(`/v1/user/${userOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('PATCH /v1/user/:userId', () => {
    test('should return 200 and successfully update user if data is ok', async () => {
      await insertUsers([userOne]);
      const updateBody = {
        username: faker.name.findName().toLowerCase(),
        password: 'newPassword1',
      };

      const res = await request(app)
        .patch(`/v1/user/${userOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body).not.toHaveProperty('password');
      expect(res.body).toEqual({
        id: userOne._id.toHexString(),
        username: updateBody.username,
        role: 'buyer',
        deposit: 0,
      });

      const dbUser = await User.findById(userOne._id);
      expect(dbUser).toBeDefined();
      expect(dbUser.password).not.toBe(updateBody.password);
      expect(dbUser).toMatchObject({ username: updateBody.username, deposit: 0, role: 'buyer' });
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne]);
      const updateBody = { username: faker.name.findName() };

      await request(app).patch(`/v1/user/${userOne._id}`).send(updateBody).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 if username is already taken', async () => {
      await insertUsers([userOne, userTwo]);
      const updateBody = { username: userTwo.username };

      await request(app)
        .patch(`/v1/user/${userOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('POST /v1/user/deposit', () => {
    test('should return 200 and successfully increase deposit if data is ok', async () => {
      await insertUsers([userOne]);
      const depositBody = { deposit: 100 };

      const res = await request(app)
        .post('/v1/user/deposit')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(depositBody)
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        id: userOne._id.toHexString(),
        username: userOne.username,
        role: 'buyer',
        deposit: depositBody.deposit,
      });

      const dbUser = await User.findById(userOne._id);
      expect(dbUser).toBeDefined();
      expect(dbUser).toMatchObject({ username: userOne.username, deposit: depositBody.deposit, role: 'buyer' });
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne]);
      const depositBody = { deposit: 100 };

      await request(app).post('/v1/user/deposit').send(depositBody).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 if deposit is invalid', async () => {
      await insertUsers([userOne]);
      const depositBody = { deposit: 3 };

      await request(app)
        .post('/v1/user/deposit')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(depositBody)
        .expect(httpStatus.BAD_REQUEST);
    });
  });
});
