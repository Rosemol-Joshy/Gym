import { useEffect, useState } from "react";
import { getMemberships, addMembership, updateMembership, deleteMembership } from "../services/membershipService";
import "./pages.css";

function Membership() {
  const [plans, setPlans] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    plan_name: "",
    price: "",
    duration_months: "",
    description: "",
    status: ""
  });

  const [editForm, setEditForm] = useState({
    plan_name: "",
    price: "",
    duration_months: "",
    description: "",
    status: ""
  });

  const loadPlans = async () => {
    try {
      const res = await getMemberships();
      setPlans(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Failed to load membership plans", error);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEdit = (plan) => {
    setEditingId(plan.plan_id);
    setEditForm({
      plan_name: plan.plan_name,
      price: plan.price.toString(),
      duration_months: plan.duration_months.toString(),
      description: plan.description,
      status: plan.status
    });
  };

  const handleUpdatePlan = async (e) => {
    e.preventDefault();
    try {
      const formData = {
        ...editForm,
        price: parseInt(editForm.price) || 0,
        duration_months: parseInt(editForm.duration_months) || 0
      };
      await updateMembership(editingId, formData);
      setEditingId(null);
      await loadPlans();
    } catch (error) {
      console.error("Failed to update membership plan", error);
    }
  };

  const handleDeletePlan = async (id) => {
    if (window.confirm("Are you sure you want to delete this membership plan?")) {
      try {
        await deleteMembership(id);
        await loadPlans();
      } catch (error) {
        console.error("Failed to delete membership plan", error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = {
        ...form,
        price: parseInt(form.price) || 0,
        duration_months: parseInt(form.duration_months) || 0
      };
      await addMembership(formData);
      await loadPlans();

      setForm({
        plan_name: "",
        price: "",
        duration_months: "",
        description: "",
        status: ""
      });
    } catch (error) {
      console.error("Failed to add membership plan", error);
    }
  };
  return (
    <div className="page-wrapper">
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title"> Membership Plans</h1>
            <p className="page-subtitle">Create and manage flexible membership packages for your members</p>
          </div>
        </div>

        <div className="content-grid">
          {editingId && (
            <div className="form-card">
              <h3 className="form-card-title">Edit Membership Plan</h3>
              <form onSubmit={handleUpdatePlan}>
                <div className="form-group full">
                  <label className="form-label">Plan Name</label>
                  <input
                    name="plan_name"
                    placeholder="e.g., Gold Premium"
                    value={editForm.plan_name}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <div>
                    <label className="form-label">Price (₹)</label>
                    <input
                      name="price"
                      type="number"
                      placeholder="Enter price"
                      value={editForm.price}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Duration (Months)</label>
                    <input
                      name="duration_months"
                      type="number"
                      placeholder="Number of months"
                      value={editForm.duration_months}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group full">
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    placeholder="Describe what's included in this plan"
                    value={editForm.description}
                    onChange={handleEditChange}
                    rows="3"
                  />
                </div>

                <div className="form-group full">
                  <label className="form-label">Status</label>
                  <select
                    name="status"
                    value={editForm.status}
                    onChange={handleEditChange}
                  >
                    <option value="">Select Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="button-group">
                  <button type="submit" className="button-primary">
                    ✓ Update Plan
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="button-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="form-card">
            <h3 className="form-card-title">Create New Plan</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group full">
                <label className="form-label">Plan Name</label>
                <input
                  name="plan_name"
                  placeholder="e.g., Gold Premium"
                  value={form.plan_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <div>
                  <label className="form-label">Price (₹)</label>
                  <input
                    name="price"
                    type="number"
                    placeholder="Enter price"
                    value={form.price}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Duration (Months)</label>
                  <input
                    name="duration_months"
                    type="number"
                    placeholder="Number of months"
                    value={form.duration_months}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group full">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  placeholder="Describe what's included in this plan"
                  value={form.description}
                  onChange={handleChange}
                  rows="3"
                />
              </div>

              <div className="form-group full">
                <label className="form-label">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="">Select Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="button-group">
                <button type="submit" className="button-primary">
                  + Create Plan
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="table-card">
          <div className="table-card-header">
            <h3 className="table-card-title">All Membership Plans</h3>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Plan Name</th>
                <th>Price</th>
                <th>Duration</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    <div className="empty-state">
                      <div className="empty-state-icon"></div>
                      <p className="empty-state-text">No membership plans yet. Create your first plan to get started!</p>
                    </div>
                  </td>
                </tr>
              ) : (
                plans.map((p) => (
                  <tr key={p.plan_id}>
                    <td>#{p.plan_id}</td>
                    <td>
                      <strong>{p.plan_name}</strong>
                    </td>
                    <td>₹{p.price.toLocaleString()}</td>
                    <td>{p.duration_months} Months</td>
                    <td>{p.description}</td>
                    <td>
                      <span className={`status-badge status-${p.status?.toLowerCase() || "inactive"}`}>
                        {p.status || "N/A"}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="button-sm button-sm-primary"
                          onClick={() => handleEdit(p)}
                        >
                          ✎ Edit
                        </button>
                        <button
                          className="button-sm button-sm-danger"
                          onClick={() => handleDeletePlan(p.plan_id)}
                        >
                          Delete
                        </button>
                      </div>
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

export default Membership;