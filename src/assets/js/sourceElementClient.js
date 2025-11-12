var SourceElementClient = (function ($) {
    'use strict';

    var BASE_PATH = '/api/v1/source';

    function buildUrl(path, query) {
        var url = BASE_PATH + path;
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

    function postJson(path, data, overrides, timeout) {
        return ajaxJson(
            {
                url: buildUrl(path),
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(data || {}),
                timeout: timeout || 20000
            },
            overrides
        );
    }

    function getJson(path, query, overrides, timeout) {
        return ajaxJson(
            {
                url: buildUrl(path, query),
                method: 'GET',
                timeout: timeout || 15000
            },
            overrides
        );
    }

    /**
     * Renders element HTML from element data
     * @param {string} elementData - Element data as string
     * @param {object} ajaxOptions - Additional AJAX options
     * @returns {Promise}
     */
    function renderElementHtmlFromData(elementData, ajaxOptions) {
        return $.ajax(
            Object.assign(
                {
                    url: buildUrl('/RenderElementHtml/'),
                    method: 'POST',
                    contentType: 'text/plain',
                    data: elementData,
                    dataType: 'html',
                    timeout: 15000
                },
                ajaxOptions || {}
            )
        );
    }

    /**
     * Renders element HTML by element ID
     * @param {number} elementId - Element ID
     * @param {object} ajaxOptions - Additional AJAX options
     * @returns {Promise}
     */
    function renderElementHtmlById(elementId, ajaxOptions) {
        return $.ajax(
            Object.assign(
                {
                    url: buildUrl('/RenderElementHtml/' + encodeURIComponent(elementId)),
                    method: 'GET',
                    dataType: 'html',
                    timeout: 15000
                },
                ajaxOptions || {}
            )
        );
    }

    /**
     * Gets the clone parent of an element
     * @param {number} elementId - Element ID
     * @param {object} options - Query parameters (includePageInfo)
     * @param {object} ajaxOptions - Additional AJAX options
     * @returns {Promise}
     */
    function getCloneParentElement(elementId, options, ajaxOptions) {
        return getJson('/GetCloneParentElement/' + encodeURIComponent(elementId), options, ajaxOptions);
    }

    /**
     * Gets an element by ID
     * @param {number} elementId - Element ID
     * @param {object} options - Query parameters (includePageInfo)
     * @param {object} ajaxOptions - Additional AJAX options
     * @returns {Promise}
     */
    function getElement(elementId, options, ajaxOptions) {
        return getJson('/GetElement/' + encodeURIComponent(elementId), options, ajaxOptions);
    }

    /**
     * Clones an element to a new page
     * @param {number} elementId - Element ID
     * @param {object} options - Query parameters (newPageId, order, disassociate)
     * @param {object} ajaxOptions - Additional AJAX options
     * @returns {Promise}
     */
    function cloneElement(elementId, options, ajaxOptions) {
        var path = '/CloneElement/' + encodeURIComponent(elementId);
        var url = buildUrl(path, options);
        return ajaxJson(
            {
                url: url,
                method: 'POST',
                timeout: 20000
            },
            ajaxOptions
        );
    }

    /**
     * Creates a new element
     * @param {object} payload - Element creation properties
     * @param {object} ajaxOptions - Additional AJAX options
     * @returns {Promise}
     */
    function createElement(payload, ajaxOptions) {
        return postJson('/CreateElement', payload, ajaxOptions);
    }

    /**
     * Updates an element
     * @param {number} elementId - Element ID
     * @param {object} payload - Element properties to update
     * @param {object} options - Query parameters (updateMethod)
     * @param {object} ajaxOptions - Additional AJAX options
     * @returns {Promise}
     */
    function updateElement(elementId, payload, options, ajaxOptions) {
        var path = '/UpdateElement/' + encodeURIComponent(elementId);
        var url = buildUrl(path, options);
        return $.ajax(
            Object.assign(
                {
                    url: url,
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(payload || {}),
                    dataType: 'json',
                    timeout: 20000
                },
                ajaxOptions || {}
            )
        );
    }

    /**
     * Updates element order on a page
     * @param {number} elementId - Element ID
     * @param {object} options - Query parameters (order, returnOrderOnly)
     * @param {object} ajaxOptions - Additional AJAX options
     * @returns {Promise}
     */
    function updateElementOrder(elementId, options, ajaxOptions) {
        var path = '/UpdateElementOrder/' + encodeURIComponent(elementId);
        var url = buildUrl(path, options);
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
     * Deletes an element (soft delete)
     * @param {number} elementId - Element ID
     * @param {object} ajaxOptions - Additional AJAX options
     * @returns {Promise}
     */
    function deleteElement(elementId, ajaxOptions) {
        return postJson('/DeleteElement/' + encodeURIComponent(elementId), {}, ajaxOptions);
    }

    /**
     * Recovers a deleted element
     * @param {number} elementId - Element ID
     * @param {object} ajaxOptions - Additional AJAX options
     * @returns {Promise}
     */
    function recoverElement(elementId, ajaxOptions) {
        return postJson('/RecoverElement/' + encodeURIComponent(elementId), {}, ajaxOptions);
    }

    /**
     * Disassociates a clone from its parent
     * @param {number} elementId - Element ID
     * @param {object} ajaxOptions - Additional AJAX options
     * @returns {Promise}
     */
    function disassociateClone(elementId, ajaxOptions) {
        return postJson('/DisassociateClone/' + encodeURIComponent(elementId), {}, ajaxOptions);
    }

    /**
     * Approves an element in review
     * @param {number} elementId - Element ID
     * @param {object} ajaxOptions - Additional AJAX options
     * @returns {Promise}
     */
    function reviewApproveElement(elementId, ajaxOptions) {
        return postJson('/ReviewApproveElement/' + encodeURIComponent(elementId), {}, ajaxOptions);
    }

    /**
     * Queries an element in review
     * @param {number} elementId - Element ID
     * @param {object} payload - Query payload with notes
     * @param {object} ajaxOptions - Additional AJAX options
     * @returns {Promise}
     */
    function reviewQueryElement(elementId, payload, ajaxOptions) {
        return postJson('/ReviewQueryElement/' + encodeURIComponent(elementId), payload, ajaxOptions);
    }

    /**
     * Gets the default label for an element
     * @param {number} elementId - Element ID
     * @param {object} ajaxOptions - Additional AJAX options
     * @returns {Promise}
     */
    function getDefaultLabel(elementId, ajaxOptions) {
        return getJson('/GetDefaultLabel/' + encodeURIComponent(elementId), null, ajaxOptions);
    }

    /**
     * Gets all clones of an element
     * @param {number} elementId - Element ID
     * @param {object} options - Query parameters (includeParent)
     * @param {object} ajaxOptions - Additional AJAX options
     * @returns {Promise}
     */
    function getAllClonesOfElement(elementId, options, ajaxOptions) {
        return getJson('/GetAllClonesOfElement/' + encodeURIComponent(elementId), options, ajaxOptions);
    }

    /**
     * Gets a clone upgrade report for an element
     * @param {number} elementId - Element ID
     * @param {object} ajaxOptions - Additional AJAX options
     * @returns {Promise}
     */
    function getCloneUpgradeReport(elementId, ajaxOptions) {
        return getJson('/GetCloneUpgradeReport/' + encodeURIComponent(elementId), null, ajaxOptions);
    }

    return {
        renderElementHtmlFromData: renderElementHtmlFromData,
        renderElementHtmlById: renderElementHtmlById,
        getCloneParentElement: getCloneParentElement,
        getElement: getElement,
        cloneElement: cloneElement,
        createElement: createElement,
        updateElement: updateElement,
        updateElementOrder: updateElementOrder,
        deleteElement: deleteElement,
        recoverElement: recoverElement,
        disassociateClone: disassociateClone,
        reviewApproveElement: reviewApproveElement,
        reviewQueryElement: reviewQueryElement,
        getDefaultLabel: getDefaultLabel,
        getAllClonesOfElement: getAllClonesOfElement,
        getCloneUpgradeReport: getCloneUpgradeReport
    };
})(jQuery);
