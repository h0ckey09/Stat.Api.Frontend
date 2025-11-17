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

const doaService = {
  listUsers: (onlyDelegatables = true) => {
    return api.get(`${API_BASE_URL}/api/v1/users/ListUsers`, {
      params: { onlyDelegatables }
    });
  },

  getStudyDoa: (studyId) => {
    return api.get(`${DOA_BASE_PATH}/${encodeURIComponent(studyId)}`);
  },

  addUserToDoa: (data) => {
    return api.post(`${DOA_BASE_PATH}/AddUserToDoa/`, data);
  },

  removeUserFromDoa: (data) => {
    return api.post(`${DOA_BASE_PATH}/RemoveUserFromDoa/`, data);
  },

   // call /api/v1/doa/UpdateUserTitle
      // body = { studyId: id, userId: editingUser.userId, title: editedTitle }
  updateUserTitle: (data) => {
    return api.post(`${DOA_BASE_PATH}/UpdateUserTitle/`, data);
  },

  addTaskToDoa: (data) => {
    return api.post(`${DOA_BASE_PATH}/AddTaskToDoa/`, data);
  },

  removeTaskFromDoa: (data) => {
    return api.post(`${DOA_BASE_PATH}/RemoveTaskFromDoa/`, data);
  },

  getStandardTasks: () => {
    return api.post(`${DOA_BASE_PATH}/getStandardTasks`);
  },

  finalizeDoa: (params) => {
    return api.post(`${DOA_BASE_PATH}/FinalizeDoa/`, null, {
      params,
    });
  },

  downloadCompiledDoaLogPdf: async (studyId, options = {}) => {
    const response = await api.post(
      `${DOA_BASE_PATH}/DownloadCompliledDoaLogPdf/${encodeURIComponent(
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
  },

  downloadChangeOnlyDoaLogPdf: async (studyId, options = {}) => {
    const response = await api.post(
      `${DOA_BASE_PATH}/DownloadChangeOnlyDoaLogPdf/${encodeURIComponent(
        studyId
      )}`,
      options,
      { responseType: "blob" }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `doa-changes-${studyId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return response;
  },
};

export default doaService;
