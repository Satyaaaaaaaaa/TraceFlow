const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { enrollUser } = require("../../services/fabricService");
const {User} = require('../../common/models/associations');
const { roles, jwtExpirationInSeconds } = require('../../config');

const jwtSecret = process.env.JWT_SECRET

const generateAccessToken = (username, userId) => {
    return jwt.sign({ 
        username, userId
    },
    jwtSecret, 
    { 
        expiresIn: jwtExpirationInSeconds
    });
};

const encryptPassword = (password) => {
    const hash = crypto.createHash('sha256')
    hash.update(password)
    return hash.digest('hex');
}

module.exports = {
    register: (req, res) => {
        const payload = req.body;
        let encryptedPassword = encryptPassword(payload.password);
        let role = payload.role || roles.USER;
        User.create(
            Object.assign(payload, { password: encryptedPassword, role })
        )
        // The object being passed to createUser 
        // is constructed using the spread operator 
        // (...) to take all properties from the 
        // payload object, and then adding or overriding
        //  the password and role properties.
        // alternative to using Object.assign()?
        // for creating a new object that 
        // combines properties from other objects.
        .then(async (user) => {
            
            // --- FABRIC INTEGRATION ---
            // After successfully creating the user in the DB, enroll them in Fabric.
            const enroll = await enrollUser(user.username, 'client');
            console.log("Enroll Result:", enroll);

            // --- END FABRIC INTEGRATION ---

            const accessToken = generateAccessToken(payload.username, user.id);
            return res.status(201).json({
                status: true,
                data: {
                    user: user.toJSON(),
                    token: accessToken,
                }
            });
        })
        .catch((error) => {
            return res.status(400).json({
                status: false,
                error: error.message
            });
        });
    },

    login: (req, res) => {
        const { username, password } = req.body;
        console.log("Username: " + username)
        const encryptedPassword = encryptPassword(password);

        User.findOne({ where: { username: username } })
        .then((user) => {
            console.log(user)
            if (!user) {
                return res.status(401).json({
                    status: false,
                    error: 'Invalid username or password'
                });
            }
            if (user.password !== encryptedPassword) {
                return res.status(401).json({
                    status: false,
                    error: 'Invalid username or password'
                });
            }
            console.log(user.username)
            console.log(encryptedPassword)
            const accessToken = generateAccessToken(username, user.id);
            return res.status(200).json({
                status: true,
                data: {
                    user: user.toJSON(),
                    token: accessToken
                }
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