const Program = require("../models/program");
const Category = require("../models/category");
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

const upload = multer({ storage: storage });

// Function to add a new program with image upload
exports.addProgram = async (req, res) => {
  try {
    const { name, description, category, talent, price, image } = req.body;

    // Assuming the file input in the form is named "image"
    upload.single("image")(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: "File upload error" });
      } else if (err) {
        return res.status(500).json({ error: "Internal server error" });
      }

      const newProgram = new Program({
        name,
        description,
        category,
        talent,
        price,
        image: req.file ? req.file.path : null, // Store the file path if uploaded
      });

      await newProgram.save();

      res.status(201).json({ message: "Program added successfully" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Function to get all programs
exports.getAllPrograms = async (req, res) => {
  try {
    const programs = await Program.find();

    res.status(200).json({ programs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Function to get a program by ID
exports.getProgramById = async (req, res) => {
  try {
    const programId = req.params.id;

    const program = await Program.findById(programId);

    if (!program) {
      return res.status(404).json({ message: "Program not found" });
    }

    res.status(200).json({ program });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Function to get a program by name
exports.getProgramByName = async (req, res) => {
  try {
    const { name } = req.params;

    const program = await Program.findOne({ name });

    if (!program) {
      return res.status(404).json({ message: "Program not found" });
    }

    res.status(200).json({ program });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Function to get programs by category
exports.getProgramsByCategory = async (req, res) => {
  try {
    const categoryId = req.params.category;

    // Check if the category exists
    const existingCategory = await Category.findById(categoryId);

    if (!existingCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check if there are programs in the category
    const programs = await Program.find({ category: categoryId });

    if (programs.length === 0) {
      return res
        .status(404)
        .json({ message: "No programs found in this category" });
    }

    res.status(200).json(programs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Function to update a program by ID with file upload
exports.updateProgramById = async (req, res) => {
  try {
    const programId = req.params.id;
    const { name, description, category, talent, price } = req.body;

    const program = await Program.findById(programId);

    if (!program) {
      return res.status(404).json({ message: "Program not found" });
    }

    // File upload logic
    upload.single("image")(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: "File upload error" });
      } else if (err) {
        return res.status(500).json({ error: "Internal server error" });
      }

      // Update program fields
      program.name = name || program.name;
      program.description = description || program.description;
      program.category = category || program.category;
      program.talent = talent || program.talent;
      program.price = price || program.price;

      // Update the image field only if a new file is uploaded
      if (req.file) {
        program.image = req.file.path;
      }

      // Save the updated program
      await program.save();

      res.status(200).json({ message: "Program updated successfully" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Function to update a program by name with file upload
exports.updateProgramByName = async (req, res) => {
  try {
    const { name } = req.params;
    const { description, category, talent, price } = req.body;

    const program = await Program.findOne({ name });

    if (!program) {
      return res.status(404).json({ message: "Program not found" });
    }

    // File upload logic
    upload.single("image")(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: "File upload error" });
      } else if (err) {
        return res.status(500).json({ error: "Internal server error" });
      }

      // Update program fields
      program.description = description || program.description;
      program.category = category || program.category;
      program.talent = talent || program.talent;
      program.price = price || program.price;

      // Update the image field only if a new file is uploaded
      if (req.file) {
        program.image = req.file.path;
      }

      // Save the updated program
      await program.save();

      res.status(200).json({ message: "Program updated successfully" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
// Function to delete a program by ID
exports.deleteProgramById = async (req, res) => {
  try {
    const programId = req.params.id;

    const program = await Program.findById(programId);

    if (!program) {
      return res.status(404).json({ message: "Program not found" });
    }

    await program.deleteOne();

    res.status(200).json({ message: "Program deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Function to delete a program by name
exports.deleteProgramByName = async (req, res) => {
  try {
    const { name } = req.params;

    const program = await Program.findOne({ name });

    if (!program) {
      return res.status(404).json({ message: "Program not found" });
    }

    await program.deleteOne();

    res.status(200).json({ message: "Program deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
