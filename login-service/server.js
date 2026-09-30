require("dotenv").config();

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const connectDB = require("./config/DBConnect");
const User = require("./models/User");

const app = express();

app.use(express.json());

app.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !["user", "admin"].includes(role)) {
      return res.status(400).json({
        message: "Valid email, password, and role are required"
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      role
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email, password, or role"
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email, password, or role"
      });
    }

    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
});

connectDB().then(() => {
  app.listen(3002, "0.0.0.0", () => {
    console.log("Login service running on port 3002");
  });
});