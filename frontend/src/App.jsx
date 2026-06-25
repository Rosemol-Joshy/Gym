import { Routes, Route, Link, useLocation } from "react-router-dom";
import PaymentManagement from "./pages/PaymentManagement";
import AdminDashboard from "./pages/AdminDashboard";
import TrainerDashboard from "./pages/TrainerDashboard";
import MemberDashboard from "./pages/MemberDashboard";
import Trainer from "./pages/Trainer";
import Membership from "./pages/Membership";
import { currentRole } from "./utils/role";

import "./App.css";

function App() {
  const location = useLocation();

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-brand">GymPro</div>

          <ul className="nav-links">

  {currentRole === "admin" && (
    <>
      <li>
        <Link
          to="/"
          className={location.pathname === "/" ? "nav-link active" : "nav-link"}
        >
          Admin Dashboard
        </Link>
      </li>

      <li>
        <Link
          to="/trainers"
          className={location.pathname === "/trainers" ? "nav-link active" : "nav-link"}
        >
          Trainer Management
        </Link>
      </li>

      <li>
        <Link
          to="/memberships"
          className={location.pathname === "/memberships" ? "nav-link active" : "nav-link"}
        >
          Membership Plans
        </Link>
      </li>

      <li>
        <Link
          to="/payments"
          className={location.pathname === "/payments" ? "nav-link active" : "nav-link"}
        >
          Payment Management
        </Link>
      </li>
    </>
  )}

  {currentRole === "trainer" && (
    <li>
      <Link
        to="/trainer-dashboard"
        className={location.pathname === "/trainer-dashboard" ? "nav-link active" : "nav-link"}
      >
        Trainer Dashboard
      </Link>
    </li>
  )}

  {currentRole === "member" && (
    <li>
      <Link
        to="/member-dashboard"
        className={location.pathname === "/member-dashboard" ? "nav-link active" : "nav-link"}
      >
        Member Dashboard
      </Link>
    </li>
  )}

</ul>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/trainer-dashboard" element={<TrainerDashboard />} />
        <Route path="/member-dashboard" element={<MemberDashboard />} />
        <Route path="/payments" element={<PaymentManagement />} />
        <Route path="/trainers" element={<Trainer />} />
        <Route path="/memberships" element={<Membership />} />
      </Routes>
    </div>
  );
}

export default App;