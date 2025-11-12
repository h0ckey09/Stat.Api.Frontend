var Doa = (function ($) {
    // ...existing code...

    /**
     * Create initial DOA for a study
     * @param {string} studyId - The study identifier
     * @param {object} data - DOA creation data
     * @returns {Promise}
     */
    function createInitialDoa(studyId, data) {
        return $.ajax({
            url: '/api/v1/doa/CreateInitialDoa/' + encodeURIComponent(studyId),
            method: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(data),
            timeout: 30000
        });
    }

    /**
     * Get current finalized DOA for a study
     * @param {string} studyId - The study identifier
     * @returns {Promise}
     */
    function getCurrentFinalizedDoaForStudy(studyId) {
        return $.ajax({
            url: '/api/v1/doa/GetCurrentFinalizedDoaForStudy/' + encodeURIComponent(studyId),
            method: 'GET',
            dataType: 'json',
            timeout: 10000
        });
    }

    /**
     * Get current finalized DOA version
     * @param {string} studyId - The study identifier
     * @returns {Promise}
     */
    function getCurrentFinalizeDoaVersion(studyId) {
        return $.ajax({
            url: '/api/v1/doa/GetCurrentFinalizeDOAVersion/' + encodeURIComponent(studyId),
            method: 'GET',
            dataType: 'json',
            timeout: 10000
        });
    }

    /**
     * Get current and pending DOA for a study
     * @param {string} studyId - The study identifier
     * @returns {Promise}
     */
    function getCurrentAndPendingDoaForStudy(studyId) {
        return $.ajax({
            url: '/api/v1/doa/GetCurrentAndPendingDoaForStudy/' + encodeURIComponent(studyId),
            method: 'GET',
            dataType: 'json',
            timeout: 10000
        });
    }

    /**
     * Get compiled DOA version for a study
     * @param {string} studyId - The study identifier
     * @returns {Promise}
     */
    function getCompiledDoaVersionForStudy(studyId) {
        return $.ajax({
            url: '/api/v1/doa/GetCompiledDoaVersionForStudy/' + encodeURIComponent(studyId),
            method: 'GET',
            dataType: 'json',
            timeout: 15000
        });
    }

    /**
     * Get DOA snapshot version
     * @param {string} versionId - The version identifier
     * @returns {Promise}
     */
    function getDoaSnapshotVersion(versionId) {
        return $.ajax({
            url: '/api/v1/doa/GetDoaSnapshotVersion/' + encodeURIComponent(versionId),
            method: 'GET',
            dataType: 'json',
            timeout: 10000
        });
    }

    /**
     * Get DOA changes only for a study
     * @param {string} studyId - The study identifier
     * @returns {Promise}
     */
    function getDoaChangesOnlyForStudy(studyId) {
        return $.ajax({
            url: '/api/v1/doa/GetDoaChangesOnlyForStudy/' + encodeURIComponent(studyId),
            method: 'GET',
            dataType: 'json',
            timeout: 10000
        });
    }

    /**
     * Get DOA audit log for a study
     * @param {string} studyId - The study identifier
     * @returns {Promise}
     */
    function getDoaAuditLogForStudy(studyId) {
        return $.ajax({
            url: '/api/v1/doa/GetDoaAuditLogForStudy/' + encodeURIComponent(studyId),
            method: 'GET',
            dataType: 'json',
            timeout: 10000
        });
    }

    /**
     * Remove user from DOA
     * @param {object} data - Object with userId and doaId
     * @returns {Promise}
     */
    function removeUserFromDoa(data) {
        return $.ajax({
            url: '/api/v1/doa/RemoveUserFromDoa/',
            method: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(data),
            timeout: 10000
        });
    }

    /**
     * Add user to DOA
     * @param {object} data - Object with userId and doaId
     * @returns {Promise}
     */
    function addUserToDoa(data) {
        return $.ajax({
            url: '/api/v1/doa/AddUserToDoa/',
            method: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(data),
            timeout: 10000
        });
    }

    /**
     * Finalize DOA
     * @param {object} data - DOA finalization data
     * @returns {Promise}
     */
    function finalizeDoa(data) {
        return $.ajax({
            url: '/api/v1/doa/FinalizeDoa/',
            method: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(data),
            timeout: 30000
        });
    }

    /**
     * Download compiled DOA log PDF
     * @param {string} studyId - The study identifier
     * @param {object} options - Optional parameters for PDF generation
     * @returns {Promise}
     */
    function downloadCompiledDoaLogPdf(studyId, options) {
        return $.ajax({
            url: '/api/v1/doa/DownloadCompliledDoaLogPdf/' + encodeURIComponent(studyId),
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(options || {}),
            xhrFields: {
                responseType: 'blob'
            },
            timeout: 60000
        }).done(function (blob) {
            // Trigger download
            var url = window.URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'doa-compiled-' + studyId + '.pdf';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        });
    }

    /**
     * Download change-only DOA log PDF
     * @param {string} studyId - The study identifier
     * @param {object} options - Optional parameters for PDF generation
     * @returns {Promise}
     */
    function downloadChangeOnlyDoaLogPdf(studyId, options) {
        return $.ajax({
            url: '/api/v1/doa/DownloadChangeOnlyDoaLogPdf/' + encodeURIComponent(studyId),
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(options || {}),
            xhrFields: {
                responseType: 'blob'
            },
            timeout: 60000
        }).done(function (blob) {
            // Trigger download
            var url = window.URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'doa-changes-' + studyId + '.pdf';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        });
    }

    // ...existing code...

    // public API
    return {
        init: init,
        loadData: loadData,
        clear: clearResult,
        // DOA API methods
        createInitialDoa: createInitialDoa,
        getCurrentFinalizedDoaForStudy: getCurrentFinalizedDoaForStudy,
        getCurrentFinalizeDoaVersion: getCurrentFinalizeDoaVersion,
        getCurrentAndPendingDoaForStudy: getCurrentAndPendingDoaForStudy,
        getCompiledDoaVersionForStudy: getCompiledDoaVersionForStudy,
        getDoaSnapshotVersion: getDoaSnapshotVersion,
        getDoaChangesOnlyForStudy: getDoaChangesOnlyForStudy,
        getDoaAuditLogForStudy: getDoaAuditLogForStudy,
        removeUserFromDoa: removeUserFromDoa,
        addUserToDoa: addUserToDoa,
        finalizeDoa: finalizeDoa,
        downloadCompiledDoaLogPdf: downloadCompiledDoaLogPdf,
        downloadChangeOnlyDoaLogPdf: downloadChangeOnlyDoaLogPdf
    };
})(jQuery);