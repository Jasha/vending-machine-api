const DENOMINATIONS = require('../utils/constants');

const objectId = (value, helpers) => {
  if (!value.match(/^[0-9a-fA-F]{24}$/)) {
    return helpers.message('"{{#label}}" must be a valid mongo id');
  }
  return value;
};

const password = (value, helpers) => {
  if (value.length < 4) {
    return helpers.message('password must be at least 4 characters');
  }
  if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
    return helpers.message('password must contain at least 1 letter and 1 number');
  }
  return value;
};

const deposit = (value, helpers) => {
  if (DENOMINATIONS.indexOf(value) === -1) {
    return helpers.message(`deposit can only be ${DENOMINATIONS.join(', ')} cent coins`);
  }
  return value;
};

module.exports = {
  objectId,
  password,
  deposit,
};
