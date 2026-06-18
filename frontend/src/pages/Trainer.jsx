import { useEffect, useState } from "react";
import { getTrainers, addTrainer, updateTrainer, deleteTrainer } from "../services/trainerService";
import "./pages.css";

function Trainer() {
  const [trainers, setTrainers] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    specialization: "",
    experience: "",
    joining_date: "",
    status: ""
  });

  const [editForm, setEditForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    specialization: "",
    experience: "",
    joining_date: "",
    status: ""
  });

  const loadTrainers = async () => {
    try {
      const res = await getTrainers();
      setTrainers(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Failed to load trainers", error);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTrainers();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEdit = (trainer) => {
    setEditingId(trainer.trainer_id);
    const dateObj = new Date(trainer.joining_date);
    const formattedDate = dateObj.toISOString().split('T')[0];
    setEditForm({
      full_name: trainer.full_name,
      email: trainer.email,
      phone: trainer.phone,
      specialization: trainer.specialization,
      experience: trainer.experience,
      joining_date: formattedDate,
      status: trainer.status
    });
  };

  const handleUpdateTrainer = async (e) => {
    e.preventDefault();
    try {
      await updateTrainer(editingId, editForm);
      setEditingId(null);
      loadTrainers();
    } catch (error) {
      console.error("Failed to update trainer", error);
    }
  };

  const handleDeleteTrainer = async (id) => {
    if (window.confirm("Are you sure you want to delete this trainer?")) {
      try {
        await deleteTrainer(id);
        loadTrainers();
      } catch (error) {
        console.error("Failed to delete trainer", error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addTrainer(form);
      setForm({
        full_name: "",
        email: "",
        phone: "",
        specialization: "",
        experience: "",
        joining_date: "",
        status: ""
      });
      loadTrainers();
    } catch (error) {
      console.error("Failed to add trainer", error);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title"> Trainer Management</h1>
            <p className="page-subtitle">Manage your team of professional fitness trainers</p>
          </div>
        </div>

        <div className="content-grid">
          {editingId && (
            <div className="form-card">
              <h3 className="form-card-title">Edit Trainer</h3>
              <form onSubmit={handleUpdateTrainer}>
                <div className="form-group">
                  <div>
                    <label className="form-label">Full Name</label>
                    <input
                      name="full_name"
                      placeholder="Enter full name"
                      value={editForm.full_name}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Email</label>
                    <input
                      name="email"
                      type="email"
                      placeholder="Enter email"
                      value={editForm.email}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div>
                    <label className="form-label">Phone</label>
                    <input
                      name="phone"
                      placeholder="Enter phone number"
                      value={editForm.phone}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div>
                    <label className="form-label">Specialization</label>
                    <input
                      name="specialization"
                      placeholder="e.g., Weightlifting"
                      value={editForm.specialization}
                      onChange={handleEditChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div>
                    <label className="form-label">Experience (Years)</label>
                    <input
                      name="experience"
                      type="number"
                      placeholder="Years of experience"
                      value={editForm.experience}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div>
                    <label className="form-label">Joining Date</label>
                    <input
                      type="date"
                      name="joining_date"
                      value={editForm.joining_date}
                      onChange={handleEditChange}
                    />
                  </div>
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
                    ✓ Update Trainer
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
            <h3 className="form-card-title">Add New Trainer</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <div>
                  <label className="form-label">Full Name</label>
                  <input
                    name="full_name"
                    placeholder="Enter full name"
                    value={form.full_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Email</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="Enter email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <div>
                  <label className="form-label">Phone</label>
                  <input
                    name="phone"
                    placeholder="Enter phone number"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="form-label">Specialization</label>
                  <input
                    name="specialization"
                    placeholder="e.g., Weightlifting"
                    value={form.specialization}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <div>
                  <label className="form-label">Experience (Years)</label>
                  <input
                    name="experience"
                    type="number"
                    placeholder="Years of experience"
                    value={form.experience}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="form-label">Joining Date</label>
                  <input
                    type="date"
                    name="joining_date"
                    value={form.joining_date}
                    onChange={handleChange}
                  />
                </div>
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
                  + Add Trainer
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="table-card">
          <div className="table-card-header">
            <h3 className="table-card-title">Trainer Directory</h3>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Specialization</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {trainers.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    <div className="empty-state">
                      <div className="empty-state-icon">👤</div>
                      <p className="empty-state-text">No trainers found. Add your first trainer to get started!</p>
                    </div>
                  </td>
                </tr>
              ) : (
                trainers.map((t) => (
                  <tr key={t.trainer_id}>
                    <td>#{t.trainer_id}</td>
                    <td>{t.full_name}</td>
                    <td>{t.email}</td>
                    <td>{t.phone}</td>
                    <td>{t.specialization}</td>
                    <td>
                      <span className={`status-badge status-${t.status?.toLowerCase() || "inactive"}`}>
                        {t.status || "N/A"}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="button-sm button-sm-primary"
                          onClick={() => handleEdit(t)}
                        >
                          ✎ Edit
                        </button>
                        <button
                          className="button-sm button-sm-danger"
                          onClick={() => handleDeleteTrainer(t.trainer_id)}
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

export default Trainer;