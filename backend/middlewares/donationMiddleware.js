// middleware/donationMiddleware.js
const validateDonation = (req, res, next) => {
  const { username, amount, programOrEventName, eventDate } = req.body;

  // Check if required fields are provided
  if (!username || !amount || !programOrEventName) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Validate amount
  if (amount < 0) {
    return res
      .status(400)
      .json({ error: "Amount must be a non-negative number" });
  }

  // If all validations pass, move on to the next middleware or controller
  next();
};

module.exports = {
  validateDonation,
};
