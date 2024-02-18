const mongoose = require("mongoose");

const programSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  talent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Assuming User model is used for talents
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  participantsCount: {
    type: Number,
    default: 0,
  },
  image: {
    type: String, // Store the file path or URL
  },
});

const Service = mongoose.model("Program", programSchema);

module.exports = Service;
