const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createProduct = {
  body: Joi.object().keys({
    amountAvailable: Joi.number(),
    cost: Joi.number().required(),
    productName: Joi.string().required(),
  }),
};

const getProducts = {
  query: Joi.object().keys({
    productName: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getProduct = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId),
  }),
};

const updateProduct = {
  params: Joi.object().keys({
    productId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      amountAvailable: Joi.number(),
      cost: Joi.number(),
      productName: Joi.string(),
    })
    .min(1),
};

const deleteProduct = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId),
  }),
};

const buyProduct = {
  body: Joi.object().keys({
    amount: Joi.number().required(),
    productId: Joi.required().custom(objectId),
  }),
};

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  buyProduct,
};
