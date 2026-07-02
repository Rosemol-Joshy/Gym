const Payment = require("./paymentschema");

const createPayment = async (paymentData) => {
  return await Payment.create(paymentData);
};

const getAllPayments = async () => {
  return await Payment.find().sort({ createdAt: -1 });
};

const getPaymentById = async (id) => {
  return await Payment.findById(id);
};

const updatePayment = async (id, paymentData) => {
  return await Payment.findByIdAndUpdate(id, paymentData, {
    new: true,
  });
};

const deletePayment = async (id) => {
  return await Payment.findByIdAndDelete(id);
};

module.exports = {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
};