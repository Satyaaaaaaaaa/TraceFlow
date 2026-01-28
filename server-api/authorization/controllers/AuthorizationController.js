const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { enrollUser } = require("../../services/fabricService");
const {User} = require('../../common/models/associations');
const { roles, jwtExpirationInSeconds } = require('../../config');
const { createUserBCStatus, updateUserBCStatus, findUserBCStatus } = require("../../common/models/UserBlockchainStatus")

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

//Todo : User registers -> saved in database -> enrolled in blockchain(with x509 identity)
//If by chance blockchain fails user is still registered in database but not in blockchain.
//So he can login but access denied for doing anything blockchain.
module.exports = {
    register: async (req, res) => {
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

            // REQUIRED: create BC status AFTER user exists
            await createUserBCStatus(user.id);

            let isSynced = false;

            try {
                // --- FABRIC INTEGRATION ---
                // Wrap this in try-catch so failure doesn't stop the registration
                const enroll = await enrollUser(user.username, 'client');
                console.log("Enroll Result:", enroll);
                
                // If enrollUser returns an object with a success property
                isSynced = enroll && enroll.success === true;
            } catch (fabricError) {
                // Log the error but don't stop the execution
                console.error("Blockchain enrollment failed, but continuing registration:", fabricError.message);
            }

            // Update the user record with whatever the result was
            await user.update({ blockchainStatus: isSynced });

            await updateUserBCStatus(
                { userId: user.id },
                { blockchainStatus: isSynced }
            );


            // Update ONLY the BC status table
            await updateUserBCStatus(
                { userId: user.id },
                { blockchainStatus: isSynced }
            );

            // Generate token
            const accessToken = generateAccessToken(user.username, user.id);

            // ALWAYS return status: true here because the database user was created
            return res.status(201).json({
                status: true,
                data: {
                    user: user.toJSON(),
                    token: accessToken,
                    blockchainError: !isSynced
                }
            });
        })
        .catch((error) => {
            // This ONLY catches errors from User.create (e.g., duplicate email)
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
    },

    syncUserToBlockchain: async (req, res) => {
        try {
            // 1. Extract the userId from the authenticated request
            const userId = req.user.userId;

            // 2. Fetch the user from the database
            const user = await User.findByPk(userId);

            if (!user) {
                return res.status(404).json({
                    status: false,
                    error: 'User not found'
                });
            }

            // 3. --- FABRIC INTEGRATION ---
            // Attempt to enroll the user in Hyperledger Fabric
            const enroll = await enrollUser(user.username, 'client');
            console.log("Enroll Result:", enroll);

            // 4. Update the database status
            await user.update({ blockchainStatus: true });

            // REQUIRED: update blockchain status table (source of truth)
            await updateUserBCStatus(
                { userId },
                { blockchainStatus: true }
            );
            
            // 5. Return success to the Android App
            // We use status: true and 'data' wrapper to match the Android Repository.
            return res.status(200).json({
                status: true,
                data: user.toJSON()
            });

        } catch (error) {
            console.error("Blockchain Sync Error:", error);
            return res.status(500).json({
                status: false,
                error: `Blockchain sync failed: ${error.message}`
            });
        }
    }
}