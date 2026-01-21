const router = require("express").Router();

// Middleware Imports
const isAuthenticatedMiddleware = require("./../common/middlewares/IsAuthenticatedMiddleware");
const SchemaValidationMiddleware = require("../common/middlewares/SchemaValidationMiddleware");
const CheckPermissionMiddleware = require("../common/middlewares/CheckPermissionMiddleware");

// Controller Imports
const UserController = require("./controllers/UserController");

// JSON Schema Imports for payload verification
const updateUserPayload = require("./schemas/updateUserPayload");
const changeRolePayload = require("./schemas/changeRolePayload");

const { roles } = require("../config");

router.get(
    "/", 
    [isAuthenticatedMiddleware.check], 
    UserController.getUser
);

router.patch(
  "/",
  [
    isAuthenticatedMiddleware.check,
    SchemaValidationMiddleware.verify(updateUserPayload),
  ],
  UserController.updateUser
);

router.get(
  "/all",
  [isAuthenticatedMiddleware.check, 
    CheckPermissionMiddleware.has(roles.ADMIN)],
  UserController.getUsers
);

// ROUTE FOR SELF ROLE CHANGE
router.patch(
  "/change-role",
  [
    isAuthenticatedMiddleware.check,
    // COMMENTING FOR NOW AS ANY USER CAN CHANGE ROLE
    // CheckPermissionMiddleware.has(roles.ADMIN), //ONLY ADMINS CAN CHAGE ROLE BUT NOT ANY USER
    SchemaValidationMiddleware.verify(changeRolePayload),
  ],
  //UserController.changeRole
  UserController.changeSelfRole  // New controller function
);

// ROUTE FOR ADMIN
//FOR ADMIN TO CHANGE ROLE 
router.patch(
  "/change-role/:userId",
  [
    isAuthenticatedMiddleware.check,
    CheckPermissionMiddleware.has(roles.ADMIN),
    SchemaValidationMiddleware.verify(changeRolePayload),
  ],
  UserController.changeRole
);

router.delete(
  "/:userId",
  [isAuthenticatedMiddleware.check, 
    CheckPermissionMiddleware.has(roles.ADMIN)],
  UserController.deleteUser
);

module.exports = router;
