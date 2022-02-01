const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { productService } = require('../services');

const createProduct = catchAsync(async (req, res) => {
  const user = await productService.createProduct(req.user, req.body);
  res.status(httpStatus.CREATED).send(user);
});

const getProducts = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['productName']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await productService.queryProducts(filter, options);
  res.send(result);
});

const getProduct = catchAsync(async (req, res) => {
  const product = await productService.getProductById(req.params.productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  res.send(product);
});

const updateProduct = catchAsync(async (req, res) => {
  const product = await productService.updateProductById(req.user, req.params.productId, req.body);
  res.send(product);
});

const deleteProduct = catchAsync(async (req, res) => {
  await productService.deleteProductById(req.user, req.params.productId);
  res.status(httpStatus.NO_CONTENT).send();
});

const buyProduct = catchAsync(async (req, res) => {
  const result = await productService.buyProduct(req.user, req.body);
  res.send(result);
});

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  buyProduct,
};
