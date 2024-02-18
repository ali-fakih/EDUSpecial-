const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const peopleSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
    min: 0, // Adjust the minimum age as needed
  },
  gender: {
    type: String,
    enum: ["male", "female"],
    required: true,
  },
  skills: {
    type: [String],
    required: true,
  },

  phone: {
    type: Number,
    required: true,
    validate: {
      validator: function (value) {
        // Basic phone number validation using a regular expression
        const phoneRegex = /^\d{10}$/; // Assuming a 10-digit phone number
        return phoneRegex.test(value);
      },
      message: "Invalid phone number. Please enter a 10-digit number.",
    },
  },
  address: {
    type: String,
    required: true,
    maxlength: 255, // Adjust the maximum length as needed
  },

  specialNeeds: {
    type: String,
    enum: [
      "none",
      "medical",
      "educational",
      "physical",
      "behavioral",
      "communication",
      "sensory",
      "other",
    ],
    required: true,
  },

  talent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Assuming User model is used for talents
    required: true,
  },
});

const People = mongoose.model("People", peopleSchema);
module.exports = People;
