import "./pages.css";
import { getCurrentRole } from "../utils/role";

function TrainerDashboard() {
  const currentRole = getCurrentRole();
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
      plan: "Gold Plan",
      status: "Active",
    },
    {
      id: 2,
      name: "Arjun",
      plan: "Silver Plan",
      status: "Active",
    },
    {
      id: 3,
      name: "Rahul",
      plan: "Gold Plan",
      status: "Active",
    },
  ];

  return (
    <div className="page-wrapper">
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Trainer Dashboard</h1>
            <p className="page-subtitle">
              Track member memberships and performance
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
        </div>

        <div className="table-card">
          <div className="table-card-header">
            <h3 className="table-card-title">
              Assigned Members & Plans
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
                    <span className="data-card-label">Assigned Plan</span>
                    <span className="data-card-value">{member.plan}</span>
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