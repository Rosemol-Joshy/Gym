import { Routes, Route, Link, useLocation } from "react-router-dom";
//import PaymentManagement from "./pages/PaymentManagement";
//import AdminDashboard from "./pages/AdminDashboard";
//import TrainerDashboard from "./pages/TrainerDashboard";
//import MemberDashboard from "./pages/MemberDashboard";
import { currentRole } from "./utils/role";
import AttendancePage        from './pages/attendance/AttendancePage';
import WorkoutPage           from './pages/workout/WorkoutPage';
import WorkoutPlanDetailPage from './pages/workout/WorkoutPlanDetailPage';
import ExercisesPage         from './pages/workout/ExercisesPage';
import AssignmentsPage       from './pages/workout/AssignmentsPage';

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
        {/*<Route path="/" element={<AdminDashboard />} />
        <Route path="/trainer-dashboard" element={<TrainerDashboard />} />
        <Route path="/member-dashboard" element={<MemberDashboard />} />
        <Route path="/payments" element={<PaymentManagement />} /> */}
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/workout" element={<WorkoutPage />} />
        <Route path="/workout/workout-plans/:id" element={<WorkoutPlanDetailPage />} />
        <Route path="/workout/exercises" element={<ExercisesPage />} />
        <Route path="/workout/assignments" element={<AssignmentsPage />} />
      </Routes>
    </div>
  );
}

export default App;