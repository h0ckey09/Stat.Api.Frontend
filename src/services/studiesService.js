import api from './apiService';

/**
 * Studies Service
 * Modern React/Axios-based client for Studies endpoints
 */

const STUDIES_BASE_PATH = '/api/v1/studies';

export const studiesService = {
  /**
   * Get list of all studies accessible to the current user
   * @param {object} params - Query parameters (status, page, pageSize)
   * @returns {Promise}
   */
  listStudies: (params = {}) => {
    return api.get(`${STUDIES_BASE_PATH}/ListStudies`, { params });
  },

  /**
   * Get list of active studies only
   * @returns {Promise}
   */
  getActiveStudies: () => {
    return api.get(`${STUDIES_BASE_PATH}/GetActiveStudies`);
  },

  /**
   * Get detailed information about a specific study
   * @param {string} studyId - The study identifier
   * @returns {Promise}
   */
  getStudy: (studyId) => {
    return api.get(`${STUDIES_BASE_PATH}/GetStudy/${encodeURIComponent(studyId)}`);
  },

  /**
   * Create a new study
   * @param {object} data - Study data (name, description, protocolNumber, sponsor)
   * @returns {Promise}
   */
  createStudy: (data) => {
    return api.post(`${STUDIES_BASE_PATH}/CreateStudy`, data);
  },

  /**
   * Update study information
   * @param {string} studyId - The study identifier
   * @param {object} data - Updated study data
   * @returns {Promise}
   */
  updateStudy: (studyId, data) => {
    return api.put(`${STUDIES_BASE_PATH}/UpdateStudy/${encodeURIComponent(studyId)}`, data);
  },

  /**
   * Archive a study
   * @param {string} studyId - The study identifier
   * @returns {Promise}
   */
  archiveStudy: (studyId) => {
    return api.post(`${STUDIES_BASE_PATH}/ArchiveStudy/${encodeURIComponent(studyId)}`);
  }
};

export default studiesService;
