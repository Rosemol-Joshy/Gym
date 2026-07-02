const paymentModel = require("../models/paymentmodel");

const addPayment = async (req, res) => {
  try {
    const payment = await paymentModel.createPayment(req.body);
    res.status(201).json({
      message: "Payment added successfully",
      payment,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllPayments = async (req, res) => {
  try {
    const payments = await paymentModel.getAllPayments();
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPaymentById = async (req, res) => {
  try {
    const payment = await paymentModel.getPaymentById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updatePayment = async (req, res) => {
  try {
    const payment = await paymentModel.updatePayment(req.params.id, req.body);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    res.status(200).json({
      message: "Payment updated successfully",
      payment,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deletePayment = async (req, res) => {
  try {
    const payment = await paymentModel.deletePayment(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    res.status(200).json({
      message: "Payment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
};