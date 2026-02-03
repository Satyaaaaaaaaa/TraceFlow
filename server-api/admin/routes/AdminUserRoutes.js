const router = require("express").Router();
const AdminUserController = require("../controllers/AdminUserController");
const SchemaValidation = require("../../common/middlewares/SchemaValidationMiddleware");
const changeRolePayload = require("../../users/schemas/changeRolePayload");
const registerPayload = require("../../authorization/schemas/registerPayload")
const AuthorizationController = require("../../authorization/controllers/AuthorizationController")

//CREATE new user
router.post(
    "/",
    //[SchemaValidationMiddleware.verify(registerPayload)],
    AuthorizationController.register //-> Sir, Should we use public resgiter from AuthorizationController or should we create one createUser in AdminUserController? and also the same for ProductController?
)

// READ (paginated)
router.get(
    "/", 
    AdminUserController.getUsers
);

// READ single
router.get(
    "/:id", 
    AdminUserController.getUser
);

// UPDATE role
router.patch(
  "/:id/role",
  SchemaValidation.verify(changeRolePayload),
  AdminUserController.changeRole
);

// HARD DELETE
router.delete("/:id", 
    AdminUserController.deleteUser
);

module.exports = router;