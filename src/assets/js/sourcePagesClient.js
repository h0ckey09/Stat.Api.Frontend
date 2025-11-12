var SourcePagesClient = (function ($) {
    'use strict';

    var BASE_PATH = '/api/v1/source';
    var BASE_PATH_V2 = '/api/v2/source';

    function buildUrl(basePath, path, query) {
        var url = basePath + path;
        if (!query) {
            return url;
        }

        var queryString = Object.keys(query)
            .filter(function (key) {
                return query[key] !== undefined && query[key] !== null;
            })
            .map(function (key) {
                return encodeURIComponent(key) + '=' + encodeURIComponent(String(query[key]));
            })
            .join('&');

        return queryString.length ? url + '?' + queryString : url;
    }

    function ajaxJson(options, overrides) {
        return $.ajax(
            Object.assign(
                {
                    method: 'GET',
                    dataType: 'json',
                    timeout: 15000
                },
                options,
                overrides || {}
            )
        );
    }

    function postJson(basePath, path, data, overrides, timeout) {
        return ajaxJson(
            {
                url: buildUrl(basePath, path),
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(data || {}),
                timeout: timeout || 20000
            },
            overrides
        );
    }

    function getJson(basePath, path, query, overrides, timeout) {
        return ajaxJson(
            {
                url: buildUrl(basePath, path, query),
                method: 'GET',
                timeout: timeout || 15000
            },
            overrides
        );
    }

    /**
     * Renders a source page as HTML
     * @param {number} pageId - Page ID
     * @param {object} options - Query parameters (autorefresh, showborders, bodyonly)
     * @param {object} ajaxOptions - Additional AJAX options
     * @returns {Promise}
     */
    function renderPage(pageId, options, ajaxOptions) {
        return $.ajax(
            Object.assign(
                {
                    url: buildUrl(BASE_PATH, '/RenderPage/' + encodeURIComponent(pageId), options),
                    method: 'GET',
                    dataType: 'html',
                    timeout: 30000
                },
                ajaxOptions || {}
            )
        );
    }

    /**
     * Gets page information
     * @param {number} pageId - Page ID
     * @param {object} options - Query parameters (includeBinderInfo, includePermissions)
     * @param {object} ajaxOptions - Additional AJAX options
     * @returns {Promise}
     */
    function getPage(pageId, options, ajaxOptions) {
        return getJson(BASE_PATH, '/GetPage/' + encodeURIComponent(pageId), options, ajaxOptions);
    }

    /**
     * Creates a new source page
     * @param {object} payload - Page creation data (binderId, sourcePageName, studyArmId)
     * @param {object} ajaxOptions - Additional AJAX options
     * @returns {Promise}
     */
    function createNewPage(payload, ajaxOptions) {
        return postJson(BASE_PATH, '/CreateNewPage/', payload, ajaxOptions);
    }

    /**
     * Clones a source page to another binder
     * @param {object} payload - Clone data (sourcePageId, destBinderId, replacementStudyArmId, replacementName)
     * @param {object} ajaxOptions - Additional AJAX options
     * @returns {Promise}
     */
    function clonePage(payload, ajaxOptions) {
        return postJson(BASE_PATH, '/ClonePage', payload, ajaxOptions, 30000);
    }

    /**
     * Gets elements for a page
     * @param {number} pageId - Page ID
     * @param {object} ajaxOptions - Additional AJAX options
     * @returns {Promise}
     */
    function getPageElements(pageId, ajaxOptions) {
        return getJson(BASE_PATH, '/GetPageElements/' + encodeURIComponent(pageId), null, ajaxOptions);
    }

    /**
     * Gets elements for a page (alias of getPageElements)
     * @param {number} pageId - Page ID
     * @param {object} ajaxOptions - Additional AJAX options
     * @returns {Promise}
     */
    function getElementsForPage(pageId, ajaxOptions) {
        return getJson(BASE_PATH, '/GetElementsForPage/' + encodeURIComponent(pageId), null, ajaxOptions);
    }

    /**
     * Gets element order for a page
     * @param {number} pageId - Page ID
     * @param {object} ajaxOptions - Additional AJAX options
     * @returns {Promise}
     */
    function getElementsOrderForPage(pageId, ajaxOptions) {
        return getJson(BASE_PATH, '/GetElementsOrderForPage/' + encodeURIComponent(pageId), null, ajaxOptions);
    }

    /**
     * Reorders elements on a page
     * @param {number} pageId - Page ID
     * @param {object} options - Query parameters (returnOrderOnly)
     * @param {object} ajaxOptions - Additional AJAX options
     * @returns {Promise}
     */
    function reorderElements(pageId, options, ajaxOptions) {
        var path = '/ReorderElements/' + encodeURIComponent(pageId);
        var url = buildUrl(BASE_PATH, path, options);
        return ajaxJson(
            {
                url: url,
                method: 'POST',
                timeout: 15000
            },
            ajaxOptions
        );
    }

    /**
     * Downloads a page as PDF (v1)
     * @param {number} pageId - Page ID
     * @param {object} ajaxOptions - Additional AJAX options
     * @returns {Promise}
     */
    function downloadPagePdf(pageId, ajaxOptions) {
        return $.ajax(
            Object.assign(
                {
                    url: buildUrl(BASE_PATH, '/DownloadPagePdf/' + encodeURIComponent(pageId)),
                    method: 'GET',
                    xhrFields: {
                        responseType: 'blob'
                    },
                    timeout: 60000
                },
                ajaxOptions || {}
            )
        ).done(function (blob) {
            // Trigger download
            var url = window.URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'page-' + pageId + '.pdf';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        });
    }

    /**
     * Downloads a page as PDF (v2 - new method)
     * @param {number} pageId - Page ID
     * @param {object} ajaxOptions - Additional AJAX options
     * @returns {Promise}
     */
    function downloadPagePdfV2(pageId, ajaxOptions) {
        return $.ajax(
            Object.assign(
                {
                    url: buildUrl(BASE_PATH_V2, '/DownloadPagePdf/' + encodeURIComponent(pageId)),
                    method: 'GET',
                    xhrFields: {
                        responseType: 'blob'
                    },
                    timeout: 60000
                },
                ajaxOptions || {}
            )
        ).done(function (blob) {
            // Trigger download
            var url = window.URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'page-' + pageId + '-v2.pdf';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        });
    }

    /**
     * Gets permissions for a page
     * @param {number} pageId - Page ID
     * @param {object} ajaxOptions - Additional AJAX options
     * @returns {Promise}
     */
    function getPagePermissions(pageId, ajaxOptions) {
        return getJson(BASE_PATH, '/GetPagePermissions/' + encodeURIComponent(pageId), null, ajaxOptions);
    }

    /**
     * Gets a specific user's permissions for a page
     * @param {number} pageId - Page ID
     * @param {number} userId - User ID
     * @param {object} ajaxOptions - Additional AJAX options
     * @returns {Promise}
     */
    function getUserPagePermissions(pageId, userId, ajaxOptions) {
        return getJson(BASE_PATH, '/GetUserPagePermissions/' + encodeURIComponent(pageId) + '/user/' + encodeURIComponent(userId), null, ajaxOptions);
    }

    /**
     * Adds reviewer permissions to a page
     * @param {number} pageId - Page ID
     * @param {object} payload - Payload with userId
     * @param {object} ajaxOptions - Additional AJAX options
     * @returns {Promise}
     */
    function addReviewerPermissions(pageId, payload, ajaxOptions) {
        return postJson(BASE_PATH, '/AddReviewerPermissions/' + encodeURIComponent(pageId), payload, ajaxOptions);
    }

    /**
     * Removes reviewer permissions from a page
     * @param {number} pageId - Page ID
     * @param {object} payload - Payload with userId
     * @param {object} ajaxOptions - Additional AJAX options
     * @returns {Promise}
     */
    function removeReviewerPermissions(pageId, payload, ajaxOptions) {
        return postJson(BASE_PATH, '/RemoveReviewerPermissions/' + encodeURIComponent(pageId), payload, ajaxOptions);
    }

    /**
     * Adds editor permissions to a page
     * @param {number} pageId - Page ID
     * @param {object} payload - Payload with userId
     * @param {object} ajaxOptions - Additional AJAX options
     * @returns {Promise}
     */
    function addEditorPermissions(pageId, payload, ajaxOptions) {
        return postJson(BASE_PATH, '/AddEditorPermissions/' + encodeURIComponent(pageId), payload, ajaxOptions);
    }

    /**
     * Removes editor permissions from a page
     * @param {number} pageId - Page ID
     * @param {object} payload - Payload with userId
     * @param {object} ajaxOptions - Additional AJAX options
     * @returns {Promise}
     */
    function removeEditorPermissions(pageId, payload, ajaxOptions) {
        return postJson(BASE_PATH, '/RemoveEditorPermissions/' + encodeURIComponent(pageId), payload, ajaxOptions);
    }

    /**
     * Gets the next page revision
     * @param {number} pageId - Page ID
     * @param {object} ajaxOptions - Additional AJAX options
     * @returns {Promise}
     */
    function getNextPageRevision(pageId, ajaxOptions) {
        return getJson(BASE_PATH, '/GetNextPageRevision/' + encodeURIComponent(pageId), null, ajaxOptions);
    }

    /**
     * Gets the most current page version
     * @param {number} pageId - Page ID
     * @param {object} ajaxOptions - Additional AJAX options
     * @returns {Promise}
     */
    function getMostCurrentPageVersion(pageId, ajaxOptions) {
        return getJson(BASE_PATH, '/GetMostCurrentPageVersion/' + encodeURIComponent(pageId), null, ajaxOptions);
    }

    /**
     * Upgrades a page to a new version
     * @param {number} pageId - Page ID
     * @param {object} ajaxOptions - Additional AJAX options
     * @returns {Promise}
     */
    function upgradePage(pageId, ajaxOptions) {
        return postJson(BASE_PATH, '/UpgradePage/' + encodeURIComponent(pageId), {}, ajaxOptions);
    }

    /**
     * Rescinds a source page
     * @param {number} pageId - Page ID
     * @param {object} payload - Payload with previousTxnId (optional)
     * @param {object} ajaxOptions - Additional AJAX options
     * @returns {Promise}
     */
    function rescindSourcePage(pageId, payload, ajaxOptions) {
        return postJson(BASE_PATH, '/RescindSourcePage/' + encodeURIComponent(pageId), payload, ajaxOptions);
    }

    return {
        renderPage: renderPage,
        getPage: getPage,
        createNewPage: createNewPage,
        clonePage: clonePage,
        getPageElements: getPageElements,
        getElementsForPage: getElementsForPage,
        getElementsOrderForPage: getElementsOrderForPage,
        reorderElements: reorderElements,
        downloadPagePdf: downloadPagePdf,
        downloadPagePdfV2: downloadPagePdfV2,
        getPagePermissions: getPagePermissions,
        getUserPagePermissions: getUserPagePermissions,
        addReviewerPermissions: addReviewerPermissions,
        removeReviewerPermissions: removeReviewerPermissions,
        addEditorPermissions: addEditorPermissions,
        removeEditorPermissions: removeEditorPermissions,
        getNextPageRevision: getNextPageRevision,
        getMostCurrentPageVersion: getMostCurrentPageVersion,
        upgradePage: upgradePage,
        rescindSourcePage: rescindSourcePage
    };
})(jQuery);
