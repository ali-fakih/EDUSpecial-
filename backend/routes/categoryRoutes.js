const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const categoryMiddleware = require("../middlewares/categoryMiddleware"); // Import the user middleware
const userMiddleware = require("../middlewares/usermiddleware");
// Private routes (require token authentication)
router.use(userMiddleware.verifyToken);
router.use(userMiddleware.checkAdminRole);
// Route to create a new category with validation middleware
router.post(
  "/addcategory",
  categoryMiddleware.validateCategory,
  categoryController.createCategory
);

// Route to get all categories
router.get("/allcategories", categoryController.getAllCategories);

// Route to get a category by ID
router.get("/specificcategories/:id", categoryController.getCategoryById);

// Route to update a category by ID
router.put(
  "/updatecategories/:id",
  categoryMiddleware.validateCategory,
  categoryController.updateCategoryById
);

// Route to delete a category by ID
router.delete("/deletecategories/:id", categoryController.deleteCategoryById);

module.exports = router;
