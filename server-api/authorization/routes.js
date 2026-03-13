const router = require("express").Router();

// Controller Imports
const AuthorizationController = require("./controllers/AuthorizationController");

// Middleware Imports
const SchemaValidationMiddleware = require("../common/middlewares/SchemaValidationMiddleware");

// JSON Schema Imports for payload verification
const registerPayload = require("./schemas/registerPayload");
const loginPayload = require("./schemas/loginPayload");

// SCHEMA FOR FORGOT PASSWORD
const forgotPasswordPayload = require("./schemas/forgotPasswordPayload");
const checkUsernamePayload = require("./schemas/checkUsernamePayload");
const IsAuthenticatedMiddleware = require("../common/middlewares/IsAuthenticatedMiddleware");

const otpLimiter = require("./middleware/rateLimit");


router.post(
  "/signup",
  //[SchemaValidationMiddleware.verify(registerPayload)], //commented to test without schema validation
  AuthorizationController.register
);

router.post(
  "/login",
  [SchemaValidationMiddleware.verify(loginPayload)],
  AuthorizationController.login
);

//CHECKING FOR USERNAME AVAILABILITY
router.post(
  "/check-username",
  [SchemaValidationMiddleware.verify(checkUsernamePayload)],
  AuthorizationController.checkUsername
);

//Route for Forgot Password
router.post(
  "/forgot-password",
  //otpLimiter, 
  AuthorizationController.requestResetOtp
);

// VERIFY OTP
router.post(
  "/verify-reset-otp",
  AuthorizationController.verifyResetOtp
);


// RESET PASSWORD
router.post(
  "/reset-password",
  AuthorizationController.resetPassword
);

module.exports = router;

/*
1. FORGOT PASSWORD
Client sends email

Server:
* Generate OTP
* Hash OTP using bcrypt

* Store in Redis:

  otp:reset:<email>     -> hashed OTP
  otp:attempts:<email>  -> number of attempts

* Set expiry (TTL) for both keys
* Push job to emailQueue
* Worker sends OTP via email

2. VERIFY OTP
Client sends email + OTP

Server:
* Retrieve hashed OTP from Redis
* Check attempt counter (< MAX_ATTEMPTS)
* Check TTL (Redis automatically deletes expired keys)

If OTP exists: bcrypt.compare(OTP, hashedOTP)

If valid:
- Delete OTP keys from Redis
- Generate JWT resetToken (short-lived)
- Return resetToken to client

If invalid:
- Increment attempt counter in Redis

3. RESET PASSWORD
Client sends: resetToken, newPassword

Server:
* Verify JWT resetToken
* Extract email from token
* Hash new password using bcrypt
* Update password in User table
* Return success response

## SECURITY FEATURES
✔ OTP stored hashed in Redis
✔ OTP expires automatically (TTL)
✔ Attempt limit prevents brute force
✔ OTP deleted after successful verification
✔ Password reset uses JWT token instead of OTP
✔ Password stored hashed using bcrypt
*/
