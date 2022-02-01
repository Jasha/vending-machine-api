const faker = require('faker');
const { User } = require('../../../src/models');

describe('User model', () => {
  describe('User validation', () => {
    let newUser;
    beforeEach(() => {
      newUser = {
        username: faker.name.findName().toLowerCase(),
        password: 'password1',
        role: 'buyer',
      };
    });

    test('should correctly validate a valid user', async () => {
      await expect(new User(newUser).validate()).resolves.toBeUndefined();
    });

    test('should throw a validation error if password length is less than 4 characters', async () => {
      newUser.password = 'p1';
      await expect(new User(newUser).validate()).rejects.toThrow();
    });

    test('should throw a validation error if password does not contain numbers', async () => {
      newUser.password = 'ppppp';
      await expect(new User(newUser).validate()).rejects.toThrow();
    });

    test('should throw a validation error if password does not contain letters', async () => {
      newUser.password = '11111';
      await expect(new User(newUser).validate()).rejects.toThrow();
    });

    test('should throw a validation error if role is unknown', async () => {
      newUser.role = 'user';
      await expect(new User(newUser).validate()).rejects.toThrow();
    });
  });

  describe('User toJSON()', () => {
    test('should not return user password when toJSON is called', () => {
      const newUser = {
        username: faker.name.findName().toLowerCase(),
        password: 'password1',
        role: 'buyer',
      };
      expect(new User(newUser).toJSON()).not.toHaveProperty('password');
    });
  });
});
