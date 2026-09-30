require("dotenv").config();

const express = require("express");
const bcrypt = require("bcryptjs");
const cors = require("cors");

const connectDB = require("./config/DBConnect");
const User = require("./models/User");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/userregister", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required"
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      phone,
      role: "user"
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Registration failed" });
  }
});

connectDB().then(() => {
  app.listen(3001, "0.0.0.0", () => {
    console.log("Registration service running on port 3001");
  });
});