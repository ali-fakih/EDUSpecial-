const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const eventsScehma = new Schema({
  imageevents: {
    type: String,
    required: true,
  },
  nameevents: {
    type: String,
    required: true,
    maxlength: 255, // Adjust the maximum length as needed
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000, // Adjust the maximum length as needed
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

const Events = mongoose.model("Events", eventsScehma);
module.exports = Events;
