const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { enrollUser } = require("../../services/fabricService");
const {User} = require('../../common/models/associations');
const { roles, jwtExpirationInSeconds } = require('../../config');
const { createUserBCStatus, updateUserBCStatus, findUserBCStatus } = require("../../common/models/UserBlockchainStatus");
//const { log } = require('console');
const TokenService = require("../services/TokenService")

const AuthService = require("../services/AuthService")

const jwtSecret = process.env.JWT_SECRET

const bcrypt = require("bcrypt");

const {
  createResetOTP,
  verifyResetOTP,
  clearOTP
} = require("../services/OtpService.js");

const  { emailQueue }   = require("../../infrastructure/queue/email/emailQueue.js");

//todo jwt sign with username, usrId and role aswell
// const generateAccessToken = (username, userId) => {
//     return jwt.sign({ 
//         username, userId
//     },
//     jwtSecret, 
//     { 
//         expiresIn: jwtExpirationInSeconds
//     });
// };

// const encryptPassword = (password) => {
//     const hash = crypto.createHash('sha256')
//     hash.update(password)
//     return hash.digest('hex');
// }

//Todo : User registers -> saved in database -> enrolled in blockchain(with x509 identity)
//If by chance blockchain fails user is still registered in database but not in blockchain.
//So he can login but access denied for doing anything blockchain.
module.exports = {

    register: async (req, res) => {
            try {
            const result = await AuthService.registerUserService(req.body);

            return res.status(201).json({
                status: true,
                data: result
            });
            } catch (error) {
            return res.status(error.statusCode || 400).json({
                status: false,
                error: error.message
            });
            }
        },

    // register: async (req, res) => {
    //     console.log("Registration Request Received");
    //     const payload = req.body;
    //     let encryptedPassword = encryptPassword(payload.password);
    //     let role = payload.role || roles.USER;
    //     console.log("Register Payload:", payload);
    //     User.create(
    //         Object.assign(payload, { password: encryptedPassword, role })
    //     )
    //     // The object being passed to createUser 
    //     // is constructed using the spread operator 
    //     // (...) to take all properties from the 
    //     // payload object, and then adding or overriding
    //     // the password and role properties.
    //     // alternative to using Object.assign()?
    //     // for creating a new object that 
    //     // combines properties from other objects.
    //     .then(async (user) => {

    //         // REQUIRED: create BC status AFTER user exists
    //         console.log("Creating blockchain status record for user ID:", user.id);
    //         await createUserBCStatus(user.id);
    //         console.log("Blockchain status record created.");

    //         let isSynced = false;

    //         try {
    //             // --- FABRIC INTEGRATION ---
    //             // Wrap this in try-catch so failure doesn't stop the registration
    //             const enroll = await enrollUser(user.username, 'client');
    //             console.log("Enroll Result:", enroll);
                
    //             // If enrollUser returns an object with a success property
    //             isSynced = enroll && enroll.success === true;
    //         } catch (fabricError) {
    //             // Log the error but don't stop the execution
    //             console.error("Blockchain enrollment failed, but continuing registration:", fabricError.message);
    //         }

    //         // Update the user record with whatever the result was
    //         await user.update({ blockchainStatus: isSynced });

    //         await updateUserBCStatus(
    //             { userId: user.id },
    //             { blockchainStatus: isSynced }
    //         );

    //         // Generate token
    //         const accessToken = generateAccessToken(user.username, user.id);

    //         // ALWAYS return status: true here because the database user was created
    //         return res.status(201).json({
    //             status: true,
    //             data: {
    //                 user: user.toJSON(),
    //                 token: accessToken,
    //                 blockchainError: !isSynced
    //             }
    //         });
    //     })
    //     .catch((error) => {
    //         // This ONLY catches errors from User.create (e.g., duplicate email)
    //         return res.status(400).json({
    //             status: false,
    //             error: error.message
    //         });
    //     });
    // },
    login: (req, res) => {
        const { username, password } = req.body;
        console.log("Username: " + username)
        const encryptedPassword = TokenService.encryptPassword(password);

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
            const accessToken = TokenService.generateAccessToken(username, user.id);
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
            const userId = req.user.id;

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
    },

    //HANDLES USERNAME AVAILABILITY IN THE DATABASE
    checkUsername: async (req, res) => {
        try {
            const { username } = req.body;

            const user = await User.findOne({ where: { username: username } });

            if (!user) {
                return res.status(404).json({
                    status: false,
                    error: 'Username not found'
                });
            }

            return res.status(200).json({
                status: true,
                message: 'Username found'
            });
        } catch (error) {
            return res.status(500).json({
                status: false,
                error: 'Server error'
            });
        }
    },
    
    //HANDLES FORGOT PASSWORD REQUEST
    requestResetOtp: async (req, res) => {

        try {

            //Recieve email from client
            const { email } = req.body;

            const user = await User.findOne({ where: { email } });

            if (!user) {
                return res.status(404).json({
                    status: false,
                    message: "User not found"
                });
            }

            //generate OTP and hashed otp(hashed otp set to redis) and returen the normal otp
            const otp = await createResetOTP(email);

            //Add to queue to avoid overloading the emailier(ex - nodemailer) and send the otp via mail
            await emailQueue.add("sendOtp", {
                email,
                otp
            });

            console.log("otp", otp)

            res.json({
                status: true,
                message: "OTP sent"
            });

        } catch (error) {

            res.status(500).json({
                status: false,
                error: error.message
            });

        }
    },

    verifyResetOtp: async (req, res) => {
        try {
            const { email, otp } = req.body;

            if (!email || !otp) {
                return res.status(400).json({
                    status: false,
                    error: "Email and OTP are required"
                });
            }

            await verifyResetOTP(email, otp);

            //(already done inside service)
            // await clearOTP(email);

            const resetToken = jwt.sign(
                { email },
                process.env.JWT_SECRET,
                { expiresIn: "10m" }
            );

            return res.status(200).json({
                status: true,
                message: "OTP verified successfully",
                resetToken
            });

        } catch (error) {
            console.error("VERIFY OTP ERROR:", error); // 🔥 add this

            return res.status(400).json({
                status: false,
                error: error.message
            });
        }
    },

    resetPassword: async (req, res) => {

        try {

            //Take resetToken and new password from frontend
            const { resetToken, newPassword } = req.body;

            //extract email  from reset token
            const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);

            //hash the password from the tokenservice
            const hashedPassword = TokenService.encryptPassword(newPassword);

            //updtae the databse
            await User.update(
                { password: hashedPassword },
                { where: { email: decoded.email } }
            );

            return res.json({
                status: true,
                message: "Password reset successful"
            });

        } catch (error) {

            return res.status(400).json({
                status: false,
                error: "Invalid or expired reset token"
            });

        }
    },
};
