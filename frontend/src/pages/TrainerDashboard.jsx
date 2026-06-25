import "./pages.css";
import { currentRole } from "../utils/role";

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

  const members = [
    {
      id: 1,
      name: "Vishnu",
      dueDate: "2026-06-20",
      status: "Pending",
    },
    {
      id: 2,
      name: "Arjun",
      dueDate: "2026-06-20",
      status: "Paid",
    },
    {
      id: 3,
      name: "Rahul",
      dueDate: "2026-06-25",
      status: "Pending",
    },
  ];

  return (
    <div className="page-wrapper">
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Trainer Dashboard</h1>
            <p className="page-subtitle">
              Track member memberships and payment status
            </p>
          </div>
        </div>

        <div className="content-grid">
          <div className="form-card">
            <h3>Assigned Members</h3>
            <h2>12</h2>
            <p className="page-subtitle">
              Members currently assigned
            </p>
          </div>

          <div className="form-card">
            <h3>Membership Ending Today</h3>
            <h2>2</h2>
            <p className="page-subtitle">
              Require immediate renewal
            </p>
          </div>

          <div className="form-card">
            <h3>Ending Within 7 Days</h3>
            <h2>4</h2>
            <p className="page-subtitle">
              Follow up with members
            </p>
          </div>

          <div className="form-card">
            <h3>Pending Payments</h3>
            <h2>3</h2>
            <p className="page-subtitle">
              Awaiting payment confirmation
            </p>
          </div>
        </div>

        <div className="table-card">
          <div className="table-card-header">
            <h3 className="table-card-title">
              Members Due & Membership Status
            </h3>
          </div>

          <div className="cards-grid">
            {members.map((member) => (
              <div className="data-card" key={member.id}>
                <div className="data-card-header">
                  <div>
                    <span className="data-card-subtitle">#{member.id}</span>
                    <h4 className="data-card-title">{member.name}</h4>
                  </div>
                  <span className={`status-badge status-${member.status.toLowerCase()}`}>
                    {member.status}
                  </span>
                </div>
                <div className="data-card-body">
                  <div className="data-card-row">
                    <span className="data-card-label">Due Date</span>
                    <span className="data-card-value">
                      {member.dueDate ? new Date(member.dueDate).toLocaleDateString() : "N/A"}
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

export default TrainerDashboard;