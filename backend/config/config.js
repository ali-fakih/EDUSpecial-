const mongoose = require("mongoose");
require("dotenv").config();
const URI = process.env.MONGODB_URI;
const databaseName = "MernProject";

// Use the mongoose instance from config.js
mongoose.connect(URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log(`Connected to MongoDB Atlas - Database: ${databaseName}`);
});

module.exports = mongoose;
