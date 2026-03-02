const { User } = require('../../common/models/User');
const TokenService = require("../services/TokenService")
const { UserBlockchainStatus } = require('../../common/models/UserBlockchainStatus');

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
    const record = await UserBlockchainStatus.findOne({
      where: { userId }
    });

    if (!record) {
      return await UserBlockchainStatus.create({
        userId,
        blockchainStatus: status
      });
    }

    return await record.update({
      blockchainStatus: status
    });
  }
};