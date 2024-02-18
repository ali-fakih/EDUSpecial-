const express = require("express");
const router = express.Router();
const donationController = require("../controllers/donationController");
const donationMiddleware = require("../middlewares/donationMiddleware"); // Import the donation middleware
const userMiddleware = require("../middlewares/usermiddleware");

// Route to create a new donation
router.post(
  "/adddonation",
  donationMiddleware.validateDonation,
  donationController.createDonation
);
// Private routes (require token authentication)
router.use(userMiddleware.verifyToken);
router.use(userMiddleware.checkAdminRole);
// Route to get all donations
router.get("/getalldonations", donationController.getAllDonations);

// Route to get a donation by ID
router.get("/getdonation/:id", donationController.getDonationById);

// Route to update a donation by ID
router.put(
  "/updatedonation/:id",
  donationMiddleware.validateDonation,
  donationController.updateDonationById
);

// Route to delete a donation by ID
router.delete("/deletedonation/:id", donationController.deleteDonationById);

module.exports = router;
