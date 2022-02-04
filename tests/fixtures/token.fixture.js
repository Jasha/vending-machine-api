const moment = require('moment');
const config = require('../../src/config/config');
const { tokenTypes } = require('../../src/config/tokens');
const tokenService = require('../../src/services/token.service');
const { userOne, userTwo, userThree } = require('./user.fixture');

const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
const userOneAccessToken = tokenService.generateToken(userOne, accessTokenExpires, tokenTypes.ACCESS);
const userTwoAccessToken = tokenService.generateToken(userTwo, accessTokenExpires, tokenTypes.ACCESS);
const userThreeAccessToken = tokenService.generateToken(userThree, accessTokenExpires, tokenTypes.ACCESS);

module.exports = {
  userOneAccessToken,
  userTwoAccessToken,
  userThreeAccessToken,
};
