const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // Username is required
    unique: true, // Username should be unique
  },
  description: {
    type: String,
    required: true, // Username is required
    unique: true, // Username should be unique
  },
  count: {
    type: Number,
    // default: 0,
    // required: true, // Password is required
  },
  eventDate: {
    type: Date,
    required: true,
    validate: {
      validator: function (value) {
        // Ensure the date is in the future
        return value > new Date();
      },
      message: "Event date must be in the future.",
    },
  },
});

const User = mongoose.model("Category", categorySchema);

module.exports = User;
