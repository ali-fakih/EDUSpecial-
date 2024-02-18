const express = require("express");
const router = express.Router();
const programController = require("../controllers/programControllers");
const programMiddleware = require("../middlewares/programMiddleware");
const userMiddleware = require("../middlewares/usermiddleware");
// Private routes (require token authentication)
// router.use(userMiddleware.verifyToken);
// router.use(userMiddleware.checkAdminRole);
// Public routes
router.post(
  "/Addprogram",
  programMiddleware.checkUniqueName,
  programMiddleware.checkValidPrice,
  programMiddleware.checkCategoryExistence,
  programMiddleware.checkTalentExistence,
  programMiddleware.validateRequiredFields,
  programController.addProgram
);

router.get("/getAllprograms", programController.getAllPrograms);
router.get("/getprogrambyid/:id", programController.getProgramById);
router.get("/getprogrambyname/:name", programController.getProgramByName);
router.get(
  "/getprogramsbycategory/:category",
  programController.getProgramsByCategory
);

router.put(
  "/updateprogrambyid/:id",
  programMiddleware.checkCategoryExistence,
  programMiddleware.checkTalentExistence,
  programMiddleware.checkValidPrice,
  programMiddleware.checkUniqueUpdatedName,
  programController.updateProgramById
);

router.put(
  "/updateprogrambyname/:name",
  programMiddleware.checkCategoryExistence,
  programMiddleware.checkTalentExistence,
  programMiddleware.checkValidPrice,
  programMiddleware.checkUniqueUpdatedName,
  programController.updateProgramByName
);

router.delete("/deleteprogrambyid/:id", programController.deleteProgramById);
router.delete(
  "/deleteprogrambyname/:name",
  programController.deleteProgramByName
);

module.exports = router;
