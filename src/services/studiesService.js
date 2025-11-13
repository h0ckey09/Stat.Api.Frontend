import api from './apiService';

/**
 * Studies Service
 * Modern React/Axios-based client for Studies endpoints
 */

// Endpoints - auto-detect API server or use configured base
var API_BASE_URL = (function () {
  // If we're on localhost:5500 (VS Code Live Server), point to the API server
  if (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') {
    // Check if we're on a non-standard port (like 5500 for Live Server)

    return 'http://localhost:3001'; // Default API server port

  }
  // Otherwise use relative paths (same origin)
  return '';
})();
const STUDIES_BASE_PATH = `${API_BASE_URL}/api/v1/studies`;

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
    return api.get(`${STUDIES_BASE_PATH}/ListActiveStudies`);
  },

  /**
   * Get detailed information about a specific study
   * @param {string} studyId - The study identifier
   * @returns {Promise}
   */
  getStudy: (studyId) => {
    return api.get(`${STUDIES_BASE_PATH}/study/${encodeURIComponent(studyId)}`);
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
