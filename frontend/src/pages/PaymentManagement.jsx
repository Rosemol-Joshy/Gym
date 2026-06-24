import { useState } from "react";
import "./pages.css";
import { currentRole } from "../utils/role";

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

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleDelete = (id) => {
    setPayments(payments.filter((payment) => payment.payment_id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setPayments([
      ...payments,
      {
        payment_id: payments.length + 1,
        ...form,
      },
    ]);

    setForm({
      member_name: "",
      amount: "",
      payment_date: "",
      due_date: "",
      status: "Pending",
    });
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
          <h3 className="table-card-title">Payment Records</h3>

          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Member</th>
                <th>Amount</th>
                <th>Payment Date</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    <div className="empty-state">
                      <p className="empty-state-text">
                        No payment records found.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.payment_id}>
                    <td>#{p.payment_id}</td>
                    <td>{p.member_name}</td>
                    <td>₹{p.amount}</td>
                    <td>{p.payment_date}</td>
                    <td>{p.due_date}</td>

                    <td>
                      <span
                        className={`status-badge status-${p.status.toLowerCase()}`}
                      >
                        {p.status}
                      </span>
                    </td>

                    <td>
                      <button
                        className="button-sm button-sm-danger"
                        onClick={() => handleDelete(p.payment_id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default PaymentManagement;