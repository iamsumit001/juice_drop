require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");

const createAdmin = async () => {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_PHONE = "" } = process.env;
  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error("ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD are required.");
  }
  if (ADMIN_PASSWORD.length < 12) {
    throw new Error("ADMIN_PASSWORD must be at least 12 characters.");
  }

  const email = ADMIN_EMAIL.trim().toLowerCase();
  await connectDB();
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("That email already has an account. No account was changed.");
  }

  await User.create({
    name: ADMIN_NAME,
    email,
    password: ADMIN_PASSWORD,
    phone: ADMIN_PHONE,
    role: "admin",
  });
  console.log("Production admin account created.");
  await mongoose.disconnect();
};

createAdmin().catch(async (error) => {
  console.error("Admin account creation failed:", error.message);
  await mongoose.disconnect();
  process.exitCode = 1;
});
