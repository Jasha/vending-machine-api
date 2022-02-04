const httpStatus = require('http-status');
const { Product } = require('../models');
const ApiError = require('../utils/ApiError');
const DENOMINATIONS = require('../utils/constants');

/**
 * Create a product
 * @param {User} seller
 * @param {Object} productBody
 * @returns {Promise<User>}
 */
const createProduct = async (seller, productBody) => {
  if (await Product.isProductNameTaken(productBody.productName)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Product name already taken');
  }
  return Product.create({ seller, ...productBody });
};

/**
 * Query for products
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryProducts = async (filter, options) => {
  return Product.paginate(filter, options);
};

/**
 * Get product by id
 * @param {ObjectId} id
 * @returns {Promise<Product>}
 */
const getProductById = async (id) => {
  return Product.findById(id);
};

/**
 * Get product by product name
 * @param {string} productName
 * @returns {Promise<Product>}
 */
const getProductByProductName = async (productName) => {
  return Product.findOne({ productName });
};

/**
 * Update product by id
 * @param {User} user
 * @param {ObjectId} productId
 * @param {Object} updateBody
 * @returns {Promise<Product>}
 */
const updateProductById = async (user, productId, updateBody) => {
  const product = await getProductById(productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  if (String(product.seller) !== user.id) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }
  if (product.productName && (await Product.isProductNameTaken(updateBody.productName, productId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Product name already taken');
  }
  Object.assign(product, updateBody);
  await product.save();
  return product;
};

/**
 * Delete product by id
 * @param {User} user
 * @param {ObjectId} productId
 * @returns {Promise<Product>}
 */
const deleteProductById = async (user, productId) => {
  const product = await getProductById(productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  if (String(product.seller) !== user.id) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }
  await product.remove();
  return product;
};

/**
 * Calculate change
 * @param {number} change
 * @returns {Array<number>}
 */
const calculateChange = (change) => {
  let rest = change;
  const result = [0, 0, 0, 0, 0];

  for (let i = DENOMINATIONS.length - 1; i >= 0; i -= 1) {
    if (rest >= DENOMINATIONS[i]) {
      result[i] = Math.floor(rest / DENOMINATIONS[i]);
      rest -= result[i] * DENOMINATIONS[i];
    }
  }

  return result;
};

/**
 * Buy product
 * @param {User} user
 * @param {Object} buyBody
 * @returns {Promise<Product>}
 */
const buyProduct = async (user, buyBody) => {
  const product = await getProductById(buyBody.productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  if (product.amountAvailable < buyBody.amount) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Not enough amount available');
  }

  const total = buyBody.amount * product.cost;
  if (user.deposit < total) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Not enough deposit');
  }

  // reduce amount available
  Object.assign(product, { amountAvailable: product.amountAvailable - buyBody.amount });
  await product.save();

  // reduce deposit
  Object.assign(user, { deposit: user.deposit - total });
  await user.save();

  return { total, product, change: calculateChange(user.deposit) };
};

module.exports = {
  createProduct,
  queryProducts,
  getProductById,
  getProductByProductName,
  updateProductById,
  deleteProductById,
  buyProduct,
};
