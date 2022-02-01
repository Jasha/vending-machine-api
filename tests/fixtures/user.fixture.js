const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const faker = require('faker');
const User = require('../../src/models/user.model');

const password = 'password1';
const salt = bcrypt.genSaltSync(8);
const hashedPassword = bcrypt.hashSync(password, salt);

const userOne = {
  _id: mongoose.Types.ObjectId(),
  username: faker.name.findName().toLowerCase(),
  password,
  role: 'buyer',
  deposit: 0,
};

const userTwo = {
  _id: mongoose.Types.ObjectId(),
  username: faker.name.findName().toLowerCase(),
  password,
  role: 'seller',
};

const userThree = {
  _id: mongoose.Types.ObjectId(),
  username: faker.name.findName().toLowerCase(),
  password,
  role: 'buyer',
  deposit: 1000,
};

const insertUsers = async (users) => {
  await User.insertMany(users.map((user) => ({ ...user, password: hashedPassword })));
};

module.exports = {
  userOne,
  userTwo,
  userThree,
  insertUsers,
};
