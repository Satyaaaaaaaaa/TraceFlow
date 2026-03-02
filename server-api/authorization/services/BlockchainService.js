const { enrollUser } = require("../../services/fabricService");

module.exports = {
  enrollUser: async (username) => {
    return enrollUser(username, 'client');
  }
};