import api from './apiService';

/**
 * DOA (Delegation of Authority) Service
 * Modern React/Axios-based client for DOA endpoints
 */

const DOA_BASE_PATH = '/api/v1/doa';

export const doaService = {
  /**
   * Create initial DOA for a study
   * @param {string} studyId - The study identifier
   * @param {object} data - DOA creation data
   * @returns {Promise}
   */
  createInitialDoa: (studyId, data) => {
    return api.post(`${DOA_BASE_PATH}/CreateInitialDoa/${encodeURIComponent(studyId)}`, data);
  },

  /**
   * Get current finalized DOA for a study
   * @param {string} studyId - The study identifier
   * @returns {Promise}
   */
  getCurrentFinalizedDoaForStudy: (studyId) => {
    return api.get(`${DOA_BASE_PATH}/GetCurrentFinalizedDoaForStudy/${encodeURIComponent(studyId)}`);
  },

  /**
   * Get current finalized DOA version
   * @param {string} studyId - The study identifier
   * @returns {Promise}
   */
  getCurrentFinalizeDoaVersion: (studyId) => {
    return api.get(`${DOA_BASE_PATH}/GetCurrentFinalizeDOAVersion/${encodeURIComponent(studyId)}`);
  },

  /**
   * Get current and pending DOA for a study
   * @param {string} studyId - The study identifier
   * @returns {Promise}
   */
  getCurrentAndPendingDoaForStudy: (studyId) => {
    return api.get(`${DOA_BASE_PATH}/GetCurrentAndPendingDoaForStudy/${encodeURIComponent(studyId)}`);
  },

  /**
   * Get compiled DOA version for a study
   * @param {string} studyId - The study identifier
   * @returns {Promise}
   */
  getCompiledDoaVersionForStudy: (studyId) => {
    return api.get(`${DOA_BASE_PATH}/GetCompiledDoaVersionForStudy/${encodeURIComponent(studyId)}`);
  },

  /**
   * Get DOA snapshot version
   * @param {string} versionId - The version identifier
   * @returns {Promise}
   */
  getDoaSnapshotVersion: (versionId) => {
    return api.get(`${DOA_BASE_PATH}/GetDoaSnapshotVersion/${encodeURIComponent(versionId)}`);
  },

  /**
   * Get DOA changes only for a study
   * @param {string} studyId - The study identifier
   * @returns {Promise}
   */
  getDoaChangesOnlyForStudy: (studyId) => {
    return api.get(`${DOA_BASE_PATH}/GetDoaChangesOnlyForStudy/${encodeURIComponent(studyId)}`);
  },

  /**
   * Get DOA audit log for a study
   * @param {string} studyId - The study identifier
   * @returns {Promise}
   */
  getDoaAuditLogForStudy: (studyId) => {
    return api.get(`${DOA_BASE_PATH}/GetDoaAuditLogForStudy/${encodeURIComponent(studyId)}`);
  },

  /**
   * Remove user from DOA
   * @param {object} data - Object with userId and doaId
   * @returns {Promise}
   */
  removeUserFromDoa: (data) => {
    return api.post(`${DOA_BASE_PATH}/RemoveUserFromDoa/`, data);
  },

  /**
   * Add user to DOA
   * @param {object} data - Object with userId and doaId
   * @returns {Promise}
   */
  addUserToDoa: (data) => {
    return api.post(`${DOA_BASE_PATH}/AddUserToDoa/`, data);
  },

  /**
   * Finalize DOA
   * @param {object} data - DOA finalization data
   * @returns {Promise}
   */
  finalizeDoa: (data) => {
    return api.post(`${DOA_BASE_PATH}/FinalizeDoa/`, data);
  },

  /**
   * Download compiled DOA log PDF
   * @param {string} studyId - The study identifier
   * @param {object} options - Optional parameters for PDF generation
   * @returns {Promise}
   */
  downloadCompiledDoaLogPdf: async (studyId, options = {}) => {
    try {
      const response = await api.post(
        `${DOA_BASE_PATH}/DownloadCompliledDoaLogPdf/${encodeURIComponent(studyId)}`,
        options,
        { responseType: 'blob' }
      );
      
      // Trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `doa-compiled-${studyId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return response;
    } catch (error) {
      console.error('Error downloading compiled DOA PDF:', error);
      throw error;
    }
  },

  /**
   * Download change-only DOA log PDF
   * @param {string} studyId - The study identifier
   * @param {object} options - Optional parameters for PDF generation
   * @returns {Promise}
   */
  downloadChangeOnlyDoaLogPdf: async (studyId, options = {}) => {
    try {
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
      console.error('Error downloading change-only DOA PDF:', error);
      throw error;
    }
  }
};

export default doaService;
