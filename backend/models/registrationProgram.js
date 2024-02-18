const mongoose = require("mongoose");

const registrationProgramSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User schema
      required: true,
    },
    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program", // Reference to the Program schema
      required: true,
    },
   
  },
  {
    timestamps: true,
  }
);

const Registration = mongoose.model("Registration", registrationProgramSchema);

module.exports = Registration;
