const Category = require("../models/category");

const validateCategory = async (req, res, next) => {
  const { name, description, count, eventDate } = req.body;
  const categoryId = req.params.id; // Retrieve the category ID from the request parameters

  // Check if required fields are provided
  if (!name || !description || !eventDate) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Validate count to be a positive number
  if (count < 0) {
    return res
      .status(400)
      .json({ error: "Count must be a non-negative number" });
  }

  // Validate eventDate to be a valid date in the future
  const currentDate = new Date();
  const inputDate = new Date(eventDate);

  if (isNaN(inputDate) || inputDate <= currentDate) {
    return res
      .status(400)
      .json({ error: "Category date must be a valid date in the future" });
  }

  // Check if the category name already exists
  try {
    const existingCategory = await Category.findOne({ name });

    // If updating and the name exists for a different category, return an error
    if (existingCategory && existingCategory._id.toString() !== categoryId) {
      return res
        .status(400)
        .json({ error: "Category with the same name already exists" });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }

  // If all validations pass, move on to the next middleware or controller
  next();
};

module.exports = {
  validateCategory,
};
