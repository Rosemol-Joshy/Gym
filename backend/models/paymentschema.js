const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    member_name: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    payment_date: {
      type: Date,
      required: true,
    },
    due_date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Paid", "Pending", "Overdue"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Payment", paymentSchema);
