const UserModel = require("../../common/models/User");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;


module.exports = {
    getUser: (req, res) => {

        const authHeader = req.headers.authorization;
            console.log(authHeader)
            const token = authHeader.split(" ")[1];
            const decoded = jwt.verify(token, jwtSecret);  
            // var userId = decoded.userId
            // console.log(userId)
        
            const { userId } = decoded;
            console.log(userId)

        UserModel.findUser({ id: userId })
            .then((user) => {
                if (!user) {
                    return res.status(404).json({
                        status: false,
                        error: 'User not found!'
                    });
                }
                return res.status(200).json({
                    status: true,
                    data: user.toJSON()
                });
            })
            .catch((error) => {
                return res.status(400).json({
                    status: false,
                    error: error.message
                });
            });
    },

    updateUser: (req, res) => {
        const {
            user: { userId },
            body: payload,  // const payload = req.body
        } = req;
        if (!Object.keys(payload).length) {
            return res.status(400).json({
              status: false,
              error: {
                message: "Body is empty, hence can not update the user.",
              },
            });
        }

        UserModel.updateUser({ id: userId}, payload)
            .then((user) => {
                return res.status(200).json({
                    status: true,
                    data: user.toJSON
                });
            })
            .catch((error) => {
                return res.status(400).json({
                    status: false,
                    error: error.message
                });
            });
    },

    deleteUser: (req, res) => {
        const {
            user: { userId }
        } = req;

        UserModel.deleteUser({ id: userId })
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
        const {
            user: { userId },
            body: { role }
        } = req;

        UserModel.updateUser({ id: userId }, { role })
            .then((user) => {
                return res.status(200).json({
                    status: true,
                    data: user.toJSON()
                });
            })
            .catch((error) => {
                return res.status(400).json({
                    status: false,
                    error: error.message
                });
            });
    },

    // FUNCTION FOR ANY USER TO CHANGE ROLE THEMSELVES
    changeSelfRole: (req, res) => {
        const {
            user: { userId },
            body: { role }
        } = req;

        //UPDATED TO BUYER AND SELLER)
        // Only allow changing between BUYER and SELLER
        const allowedRoles = ['BUYER', 'SELLER', 'buyer', 'seller'];
        
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                status: false,
                error: 'Invalid role. Only BUYER and SELLER roles are allowed.'
            });
        }
    
        // CONVERTING TO UPPERCASE
        const normalizedRole = role.toUpperCase();
    
        UserModel.updateUser({ id: userId }, { role: normalizedRole })
            .then(() => {
                return UserModel.findUser({ id: userId });
            })
            .then((user) => {
                return res.status(200).json({
                    status: true,
                    data: user.toJSON(),
                    message: 'Role updated successfully'
                });
            })
            .catch((error) => {
                return res.status(400).json({
                    status: false,
                    error: error.message
                });
            });
    }
}