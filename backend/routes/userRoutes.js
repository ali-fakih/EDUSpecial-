const express = require("express");
const router = express.Router();
const userController = require("../controllers/usercontrollers");
const userMiddleware = require("../middlewares/usermiddleware");
const path = require("path");
const ejs = require("ejs");

// Public routes
router.post(
  "/register",
  userMiddleware.validateRequiredFields,
  userMiddleware.validatePasswordMatch,
  userController.registerUser
);
router.post(
  "/login",
  userMiddleware.validateRequiredLogin,
  userController.loginUser
);
router.post("/refresh-token", userController.refreshToken);

// Forget Password Routes
router.post("/forget-password", userController.forgetPassword);
// Change Password Routes
router.post('/change-password', userMiddleware.verifyToken, userController.changePassword);



// Reset Password Routes
// This route renders the password reset form
router.get("/reset-password/:userId/:token", (req, res) => {
  const userId = req.params.userId;
  const token = req.params.token;

  ejs.renderFile(
    path.join(__dirname, "../views/reset-password.html"),
    { userId, token },
    (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
      } else {
        res.send(data);
      }
    }
  );
});

// This route handles the password reset form submission
router.post(
  "/reset-password/:userId/:token",
  userMiddleware.validateResetPassword,
  userController.resetPassword
);
// Private routes (require token authentication)
// disabled to get user by email for now
router.use(userMiddleware.verifyToken);

// Logout route
router.post("/logout", userController.logoutUser);
router.get(
  "/getuserbyid/:id",
  userMiddleware.checkResourceOwnership,
  userMiddleware.checkAdminRole,
  userController.getUserById
);
router.put(
  "/updateuserbyid/:id",
  userMiddleware.checkResourceOwnership,
  userController.updateUserById
);
router.delete(
  "/deleteuserbyid/:id",
  userMiddleware.checkResourceOwnership,
  userMiddleware.checkAdminRole,
  userController.deleteUserById
);

// router.get(
//   "/getuserbyemail/:email",
//   userMiddleware.checkAdminRole,
//   userController.getUserByEmail
// );

router.get(
  "/getuserbyemail/:email",
  userController.getUserByEmail
);

router.put(
  "/updateuserbyemail/:email",
  userMiddleware.checkResourceOwnership,
  userController.updateUserByEmail
);
router.delete(
  "/deleteuserbyemail/:email",
  userMiddleware.checkAdminRole,
  userController.deleteUserByEmail
);

router.get("/users", userMiddleware.checkAdminRole, userController.getAllUsers);

router.get(
  "/getuserbyfirstname/:firstname",
  userMiddleware.checkAdminRole,
  userController.getUserByFirstname
);
router.post("/checkout", userController.Payments);
// User Verification Routes
router.get(
  "/verify/:userId/:uniqueString",
  userMiddleware.validateUserVerification,
  userController.handleUserVerification
);
router.get(
  "/verified",
  userMiddleware.validateShowVerifiedPage,
  userController.showVerifiedPage
);

module.exports = router;
