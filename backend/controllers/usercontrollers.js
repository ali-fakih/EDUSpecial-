const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const stripe = require("stripe")(process.env.SECRET_STRIPE_KEY);
const { v4: uuidv4 } = require("uuid");
const nodemailer = require("nodemailer");
const UserVerification = require("../models/userVerification");
const path = require("path");
//===================== NodeMailer Starts =============================================================
// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: "outlook",
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS,
  },
});

// Verify transporter setup
transporter.verify((error, success) => {
  if (error) {
    console.log(error);
  } else {
    console.log("Ready for message");
    console.log(success);
  }
});
//===================== NodeMailer Ends ===============================================================

//================= User Authentication and Verification  Starts ======================================
// verify email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    console.log("Verification Token:", token);

    // Find the user verification record by the token
    const verificationRecord = await UserVerification.findOne({
      uniqueString: token,
    });

    console.log("Verification Record:", verificationRecord);

    if (!verificationRecord) {
      // If no verification record is found, handle the error accordingly
      console.log("Invalid verification token");
      return res.status(400).json({ error: "Invalid verification token" });
    }

    // Update the user record to mark it as verified (you may have a "verified" field in your User model)
    await User.findByIdAndUpdate(verificationRecord.userId, { verified: true });

    console.log("User marked as verified");

    // Optionally, you can remove the verification record from the database
    await UserVerification.findByIdAndDelete(verificationRecord._id);

    console.log("Verification record deleted");

    // Respond with success message
    res.json({ message: "Email verification successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//  function to include token in the verification email
exports.sendVerificationEmail = async (user, token) => {
  const currentURL = "http://localhost:3000/";
  const uniqueString = uuidv4() + user._id;

  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: user.email,
    subject: "Verify Your Email",
    html: `<p>Verify your email address to complete the signup and login into your account.</p><p>This link <b>expires in 6 hours</b>.</p><p>Press <a href=${
      currentURL + "users/verify/" + user._id + "/" + uniqueString
    }?token=${token}>here</a> to proceed.</p>`,
  };

  try {
    const hashedUniqueString = await bcrypt.hash(uniqueString, 10);

    await UserVerification.create({
      userId: user._id,
      uniqueString: hashedUniqueString,
      createdAt: Date.now(),
      expiresAt: Date.now() + 21600000,
    });

    await transporter.sendMail(mailOptions);

    return {
      status: "Pending",
      message: "Verification Email Sent",
      token, // Include the token in the response
    };
  } catch (error) {
    console.error(error);
    return {
      status: "FAILED",
      message: "An error occurred while sending the verification email",
    };
  }
};

// Separate function for handling user verification
exports.handleUserVerification = async (req, res) => {
  const { userId, uniqueString } = req.params;

  try {
    const result = await UserVerification.find({ userId });

    if (result.length > 0) {
      const { expiresAt, uniqueString: hashedUniqueString } = result[0];

      if (expiresAt < Date.now()) {
        await UserVerification.deleteOne({ userId });
        await User.deleteOne({ _id: userId });

        return res
          .status(400)
          .json({ error: "The link has expired, please log in again" });
      } else {
        const isUniqueStringValid = await bcrypt.compare(
          uniqueString,
          hashedUniqueString
        );

        if (isUniqueStringValid) {
          await User.updateOne({ _id: userId }, { verified: true });
          await UserVerification.deleteOne({ userId });

          // Send the HTML response
          return res.sendFile(path.join(__dirname, "../views/verified.html"));
        } else {
          return res.status(400).json({
            error: "Invalid verification details passed. Check your inbox",
          });
        }
      }
    } else {
      return res.status(400).json({
        error:
          "Account record doesn't exist or has been verified already. Please sign up or log in",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error:
        "An error occurred while checking for an existing user verification record",
    });
  }
};

// Separate function for handling the /verified route
exports.showVerifiedPage = (req, res) => {
  res.sendFile(path.join(__dirname, "../views/verified.html"));
};

//================= User Authentication and Verification  Ends ======================================

//============================= Password Management Starts =============================================

// Function to send reset password email
exports.sendResetPasswordEmail = async (user, Token) => {
  const currentURL = "http://localhost:3001";
  const uniqueString = uuidv4() + user._id;

  try {
    // Hash the uniqueString before storing it
    const hashedUniqueString = await bcrypt.hash(uniqueString, 10);

    await UserVerification.create({
      userId: user._id,
      uniqueString: hashedUniqueString, // Save the hashed uniqueString
      createdAt: Date.now(),
      expiresAt: Date.now() + 21600000,
    });

    const resetToken = uuidv4(); // Generate a new reset token
    user.resetToken = resetToken;
    user.resetTokenExpires = Date.now() + 3600000; // 1 hour expiration

    await user.save();

    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
          <p style="color: #555;">Hello ${user.firstname},</p>
          <p style="color: #555;">You've requested to reset your password. Please click the link below to proceed:</p>
          <p style="color: #555; margin-bottom: 20px;"><a href="${currentURL}/reset-password/${user._id}/${resetToken}" style="color: #007BFF; text-decoration: none;">Reset Your Password</a></p>
          <p style="color: #555;">If you didn't request a password reset, you can safely ignore this email. The link is valid for 1 hour.</p>
          <p style="color: #555;">Best regards,<br>Your EDUSpecial Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return {
      status: "Pending",
      message: "Reset Password Email Sent",
      token: resetToken,
    };
  } catch (error) {
    console.error(error);
    return {
      status: "FAILED",
      message: "An error occurred while sending the reset password email",
    };
  }
};
// Function to handle forget password
exports.forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a reset token
    const resetToken = uuidv4();
    user.resetToken = resetToken;
    user.resetTokenExpires = Date.now() + 3600000; // 1 hour expiration

    await user.save();

    // Send reset password email
    const result = await exports.sendResetPasswordEmail(user, resetToken);

    res.json({
      message:
        "Password reset request has been successfully sent. Check your email.",
      result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
// Function to handle reset password
exports.resetPassword = async (req, res) => {
  try {
    const { userId, token } = req.params;
    const { password, confirmPassword } = req.body;

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    // Find the user by ID
    const user = await User.findById(userId);

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the reset token matches
    if (user.resetToken !== token) {
      return res.status(400).json({ error: "Invalid reset token" });
    }

    // Check if the reset token has expired
    if (user.resetTokenExpires < Date.now()) {
      return res.status(400).json({ error: "Reset token has expired" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user's password and reset token fields
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpires = null;

    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
// Function to change user password
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user ID is obtained from the JWT token
    const { oldPassword, newPassword, confirmPassword } = req.body;

    // Extract token from Authorization header
    const token = req.headers.authorization.split(' ')[1]; // Assuming the token is sent as "Bearer <token>"

    // Verify token using the same secret key as middleware
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      // Token is valid, proceed with changing password

      // Find the user by ID
      const user = await User.findById(userId);

      // Check if the user exists
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Verify old password
      const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isOldPasswordValid) {
        return res.status(401).json({ error: 'Incorrect old password' });
      }

      // Check if the new password matches the confirm password
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match' });
      }

      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update user's password
      user.password = hashedPassword;

      // Save the updated user information
      await user.save();

      // Respond with success message
      res.status(200).json({ message: 'Password changed successfully' });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


//============================== Password Management Ends ==============================================
// Function to register a new user
exports.registerUser = async (req, res) => {
  try {
    const { role, firstname, lastname, password, bloodType, email } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }],
    });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // Set default role (e.g., "user")
    const defaultRole = "user";
    const newUser = new User({
      role: defaultRole,
      firstname,
      lastname,
      password: hashedPassword,
      bloodType,
      email,
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

//todo function for stripe payments-----------------------------
exports.Payments = async (req, res) => {
  try {
    // Check if req.body.items exists and is an array
    if (!req.body.items || !Array.isArray(req.body.items)) {
      return res.status(400).json({
        error: "Invalid or missing 'items' property in the request body.",
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: req.body.items.map((item) => {
        return {
          price_data: {
            currency: "usd", // Change to the appropriate currency code
            product_data: {
              name: item.name,
            },
            unit_amount: item.price * 100,
          },
          quantity: item.quantity,
        };
      }),
      success_url: "http://localhost:3000/users/login",
      cancel_url: "http://localhost:3000/",
    });
    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
//todo Function to refresh access token using refresh token
exports.refreshToken = async (req, res) => {
  try {
    // Extract refresh token from the Authorization header
    const refreshTokenHeader = req.header("Authorization");

    if (invalidatedRefreshTokens.includes(refreshTokenHeader)) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }
    if (!refreshTokenHeader) {
      return res.status(400).json({ error: "Refresh token not provided" });
    }

    // Extract the token from the "Bearer token" format
    const [, refreshToken] = refreshTokenHeader.split(" ");

    // Validate the refresh token (check against the stored tokens, database, etc.)
    // If valid, get the user ID from the refresh token payload
    const decodedRefreshToken = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const userId = decodedRefreshToken.id;

    // Check if the refresh token is expired
    if (decodedRefreshToken.exp < Date.now() / 1000) {
      return res.status(401).json({ error: "Refresh token has expired" });
    }

    // Generate a new access token
    const newAccessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: "7 minutes",
    });

    // Generate a new refresh token (optional, if you want to rotate refresh tokens)
    const newRefreshToken = jwt.sign(
      { id: userId },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "7 days", // Choose an appropriate expiration time
      }
    );

    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken, // Include the new refresh token in the response
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

//todo time for incorrect login --------------------
const MAX_LOGIN_ATTEMPTS = 20;
const LOCKOUT_TIME_SHORT = 1 * 60 * 1000; // 1 minute
const LOCKOUT_TIME_LONG = 60 * 60 * 1000; // 1 hour

// Function to log in a user
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid Email" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    // Check if the account is currently locked
    if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS && user.lastLoginAttempt) {
      const elapsedTime = Date.now() - user.lastLoginAttempt;

      // Check if it's been less than 1 minute since the last attempt
      if (elapsedTime < LOCKOUT_TIME_SHORT) {
        const remainingTime = formatRemainingTime(
          LOCKOUT_TIME_SHORT - elapsedTime
        );
        return res.status(401).json({
          message: `Please try again after ${remainingTime} minute.`,
        });
      } else if (elapsedTime < LOCKOUT_TIME_LONG) {
        // Check if it's been less than 1 hour since the last attempt
        const remainingTime = formatRemainingTime(
          LOCKOUT_TIME_LONG - elapsedTime
        );
        return res.status(401).json({
          message: `Account locked For 1 Hour. Please try again after ${remainingTime} minute.`,
        });
      } else {
        // If it's been more than 1 hour, reset the login attempts
        await User.findByIdAndUpdate(user._id, {
          loginAttempts: 0,
          lastLoginAttempt: Date.now(),
        });
      }
    }

    if (!isPasswordValid) {
      // Increment login attempts
      await User.findByIdAndUpdate(user._id, {
        $inc: { loginAttempts: 1 },
        lastLoginAttempt: Date.now(),
      });

      // Check if the user should be locked out
      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS - 1) {
        const remainingTime = formatRemainingTime(LOCKOUT_TIME_SHORT);
        return res.status(401).json({
          message: `Invalid Password. Account will be locked after ${MAX_LOGIN_ATTEMPTS} failed attempts. Please try again after ${remainingTime}.`,
        });
      }

      return res.status(401).json({ message: "Incorrect Password" });
    }

    // If the password is valid, reset login attempts
    await User.findByIdAndUpdate(user._id, {
      loginAttempts: 0,
      lastLoginAttempt: Date.now(),
    });

    // Generate JWT tokens
    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "4 minutes",
    });
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "5 minutes",
      }
    );

    // Set cookies in the response
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "Lax", // Adjust as needed
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "Lax", // Adjust as needed
    });
    res.header("Authorization", "Bearer " + accessToken);
    res.status(200).json({
      message: "Login successfully",
      accessToken,
      refreshToken,
      role: user.role,
      email,
      firstname: user.firstname,
      lastname: user.lastname,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

//? Function to format remaining time in MM:SS format--------------
function formatRemainingTime(timeInMilliseconds) {
  const minutes = Math.floor(timeInMilliseconds / (60 * 1000));
  const seconds = Math.floor((timeInMilliseconds % (60 * 1000)) / 1000);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
}
//? Function to format remaining time in MM:SS format---------------
//! Maintain a list of invalidated refresh tokens (in-memory or persistent store)
const invalidatedRefreshTokens = [];

// Function to handle user logout
exports.logoutUser = async (req, res) => {
  try {
    // Get the access token from the request headers
    const accessTokenHeader = req.header("Authorization");
    const accessToken = accessTokenHeader
      ? accessTokenHeader.replace("Bearer ", "")
      : null;

    // Optionally, you can also get the refresh token if needed
    const refreshTokenHeader = req.header("refreshauth");
    const refreshToken = refreshTokenHeader
      ? refreshTokenHeader.replace("Bearer ", "")
      : null;

    // Your logic to handle the tokens (e.g., invalidate them)

    // Clear any existing tokens on the client-side (cookies, localStorage, etc.)
    // Clear cookies in the response
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    // Optionally, you can also add the tokens to the list of invalidated tokens
    if (accessToken && !invalidatedRefreshTokens.includes(accessToken)) {
      invalidatedRefreshTokens.push(accessToken);
    }
    if (refreshToken && !invalidatedRefreshTokens.includes(refreshToken)) {
      invalidatedRefreshTokens.push(refreshToken);
    }

    // Respond with a success message
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Function to get user by ID
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      user: {
        _id: user._id,
        role: user.role,
        firstname: user.firstname,
        lastname: user.lastname,
        bloodType: user.bloodType,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Function to update user information by ID
exports.updateUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const { role, firstname, lastname, bloodType, email, password } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = role || user.role;
    user.firstname = firstname || user.firstname;
    user.lastname = lastname || user.lastname;
    user.bloodType = bloodType || user.bloodType;
    user.email = email || user.email;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user.password = hashedPassword;
    }

    await user.save();

    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Function to update user information by email
exports.updateUserByEmail = async (req, res) => {
  try {
    const userEmail = req.params.email;
    const { role, firstname, lastname, bloodType, email, password } = req.body;

    const user = await User.findOne({ email: userEmail });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = role || user.role;
    user.firstname = firstname || user.firstname;
    user.lastname = lastname || user.lastname;
    user.bloodType = bloodType || user.bloodType;
    user.email = email || user.email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user.password = hashedPassword;
    }

    await user.save();

    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Function to delete a user account by ID
exports.deleteUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.deleteOne();

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Function to delete a user account by email
exports.deleteUserByEmail = async (req, res) => {
  try {
    const userEmail = req.params.email;

    const user = await User.findOne({ email: userEmail });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.deleteOne();

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Function to retrieve a user by email
exports.getUserByEmail = async (req, res) => {
  try {
    const userEmail = req.params.email;

    const user = await User.findOne({ email: userEmail });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      user: {
        _id: user._id,
        role: user.role,
        firstname: user.firstname,
        lastname: user.lastname,
        bloodType: user.bloodType,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
// Function to retrieve all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }); // Exclude the password field from the results

    res.status(200).json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
// Function to retrieve a user by firstname
exports.getUserByFirstname = async (req, res) => {
  try {
    const userfirstname = req.params.firstname; // Extract the firstname from the request params

    const user = await User.findOne({ firstname: userfirstname });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send user information without the password field
    res.status(200).json({
      user: {
        _id: user._id,
        role: user.role,
        firstname: user.firstname,
        lastname: user.lastname,
        bloodType: user.bloodType,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
//============================= User CRUD Operations Ends =============================================
