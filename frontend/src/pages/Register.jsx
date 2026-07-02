import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "member",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await registerUser(form);

      // Save token and user details to login automatically
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      alert(res.data.message || "Registered successfully");

      const role = (res.data.user?.role || "").toLowerCase();
      if (role === "admin") {
        window.location.href = "/";
      } else if (role === "trainer") {
        window.location.href = "/trainer-dashboard";
      } else {
        window.location.href = "/member-dashboard";
      }
    } catch (err) {
      console.error(err?.response || err);
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div style={{ width: "300px", margin: "50px auto" }}>
      <h2>Register</h2>

      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
        <br /><br />

        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
        <br /><br />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        />
        <br /><br />

        <select name="role" value={form.role} onChange={handleChange}>
          <option value="member">Member</option>
          <option value="trainer">Trainer</option>
          <option value="admin">Admin</option>
        </select>

        <br /><br />

        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;