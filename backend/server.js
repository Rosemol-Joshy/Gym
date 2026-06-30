require("dotenv").config();
const express = require("express");
const paymentRoutes = require("./routes/paymentroutes");
const cors = require("cors");
const connectDB = require("./config/db");
const app = express();
connectDB();
const trainerRoutes = require("./routes/trainerroutes");
const membershipPlanRoutes = require("./routes/membershipplanroutes");
// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/trainers", trainerRoutes);
app.use("/api/membership-plans", membershipPlanRoutes);
app.use("/api/payments", paymentRoutes);
// Test Route
app.get("/", (req, res) => {
  res.send("Gym Management System Backend is Running 🚀");
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

server.on('error', (err) => {
  console.error('Server Error:', err);
});