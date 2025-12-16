import React, { useState, useEffect } from "react";
import useToast from "../hooks/useToast";
import { useParams, useNavigate } from "react-router-dom";
import doaService from "../services/doaService";
import {
  formatDateTime,
  resolveDisplayName,
  resolveRole,
  getDoaUserIdValue,
  getVersionIdentifier,
  getCodeLetters,
} from "../utils/doaUtils";

/**
 * DOAVersion Component
 * 
 * Displays and manages a specific version of a DOA (Delegation of Authority) for a study.
 * Allows users to:
 * - View version details and metadata
 * - Add/remove people from the study
 * - Edit user titles and roles
 * - Add tasks to the DOA
 * - Create delegations (assign tasks to users)
 * - Finalize the DOA version
 * - View changes made in this version
 * - View assignments organized by task groups
 * 
 * @component
 */
function DOAVersion() {
  const toast = useToast();
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
  const [editedDisplayName, setEditedDisplayName] = useState("");
  const [savingTitle, setSavingTitle] = useState(false);

  // Add Task modal state
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [standardTasks, setStandardTasks] = useState([]);
  const [loadingStandardTasks, setLoadingStandardTasks] = useState(false);
  const [taskCode, setTaskCode] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [standardTaskId, setStandardTaskId] = useState(null);
  const [addingTask, setAddingTask] = useState(false);

  // Add Delegation modal state
  const [showAddDelegationModal, setShowAddDelegationModal] = useState(false);
  const [selectedDelegationUsers, setSelectedDelegationUsers] = useState([]);
  const [selectedDelegationTasks, setSelectedDelegationTasks] = useState([]);
  const [addingDelegations, setAddingDelegations] = useState(false);

  // Finalize DOA state
  const [finalizingDoa, setFinalizingDoa] = useState(false);

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
      setStudyInfo(record.studyInfo ?? null);
      const versions = record.versions ?? [];
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
      const currentUsers = snapshot?.usersOnStudy || [];
      const currentUserIds = currentUsers
        .map((u) => u.userId)
        .filter((val) => val != null);

      // Filter out users already on the study
      const availableUsers = users.filter((user) => {
        const userId = user.id || user.userId || null;
        if (!userId) return false;
        return !currentUserIds.includes(userId);
      });

      setAllUsers(availableUsers);
      setSelectedUsers([]);
    } catch (err) {
      console.error("Error loading users:", err);
      toast.error(
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
      toast.info("Please select at least one person to add.");
      return;
    }

    setAddingPeople(true);
    try {
      // Call the API individually for each selected user
      const errors = [];
      let successCount = 0;

      for (const userId of selectedUsers) {
        // Find the user object to get their details
        const user = allUsers.find((u) => u.id== userId);

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
        toast.success(
          `Successfully added ${successCount} person(s) to the study.`
        );
        handleCloseAddPeopleModal();
        await loadDOAVersion();
      } else if (successCount > 0 && errors.length > 0) {
        toast.warning(
          `Partially successful: Added ${successCount}, Failed ${
            errors.length
          }: ${errors.join(", ")}`
        );
        handleCloseAddPeopleModal();
        await loadDOAVersion();
      } else {
        toast.error(`Failed to add users: ${errors.join(", ")}`);
      }
    } catch (err) {
      console.error("Error adding people to study:", err);
      toast.error(
        "Failed to add people: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setAddingPeople(false);
    }
  };

  const handleOpenEditUserModal = (user) => {
    setEditingUser(user);
    setEditedTitle(resolveRole(user));
    setEditedDisplayName(resolveDisplayName(user));
    setShowEditUserModal(true);
  };

  const handleCloseEditUserModal = () => {
    setShowEditUserModal(false);
    setEditingUser(null);
    setEditedTitle("");
    setEditedDisplayName("");
  };

  const handleSaveUserTitle = async () => {
    if (!editingUser) return;

    const userId = getDoaUserIdValue(editingUser);
    if (!userId) {
      toast.error("Unable to determine the user's ID for updating the title.");
      return;
    }

    setSavingTitle(true);
    try {
      await doaService.updateUserInfo({
        studyId: id,
        userId,
        title: editedTitle,
        displayName: editedDisplayName,
      });

      toast.success("User information updated successfully!");
      handleCloseEditUserModal();
      await loadDOAVersion();
    } catch (err) {
      console.error("Error updating user title:", err);
      toast.error(
        "Failed to update title: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setSavingTitle(false);
    }
  };

  const handleRemoveUserFromStudy = async (user) => {
    const userId = getDoaUserIdValue(user);
    if (!userId) {
      toast.error("Unable to determine the user's ID for removal.");
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
      toast.success(`Successfully removed ${displayName} from the study.`);
      await loadDOAVersion();
    } catch (err) {
      console.error("Error removing user from study:", err);
      toast.error(
        `Failed to remove ${displayName}: ${
          err.response?.data?.message || err.message
        }`
      );
    } finally {
      setRemovingUserId(null);
    }
  };

  const handleOpenAddTaskModal = async () => {
    // Reset form fields
    setTaskCode("");
    setTaskTitle("");
    setTaskDescription("");

    // Load standard tasks first
    setLoadingStandardTasks(true);
    try {
      const response = await doaService.getStandardTasks();
      setStandardTasks(response.data.tasks || []);
      // Only show modal if loading was successful
      setShowAddTaskModal(true);
    } catch (err) {
      console.error("Error loading standard tasks:", err);
      toast.error(
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
      setStandardTaskId(null);
      return;
    }

    const task = standardTasks.find(
      (t) =>
        (t.standardId ?? t.Id ?? t.code ?? t.Code).toString() ===
        selectedTaskId.toString()
    );

    if (task) {
      setTaskCode(task.code ?? task.Code ?? "");
      setTaskTitle(task.title ?? task.Title ?? task.name ?? task.Name ?? "");
      setTaskDescription(task.description ?? task.Description ?? "");
      setStandardTaskId(
        task.standardId ?? task.Id ?? task.code ?? task.Code ?? -1
      );
    }
  };

  const handleTaskCodeChange = (e) => {
    const value = e.target.value.slice(0, 5); // Limit to 5 characters
    setTaskCode(value);
  };

  const handleAddTask = async () => {
    if (!taskCode.trim() || !taskTitle.trim()) {
      toast.info("Please enter both a task code and title.");
      return;
    }

    setAddingTask(true);
    try {
      await doaService.addTaskToDoa({
        studyId: id,
        code: taskCode.trim(),
        title: taskTitle.trim(),
        description: taskDescription.trim(),
        standardTaskId: standardTaskId || null,
      });

      toast.success(`Task "${taskCode}" added successfully!`);
      handleCloseAddTaskModal();
      await loadDOAVersion();
    } catch (err) {
      console.error("Error adding task:", err);
      toast.error(
        "Failed to add task: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setAddingTask(false);
    }
  };

  const handleFinalizeDoa = async () => {
    const confirmMessage =
      "Are you sure you want to finalize this DOA version?\n\n" +
      "Once finalized, this version cannot be modified.";

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setFinalizingDoa(true);
    try {
      await doaService.finalizeDoa({
        studyId: id,
        versionNumber: versionNumber || getVersionIdentifier(versionData),
      });

      toast.success("DOA version finalized successfully!");
      await loadDOAVersion();
    } catch (err) {
      console.error("Error finalizing DOA:", err);
      toast.error(
        "Failed to finalize DOA: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setFinalizingDoa(false);
    }
  };

  const handleOpenAddDelegationModal = () => {
    setShowAddDelegationModal(true);
    setSelectedDelegationUsers([]);
    setSelectedDelegationTasks([]);
  };

  const handleCloseAddDelegationModal = () => {
    setShowAddDelegationModal(false);
    setSelectedDelegationUsers([]);
    setSelectedDelegationTasks([]);
  };

  const handleDelegationUserToggle = (userId) => {
    setSelectedDelegationUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleDelegationTaskToggle = (taskCode) => {
    setSelectedDelegationTasks((prev) =>
      prev.includes(taskCode)
        ? prev.filter((code) => code !== taskCode)
        : [...prev, taskCode]
    );
  };

  const handleAddDelegations = async () => {
    if (
      selectedDelegationUsers.length === 0 ||
      selectedDelegationTasks.length === 0
    ) {
      toast.info("Please select at least one user and one task.");
      return;
    }

    setAddingDelegations(true);
    try {
      // Build batch delegations payload as cartesian product
      const delegations = [];
      for (const userId of selectedDelegationUsers) {
        for (const taskCode of selectedDelegationTasks) {
          delegations.push({ doaUserId: userId, taskCode });
        }
      }

      await doaService.addDelegations(id, delegations);

      toast.success(`Successfully added ${delegations.length} delegation(s).`);
      handleCloseAddDelegationModal();
      await loadDOAVersion();
    } catch (err) {
      console.error("Error adding delegations:", err);
      toast.error(
        "Failed to add delegations: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setAddingDelegations(false);
    }
  };

  // versionChanges will be computed after snapshot/version are defined later

  const handleDeleteChange = async (recordId, change) => {
    if (!recordId) {
      toast.info("Delete API pending; missing record id.");
      return;
    }
    const confirmMsg = `Are you sure you want to delete change #${recordId}?`;
    if (!window.confirm(confirmMsg)) return;
    // Placeholder: wire API endpoint when available
    console.log("Delete change record", { recordId, change });
    toast.info("Delete endpoint not yet available; will wire later.");
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
  const users = snapshot?.usersOnStudy ?? [];
  const tasks = snapshot?.taskCodes ?? [];
  const entries = snapshot?.entries ?? [];

  // Build dynamic task-group columns from tasks (letters-only portion of code)
  const taskGroups = Array.from(
    new Set(
      tasks
        .map((t) => getCodeLetters(t.task.code ?? ""))
        .filter((g) => g && g.length > 0)
    )
  ).sort((a, b) => a.localeCompare(b));

  // Metrics for version change summary table
  const currentVersion = snapshot?.version ?? snapshot?.Version ?? versionLabel;
  let changeUserIds = new Set();
  let changeTaskCodes = new Set();
  let changeDelegationCount = 0;

  entries.forEach((entry) => {
    const user = entry?.user;
    const userId = getDoaUserIdValue(user);
    const entryTasks = entry?.tasks ?? [];
    entryTasks.forEach((t) => {
      const code = t?.task?.code ?? t?.code ?? t?.Code ?? "";
      const addedVersion = t?.addedVersion ?? t?.AddedVersion;
      const removedVersion = t?.removedVersion ?? t?.RemovedVersion;
      const isRemoved = t?.isRemoved ?? t?.IsRemoved ?? false;
      const isChange =
        (addedVersion != null &&
          String(addedVersion) === String(currentVersion) &&
          !isRemoved) ||
        (isRemoved &&
          removedVersion != null &&
          String(removedVersion) === String(currentVersion));
      if (isChange) {
        if (userId) changeUserIds.add(userId);
        if (code) changeTaskCodes.add(code);
        changeDelegationCount++;
      }
    });
  });

  const combinedDelegationCount = entries.reduce(
    (sum, entry) => sum + (entry?.tasks?.length || 0),
    0
  );

  // Aggregate entries by user so each user renders on a single row
  const aggregatedUserEntries = (() => {
    const map = new Map();
    entries.forEach((entry) => {
      const user = entry?.user;
      const userId = getDoaUserIdValue(user) ?? `anon-${Math.random()}`;
      const existing = map.get(userId);
      const entryTasks = Array.isArray(entry?.tasks) ? entry.tasks : [];
      if (!existing) {
        // Deduplicate tasks by code inside this entry
        const taskMap = new Map();
        entryTasks.forEach((t) => {
          const codeKey = t?.task?.code ?? t?.code ?? t?.Code;
          if (!codeKey) return;
          taskMap.set(codeKey, t);
        });
        map.set(userId, {
          user,
          userId,
          tasks: Array.from(taskMap.values()),
        });
      } else {
        // Merge tasks, overwriting by code so last occurrence wins
        const taskMap = new Map();
        existing.tasks.forEach((t) => {
          const codeKey = t?.task?.code ?? t?.code ?? t?.Code;
          if (!codeKey) return;
          taskMap.set(codeKey, t);
        });
        entryTasks.forEach((t) => {
          const codeKey = t?.task?.code ?? t?.code ?? t?.Code;
          if (!codeKey) return;
          taskMap.set(codeKey, t);
        });
        existing.tasks = Array.from(taskMap.values());
      }
    });
    return Array.from(map.values()).sort((a, b) => {
      const nameA = (resolveDisplayName(a.user) || "").toLowerCase();
      const nameB = (resolveDisplayName(b.user) || "").toLowerCase();
      return nameA.localeCompare(nameB);
    });
  })();

  // Build flat list of changes in this version for the Changes table using snapshot.changes
  const changeLog = snapshot?.changes ?? [];

  return (
    <div className="container mt-4" style={{ marginBottom: "30px" }}>
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
                <span
                  className={`badge ms-2 ${
                    versionData?.isFinalized || versionData?.IsFinalized
                      ? "bg-success"
                      : "bg-info text-dark"
                  }`}>
                  {versionData?.isFinalized || versionData?.IsFinalized
                    ? "Finalized"
                    : "Draft"}
                </span>{" "}
                | Study ID: <code>{id}</code>{" "}
              </p>
            </div>
            {!(versionData?.isFinalized || versionData?.IsFinalized) && (
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleOpenAddPeopleModal}>
                  <i className="bi bi-person-plus"></i> Add People
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleOpenAddTaskModal}>
                  <i className="bi bi-list-task"></i> Add Task
                </button>
                <button
                  type="button"
                  className="btn"
                  style={{ backgroundColor: "#6f42c1", color: "white" }}
                  onClick={handleOpenAddDelegationModal}>
                  <i className="bi bi-person-badge"></i> Add Delegate
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleFinalizeDoa}
                  disabled={finalizingDoa}>
                  {finalizingDoa ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"></span>
                      Finalizing...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-lock-fill"></i> Finalize DOA
                    </>
                  )}
                </button>
              </div>
            )}
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
              <div className="table-responsive">
                <table className="table table-sm mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: "220px" }}>Version</th>
                      <th className="text-center" style={{ width: "110px" }}>
                        User Total
                      </th>
                      <th className="text-center" style={{ width: "110px" }}>
                        Task Total
                      </th>
                      <th className="text-center" style={{ width: "140px" }}>
                        Delegation Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <strong>This Version's Changes</strong>
                      </td>
                      <td className="text-center">{changeUserIds.size}</td>
                      <td className="text-center">{changeTaskCodes.size}</td>
                      <td className="text-center">{changeDelegationCount}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Combined Totals</strong>
                      </td>
                      <td className="text-center">{users.length}</td>
                      <td className="text-center">{tasks.length}</td>
                      <td className="text-center">{combinedDelegationCount}</td>
                    </tr>
                  </tbody>
                </table>
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
                      <th>Title</th>
                      <th className="text-center" style={{ width: "100px" }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="text-center text-muted">
                          No users in snapshot
                        </td>
                      </tr>
                    ) : (
                      users.map((user, index) => {
                        const resolvedUserId = getDoaUserIdValue(user);
                        const rowKey =
                          resolvedUserId ?? `snapshot-user-${index}`;
                        const isRemoving =
                          resolvedUserId != null &&
                          removingUserId === resolvedUserId;

                        return (
                          <tr key={rowKey}>
                            <td>
                              <strong>{resolveDisplayName(user)}</strong>
                            </td>
                            <td>{resolveRole(user)}</td>
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
                      <th style={{ width: "80px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center text-muted">
                          No task codes defined
                        </td>
                      </tr>
                    ) : (
                      tasks.map((task, index) => {
                        const taskCode = task.task.code;
                        const codeLetters = taskCode
                          .replace(/[^A-Za-z]/g, "")
                          .toUpperCase();
                        const rowClass = codeLetters
                          ? `taskcode_${codeLetters}`
                          : "";
                        return (
                          <tr
                            key={
                              task?.taskId ??
                              task?.TaskId ??
                              task?.code ??
                              index
                            }
                            className={rowClass}>
                            <td>{task.task.code ?? "-"}</td>
                            <td>{task.task.title ?? "-"}</td>
                            <td>
                              {(() => {
                                const isRemoved =
                                  task?.task?.isRemoved ??
                                  task?.IsRemoved ??
                                  false;
                                const addedV =
                                  task?.addedVersion ??
                                  task?.AddedVersion ??
                                  task?.task?.addedVersion ??
                                  task?.task?.AddedVersion;
                                const removedV =
                                  task?.removedVersion ??
                                  task?.RemovedVersion ??
                                  task?.task?.removedVersion ??
                                  task?.task?.RemovedVersion;

                                const isAddedThisVersion =
                                  addedV != null &&
                                  String(addedV) === String(currentVersion) &&
                                  !isRemoved;
                                const isRemovedThisVersion =
                                  isRemoved &&
                                  removedV != null &&
                                  String(removedV) === String(currentVersion);

                                if (isRemovedThisVersion) {
                                  return (
                                    <span className="badge bg-danger">
                                      Removed
                                    </span>
                                  );
                                }
                                if (isAddedThisVersion) {
                                  return (
                                    <span className="badge bg-primary">
                                      New
                                    </span>
                                  );
                                }
                                if (isRemoved) {
                                  return (
                                    <span className="badge bg-secondary">
                                      Inactive
                                    </span>
                                  );
                                }
                                return (
                                  <span className="badge bg-success">
                                    Active
                                  </span>
                                );
                              })()}
                            </td>
                            <td>
                              <i
                                className="bi bi-pencil-square text-primary me-2"
                                style={{ cursor: "pointer" }}
                                title="Edit Task"
                                onClick={() => {
                                  // TODO: Implement edit task handler
                                  console.log("Edit task:", task);
                                }}></i>
                              <i
                                className="bi bi-trash text-danger"
                                style={{ cursor: "pointer" }}
                                title="Delete Task"
                                onClick={() => {
                                  // TODO: Implement delete task handler
                                  console.log("Delete task:", task);
                                }}></i>
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
      </div>

      {/* Changes in This Version - Full Width */}
      <div className="row mt-3">
        <div className="col">
          <div className="card">
            <div className="card-header bg-warning">
              <h5 className="mb-0">Changes in This Version</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-sm mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th style={{ minWidth: "220px" }}>Description</th>
                      <th>Changes</th>
                      <th className="text-center" style={{ width: "100px" }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {changeLog.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center text-muted">
                          No changes in this version
                        </td>
                      </tr>
                    ) : (
                      changeLog.map((chg, i) => (
                        <tr
                          key={
                            chg.recordId ?? `${chg.userId}-${chg.code}-${i}`
                          }>
                          <td>{chg.description}</td>

                          <td>
                            {chg.changeType.includes("Added") ? (
                              <span className="badge rounded-pill bg-success">
                                Added {chg.code}
                              </span>
                            ) : (
                              <span className="badge rounded-pill bg-danger">
                                Removed {chg.code}
                              </span>
                            )}
                          </td>
                          <td className="text-center">
                            <button
                              className="btn btn-sm btn-link text-danger p-0"
                              title="Delete Change"
                              data-record-id={chg.recordId ?? ""}
                              onClick={() =>
                                handleDeleteChange(chg.recordId, chg)
                              }>
                              <i className="bi bi-trash"></i>
                            </button>
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

      {/* Assignments by Task Group - Full Width */}
      <div className="row mt-3">
        <div className="col">
          <div className="card">
            <div className="card-header bg-dark text-white">
              <h5 className="mb-0">Assignments by Task Group</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-sm mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th style={{ minWidth: "220px" }}>Name</th>
                      <th style={{ minWidth: "200px" }}>Title</th>
                      {taskGroups.map((g) => (
                        <th key={g} className="text-center">
                          {g}
                        </th>
                      ))}
                      <th className="text-center" style={{ width: "100px" }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {aggregatedUserEntries.length === 0 ? (
                      <tr>
                        <td
                          colSpan={2 + taskGroups.length + 1}
                          className="text-center text-muted">
                          No entries in snapshot
                        </td>
                      </tr>
                    ) : (
                      aggregatedUserEntries.map((entry) => {
                        const user = entry.user;
                        const displayName =
                          resolveDisplayName(user) || "Unknown";
                        const titleOrRole = resolveRole(user);
                        const userTasks = entry.tasks || [];
                        return (
                          <tr key={entry.userId}>
                            <td>
                              <strong>{displayName}</strong>
                            </td>
                            <td>{titleOrRole}</td>
                            {taskGroups.map((group) => {
                              const currentVersion =
                                snapshot?.version ??
                                snapshot?.Version ??
                                versionLabel;
                              const groupTasks = userTasks.filter((t) =>
                                (t?.task?.code ?? "")
                                  .toUpperCase()
                                  .startsWith(group)
                              );
                              if (groupTasks.length === 0) {
                                return (
                                  <td
                                    key={group}
                                    className="text-muted task-cell">
                                    <span className="opacity-50">N/A</span>
                                  </td>
                                );
                              }
                              const pills = groupTasks
                                .map((t) => {
                                  const code = t?.task?.code ?? "";
                                  const addedV =
                                    t?.addedVersion ?? t?.AddedVersion;
                                  const removedV =
                                    t?.removedVersion ?? t?.RemovedVersion;
                                  const isRemoved =
                                    t?.isRemoved ?? t?.IsRemoved ?? false;
                                  let state;
                                  if (
                                    isRemoved &&
                                    removedV != null &&
                                    String(removedV) === String(currentVersion)
                                  ) {
                                    state = "removed";
                                  } else if (
                                    !isRemoved &&
                                    addedV != null &&
                                    String(addedV) === String(currentVersion)
                                  ) {
                                    state = "added";
                                  } else if (!isRemoved) {
                                    state = "existing";
                                  } else {
                                    state = "removed";
                                  }
                                  return { code, state };
                                })
                                .filter((p) => p.code)
                                .sort((a, b) => a.code.localeCompare(b.code));
                              return (
                                <td
                                  key={group}
                                  className={`taskcode_${group} task-cell`}>
                                  {pills.map((p) => {
                                    const base = "badge rounded-pill me-1 mb-1";
                                    let cls, title;
                                    switch (p.state) {
                                      case "added":
                                        cls = base + " bg-success";
                                        title = "Added in this version";
                                        break;
                                      case "removed":
                                        cls = base + " bg-danger";
                                        title = "Removed in this version";
                                        break;
                                      case "existing":
                                      default:
                                        cls = base + " bg-secondary";
                                        title = "Previously assigned";
                                        break;
                                    }
                                    return (
                                      <span
                                        key={p.code}
                                        className={cls}
                                        title={title}>
                                        {p.code}
                                      </span>
                                    );
                                  })}
                                </td>
                              );
                            })}
                            <td className="text-center">
                              <button
                                className="btn btn-sm btn-link text-primary p-0 me-2"
                                title="Edit Delegations"
                                onClick={() =>
                                  console.log("Edit delegations", user)
                                }>
                                <i className="bi bi-pencil-square"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-link text-danger p-0"
                                title="Clear Delegations"
                                onClick={() =>
                                  console.log("Clear delegations", user)
                                }>
                                <i className="bi bi-trash"></i>
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
                                const userId = user.id ?? user.ID ?? user.userId ?? user.UserId;
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
                                const userId = user.id ?? user.ID ?? user.userId ?? user.UserId;
                                if (!userId) return null;
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
                  <label className="form-label text-muted">
                    <strong>Email:</strong>
                  </label>
                  <p className="text-muted small mb-0">
                    {editingUser.USR_Users?.email ?? "-"}
                  </p>
                </div>
                <div className="mb-3">
                  <label htmlFor="userDisplayName" className="form-label">
                    Display Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="userDisplayName"
                    value={editedDisplayName}
                    onChange={(e) => setEditedDisplayName(e.target.value)}
                    placeholder="Enter display name"
                  />
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
                          task.standardId ?? task.Id ?? task.code ?? task.Code;
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

      {/* Add Delegation Modal */}
      {showAddDelegationModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Delegations</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseAddDelegationModal}></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  {/* Users List */}
                  <div className="col-md-6">
                    <h6 className="mb-3">Users on Study</h6>
                    <div
                      className="border rounded p-3"
                      style={{ maxHeight: "400px", overflowY: "auto" }}>
                      {users.length === 0 ? (
                        <p className="text-muted">No users on study</p>
                      ) : (
                        users
                          .slice()
                          .sort((a, b) => {
                            const nameA = resolveDisplayName(a).toLowerCase();
                            const nameB = resolveDisplayName(b).toLowerCase();
                            return nameA.localeCompare(nameB);
                          })
                          .map((user) => {
                            const userId = getDoaUserIdValue(user);
                            const displayName = resolveDisplayName(user);
                            return (
                              <div key={userId} className="form-check mb-2">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id={`del-user-${userId}`}
                                  checked={selectedDelegationUsers.includes(
                                    userId
                                  )}
                                  onChange={() =>
                                    handleDelegationUserToggle(userId)
                                  }
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor={`del-user-${userId}`}>
                                  {displayName}
                                </label>
                              </div>
                            );
                          })
                      )}
                    </div>
                    <div className="mt-2">
                      <small className="text-muted">
                        {selectedDelegationUsers.length} user(s) selected
                      </small>
                    </div>
                  </div>

                  {/* Tasks List */}
                  <div className="col-md-6">
                    <h6 className="mb-3">Tasks</h6>
                    <div
                      className="border rounded p-3"
                      style={{ maxHeight: "400px", overflowY: "auto" }}>
                      {tasks.length === 0 ? (
                        <p className="text-muted">No tasks defined</p>
                      ) : (
                        tasks
                          .slice()
                          .sort((a, b) => {
                            const codeA = (
                              a.task.code ??
                              a.task.Code ??
                              ""
                            ).toLowerCase();
                            const codeB = (
                              b.task.code ??
                              b.task.Code ??
                              ""
                            ).toLowerCase();
                            return codeA.localeCompare(codeB);
                          })
                          .map((task) => {
                            const taskCode =
                              task.task.code ?? task.task.Code ?? "";
                            const taskTitle =
                              task.task.title ??
                              task.task.Title ??
                              task.task.name ??
                              task.task.Name ??
                              "";
                            return (
                              <div key={taskCode} className="form-check mb-2">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id={`del-task-${taskCode}`}
                                  checked={selectedDelegationTasks.includes(
                                    taskCode
                                  )}
                                  onChange={() =>
                                    handleDelegationTaskToggle(taskCode)
                                  }
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor={`del-task-${taskCode}`}>
                                  <strong>{taskCode}</strong> - {taskTitle}
                                </label>
                              </div>
                            );
                          })
                      )}
                    </div>
                    <div className="mt-2">
                      <small className="text-muted">
                        {selectedDelegationTasks.length} task(s) selected
                      </small>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseAddDelegationModal}
                  disabled={addingDelegations}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddDelegations}
                  disabled={
                    addingDelegations ||
                    selectedDelegationUsers.length === 0 ||
                    selectedDelegationTasks.length === 0
                  }>
                  {addingDelegations ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"></span>
                      Adding...
                    </>
                  ) : (
                    `Add ${
                      selectedDelegationUsers.length *
                      selectedDelegationTasks.length
                    } Delegation(s)`
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
