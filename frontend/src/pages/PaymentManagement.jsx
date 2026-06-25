import { useState, useEffect } from "react";
import "./pages.css";
import { currentRole } from "../utils/role";
import { getPayments, addPayment, deletePayment } from "../services/paymentService";

function PaymentManagement() {
  if (currentRole !== "admin") {
    return (
      <div className="page-wrapper">
        <div className="page-container">
          <h1>Access Denied</h1>
        </div>
      </div>
    );
  }

  const [payments, setPayments] = useState([]);

  const [form, setForm] = useState({
    member_name: "",
    amount: "",
    payment_date: "",
    due_date: "",
    status: "Pending",
  });

  const loadPayments = async () => {
    try {
      const res = await getPayments();
      setPayments(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Failed to load payments", error);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this payment record?")) {
      try {
        await deletePayment(id);
        await loadPayments();
      } catch (error) {
        console.error("Failed to delete payment", error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addPayment(form);
      setForm({
        member_name: "",
        amount: "",
        payment_date: "",
        due_date: "",
        status: "Pending",
      });
      await loadPayments();
    } catch (error) {
      console.error("Failed to add payment", error);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Payment Management</h1>
        </div>

        <div className="form-card">
          <h3 className="form-card-title">Add Payment</h3>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <div>
                <label className="form-label">Member Name</label>
                <input
                  name="member_name"
                  value={form.member_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="form-label">Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div>
                <label className="form-label">Payment Date</label>
                <input
                  type="date"
                  name="payment_date"
                  value={form.payment_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  name="due_date"
                  value={form.due_date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group full">
              <label className="form-label">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>

            <button className="button-primary" type="submit">
              Add Payment
            </button>
          </form>
        </div>

        <div className="table-card">
          <div className="table-card-header">
            <h3 className="table-card-title">Payment Records</h3>
          </div>

          {payments.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-text">No payment records found.</p>
            </div>
          ) : (
            <div className="cards-grid">
              {payments.map((p) => (
                <div className="data-card" key={p.payment_id}>
                  <div className="data-card-header">
                    <div>
                      <span className="data-card-subtitle">#{p.payment_id}</span>
                      <h4 className="data-card-title">{p.member_name}</h4>
                    </div>
                    <span className={`status-badge status-${p.status.toLowerCase()}`}>
                      {p.status}
                    </span>
                  </div>
                  <div className="data-card-body">
                    <div className="data-card-price" style={{ margin: "5px 0 15px" }}>
                      ₹{p.amount.toLocaleString()}
                    </div>
                    <div className="data-card-row">
                      <span className="data-card-label">Payment Date</span>
                      <span className="data-card-value">
                        {p.payment_date ? new Date(p.payment_date).toLocaleDateString() : "N/A"}
                      </span>
                    </div>
                    <div className="data-card-row">
                      <span className="data-card-label">Due Date</span>
                      <span className="data-card-value">
                        {p.due_date ? new Date(p.due_date).toLocaleDateString() : "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="data-card-footer">
                    <button
                      className="button-sm button-sm-danger"
                      onClick={() => handleDelete(p.payment_id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PaymentManagement;