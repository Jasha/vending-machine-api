const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, tokenService } = require('../services');

const login = catchAsync(async (req, res) => {
  const { username, password } = req.body;
  const user = await authService.loginUserWithUsernameAndPassword(username, password);
  const activeTokens = await tokenService.getAllTokens(user);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens, activeTokens: activeTokens.length });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const logoutAll = catchAsync(async (req, res) => {
  await authService.logoutAll(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

module.exports = {
  login,
  logout,
  logoutAll,
  refreshTokens,
};
