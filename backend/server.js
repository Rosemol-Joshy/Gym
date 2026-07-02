const express = require("express");
const paymentRoutes = require("./routes/paymentroutes");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const app = express();
const trainerRoutes = require("./routes/trainerroutes");
const membershipPlanRoutes = require("./routes/membershipplanroutes");
const authRoutes = require("./routes/authRoutes");
// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/trainers", trainerRoutes);
app.use("/api/membership-plans", membershipPlanRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/auth", authRoutes);
// Test Route
app.get("/", (req, res) => {
  res.send("Gym Management System Backend is Running 🚀");
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  server.on("error", (err) => {
    console.error("Server Error:", err);
  });
}

startServer();

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

