const Category = require("../models/category");

// Create a new category
// Create a new category
const createCategory = async (req, res) => {
  try {
    const { name, description, count, eventDate } = req.body;

    // Check if required fields are provided
    if (!name || !description || !eventDate) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const category = new Category({
      name,
      description,
      count,
      eventDate,
    });

    await category.save();
    res.status(201).json({ message: "created successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get category by ID
const getCategoryById = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update category by ID
const updateCategoryById = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { name, description, count, eventDate } = req.body;
    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      { name, description, count, eventDate },
      { new: true }
    );
    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json({ message: "Updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete category by ID
const deleteCategoryById = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const deletedCategory = await Category.findByIdAndDelete(categoryId);
    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategoryById,
  deleteCategoryById,
};
