const mongoose = require("mongoose");

const connectDB = async () => {
  console.log("connectDB called");
  console.log("URI:", process.env.MONGODB_URI);

  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;