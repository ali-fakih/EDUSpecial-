const People = require("../models/people");

const validatePerson = async (req, res, next) => {
  const { name, age, gender, skills, phone, address, specialNeeds } = req.body;
  const personId = req.params.id; // Retrieve the person ID from the request parameters

  // Check if required fields are provided
  if (
    !name ||
    !age ||
    !gender ||
    !skills ||
    !phone ||
    !address ||
    !specialNeeds
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Validate age
  if (age < 0) {
    return res.status(400).json({ error: "Age must be a non-negative number" });
  }

  // Validate gender
  if (!["male", "female"].includes(gender.toLowerCase())) {
    return res.status(400).json({ error: "Invalid gender" });
  }

  // Validate skills
  if (skills.length === 0) {
    return res.status(400).json({ error: "Skills must be a non-empty array" });
  }

  // Validate contact
  if (!phone || phone.toString().length !== 10) {
    return res
      .status(400)
      .json({ error: "Invalid phone number. Please enter a 10-digit number." });
  }

  // Validate specialNeeds
  if (
    !["none", "medical", "educational", "other"].includes(
      specialNeeds.toLowerCase()
    )
  ) {
    return res.status(400).json({ error: "Invalid special needs type" });
  }

  // Check if the person name already exists
  try {
    const existingPerson = await People.findOne({ name });

    // If updating and the name exists for a different person, return an error
    if (existingPerson && existingPerson._id.toString() !== personId) {
      return res
        .status(400)
        .json({ error: "Person with the same name already exists" });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }

  // If all validations pass, move on to the next middleware or controller
  next();
};

module.exports = {
  validatePerson,
};
