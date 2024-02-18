const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  image: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
});

const team = mongoose.model("teammember", teamSchema);

module.exports = team;
