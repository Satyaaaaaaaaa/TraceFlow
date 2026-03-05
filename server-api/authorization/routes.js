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
  otpLimiter, 
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
