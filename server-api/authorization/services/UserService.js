const { User } = require('../../common/models/User');
const TokenService = require("../services/TokenService")


module.exports = {

  createUserService: async (payload) => {
    const encryptedPassword = TokenService.encryptPassword(payload.password);

    const user = await User.create({
      ...payload,
      password: encryptedPassword,
      role: payload.role || 'USER'
    });

    return user;
  },

  updateBlockchainStatus: async (userId, status) => {
    return User.update(
      { blockchainStatus: status },
      { where: { id: userId } }
    );
  }
};