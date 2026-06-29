import { useEffect, useState } from "react";
import "./pages.css";
import { currentRole } from "../utils/role";
import { getPayments } from "../services/paymentService";

function AdminDashboard() {
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

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const res = await getPayments();
      setPayments(res.data);
    } catch (err) {
      console.error("Error loading payments:", err);
    }
  };

  const totalRevenue = payments
    .filter((p) => p.status === "Paid")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const totalPayments = payments.length;

  const pendingPayments = payments.filter(
    (p) => p.status === "Pending"
  ).length;

  const overduePayments = payments.filter(
    (p) => p.status === "Overdue"
  ).length;

  const recentPayments = [...payments]
    .sort((a, b) => b.payment_id - a.payment_id)
    .slice(0, 5);

  return (
    <div className="page-wrapper">
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Admin Dashboard</h1>
            <p className="page-subtitle">
              Monitor payments, revenue and gym performance
            </p>
          </div>
        </div>

        <div className="content-grid">
          <div className="form-card">
            <h3>💰 Total Revenue</h3>
            <h2>₹{totalRevenue}</h2>
            <p className="page-subtitle">
              Revenue from paid payments
            </p>
          </div>

          <div className="form-card">
            <h3>💳 Total Payments</h3>
            <h2>{totalPayments}</h2>
            <p className="page-subtitle">
              Payment records
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
              Recent Payments
            </h3>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Member</th>
                <th>Amount</th>
                <th>Payment Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {recentPayments.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <div className="empty-state">
                      <p className="empty-state-text">
                        No payments found.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                recentPayments.map((payment) => (
                  <tr key={payment.payment_id}>
                    <td>#{payment.payment_id}</td>
                    <td>{payment.member_name}</td>
                    <td>₹{payment.amount}</td>
                    <td>{payment.payment_date}</td>
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

export default AdminDashboard;