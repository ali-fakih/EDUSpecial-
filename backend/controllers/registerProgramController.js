const Registration = require("../models/registrationProgram");
const User = require("../models/user");
const Program = require("../models/program");

// Create a new registration
const createRegistration = async (req, res) => {
  try {
    const { userId, programId } = req.body;

    const registration = new Registration({
      user: userId,
      program: programId,
    });

    await registration.save();
    res.status(201).json({ message: "Registration created successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all registrations with user and program names
const getAllRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find()
      .populate("user", "firstname lastname")
      .populate("program", "name");

    const formattedRegistrations = registrations.map((registration) => {
      return {
        _id: registration._id,
        registrationDate: registration.createdAt,
        userName: `${registration.user.firstname} ${registration.user.lastname}`,
        programName: registration.program.name,
        UpdateAt: registration.updatedAt,
      };
    });

    res.status(200).json(formattedRegistrations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get registration by ID
const getRegistrationById = async (req, res) => {
  try {
    const registrationId = req.params.id;

    const registration = await Registration.findById(registrationId)
      .populate("user", "firstname lastname")
      .populate("program", "name");

    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }

    // Concatenate first name and last name
    const fullName = `${registration.user.firstname} ${registration.user.lastname}`;

    // Include the concatenated name and timestamp in the response
    const response = {
      _id: registration._id,
      registrationDate: registration.createdAt,
      userName: fullName,
      programName: registration.program.name,
      UpdateAt: registration.updatedAt,
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update registration by ID
const updateRegistrationById = async (req, res) => {
  try {
    const registrationId = req.params.id;
    const { userId, programId } = req.body;

    // Validate if the user and program exist before updating
    const userExists = await User.exists({ _id: userId });
    const programExists = await Program.exists({ _id: programId });

    if (!userExists || !programExists) {
      return res.status(404).json({ message: "User or Program not found" });
    }

    const updatedRegistration = await Registration.findByIdAndUpdate(
      registrationId,
      { user: userId, program: programId },
      { new: true }
    )
      .populate("user", "firstname lastname") // Assuming you have firstname and lastname fields in your User schema
      .populate("program", "name");

    if (!updatedRegistration) {
      return res.status(404).json({ message: "Registration not found" });
    }

    res.status(200).json({
      message: "Registration updated successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete registration by ID
const deleteRegistrationById = async (req, res) => {
  try {
    const registrationId = req.params.id;

    const deletedRegistration = await Registration.findByIdAndDelete(
      registrationId
    );

    if (!deletedRegistration) {
      return res.status(404).json({ message: "Registration not found" });
    }

    res.status(200).json({ message: "Registration deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Get registrations by program name
const getRegistrationsByProgramName = async (req, res) => {
  try {
    const programName = req.params.name;

    // Find registrations by program name
    const registrations = await Registration.find()
      .populate({
        path: "program",
        match: { name: programName }, // Filter registrations by program name
        select: "name", // Select only the program name
      })
      .populate("user", "firstname lastname")
      .exec();

    // Filter out registrations with no matching program
    const filteredRegistrations = registrations.filter(
      (registration) => registration.program !== null
    );

    if (filteredRegistrations.length === 0) {
      return res
        .status(404)
        .json({ message: "No registrations found for the program" });
    }

    // Format the response
    const formattedRegistrations = filteredRegistrations.map(
      (registration) => ({
        _id: registration._id,
        registrationDate: registration.createdAt,
        userName: `${registration.user.firstname} ${registration.user.lastname}`,
        programName: registration.program.name,
        UpdateAt: registration.updatedAt,
      })
    );

    res.status(200).json(formattedRegistrations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get registrations by user's first name and last name

const getRegistrationsByUserName = async (req, res) => {
  try {
    const fullName = req.params.fullName;

    // Split the full name into first name and last name
    const [firstName, lastName] = fullName.split(" ");

    // Determine the role of the user from the token
    const { role, userId } = req.user; // Assuming the user role and ID are available in the request user object

    let registrations;

    if (role === 'user') {
      // If the user is not an admin, only retrieve programs associated with their user ID
      registrations = await Registration.find({ user: userId })
        .populate("user", "firstname lastname")
        .populate("program", "name")
        .exec();
    } else {
      // If the user is an admin, retrieve all programs
      registrations = await Registration.find()
        .populate({
          path: "user",
          match: { firstname: firstName, lastname: lastName },
          select: "firstname lastname",
        })
        .populate("program", "name")
        .exec();
    }

    // Filter out registrations with no matching user
    const filteredRegistrations = registrations.filter(
      (registration) => registration.user !== null
    );

    if (filteredRegistrations.length === 0) {
      return res.status(404).json({
        message: "No registrations found for the user"
      });
    }

    // Format the response
    const formattedRegistrations = filteredRegistrations.map(
      (registration) => ({
        _id: registration._id,
        registrationDate: registration.createdAt.toLocaleString(
          "en-US",
          {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }
        ),
        userName: `${registration.user.firstname} ${registration.user.lastname}`,
        programName: registration.program.name,
        UpdateAt: registration.updatedAt.toLocaleString(
          "en-US",
          {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }
        ),
      })
    );

    res.status(200).json(formattedRegistrations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = {
  createRegistration,
  getAllRegistrations,
  getRegistrationById,
  updateRegistrationById,
  deleteRegistrationById,
  getRegistrationsByProgramName,
  getRegistrationsByUserName,

};
