const UserService = require('./UserService');
const BlockchainService = require('./BlockchainService');
const TokenService = require('./TokenService');

module.exports = {
  registerUserService: async (payload) => {

    const user = await UserService.createUserService(payload);

    let isSynced = false;
    let blockchainError = null;

    try {
      const enroll = await BlockchainService.enrollUser(user.username);
      isSynced = enroll?.success === true;
    } catch (err) {
      blockchainError = err.message;
    }

    try {
      await UserService.updateBlockchainStatus(user.id, isSynced);
    } catch (err) {
      console.error("Blockchain status update failed:", err.message);
    }

    const token = TokenService.generateAccessToken(
      user.username,
      user.id
    );

    return {
      user,
      token,
      blockchainSynced: isSynced,
      blockchainError
    };
  }
};