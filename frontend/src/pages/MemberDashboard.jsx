import { useEffect, useState } from "react";
import "./pages.css";
import { currentRole } from "../utils/role";
import { getPayments } from "../services/paymentService";

function MemberDashboard() {
  if (currentRole !== "member") {
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

  const totalAmountPaid = payments
    .filter((p) => p.status === "Paid")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const paidPayments = payments.filter(
    (p) => p.status === "Paid"
  ).length;

  const pendingPayments = payments.filter(
    (p) => p.status === "Pending"
  ).length;

  return (
    <div className="page-wrapper">
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Member Dashboard</h1>
            <p className="page-subtitle">
              View your payment records and transaction history
            </p>
          </div>
        </div>

        <div className="content-grid">
          <div className="form-card">
            <h3>💰 Total Amount Paid</h3>
            <h2>₹{totalAmountPaid}</h2>
            <p className="page-subtitle">
              Total successful payments
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
            <h3>✅ Paid Payments</h3>
            <h2>{paidPayments}</h2>
            <p className="page-subtitle">
              Completed successfully
            </p>
          </div>

          <div className="form-card">
            <h3>⏳ Pending Payments</h3>
            <h2>{pendingPayments}</h2>
            <p className="page-subtitle">
              Awaiting confirmation
            </p>
          </div>
        </div>

        <div className="table-card">
          <div className="table-card-header">
            <h3 className="table-card-title">
              Payment History
            </h3>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Member</th>
                <th>Payment Date</th>
                <th>Amount</th>
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
                        No payment history found.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.payment_id}>
                    <td>#{payment.payment_id}</td>
                    <td>{payment.member_name}</td>
                    <td>{payment.payment_date}</td>
                    <td>₹{payment.amount}</td>
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

export default MemberDashboard;