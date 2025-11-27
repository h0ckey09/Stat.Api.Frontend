import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import doaService from "../services/doaService";

/**
 * ManageStandardTasks Component
 * Manages standard tasks for DOA with ability to add, update, and archive
 */
function ManageStandardTasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    title: "",
    description: "",
  });

  useEffect(() => {
    loadStandardTasks();
  }, []);

  const loadStandardTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await doaService.getStandardTasks();
      setTasks(response.data.tasks || []);
    } catch (err) {
      console.error("Error loading standard tasks:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load standard tasks"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setFormData({ code: "", title: "", description: "" });
    setShowAddModal(true);
  };

  const handleUpdate = (task) => {
    setSelectedTask(task);
    setFormData({
      code: task.code || "",
      title: task.title || "",
      description: task.description || "",
    });
    setShowUpdateModal(true);
  };

  const handleArchive = async (taskId) => {
    if (!window.confirm("Are you sure you want to archive this task?")) {
      return;
    }

    try {
      await doaService.archiveStandardTask(taskId);
      await loadStandardTasks();
    } catch (err) {
      console.error("Error archiving task:", err);
      alert(
        err.response?.data?.message || err.message || "Failed to archive task"
      );
    }
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    try {
      await doaService.newStandardTask(formData);
      setShowAddModal(false);
      await loadStandardTasks();
    } catch (err) {
      console.error("Error creating task:", err);
      alert(
        err.response?.data?.message || err.message || "Failed to create task"
      );
    }
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    try {
      await doaService.updateStandardTask(selectedTask.standardId, formData);
      setShowUpdateModal(false);
      await loadStandardTasks();
    } catch (err) {
      console.error("Error updating task:", err);
      alert(
        err.response?.data?.message || err.message || "Failed to update task"
      );
    }
  };

  const handleBack = () => {
    navigate("/doa");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading standard tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error Loading Standard Tasks</h4>
          <p>{error}</p>
          <hr />
          <button className="btn btn-danger" onClick={loadStandardTasks}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row mb-3">
        <div className="col">
          <button className="btn btn-secondary mb-3" onClick={handleBack}>
            ← Back to DOA
          </button>
          <h2>Manage Standard Tasks</h2>
          <p className="text-muted">
            Manage standard tasks that can be used across DOA versions
          </p>
        </div>
        <div className="col-auto d-flex align-items-start">
          <button className="btn btn-primary mt-3" onClick={handleAddNew}>
            Add New
          </button>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="alert alert-info" role="alert">
          <h4 className="alert-heading">No Standard Tasks</h4>
          <p>There are currently no standard tasks defined.</p>
        </div>
      ) : (
        <div className="row">
          <div className="col">
            <div className="card">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Standard Tasks ({tasks.length})</h5>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                                           <th>Code</th>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map((task) => (
                        <tr key={task.standardId} className={`taskcode_${task.code.replace(/[^A-Za-z]/g, "").toUpperCase()}`}>
                          <td>{task.code}</td>
                          <td>
                            <strong>{task.title}</strong>
                          </td>
                          <td>{task.description}</td>
                          <td>
                            <div className="btn-group" role="group">
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => handleUpdate(task)}>
                                Update
                              </button>
                              <button
                                className="btn btn-sm btn-warning"
                                onClick={() => handleArchive(task.standardId)}>
                                Archive
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Task Modal */}
      {showAddModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Standard Task</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddModal(false)}></button>
              </div>
              <form onSubmit={handleSubmitAdd}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="code" className="form-label">
                      Code
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="code"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="title" className="form-label">
                      Title
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">
                      Description
                    </label>
                    <textarea
                      className="form-control"
                      id="description"
                      name="description"
                      rows="3"
                      value={formData.description}
                      onChange={handleInputChange}
                      required></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Add Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Update Task Modal */}
      {showUpdateModal && selectedTask && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Update Standard Task</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowUpdateModal(false)}></button>
              </div>
              <form onSubmit={handleSubmitUpdate}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="update-code" className="form-label">
                      Code
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="update-code"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="update-title" className="form-label">
                      Title
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="update-title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="update-description" className="form-label">
                      Description
                    </label>
                    <textarea
                      className="form-control"
                      id="update-description"
                      name="description"
                      rows="3"
                      value={formData.description}
                      onChange={handleInputChange}
                      required></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowUpdateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Update Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageStandardTasks;
