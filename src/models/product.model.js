const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const productSchema = mongoose.Schema(
  {
    amountAvailable: {
      type: Number,
      default: 0,
    },
    cost: {
      type: Number,
      required: true,
    },
    productName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    seller: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
productSchema.plugin(toJSON);
productSchema.plugin(paginate);

/**
 * Check if product name is taken
 * @param {string} productName - The product's name
 * @returns {Promise<boolean>}
 */
productSchema.statics.isProductNameTaken = async function (productName, excludeProductId) {
  const product = await this.findOne({ productName, _id: { $ne: excludeProductId } });
  return !!product;
};

/**
 * @typedef Product
 */
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
