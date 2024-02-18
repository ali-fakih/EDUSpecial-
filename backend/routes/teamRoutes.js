const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/teamcontrollers");
const teammiddlewares = require("../middlewares/teammiddleware");
const userMiddleware = require("../middlewares/usermiddleware");
// Private routes (require token authentication)
// router.use(userMiddleware.verifyToken);
// router.use(userMiddleware.checkAdminRole);
// Route to create a new employee

router.post(
  "/ADDemployees",
  // teammiddlewares.validateRequiredFields,
  teammiddlewares.validateNameExists,
  employeeController.createEmployee
);

// Route to update an existing employee
router.put(
  "/updateemployees/:id",
  // teammiddlewares.validateRequiredFields,
  teammiddlewares.validateNameExists,
  employeeController.updateEmployee
);

// Route to delete an employee
router.delete("/deletemployeesbyid/:id", employeeController.deleteEmployee);
// Route to delete an employee by name
router.delete(
  "/deletemployeesbyname/:name",
  employeeController.deleteEmployeeByName
);

// Route to get all employees
router.get("/Allemployees", employeeController.getAllEmployees);

// Route to get a specific employee by ID
router.get("/getemployeesbyid/:id", employeeController.getEmployeeById);
// Route to get a specific employee by Name

router.get("/getemployeesbyname/:name", employeeController.getEmployeeByName);

module.exports = router;
