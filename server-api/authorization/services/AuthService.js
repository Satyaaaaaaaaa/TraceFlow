const UserService = require('./UserService');
const BlockchainService = require('./BlockchainService');
const TokenService = require('./TokenService');

module.exports = {
  registerUserService: async (payload) => {

    const user = await UserService.createUserService(payload);

    let isSynced = false;

    try {
      const enroll = await BlockchainService.enrollUser(user.username);
      isSynced = enroll?.success === true;
    } catch (err) {
      console.error("Blockchain failed:", err.message);
    }

    await UserService.updateBlockchainStatus(user.id, isSynced);

    const token = TokenService.generateAccessToken(
      user.username,
      user.id
    );

    return {
      user,
      token,
      blockchainError: !isSynced
    };
  }
};