const router = require("express").Router();

// Controller Imports
const AuthorizationController = require("./controllers/AuthorizationController");

// Middleware Imports
const SchemaValidationMiddleware = require("../common/middlewares/SchemaValidationMiddleware");

// JSON Schema Imports for payload verification
const registerPayload = require("./schemas/registerPayload");
const loginPayload = require("./schemas/loginPayload");

const forgotPasswordPayload = require("./schemas/forgotPasswordPayload");
const checkUsernamePayload = require("./schemas/checkUsernamePayload");

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

//Added Route for Forgot Password
router.post(
  "/forgot-password",
  [SchemaValidationMiddleware.verify(forgotPasswordPayload)],
  AuthorizationController.forgotPassword
);

module.exports = router;
