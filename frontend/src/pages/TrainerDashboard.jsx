import { useEffect, useState } from "react";
import "./pages.css";
import { currentRole } from "../utils/role";
import { getPayments } from "../services/paymentService";

function TrainerDashboard() {
  if (currentRole !== "trainer") {
    return (
      <div className="page-wrapper">
        <div className="page-container">
          <h1>Access Denied</h1>
        </div>
      </div>
    );
  }

  const [payments, setPayments] = useState([]);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const res = await getPayments();
      setPayments(res.data);
    } catch (error) {
      console.error("Failed to load payments", error);
    }
  };

  const totalPayments = payments.length;

  const paidPayments = payments.filter(
    (p) => p.status === "Paid"
  ).length;

  const pendingPayments = payments.filter(
    (p) => p.status === "Pending"
  ).length;

  const overduePayments = payments.filter(
    (p) => p.status === "Overdue"
  ).length;

  return (
    <div className="page-wrapper">
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Trainer Dashboard</h1>
            <p className="page-subtitle">
              Monitor member payment records
            </p>
          </div>
        </div>

        <div className="content-grid">
          <div className="form-card">
            <h3>💳 Total Payment Records</h3>
            <h2>{totalPayments}</h2>
            <p className="page-subtitle">
              Total payment entries
            </p>
          </div>

          <div className="form-card">
            <h3>✅ Paid Payments</h3>
            <h2>{paidPayments}</h2>
            <p className="page-subtitle">
              Successfully completed
            </p>
          </div>

          <div className="form-card">
            <h3>⏳ Pending Payments</h3>
            <h2>{pendingPayments}</h2>
            <p className="page-subtitle">
              Awaiting payment
            </p>
          </div>

          <div className="form-card">
            <h3>⚠️ Overdue Payments</h3>
            <h2>{overduePayments}</h2>
            <p className="page-subtitle">
              Require attention
            </p>
          </div>
        </div>

        <div className="table-card">
          <div className="table-card-header">
            <h3 className="table-card-title">
              Recent Payment Records
            </h3>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Member Name</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <div className="empty-state">
                      <div className="empty-state-icon">💳</div>
                      <p className="empty-state-text">
                        No payment records found.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.payment_id}>
                    <td>#{payment.payment_id}</td>
                    <td>{payment.member_name}</td>
                    <td>₹{payment.amount}</td>
                    <td>{payment.due_date}</td>
                    <td>
                      <span
                        className={`status-badge status-${payment.status.toLowerCase()}`}
                      >
                        {payment.status}
                      </span>
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

export default TrainerDashboard;