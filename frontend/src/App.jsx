import { Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import PaymentManagement from "./pages/PaymentManagement";
import AdminDashboard from "./pages/AdminDashboard";
import TrainerDashboard from "./pages/TrainerDashboard";
import MemberDashboard from "./pages/MemberDashboard";
import Trainer from "./pages/Trainer";
import Membership from "./pages/Membership";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { getCurrentRole } from "./utils/role";
import "./App.css";

function App() {
  const location = useLocation();
  const currentRole = getCurrentRole();

  const getHomePath = (role) => {
    if (role === "admin") return "/";
    if (role === "trainer") return "/trainer-dashboard";
    if (role === "member") return "/member-dashboard";
    return "/login";
  };

  return (
    <div className="app">

      {currentRole && (
        <nav className="navbar">
          <div className="nav-container">
            <div className="nav-brand">GymPro</div>

            <ul className="nav-links">
              {currentRole === "admin" && (
                <>
                  <li><Link to="/">Admin Dashboard</Link></li>
                  <li><Link to="/trainers">Trainer Management</Link></li>
                  <li><Link to="/memberships">Membership Plans</Link></li>
                  <li><Link to="/payments">Payment Management</Link></li>
                </>
              )}

              {currentRole === "trainer" && (
                <li><Link to="/trainer-dashboard">Trainer Dashboard</Link></li>
              )}

              {currentRole === "member" && (
                <li><Link to="/member-dashboard">Member Dashboard</Link></li>
              )}

              <li>
                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    window.location.href = "/login";
                  }}
                  className="nav-logout-btn"
                  style={{
                    background: "none",
                    border: "none",
                    color: "#EF4444",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    marginLeft: "20px"
                  }}
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </nav>
      )}

      <Routes>
        <Route path="/login" element={!currentRole ? <Login /> : <Navigate to={getHomePath(currentRole)} replace />} />
        <Route path="/register" element={!currentRole ? <Register /> : <Navigate to={getHomePath(currentRole)} replace />} />

        <Route path="/" element={currentRole === "admin" ? <AdminDashboard /> : <Navigate to={getHomePath(currentRole)} replace />} />
        <Route path="/trainers" element={currentRole === "admin" ? <Trainer /> : <Navigate to={getHomePath(currentRole)} replace />} />
        <Route path="/memberships" element={currentRole === "admin" ? <Membership /> : <Navigate to={getHomePath(currentRole)} replace />} />
        <Route path="/payments" element={currentRole === "admin" ? <PaymentManagement /> : <Navigate to={getHomePath(currentRole)} replace />} />

        <Route path="/trainer-dashboard" element={currentRole === "trainer" ? <TrainerDashboard /> : <Navigate to={getHomePath(currentRole)} replace />} />
        <Route path="/member-dashboard" element={currentRole === "member" ? <MemberDashboard /> : <Navigate to={getHomePath(currentRole)} replace />} />

        <Route path="*" element={<Navigate to={getHomePath(currentRole)} replace />} />
      </Routes>

    </div>
  );
}

export default App;