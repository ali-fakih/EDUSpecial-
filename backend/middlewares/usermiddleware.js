const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Joi = require("joi");
const { validationResult } = require("express-validator");
// Middleware to verify the JWT token
exports.verifyToken = (req, res, next) => {
  const authorizationHeader = req.header("Authorization");

  // Exclude token verification for registration route and refresh token route
  if (req.path === "/register") {
    return next();
  }

  if (!authorizationHeader) {
    return res
      .status(401)
      .json({ message: "Access denied. Token not provided" });
  }

  // Check if the header starts with "Bearer "
  const [scheme, token] = authorizationHeader.split(" ");
  if (!token || scheme !== "Bearer") {
    return res.status(401).json({ message: "Invalid token format" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Invalid token" });
  }
};

// Middleware to check if the user has admin role
exports.checkAdminRole = async (req, res, next) => {
  try {
    // Ensure req.user is populated correctly
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    // Retrieve user information from the database
    const user = await User.findById(req.user.id);

    // Check if user has admin role
    if (!user || user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Admin role required" });
    }

    // If the user has admin role, proceed to the next middleware/route handler
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Middleware to check if the user is the owner of the resource or has admin role
exports.checkResourceOwnership = async (req, res, next) => {
  const userId = req.user.id;
  const resourceId = req.params.id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user is the owner of the resource or has admin role
    if (user._id.toString() !== resourceId && user.role !== "admin") {
      return res.status(403).json({
        message:
          "Access denied. You are not the owner or an admin of this resource",
      });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
// Middleware to validate if password matches confirm password
exports.validatePasswordMatch = (req, res, next) => {
  const { password, confirmPassword, email } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }
  // Check if the email is in a valid format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  // Check if the email is from @gmail.com
  if (!email.endsWith("@gmail.com")) {
    return res.status(400).json({ message: "Email must be from @gmail.com" });
  }

  next();
};
// Middleware to validate if all required fields are provided

exports.validateRequiredFields = async (req, res, next) => {
  const { role, firstname, lastname, password, bloodType, email } = req.body;

  if (!firstname || !lastname || !password || !bloodType || !email) {
    return res.status(400).json({ message: "All fields are required" });
  }

  next();
};
exports.validateRequiredLogin = async (req, res, next) => {
  const { password, email } = req.body;

  if (!password || !email) {
    return res.status(400).json({ message: "All fields are required" });
  }

  next();
};
//! Middleware to validate reset password data-------------------------
exports.validateResetPassword = async (req, res, next) => {
  // Define the validation schema using Joi
  const schema = Joi.object({
    password: Joi.string().min(8).required(),
    confirmPassword: Joi.string()
      .valid(Joi.ref("password"))
      .required()
      .messages({
        "any.only": "Passwords do not match",
      }),
  });

  // Validate the request body against the schema
  const { error } = schema.validate(req.body);

  // If there is a validation error, respond with a 400 status and error details
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  // If validation passes, move on to the next middleware or controller
  next();
};
// ! Validation middleware for user verification
exports.validateUserVerification = async (req, res, next) => {
  // Use the validationResult function from express-validator to check for validation errors
  const errors = validationResult(req);

  // If there are validation errors, respond with a 400 status and the error details
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }

  // If validation passes, move on to the next middleware or controller
  next();
};

//! Validation middleware for the /verified route
exports.validateShowVerifiedPage = async (req, res, next) => {
  // Use the validationResult function from express-validator to check for validation errors
  const errors = validationResult(req);

  // If there are validation errors, respond with a 400 status and the error details
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // If validation passes, move on to the next middleware or controller
  next();
};
