const paymentModel = require("../models/paymentmodel");

const addPayment = (req, res) => {
  paymentModel.createPayment(req.body, (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }

    res.status(201).json({
      message: "Payment added successfully",
    });
  });
};

const getAllPayments = (req, res) => {
  paymentModel.getAllPayments((err, results) => {
    if (err) {
      return res.status(500).json(err);
    }

    res.status(200).json(results);
  });
};

const getPaymentById = (req, res) => {
  paymentModel.getPaymentById(req.params.id, (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }

    res.status(200).json(result);
  });
};

const updatePayment = (req, res) => {
  const id = req.params.id;

  paymentModel.updatePayment(id, req.body, (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }

    res.json({
      message: "Payment updated successfully",
    });
  });
};

const deletePayment = (req, res) => {
  const id = req.params.id;

  paymentModel.deletePayment(id, (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }

    res.json({
      message: "Payment deleted successfully",
    });
  });
};

module.exports = {
  addPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
};