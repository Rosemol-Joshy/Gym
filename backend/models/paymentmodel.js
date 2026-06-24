const db = require("../config/db");

const createPayment = (paymentData, callback) => {
  const sql = `
    INSERT INTO payments
    (member_name, amount, payment_date, due_date, status)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      paymentData.member_name,
      paymentData.amount,
      paymentData.payment_date,
      paymentData.due_date,
      paymentData.status,
    ],
    callback
  );
};

const getAllPayments = (callback) => {
  const sql = "SELECT * FROM payments";
  db.query(sql, callback);
};

const getPaymentById = (id, callback) => {
  const sql = "SELECT * FROM payments WHERE payment_id = ?";
  db.query(sql, [id], callback);
};

const updatePayment = (id, paymentData, callback) => {
  const sql = `
    UPDATE payments
    SET member_name = ?, amount = ?, payment_date = ?,
        due_date = ?, status = ?
    WHERE payment_id = ?
  `;

  db.query(
    sql,
    [
      paymentData.member_name,
      paymentData.amount,
      paymentData.payment_date,
      paymentData.due_date,
      paymentData.status,
      id,
    ],
    callback
  );
};

const deletePayment = (id, callback) => {
  const sql = "DELETE FROM payments WHERE payment_id = ?";
  db.query(sql, [id], callback);
};

module.exports = {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
};