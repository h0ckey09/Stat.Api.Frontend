/**
 * Shared utility functions for DOA components
 */

/**
 * Format a date value to locale date string
 * @param {string|Date} value - The date value to format
 * @returns {string} Formatted date string or "-" if no value
 */
export const formatDate = (value) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleDateString();
  } catch (error) {
    console.error("Error formatting date:", error);
    return "-";
  }
};

/**
 * Format a date-time value to locale date-time string
 * @param {string|Date} value - The date-time value to format
 * @returns {string} Formatted date-time string or "-" if no value
 */
export const formatDateTime = (value) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString();
  } catch (error) {
    console.error("Error formatting date-time:", error);
    return "-";
  }
};

/**
 * Resolve display name from user object with multiple fallback options
 * @param {Object} user - The user object
 * @returns {string} Display name or "Unknown" if not found
 */
export const resolveDisplayName = (user) => {
  if (!user) return "Unknown";
  
  // Try displayName or name first
  if (user.displayName) return user.displayName;
  if (user.name) return user.name;
  
  // Try constructing from first and last name
  const fullName = `${user.FirstName ?? ""} ${user.LastName ?? ""}`.trim();
  if (fullName) return fullName;
  
  // Fallback to dash
  return "-";
};

/**
 * Resolve role/title from user object with multiple fallback options
 * @param {Object} user - The user object
 * @returns {string} Role/title or "-" if not found
 */
export const resolveRole = (user) => {
  if (!user) return "-";
  return user.titleOrRole ?? user.Title ?? user.role ?? user.Role ?? "-";
};

/**
 * Get DOA user ID value from user object
 * @param {Object} user - The user object
 * @returns {number|null} User ID or null if not found
 */
export const getDoaUserIdValue = (user) => {
  if (!user) return null;
  return user.doaUserId ?? user.userId ?? user.id ?? user.ID ?? user.UserId ?? null;
};

/**
 * Get version identifier from version object
 * @param {Object} version - The version object
 * @returns {string|number|null} Version identifier
 */
export const getVersionIdentifier = (version) => {
  if (!version) return null;
  return (
    version.versionNumber ??
    version.version ??
    version.Version ??
    version.id ??
    version.Id ??
    null
  );
};

/**
 * Resolve study name from study object
 * @param {Object} study - The study object
 * @returns {string} Study name or "Study" if not found
 */
export const resolveStudyName = (study) => {
  if (!study) return "Study";
  return (
    study.studyName ??
    study.StudyName ??
    study.name ??
    study.Study_Title ??
    "Study"
  );
};

/**
 * Extract letters-only portion of task code
 * @param {string} code - The task code
 * @returns {string} Letters-only portion in uppercase
 */
export const getCodeLetters = (code) => {
  if (!code) return "";
  return code.replace(/[^A-Za-z]/g, "").toUpperCase();
};

/**
 * Check if a string is a valid email
 * Uses a more comprehensive regex pattern that handles most valid email formats
 * @param {string} email - The email to validate
 * @returns {boolean} True if valid email format
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  // More comprehensive email regex that handles most valid formats
  // Including subdomains, special characters, and international domains
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
};

/**
 * Safely parse JSON with error handling
 * @param {string} jsonString - The JSON string to parse
 * @param {*} defaultValue - Default value if parsing fails
 * @returns {*} Parsed object or default value
 */
export const safeJSONParse = (jsonString, defaultValue = null) => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return defaultValue;
  }
};

/**
 * Group tasks by their letter code prefix
 * @param {Array} tasks - Array of task objects
 * @returns {Array} Array of unique letter groups sorted alphabetically
 */
export const getTaskGroups = (tasks) => {
  if (!Array.isArray(tasks)) return [];
  
  const groups = new Set(
    tasks
      .map((t) => getCodeLetters(t?.task?.code ?? t?.code ?? ""))
      .filter((g) => g && g.length > 0)
  );
  
  return Array.from(groups).sort((a, b) => a.localeCompare(b));
};
