const mongoose = require('mongoose');
const Product = require('../../src/models/product.model');
const { userTwo } = require('./user.fixture');

const productOne = {
  _id: mongoose.Types.ObjectId(),
  amountAvailable: 10,
  seller: userTwo._id,
  productName: 'Product 1',
  cost: 25,
};

const insertProducts = async (products) => {
  await Product.insertMany(products);
};

module.exports = {
  productOne,
  insertProducts,
};
