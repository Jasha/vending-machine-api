const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { User } = require('../../src/models');
const { userOne, userTwo, userThree, insertUsers } = require('../fixtures/user.fixture');
const { productOne, insertProducts } = require('../fixtures/product.fixture');
const { userOneAccessToken, userThreeAccessToken } = require('../fixtures/token.fixture');

setupTestDB();

describe('Product routes', () => {
  describe('POST /v1/product/buy', () => {
    test('should return 200 and successfully buy a product if data is ok', async () => {
      await insertUsers([userOne, userTwo, userThree]);
      await insertProducts([productOne]);
      const buyBody = { productId: productOne._id, amount: 2 };

      const res = await request(app)
        .post('/v1/product/buy')
        .set('Authorization', `Bearer ${userThreeAccessToken}`)
        .send(buyBody)
        .expect(httpStatus.OK);

      const total = buyBody.amount * productOne.cost;
      expect(res.body).toEqual({
        total,
        product: {
          id: productOne._id.toHexString(),
          amountAvailable: productOne.amountAvailable - buyBody.amount,
          cost: productOne.cost,
          productName: productOne.productName,
          seller: productOne.seller._id.toHexString(),
        },
        change: [0, 0, 0, 1, 9],
      });

      const dbUser = await User.findById(userThree._id);
      expect(dbUser).toBeDefined();
      expect(dbUser).toMatchObject({ username: userThree.username, deposit: userThree.deposit - total, role: 'buyer' });
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne, userTwo, userThree]);
      await insertProducts([productOne]);
      const buyBody = { productId: productOne._id, amount: 2 };

      await request(app).post('/v1/product/buy').send(buyBody).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 404 error if product is missing', async () => {
      await insertUsers([userOne, userTwo, userThree]);
      await insertProducts([productOne]);
      const buyBody = { productId: userOne._id, amount: 2 };

      await request(app)
        .post('/v1/product/buy')
        .set('Authorization', `Bearer ${userThreeAccessToken}`)
        .send(buyBody)
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 400 error if there is not enough amount of product', async () => {
      await insertUsers([userOne, userTwo, userThree]);
      await insertProducts([productOne]);
      const buyBody = { productId: productOne._id, amount: 1234567 };

      await request(app)
        .post('/v1/product/buy')
        .set('Authorization', `Bearer ${userThreeAccessToken}`)
        .send(buyBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if there is not enough deposit', async () => {
      await insertUsers([userOne, userTwo, userThree]);
      await insertProducts([productOne]);
      const buyBody = { productId: productOne._id, amount: 2 };

      await request(app)
        .post('/v1/product/buy')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(buyBody)
        .expect(httpStatus.BAD_REQUEST);
    });
  });
});
