const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

//todo: modify, such that it attaches userId, username and role ... so jwt verification is not required in controllers
module.exports = { 
    check: (req, res, next) => {
        const authHeader = req.headers.authorization;

        if(!authHeader || !authHeader.startsWith("Bearer")) {
            return res.status(401)
            .json({
                "status": false, 
                "error": {
                    "message": "Either unauthorized or invalid machanism!"
                }
            });
        }

        const token = authHeader.split(" ")[1];
        if(!token){
            return res.status(401)
            .json({
                "status": false, 
                "error": {
                    "message": "Token not found!"
                }
            });
        }

        jwt.verify(token, jwtSecret, (err, user) => {
            if(err) {
                return res.status(403)
                .json({
                    "status": false, 
                    "error": {
                        "message": "Invalid Token! Please login again."
                    }
                });
            }

            req.user = user;
            next();
        });
    }
}
