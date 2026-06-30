const Trainer = require("../models/trainerModel");

// Add Trainer
const addTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.create(req.body);

    res.status(201).json({
      message: "Trainer added successfully",
      trainer,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Trainers
const getAllTrainers = async (req, res) => {
  try {
    const trainers = await Trainer.find().sort({ createdAt: -1 });

    res.status(200).json(trainers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Trainer By ID
const getTrainerById = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id);

    if (!trainer) {
      return res.status(404).json({
        message: "Trainer not found",
      });
    }

    res.status(200).json(trainer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Trainer
const updateTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!trainer) {
      return res.status(404).json({
        message: "Trainer not found",
      });
    }

    res.status(200).json({
      message: "Trainer updated successfully",
      trainer,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Trainer
const deleteTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findByIdAndDelete(req.params.id);

    if (!trainer) {
      return res.status(404).json({
        message: "Trainer not found",
      });
    }

    res.status(200).json({
      message: "Trainer deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addTrainer,
  getAllTrainers,
  getTrainerById,
  updateTrainer,
  deleteTrainer,
};