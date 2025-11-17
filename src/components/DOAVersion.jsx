import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import doaService from "../services/doaService";

const formatDateTime = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleString();
};

const resolveDisplayName = (user) => {
  if (!user) return "Unknown";
  return (
    (user.DisplayName ??
      user.name ??
      `${user.FirstName ?? ""} ${user.LastName ?? ""}`.trim()) ||
    "-"
  );
};

const resolveRole = (user) =>
  user?.titleOrRole ?? user?.Title ?? user?.role ?? user?.Role ?? "-";

const getUserIdValue = (user) => {
  if (!user) return null;
  return (
    user.userId ??
    user.UserId ??
    user.id ??
    user.Id ??
    user.UserID ??
    user.User?.userId ??
    user.User?.UserId ??
    user.USR_Users?.UserID ??
    user.USR_Users?.UserId ??
    user.USR_Users?.Id ??
    user.USR_Users?.id ??
    null
  );
};

const getVersionIdentifier = (version) => {
  return (
    version?.versionNumber ??
    version?.version ??
    version?.Version ??
    version?.id ??
    version?.Id ??
    null
  );
};

function DOAVersion() {
  const { id, versionNumber } = useParams();
  const navigate = useNavigate();
  const [studyInfo, setStudyInfo] = useState(null);
  const [versionData, setVersionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingUserId, setRemovingUserId] = useState(null);

  // Add People modal state
  const [showAddPeopleModal, setShowAddPeopleModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [addingPeople, setAddingPeople] = useState(false);

  // Edit User Title modal state
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [savingTitle, setSavingTitle] = useState(false);

  // Add Task modal state
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [standardTasks, setStandardTasks] = useState([]);
  const [loadingStandardTasks, setLoadingStandardTasks] = useState(false);
  const [taskCode, setTaskCode] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [addingTask, setAddingTask] = useState(false);

  useEffect(() => {
    if (id) {
      loadDOAVersion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, versionNumber]);

  const findMatchingVersion = (versions) => {
    if (!Array.isArray(versions)) return null;
    if (versionNumber) {
      const target = versionNumber.toString();
      const match = versions.find(
        (v) => String(getVersionIdentifier(v)) === target
      );
      if (match) {
        return match;
      }
    }
    return versions[0] ?? null;
  };

  const loadDOAVersion = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await doaService.getStudyDoa(id);
      const record = response.data || {};
      setStudyInfo(
        record.studyInfo ??
          record.StudyInfo ??
          record.study ??
          record.Study ??
          null
      );
      const versions =
        record.versions ??
        record.Versions ??
        record.DoaVersions ??
        record.doaVersions ??
        [];
      const selectedVersion = findMatchingVersion(versions);
      setVersionData(selectedVersion);
    } catch (err) {
      console.error("Error loading DOA version:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load DOA version"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(`/doa/${id}`);
  };

  const handleOpenAddPeopleModal = async () => {
    setShowAddPeopleModal(true);
    setLoadingUsers(true);
    try {
      const response = await doaService.listUsers(true);
      const users = response.data || [];

      // Get current users on study
      const snapshot = versionData?.compiledSnapshot ?? versionData ?? null;
      const currentUsers =
        snapshot?.usersOnStudy ??
        snapshot?.UsersOnStudy ??
        snapshot?.delegatedUsers ??
        [];
      const currentUserIds = currentUsers
        .map((u) => getUserIdValue(u))
        .filter((val) => val != null);

      // Filter out users already on the study
      const availableUsers = users.filter((user) => {
        const userId = getUserIdValue(user);
        if (!userId) return false;
        return !currentUserIds.includes(userId);
      });

      setAllUsers(availableUsers);
      setSelectedUsers([]);
    } catch (err) {
      console.error("Error loading users:", err);
      alert(
        "Failed to load users: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleCloseAddPeopleModal = () => {
    setShowAddPeopleModal(false);
    setAllUsers([]);
    setSelectedUsers([]);
  };

  const handleUserCheckboxChange = (userId) => {
    if (!userId) return;
    setSelectedUsers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleAddPeopleToStudy = async () => {
    if (selectedUsers.length === 0) {
      alert("Please select at least one person to add.");
      return;
    }

    setAddingPeople(true);
    try {
      // Call the API individually for each selected user
      const errors = [];
      let successCount = 0;

      for (const userId of selectedUsers) {
        // Find the user object to get their details
        const user = allUsers.find((u) => getUserIdValue(u) === userId);

        if (!user) {
          errors.push(`User ${userId} not found`);
          continue;
        }

        const displayName = resolveDisplayName(user);
        const title = resolveRole(user);

        try {
          await doaService.addUserToDoa({
            studyId: id,
            userId: userId,
            title: title !== "-" ? title : "",
            displayName: displayName,
          });
          successCount++;
        } catch (err) {
          console.error(`Error adding user ${userId}:`, err);
          errors.push(
            `${displayName}: ${err.response?.data?.message || err.message}`
          );
        }
      }

      // Show results
      if (successCount > 0 && errors.length === 0) {
        alert(`Successfully added ${successCount} person(s) to the study.`);
        handleCloseAddPeopleModal();
        await loadDOAVersion();
      } else if (successCount > 0 && errors.length > 0) {
        alert(
          `Partially successful:\n` +
            `- Added ${successCount} person(s)\n` +
            `- Failed ${errors.length} person(s):\n` +
            errors.join("\n")
        );
        handleCloseAddPeopleModal();
        await loadDOAVersion();
      } else {
        alert(`Failed to add users:\n${errors.join("\n")}`);
      }
    } catch (err) {
      console.error("Error adding people to study:", err);
      alert(
        "Failed to add people: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setAddingPeople(false);
    }
  };

  const handleOpenEditUserModal = (user) => {
    setEditingUser(user);
    setEditedTitle(resolveRole(user));
    setShowEditUserModal(true);
  };

  const handleCloseEditUserModal = () => {
    setShowEditUserModal(false);
    setEditingUser(null);
    setEditedTitle("");
  };

  const handleSaveUserTitle = async () => {
    if (!editingUser) return;

    const userId = getUserIdValue(editingUser);
    if (!userId) {
      alert("Unable to determine the user's ID for updating the title.");
      return;
    }

    setSavingTitle(true);
    try {
      await doaService.updateUserTitle({
        studyId: id,
        userId,
        title: editedTitle,
      });

      console.log("Updating user title:", {
        studyId: id,
        userId,
        title: editedTitle,
      });

      handleCloseEditUserModal();
      await loadDOAVersion();
    } catch (err) {
      console.error("Error updating user title:", err);
      alert(
        "Failed to update title: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setSavingTitle(false);
    }
  };

  const handleRemoveUserFromStudy = async (user) => {
    const userId = getUserIdValue(user);
    if (!userId) {
      alert("Unable to determine the user's ID for removal.");
      return;
    }

    const displayName = resolveDisplayName(user);
    const confirmMessage = `Remove ${displayName} from study ${
      studyInfo?.studyName ?? id
    }?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setRemovingUserId(userId);
    try {
      await doaService.removeUserFromDoa({
        studyId: id,
        userId,
      });
      await loadDOAVersion();
    } catch (err) {
      console.error("Error removing user from study:", err);
      alert(
        `Failed to remove ${displayName}: ${
          err.response?.data?.message || err.message
        }`
      );
    } finally {
      setRemovingUserId(null);
    }
  };

  const handleOpenAddTaskModal = async () => {
    setShowAddTaskModal(true);
    setTaskCode("");
    setTaskTitle("");
    setTaskDescription("");

    // Load standard tasks
    setLoadingStandardTasks(true);
    try {
      const response = await doaService.getStandardTasks();
      setStandardTasks(response.data || []);
    } catch (err) {
      console.error("Error loading standard tasks:", err);
      alert(
        "Failed to load standard tasks: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setLoadingStandardTasks(false);
    }
  };

  const handleCloseAddTaskModal = () => {
    setShowAddTaskModal(false);
    setTaskCode("");
    setTaskTitle("");
    setTaskDescription("");
    setStandardTasks([]);
  };

  const handleStandardTaskSelect = (e) => {
    const selectedTaskId = e.target.value;
    if (!selectedTaskId) {
      setTaskCode("");
      setTaskTitle("");
      setTaskDescription("");
      return;
    }

    const task = standardTasks.find(
      (t) => (t.id ?? t.Id ?? t.code ?? t.Code) === selectedTaskId
    );

    if (task) {
      setTaskCode(task.code ?? task.Code ?? "");
      setTaskTitle(task.title ?? task.Title ?? task.name ?? task.Name ?? "");
      setTaskDescription(task.description ?? task.Description ?? "");
    }
  };

  const handleTaskCodeChange = (e) => {
    const value = e.target.value.slice(0, 5); // Limit to 5 characters
    setTaskCode(value);
  };

  const handleAddTask = async () => {
    if (!taskCode.trim() || !taskTitle.trim()) {
      alert("Please enter both a task code and title.");
      return;
    }

    setAddingTask(true);
    try {
      await doaService.addTaskToDoa({
        studyId: id,
        code: taskCode.trim(),
        title: taskTitle.trim(),
        description: taskDescription.trim(),
      });

      alert("Task added successfully!");
      handleCloseAddTaskModal();
      await loadDOAVersion();
    } catch (err) {
      console.error("Error adding task:", err);
      alert(
        "Failed to add task: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setAddingTask(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading DOA version...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error Loading DOA Version</h4>
          <p>{error}</p>
          <hr />
          <button className="btn btn-danger" onClick={loadDOAVersion}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const versionLabel =
    getVersionIdentifier(versionData) ??
    versionNumber ??
    studyInfo?.currentVersion ??
    "Unknown";
  const snapshot = versionData?.compiledSnapshot ?? versionData ?? null;
  const users = studyInfo?.doaUsers ?? [];
  const tasks =
    snapshot?.taskCodes ?? snapshot?.TaskCodes ?? snapshot?.tasks ?? [];
  const entries =
    snapshot?.entries ?? snapshot?.Entries ?? snapshot?.userTasks ?? [];

  return (
    <div className="container mt-4">
      <div className="row mb-3">
        <div className="col">
          <button className="btn btn-secondary mb-3" onClick={handleBack}>
            🡠 Back to DOA Versions
          </button>
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h2>
                {studyInfo?.sponsorName} |{" "}
                {studyInfo?.studyName ?? "Unknown Study"} |{" "}
                {studyInfo?.protocolNameOfficial ?? "Unknown Protocol"}
              </h2>
              <p className="text-muted">
                Version {versionLabel} |
                <span className="badge bg-info text-dark ms-2">
                  {versionData?.isFinalized || versionData?.IsFinalized
                    ? "Finalized"
                    : "Draft"}
                </span>{" "}
                | Study ID: <code>{id}</code>{" "}
              </p>
            </div>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleOpenAddPeopleModal}>
                <i className="bi bi-person-plus"></i> Add People
              </button>
              <button type="button" className="btn btn-primary">
                <i className="bi bi-person-badge"></i> Add Delegate
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleOpenAddTaskModal}>
                <i className="bi bi-list-task"></i> Add Task
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Version Metadata</h5>
            </div>
            <div className="card-body">
              <dl className="row mb-0">
                <dt className="col-4">Created</dt>
                <dd className="col-8">
                  {formatDateTime(versionData?.created ?? versionData?.Created)}
                </dd>
                <dt className="col-4">Finalized</dt>
                <dd className="col-8">
                  {formatDateTime(
                    versionData?.finalizedDate ?? versionData?.FinalizedDate
                  )}
                </dd>
                <dt className="col-4">External Notes</dt>
                <dd className="col-8">
                  {versionData?.externalNotes ??
                    versionData?.ExternalNotes ??
                    "-"}
                </dd>
                <dt className="col-4">Internal Notes</dt>
                <dd className="col-8">
                  {versionData?.internalNotes ??
                    versionData?.InternalNotes ??
                    "-"}
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-secondary text-white">
              <h5 className="mb-0">Snapshot Totals</h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <p className="mb-1 small text-muted">Users</p>
                  <strong>{users.length}</strong>
                </div>
                <div>
                  <p className="mb-1 small text-muted">Tasks</p>
                  <strong>{tasks.length}</strong>
                </div>
                <div>
                  <p className="mb-1 small text-muted">Entries</p>
                  <strong>{entries.length}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row gy-3">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Users on Study</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-sm mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Name</th>
                      <th>Title</th> <th>Email</th>
                      <th className="text-center" style={{ width: "100px" }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center text-muted">
                          No users in snapshot
                        </td>
                      </tr>
                    ) : (
                      users.map((user, index) => {
                        const resolvedUserId = getUserIdValue(user);
                        const rowKey = resolvedUserId ?? `snapshot-user-${index}`;
                        const isRemoving =
                          resolvedUserId != null &&
                          removingUserId === resolvedUserId;

                        return (
                          <tr key={rowKey}>
                            <td>
                              <strong>{resolveDisplayName(user)}</strong>
                            </td>
                            <td>{resolveRole(user)}</td>
                            <td>{user.USR_Users.EmailAddress ?? "-"}</td>
                            <td className="text-center">
                              <button
                                className="btn btn-sm btn-link text-primary p-0 me-2"
                                onClick={() => handleOpenEditUserModal(user)}
                                title="Edit Title">
                                <i className="bi bi-pencil-square"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-link text-danger p-0"
                                title="Delete User"
                                onClick={() => handleRemoveUserFromStudy(user)}
                                disabled={!resolvedUserId || isRemoving}>
                                {isRemoving ? (
                                  <span
                                    className="spinner-border spinner-border-sm text-danger"
                                    role="status"
                                    aria-hidden="true"></span>
                                ) : (
                                  <i className="bi bi-trash"></i>
                                )}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-secondary text-white">
              <h5 className="mb-0">Task Codes</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-sm mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Code</th>
                      <th>Title</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="text-center text-muted">
                          No task codes defined
                        </td>
                      </tr>
                    ) : (
                      tasks.map((task, index) => (
                        <tr
                          key={
                            task?.taskId ?? task?.TaskId ?? task?.code ?? index
                          }>
                          <td>{task?.code ?? task?.Code ?? "-"}</td>
                          <td>{task?.title ?? task?.Title ?? "-"}</td>
                          <td>
                            {task?.isRemoved || task?.IsRemoved ? (
                              <span className="badge bg-danger text-dark">
                                Removed
                              </span>
                            ) : (
                              <span className="badge bg-success">Active</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row gy-3 mt-3">
        <div className="col">
          <div className="card">
            <div className="card-header bg-dark text-white">
              <h5 className="mb-0">Entries / Assignments</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-sm mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>User</th>
                      <th>Task</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="text-center text-muted">
                          No entries captured for this version
                        </td>
                      </tr>
                    ) : (
                      entries.map((entry, index) => {
                        const user = entry?.user;
                        const task = entry?.task;
                        const entryAction =
                          entry?.isRemoval || entry?.IsRemoval
                            ? "Removed"
                            : "Assigned";
                        return (
                          <tr key={entry?.entryId ?? entry?.EntryId ?? index}>
                            <td>{resolveDisplayName(user)}</td>
                            <td>
                              <strong>{task?.code ?? task?.Code ?? "-"}</strong>
                            </td>
                            <td>{entryAction}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add People Modal */}
      {showAddPeopleModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add People to Study</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseAddPeopleModal}></button>
              </div>
              <div className="modal-body">
                {loadingUsers ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading users...</span>
                    </div>
                    <p className="mt-2">Loading available users...</p>
                  </div>
                ) : allUsers.length === 0 ? (
                  <div className="alert alert-info">
                    No additional users available to add to this study.
                  </div>
                ) : (
                  <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                    {/* Active Users Section */}
                    {(() => {
                      const activeUsers = allUsers
                        .filter(
                          (user) => user.isActive ?? user.IsActive ?? true
                        )
                        .sort((a, b) => {
                          const nameA = resolveDisplayName(a).toLowerCase();
                          const nameB = resolveDisplayName(b).toLowerCase();
                          return nameA.localeCompare(nameB);
                        });

                      const inactiveUsers = allUsers
                        .filter(
                          (user) => !(user.isActive ?? user.IsActive ?? true)
                        )
                        .sort((a, b) => {
                          const nameA = resolveDisplayName(a).toLowerCase();
                          const nameB = resolveDisplayName(b).toLowerCase();
                          return nameA.localeCompare(nameB);
                        });

                      return (
                        <>
                          {/* Active Users */}
                          {activeUsers.length > 0 && (
                            <div className="mb-4">
                              <h6 className="fw-bold text-success mb-3">
                                <i className="bi bi-check-circle-fill me-2"></i>
                                Active Users ({activeUsers.length})
                              </h6>
                              {activeUsers.map((user) => {
                                const userId = getUserIdValue(user);
                                if (!userId) {
                                  return null;
                                }
                                const displayName = resolveDisplayName(user);
                                const email = user.email ?? user.Email ?? "";
                                const role = resolveRole(user);

                                return (
                                  <div
                                    key={userId}
                                    className="form-check mb-2 ms-3">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      id={`user-${userId}`}
                                      checked={selectedUsers.includes(userId)}
                                      onChange={() =>
                                        handleUserCheckboxChange(userId)
                                      }
                                    />
                                    <label
                                      className="form-check-label"
                                      htmlFor={`user-${userId}`}>
                                      <strong>{displayName}</strong>
                                      {email && (
                                        <span className="text-muted ms-2">
                                          ({email})
                                        </span>
                                      )}
                                      {role !== "-" && (
                                        <span className="badge bg-secondary ms-2">
                                          {role}
                                        </span>
                                      )}
                                    </label>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Non-Active Users */}
                          {inactiveUsers.length > 0 && (
                            <div className="mb-3">
                              <h6 className="fw-bold text-muted mb-3">
                                <i className="bi bi-x-circle-fill me-2"></i>
                                Non-Active Users ({inactiveUsers.length})
                              </h6>
                              {inactiveUsers.map((user) => {
                                const userId = getUserIdValue(user);
                                if (!userId) {
                                  return null;
                                }
                                const displayName = resolveDisplayName(user);
                                const email = user.email ?? user.Email ?? "";
                                const role = resolveRole(user);

                                return (
                                  <div
                                    key={userId}
                                    className="form-check mb-2 ms-3">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      id={`user-${userId}`}
                                      checked={selectedUsers.includes(userId)}
                                      onChange={() =>
                                        handleUserCheckboxChange(userId)
                                      }
                                    />
                                    <label
                                      className="form-check-label text-muted"
                                      htmlFor={`user-${userId}`}>
                                      <strong>{displayName}</strong>
                                      {email && (
                                        <span className="ms-2">({email})</span>
                                      )}
                                      {role !== "-" && (
                                        <span className="badge bg-secondary ms-2">
                                          {role}
                                        </span>
                                      )}
                                    </label>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
                <div className="mt-3">
                  <small className="text-muted">
                    {selectedUsers.length} person(s) selected
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseAddPeopleModal}
                  disabled={addingPeople}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddPeopleToStudy}
                  disabled={addingPeople || selectedUsers.length === 0}>
                  {addingPeople ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"></span>
                      Adding...
                    </>
                  ) : (
                    "Add People To Study"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Title Modal */}
      {showEditUserModal && editingUser && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit User Title</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseEditUserModal}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">
                    <strong>User:</strong>
                  </label>
                  <p className="mb-1">{resolveDisplayName(editingUser)}</p>
                  <p className="text-muted small">
                    {editingUser.USR_Users?.email ?? "-"}
                  </p>
                </div>
                <div className="mb-3">
                  <label htmlFor="userTitle" className="form-label">
                    Title/Role
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="userTitle"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    placeholder="Enter user title or role"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseEditUserModal}
                  disabled={savingTitle}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveUserTitle}
                  disabled={savingTitle}>
                  {savingTitle ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"></span>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Task to Study</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseAddTaskModal}></button>
              </div>
              <div className="modal-body">
                {/* Standard Tasks Dropdown */}
                <div className="mb-3">
                  <label htmlFor="standardTasks" className="form-label">
                    Standard Tasks
                  </label>
                  {loadingStandardTasks ? (
                    <div className="text-center py-2">
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"></span>
                      Loading standard tasks...
                    </div>
                  ) : (
                    <select
                      className="form-select"
                      id="standardTasks"
                      onChange={handleStandardTaskSelect}
                      defaultValue="">
                      <option value="">-- Select a standard task --</option>
                      {standardTasks.map((task) => {
                        const taskId =
                          task.id ?? task.Id ?? task.code ?? task.Code;
                        const taskLabel = `${task.code ?? task.Code ?? ""} - ${
                          task.title ??
                          task.Title ??
                          task.name ??
                          task.Name ??
                          ""
                        }`;
                        return (
                          <option key={taskId} value={taskId}>
                            {taskLabel}
                          </option>
                        );
                      })}
                    </select>
                  )}
                  <small className="text-muted">
                    Select a standard task to auto-fill the fields below
                  </small>
                </div>

                <hr />

                {/* Task Code */}
                <div className="mb-3">
                  <label htmlFor="taskCode" className="form-label">
                    Code <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="taskCode"
                    value={taskCode}
                    onChange={handleTaskCodeChange}
                    placeholder="Enter task code (max 5 chars)"
                    maxLength={5}
                  />
                  <small className="text-muted">
                    {taskCode.length}/5 characters
                  </small>
                </div>

                {/* Task Title */}
                <div className="mb-3">
                  <label htmlFor="taskTitle" className="form-label">
                    Title <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="taskTitle"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="Enter task title"
                  />
                </div>

                {/* Task Description */}
                <div className="mb-3">
                  <label htmlFor="taskDescription" className="form-label">
                    Description
                  </label>
                  <textarea
                    className="form-control"
                    id="taskDescription"
                    rows="4"
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    placeholder="Enter task description (optional)"></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseAddTaskModal}
                  disabled={addingTask}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddTask}
                  disabled={
                    addingTask || !taskCode.trim() || !taskTitle.trim()
                  }>
                  {addingTask ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"></span>
                      Adding...
                    </>
                  ) : (
                    "Add Task"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DOAVersion;
