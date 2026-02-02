const UserModel = require("../models/User");

module.exports = {
    has: (role) => {
        return (req, res, next) => {
            const { userId } = jwt.verify(req.headers.authorization.split(" ")[1], jwtSecret);

            UserModel.findUser({id: userId})
            .then((user) => {
                if(user.role === role) {
                    return next();
                }
                return res.status(403).json({
                    status: false,
                    error: "Forbidden"
                });
            })
        }
    }
}