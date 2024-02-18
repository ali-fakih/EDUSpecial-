const express = require("express");
const router = express.Router();
const peopleController = require("../controllers/peopleController");
const peopleMiddleware = require("../middlewares/peopleMiddleware"); // Import the people middleware
const userMiddleware = require("../middlewares/usermiddleware");
// Private routes (require token authentication)
// router.use(userMiddleware.verifyToken);
// Route to create a new person
router.post(
  "/addperson",
  peopleMiddleware.validatePerson,
  peopleController.createPerson
);

// Route to get all people
router.get(
  "/getpeople",
  userMiddleware.checkAdminRole,
  peopleController.getAllPeople
);

// Route to get a person by ID
router.get("/getperson/:id", peopleController.getPersonById);
// Route to get a person by Name
router.get("/getpersonsname/:name", peopleController.getPersonByName);
// Route to get people by talent ID
router.get("/getpeoplebytalent/:talentId", peopleController.getPeopleByTalentId);
// Route to update a person by ID
router.put(
  "/updateperson/:id",
  peopleMiddleware.validatePerson,
  peopleController.updatePersonById
);

// Route to delete a person by ID
router.delete(
  "/deleteperson/:id",
  userMiddleware.checkAdminRole,
  peopleController.deletePersonById
);
// Route to delete a person by Name
router.delete(
  "/deletepersonsname/:name",
  userMiddleware.checkAdminRole,
  peopleController.deletePersonByName
);
module.exports = router;
