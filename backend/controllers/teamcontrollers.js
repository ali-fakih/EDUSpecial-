const Employee = require("../models/team");
const multer = require("multer");
// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Set the destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname +
        "-" +
        uniqueSuffix +
        "." +
        file.originalname.split(".").pop()
    );
  },
});

// Upload middleware
const upload = multer({ storage: storage }).single("image");
// Controller function to create a new employee
const createEmployee = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      const { name, position } = req.body;
      const image = req.file.filename;

      const newEmployee = new Employee({
        name,
        position,
        image,
      });

      await newEmployee.save();
      res.json({ message: "Created successfully" });
    });
  } catch (error) {
    console.error("Error creating employee:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Controller function to update an existing employee
const updateEmployee = async (req, res) => {
  try {
    // Call the upload middleware to handle the image upload
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      const { id } = req.params;
      const { name, position } = req.body;

      // Check if the employee with the provided id exists
      const existingEmployee = await Employee.findById(id);

      if (!existingEmployee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      // Update the employee
      const updateFields = { name, position };

      // If there is a new file, update the image field
      if (req.file) {
        updateFields.image = req.file.filename;
      }

      const updatedEmployee = await Employee.findByIdAndUpdate(
        id,
        updateFields,
        { new: true }
      );

      res.json({ message: "Updated successfully" });
    });
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Controller function to delete an employee
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedEmployee = await Employee.findByIdAndDelete(id);
    if (!deletedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Error deleting employee:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Controller function to get all employees
const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Controller function to get a specific employee by ID
const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.json(employee);
  } catch (error) {
    console.error("Error fetching employee:", error);
    res.status(500).send("Internal Server Error");
  }
};
// Controller function to get an employee by name
const getEmployeeByName = async (req, res) => {
  try {
    const { name } = req.params;

    const employee = await Employee.findOne({ name });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json(employee);
  } catch (error) {
    console.error("Error fetching employee by name:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Controller function to delete an employee by name
const deleteEmployeeByName = async (req, res) => {
  try {
    const { name } = req.params;

    const deletedEmployee = await Employee.findOneAndDelete({ name });
    if (!deletedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Error deleting employee by name:", error);
    res.status(500).send("Internal Server Error");
  }
};
module.exports = {
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getAllEmployees,
  getEmployeeById,
  getEmployeeByName,
  deleteEmployeeByName,
};
