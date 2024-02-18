const People = require("../models/people");

// Create a new person
const createPerson = async (req, res) => {
  try {
    const { name, age, gender, skills, phone,talent, address, specialNeeds } =
      req.body;

    const person = new People({
      name,
      age,
      gender,
      skills,
      phone,
      address,
      talent,
      specialNeeds,
    });

    await person.save();
    res.status(201).json({ message: "Added successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
// Get person by Name
const getPersonByName = async (req, res) => {
  try {
    const personName = req.params.name;
    const person = await People.findOne({ name: personName });

    if (!person) {
      return res.status(404).json({ message: "Person not found" });
    }

    res.status(200).json(person);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Get all people
const getAllPeople = async (req, res) => {
  try {
    const people = await People.find();
    res.status(200).json(people);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get person by ID
const getPersonById = async (req, res) => {
  try {
    const personId = req.params.id;
    const person = await People.findById(personId);
    if (!person) {
      return res.status(404).json({ message: "Person not found" });
    }
    res.status(200).json(person);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get people by talent ID
const getPeopleByTalentId = async (req, res) => {
  try {
    const talentId = req.params.talentId;
    const people = await People.find({ talent: talentId });
    if (!people || people.length === 0) {
      return res.status(404).json({ message: "No people found for this talent ID" });
    }
    res.status(200).json(people);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update person by ID
const updatePersonById = async (req, res) => {
  try {
    const personId = req.params.id;
    const { name, age, gender, skills, phone, address, specialNeeds } =
      req.body;
    const updatedPerson = await People.findByIdAndUpdate(
      personId,
      { name, age, gender, skills, phone, address, specialNeeds },
      { new: true }
    );
    if (!updatedPerson) {
      return res.status(404).json({ message: "Person not found" });
    }
    res.status(200).json({ message: "Updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete person by ID
const deletePersonById = async (req, res) => {
  try {
    const personId = req.params.id;
    const deletedPerson = await People.findByIdAndDelete(personId);
    if (!deletedPerson) {
      return res.status(404).json({ message: "Person not found" });
    }
    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Delete person by Name
const deletePersonByName = async (req, res) => {
  try {
    const personName = req.params.name;
    const deletedPerson = await People.findOneAndDelete({ name: personName });

    if (!deletedPerson) {
      return res.status(404).json({ message: "Person not found" });
    }

    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createPerson,
  getAllPeople,
  getPersonById,
  updatePersonById,
  deletePersonById,
  deletePersonByName,
  getPersonByName,
  getPeopleByTalentId
};
