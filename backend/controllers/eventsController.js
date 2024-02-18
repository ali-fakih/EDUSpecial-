const Event = require("../models/events");
const multer = require("multer");

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Set the destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname +
        "-" +
        uniqueSuffix +
        "." +
        file.originalname.split(".").pop()
    );
  },
});

// Upload middleware
const upload = multer({ storage: storage }).single("imageevents");

const createEvent = async (req, res) => {
  try {
    // Call the upload middleware to handle the image upload
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      // Check if req.file exists before accessing its properties
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const { nameevents, description, eventDate } = req.body;
      const imageevents = req.file.filename;
      const event = new Event({
        nameevents,
        description,
        eventDate,
        imageevents, // Save the filename in the database
      });

      await event.save();
      res.status(201).json({ message: "Event created successfully" });
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all events
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get event by ID
const getEventById = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update event by ID
const updateEventById = async (req, res) => {
  try {
    // Call the upload middleware to handle the image upload
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      const eventId = req.params.id;
      const { nameevents, description, eventDate } = req.body;
      const updateFields = { nameevents, description, eventDate };

      // If there is a new file, update the imageevents field
      if (req.file) {
        updateFields.imageevents = req.file.filename;
      }

      const updatedEvent = await Event.findByIdAndUpdate(
        eventId,
        updateFields,
        { new: true }
      );
      if (!updatedEvent) {
        return res.status(404).json({ message: "Event not found" });
      }

      res.status(200).json({ message: "Event updated successfully" });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete event by ID
const deleteEventById = async (req, res) => {
  try {
    const eventId = req.params.id;
    const deletedEvent = await Event.findByIdAndDelete(eventId);
    if (!deletedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json({ message: "Event Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEventById,
  deleteEventById,
};
