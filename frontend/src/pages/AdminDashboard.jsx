import "./pages.css";
import { currentRole } from "../utils/role";

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

  const recentPayments = [
    {
      id: 1,
      member: "Vishnu",
      amount: 1000,
      status: "Paid",
    },
    {
      id: 2,
      member: "Arjun",
      amount: 1500,
      status: "Pending",
    },
    {
      id: 3,
      member: "Rahul",
      amount: 2000,
      status: "Overdue",
    },
  ];

  return (
    <div className="page-wrapper">
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Admin Dashboard</h1>
            <p className="page-subtitle">
              Monitor payments, revenue, and gym performance
            </p>
          </div>
        </div>

        <div className="content-grid">
          <div className="form-card">
            <h3>Total Revenue</h3>
            <h2>₹25,000</h2>
            <p className="page-subtitle">
              Revenue generated this month
            </p>
          </div>

          <div className="form-card">
            <h3>Total Payments</h3>
            <h2>35</h2>
            <p className="page-subtitle">
              Successful transactions
            </p>
          </div>

          <div className="form-card">
            <h3>Pending Payments</h3>
            <h2>5</h2>
            <p className="page-subtitle">
              Awaiting payment confirmation
            </p>
          </div>

          <div className="form-card">
            <h3>Overdue Payments</h3>
            <h2>2</h2>
            <p className="page-subtitle">
              Require immediate attention
            </p>
          </div>
        </div>

        <div className="table-card">
          <div className="table-card-header">
            <h3 className="table-card-title">Recent Payments</h3>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Member</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {recentPayments.map((payment) => (
                <tr key={payment.id}>
                  <td>#{payment.id}</td>
                  <td>{payment.member}</td>
                  <td>₹{payment.amount}</td>
                  <td>
                    <span
                      className={`status-badge status-${payment.status.toLowerCase()}`}
                    >
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;