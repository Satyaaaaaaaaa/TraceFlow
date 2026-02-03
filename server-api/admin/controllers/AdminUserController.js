const UserModel = require("../../common/models/User");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

module.exports = {
    getUser: (req, res) => {

        const { id } = req.params;

        UserModel.findUser({ id })
            .then((user) => {
                if (!user) {
                    return res.status(404).json({
                        status: false,
                        error: "User not found",
                    });
                }

                return res.status(200).json({
                    status: true,
                    data: user.toJSON(),
                });
            })
            .catch((error) => {
                return res.status(400).json({
                    status: false,
                    error: error.message,
                });
            });
    },
    //It deletes the user even if user was never there, skipped this for now
    deleteUser: (req, res) => {

        const { id } = req.params;

        if (id === req.user.userId) {
            return res.status(400).json({
                status: false,
                error: "Admin cannot delete himself",
            });
        }

        UserModel.deleteUser({ id })
            .then(() => {
                return res.status(200).json({
                    status: true,
                    message: 'User deleted successfully!'
                });
            })
            .catch((error) => {
                return res.status(400).json({
                    status: false,
                    error: error.message
                });
            });
    },

    getUsers: (req, res) => {
        UserModel.findAllUsers(req.query)
            .then((users) => {
                return res.status(200).json({
                    status: true,
                    data: users.map((user) => user.toJSON())
                });
            })
            .catch((error) => {
                return res.status(400).json({
                    status: false,
                    error: error.message
                });
            });
    },

    changeRole: (req, res) => {
        const { id } = req.params;
        const { role } = req.body;

        if (!role) {
            return res.status(400).json({
                status: false,
                error: "Role is required",
            });
        }

        if (id === req.user.userId) {
            return res.status(400).json({
                status: false,
                error: "Admin cannot change his own role",
            });
        }

        UserModel.updateUser({ id }, { role })
            .then(() => UserModel.findUser({ id }))
            .then((user) => {
                if (!user) {
                    return res.status(404).json({
                        status: false,
                        error: "User not found",
                    });
                }

                return res.status(200).json({
                    status: true,
                    data: user.toJSON(),
                });
            })
            .catch((error) => {
                return res.status(400).json({
                    status: false,
                    error: error.message,
                });
            });
    }
   
};
