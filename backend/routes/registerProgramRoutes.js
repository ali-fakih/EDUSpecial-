const express = require("express");
const router = express.Router();
const {
  validateRegistration,
} = require("../middlewares/registerProgramMiddleware");
const RegistrationController = require("../controllers/registerProgramController");
const userMiddleware = require("../middlewares/usermiddleware");
// Private routes (require token authentication)
router.use(userMiddleware.verifyToken);

// Create a new registration
router.post(
  "/registrations",
  validateRegistration,
  RegistrationController.createRegistration
);

// Get all registrations
router.get(
  "/registrations",
  userMiddleware.checkAdminRole,
  RegistrationController.getAllRegistrations
);

// Get registration by ID
router.get(
  "/registrations/:id",
  userMiddleware.checkAdminRole,
  RegistrationController.getRegistrationById
);


router.get(
  "/registrationsbyProName/:name",
  userMiddleware.checkAdminRole,
  RegistrationController.getRegistrationsByProgramName
);
router.get(
  "/registrationsbyuserName/:fullName",
  RegistrationController.getRegistrationsByUserName
);

// Update registration by ID
router.put(
  "/updateregistrations/:id",
  validateRegistration,
  userMiddleware.checkAdminRole,
  RegistrationController.updateRegistrationById
);

// Delete registration by ID
router.delete(
  "/deleteregistrations/:id",
  userMiddleware.checkAdminRole,
  RegistrationController.deleteRegistrationById
);
router.use(userMiddleware.checkAdminRole);
module.exports = router;
