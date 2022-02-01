const allRoles = {
  buyer: ['manageDeposit'],
  seller: ['manageProducts'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
