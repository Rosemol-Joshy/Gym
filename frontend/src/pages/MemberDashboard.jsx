import "./pages.css";
import { getCurrentRole } from "../utils/role";

function MemberDashboard() {
  const currentRole = getCurrentRole();
  if (currentRole !== "member") {
    return (
      <div className="page-wrapper">
        <div className="page-container">
          <h1>Access Denied</h1>
        </div>
      </div>
    );
  }

  const paymentHistory = [
    {
      id: 1,
      date: "2026-05-20",
      amount: 1000,
      status: "Paid",
    },
    {
      id: 2,
      date: "2026-04-20",
      amount: 1000,
      status: "Paid",
    },
    {
      id: 3,
      date: "2026-03-20",
      amount: 1000,
      status: "Paid",
    },
  ];

  return (
    <div className="page-wrapper">
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Member Dashboard</h1>
            <p className="page-subtitle">
              View membership details and payment history
            </p>
          </div>
        </div>

        <div className="content-grid">
          <div className="form-card">
            <h3>Membership Status</h3>
            <h2>Active</h2>
            <p className="page-subtitle">
              Membership currently active
            </p>
          </div>

          <div className="form-card">
            <h3>Membership Plan</h3>
            <h2>Gold Plan</h2>
            <p className="page-subtitle">
              Premium fitness package
            </p>
          </div>

          <div className="form-card">
            <h3>Expiry Date</h3>
            <h2>25 Jun 2026</h2>
            <p className="page-subtitle">
              Membership renewal date
            </p>
          </div>

          <div className="form-card">
            <h3>Assigned Trainer</h3>
            <h2>John</h2>
            <p className="page-subtitle">
              Personal fitness trainer
            </p>
          </div>
        </div>

        <div className="table-card">
          <div className="table-card-header">
            <h3 className="table-card-title">Payment History</h3>
          </div>

          <div className="cards-grid">
            {paymentHistory.map((payment) => (
              <div className="data-card" key={payment.id}>
                <div className="data-card-header">
                  <div>
                    <span className="data-card-subtitle">#{payment.id}</span>
                    <h4 className="data-card-title">Payment Transaction</h4>
                  </div>
                  <span className={`status-badge status-${payment.status.toLowerCase()}`}>
                    {payment.status}
                  </span>
                </div>
                <div className="data-card-body">
                  <div className="data-card-row">
                    <span className="data-card-label">Amount</span>
                    <span className="data-card-value">₹{payment.amount.toLocaleString()}</span>
                  </div>
                  <div className="data-card-row">
                    <span className="data-card-label">Date</span>
                    <span className="data-card-value">
                      {payment.date ? new Date(payment.date).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MemberDashboard;