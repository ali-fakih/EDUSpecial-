const Donation = require("../models/donation");

// Create a new donation
const createDonation = async (req, res) => {
  try {
    const { username, amount, programOrEventName, eventDate } = req.body;

    const donation = new Donation({
      username,
      amount,
      programOrEventName,
      eventDate,
    });

    const savedDonation = await donation.save();
    res.status(201).json({message: "Donated successfully"});
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all donations
const getAllDonations = async (req, res) => {
  try {
    const donations = await Donation.find();
    res.status(200).json(donations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get donation by ID
const getDonationById = async (req, res) => {
  try {
    const donationId = req.params.id;
    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }
    res.status(200).json(donation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update donation by ID
const updateDonationById = async (req, res) => {
  try {
    const donationId = req.params.id;
    const { username, amount, programOrEventName, eventDate } = req.body;
    const updatedDonation = await Donation.findByIdAndUpdate(
      donationId,
      { username, amount, programOrEventName, eventDate },
      { new: true }
    );
    if (!updatedDonation) {
      return res.status(404).json({ message: "Donation not found" });
    }
    res.status(200).json({message:"Updated successfully"});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete donation by ID
const deleteDonationById = async (req, res) => {
  try {
    const donationId = req.params.id;
    const deletedDonation = await Donation.findByIdAndDelete(donationId);
    if (!deletedDonation) {
      return res.status(404).json({ message: "Donation not found" });
    }
    res.status(200).json({message:"Deleted successfully"});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createDonation,
  getAllDonations,
  getDonationById,
  updateDonationById,
  deleteDonationById,
};
