const Joi = require("joi");

// Joi schema for registration validation
const registrationSchema = Joi.object({
  userId: Joi.string().required().messages({
    "any.required": "User ID is required.",
  }),
  programId: Joi.string().required().messages({
    "any.required": "Program ID is required.",
  }),
  registrationDate: Joi.date().iso().required().messages({
    "any.required":
      "Registration date is required and must be a valid date in ISO format.",
  }),
});

// Middleware to validate registration data using Joi
const validateRegistration = (req, res, next) => {
//   const { error } = registrationSchema.validate(req.body, {
//     abortEarly: false,
//   });

//   if (error) {
//     const errorMessage = error.details
//       .map((detail) => detail.message)
//       .join(", ");
//     return res.status(400).json({ error: errorMessage });
//   }

  next();
};

module.exports = {
  validateRegistration,
};
