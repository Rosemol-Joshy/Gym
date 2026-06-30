const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
connectDB();
const attendanceRoutes = require('./routes/attendanceRoutes');
const workoutRoutes = require('./routes/workoutRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/attendance', attendanceRoutes);
app.use('/api/workout', workoutRoutes);

// Test Route
app.get('/', (req, res) => {
  res.send('Gym Management System Backend is Running 🚀');
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  server.on('error', (err) => {
    console.error('Server Error:', err);
  });
};

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});