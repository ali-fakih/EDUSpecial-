const Employee = require("../models/team");

// Middleware to validate if all required fields are provided
const validateRequiredFields = (req, res, next) => {
  const { name, position } = req.body;

  if (!name || !position) {
    return res.status(400).json({ error: "All fields are required" });
  }

  next();
};

// Middleware function to validate if the name already exists
const validateNameExists = async (req, res, next) => {
  const { name } = req.body;

  try {
    const existingEmployee = await Employee.findOne({ name });

    // If an employee with the same name exists, return an error
    if (existingEmployee) {
      return res
        .status(400)
        .json({ error: "Employee with the same name already exists" });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }

  next(); // Proceed to the next middleware or route handler
};

module.exports = {
  validateRequiredFields,
  validateNameExists,
};
