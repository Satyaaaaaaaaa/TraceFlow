const { User } = require('../../common/models/User');
const crypto = require('crypto');

const encryptPassword = (password) => {
  return crypto.createHash('sha256')
    .update(password)
    .digest('hex');
};

module.exports = {

  createUserService: async (payload) => {
    const encryptedPassword = encryptPassword(payload.password);

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