
import api from "./apiService";

// Resolve API base to keep the DOA endpoints aligned with the backend server
const API_BASE_URL = (() => {
  if (
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "localhost"
  ) {
    return "http://localhost:3001";
  }
  return "";
})();

const DOA_BASE_PATH = `${API_BASE_URL}/api/v1/doa`;

/**
 * Helper function to handle API errors consistently
 * @param {Error} error - The error object
 * @param {string} operation - Description of the operation that failed
 */
const handleApiError = (error, operation) => {
  console.error(`DOA Service Error - ${operation}:`, error);
  
  // Extract meaningful error message
  const message = 
    error.response?.data?.message || 
    error.response?.data?.error || 
    error.message || 
    `Failed to ${operation}`;
  
  // Re-throw with enhanced error
  const enhancedError = new Error(message);
  enhancedError.originalError = error;
  enhancedError.statusCode = error.response?.status;
  throw enhancedError;
};

const doaService = {
  listUsers: async (onlyDelegatables = true) => {
    try {
      return await api.get(`${API_BASE_URL}/api/v1/users/ListUsers`, {
        params: { onlyDelegatables }
      });
    } catch (error) {
      handleApiError(error, "list users");
    }
  },

  getStudyDoa: async (studyId) => {
    try {
      if (!studyId) {
        throw new Error("Study ID is required");
      }
      return await api.get(`${DOA_BASE_PATH}/${encodeURIComponent(studyId)}`);
    } catch (error) {
      handleApiError(error, "get study DOA");
    }
  },

  addUserToDoa: async (data) => {
    try {
      if (!data.studyId || !data.userId) {
        throw new Error("Study ID and User ID are required");
      }
      return await api.post(`${DOA_BASE_PATH}/AddUserToDoa/${data.studyId}`, data);
    } catch (error) {
      handleApiError(error, "add user to DOA");
    }
  },

  removeUserFromDoa: async (data) => {
    try {
      if (!data.studyId || !data.userId) {
        throw new Error("Study ID and User ID are required");
      }
      return await api.post(`${DOA_BASE_PATH}/RemoveUserFromDoa/${data.studyId}`, data);
    } catch (error) {
      handleApiError(error, "remove user from DOA");
    }
  },

  updateUserInfo: async (data) => {
    try {
      if (!data.studyId || !data.userId) {
        throw new Error("Study ID and User ID are required");
      }
      return await api.post(`${DOA_BASE_PATH}/${data.studyId}/UpdateUser/`, data);
    } catch (error) {
      handleApiError(error, "update user info");
    }
  },

  addTaskToDoa: async (data) => {
    try {
      if (!data.studyId || !data.code || !data.title) {
        throw new Error("Study ID, task code, and title are required");
      }
      return await api.post(`${DOA_BASE_PATH}/AddTaskToDoa/${data.studyId}`, data);
    } catch (error) {
      handleApiError(error, "add task to DOA");
    }
  },

  removeTaskFromDoa: async (data) => {
    try {
      if (!data.studyId || !data.code) {
        throw new Error("Study ID and task code are required");
      }
      return await api.post(`${DOA_BASE_PATH}/RemoveTaskFromDoa/${data.studyId}`, data);
    } catch (error) {
      handleApiError(error, "remove task from DOA");
    }
  },

  /**
   * Add delegations (batch)
   * Endpoint: /api/v1/doa/:studyId/addDelegation
   * Body: { delegations: [ { userId: number, taskCode: string }, ... ] }
   */
  addDelegations: async (studyId, delegations) => {
    try {
      if (!studyId) {
        throw new Error("Study ID is required");
      }
      if (!Array.isArray(delegations) || delegations.length === 0) {
        throw new Error("At least one delegation is required");
      }
      return await api.post(`${DOA_BASE_PATH}/${encodeURIComponent(studyId)}/addDelegation`, {
        delegations,
      });
    } catch (error) {
      handleApiError(error, "add delegations");
    }
  },

  /**
   * Remove delegations (batch)
   * Endpoint: /api/v1/doa/:studyId/removeDelegation
   * Body: { delegations: [ { userId: number, taskCode: string }, ... ] }
   */
  removeDelegations: async (studyId, delegations) => {
    try {
      if (!studyId) {
        throw new Error("Study ID is required");
      }
      if (!Array.isArray(delegations) || delegations.length === 0) {
        throw new Error("At least one delegation is required");
      }
      return await api.post(`${DOA_BASE_PATH}/${encodeURIComponent(studyId)}/removeDelegation`, {
        delegations,
      });
    } catch (error) {
      handleApiError(error, "remove delegations");
    }
  },

  finalizeDoa: async (params) => {
    try {
      if (!params.studyId) {
        throw new Error("Study ID is required");
      }
      return await api.post(`${DOA_BASE_PATH}/${params.studyId}/finalize`, {}, {
        params,
      });
    } catch (error) {
      handleApiError(error, "finalize DOA");
    }
  },

  downloadCompiledDoaLogPdf: async (studyId, options = {}) => {
    try {
      if (!studyId) {
        throw new Error("Study ID is required");
      }
      
      const response = await api.post(
        `${DOA_BASE_PATH}/DownloadCompiledDoaLogPdf/${encodeURIComponent(
          studyId
        )}`,
        options,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `doa-compiled-${studyId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return response;
    } catch (error) {
      handleApiError(error, "download compiled DOA PDF");
    }
  },

  downloadChangeOnlyDoaLogPdf: async (studyId, options = {}) => {
    try {
      if (!studyId) {
        throw new Error("Study ID is required");
      }
      
      const response = await api.post(
        `${DOA_BASE_PATH}/DownloadChangeOnlyDoaLogPdf/${encodeURIComponent(studyId)}`,
        options,
        { responseType: 'blob' }
      );

      // Trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `doa-changes-${studyId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return response;
    } catch (error) {
      handleApiError(error, "download change-only DOA PDF");
    }
  },

  /**
   * Get all standard tasks
   * @returns {Promise}
   */
  getStandardTasks: async () => {
    try {
      return await api.get(`${DOA_BASE_PATH}/getStandardTasks`);
    } catch (error) {
      handleApiError(error, "get standard tasks");
    }
  },

  /**
   * Update a standard task
   * @param {string} id - The standard task identifier
   * @param {object} data - Task update data
   * @returns {Promise}
   */
  updateStandardTask: async (id, data) => {
    try {
      if (!id) {
        throw new Error("Task ID is required");
      }
      return await api.post(`${DOA_BASE_PATH}/updateStandardTask/${encodeURIComponent(id)}`, data);
    } catch (error) {
      handleApiError(error, "update standard task");
    }
  },

  /**
   * Archive a standard task
   * @param {string} id - The standard task identifier
   * @returns {Promise}
   */
  archiveStandardTask: async (id) => {
    try {
      if (!id) {
        throw new Error("Task ID is required");
      }
      return await api.post(`${DOA_BASE_PATH}/archiveStandardTask/${encodeURIComponent(id)}`);
    } catch (error) {
      handleApiError(error, "archive standard task");
    }
  },

  /**
   * Create a new standard task
   * @param {object} data - New task data
   * @returns {Promise}
   */
  newStandardTask: async (data) => {
    try {
      if (!data.code || !data.title) {
        throw new Error("Task code and title are required");
      }
      return await api.post(`${DOA_BASE_PATH}/newStandardTask`, data);
    } catch (error) {
      handleApiError(error, "create new standard task");
    }
  },

  /**
   * Get requirements enum
   * Returns a list of requirement options that can be assigned to tasks
   * @returns {Promise<{message: string, data: Array<{id: number, description: string}>}>}
   */
  getRequirementsEnum: async () => {
    try {
      return await api.get(`${DOA_BASE_PATH}/requirementsEnum`);
    } catch (error) {
      handleApiError(error, "get requirements enum");
    }
  }
};

export default doaService;
