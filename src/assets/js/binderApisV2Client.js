var BinderApisV2Client = (function ($) {
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

    function createNewSourceBinderFreeStanding(payload, ajaxOptions) {
        return postJson('/CreateNewSourceBinderFreeStanding', payload, ajaxOptions, 20000);
    }

    function createNewSourceBinderWithStudy(payload, ajaxOptions) {
        return postJson('/CreateNewSourceBinderWithStudy', payload, ajaxOptions, 20000);
    }

    function getBinderPermissions(binderId, ajaxOptions) {
        return getJson('/GetBinderPermissions/' + encodeURIComponent(binderId), null, ajaxOptions);
    }

    function getBinderOwner(binderId, ajaxOptions) {
        return getJson('/GetBinderOwner/' + encodeURIComponent(binderId), null, ajaxOptions);
    }

    function getBinder(binderId, ajaxOptions) {
        return getJson('/GetBinder/' + encodeURIComponent(binderId), null, ajaxOptions);
    }

    function listBinders(ajaxOptions) {
        return getJson('/ListBinders', null, ajaxOptions);
    }

    function getBinderPages(binderId, options, ajaxOptions) {
        var query = options || {};
        return getJson('/GetBinderPages/' + encodeURIComponent(binderId), query, ajaxOptions, 20000);
    }

    function archiveBinder(binderId, payload, ajaxOptions) {
        return postJson('/ArchiveBinder/' + encodeURIComponent(binderId), payload, ajaxOptions, 20000);
    }

    function removeUserFromBinder(binderId, userId, ajaxOptions) {
        var path = '/RemoveUserFromBinder/' + encodeURIComponent(binderId);
        var url = buildUrl(path, { userId: userId });
        return ajaxJson(
            {
                url: url,
                method: 'POST',
                timeout: 15000
            },
            ajaxOptions
        );
    }

    function addUserToBinder(binderId, userId, ajaxOptions) {
        var path = '/AddUserToBinder/' + encodeURIComponent(binderId);
        var url = buildUrl(path, { userId: userId });
        return ajaxJson(
            {
                url: url,
                method: 'POST',
                timeout: 15000
            },
            ajaxOptions
        );
    }

    function setBinderOwner(binderId, userId, ajaxOptions) {
        var path = '/SetBinderOwner/' + encodeURIComponent(binderId);
        var url = buildUrl(path, { userId: userId });
        return ajaxJson(
            {
                url: url,
                method: 'POST',
                timeout: 15000
            },
            ajaxOptions
        );
    }

    function updateBinderProtocolInfo(payload, ajaxOptions) {
        return postJson('/UpdateBinderProtocolInfo', payload, ajaxOptions);
    }

    function updateBinderDescription(payload, ajaxOptions) {
        return postJson('/UpdateBinderDescription', payload, ajaxOptions);
    }

    function updateBinderName(payload, ajaxOptions) {
        return postJson('/UpdateBinderName', payload, ajaxOptions);
    }

    function unarchiveBinder(binderId, payload, ajaxOptions) {
        return postJson('/UnarchiveBinder/' + encodeURIComponent(binderId), payload, ajaxOptions, 20000);
    }

    function getBinderPagesIdList(binderId, ajaxOptions) {
        return getJson('/GetBinderPagesIdList/' + encodeURIComponent(binderId), null, ajaxOptions);
    }

    function getCurrentUserBinderPermission(binderId, ajaxOptions) {
        return getJson('/GetCurrentUserBinderPermission/' + encodeURIComponent(binderId), null, ajaxOptions);
    }

    function getUserBinderPermission(binderId, userId, ajaxOptions) {
        return getJson('/GetUserBinderPermission/' + encodeURIComponent(binderId) + '/user/' + encodeURIComponent(userId), null, ajaxOptions);
    }

    return {
        createNewSourceBinderFreeStanding: createNewSourceBinderFreeStanding,
        createNewSourceBinderWithStudy: createNewSourceBinderWithStudy,
        getBinderPermissions: getBinderPermissions,
        getBinderOwner: getBinderOwner,
        getBinder: getBinder,
        listBinders: listBinders,
        getBinderPages: getBinderPages,
        archiveBinder: archiveBinder,
        unarchiveBinder: unarchiveBinder,
        removeUserFromBinder: removeUserFromBinder,
        addUserToBinder: addUserToBinder,
        setBinderOwner: setBinderOwner,
        updateBinderProtocolInfo: updateBinderProtocolInfo,
        updateBinderDescription: updateBinderDescription,
        updateBinderName: updateBinderName,
        getBinderPagesIdList: getBinderPagesIdList,
        getCurrentUserBinderPermission: getCurrentUserBinderPermission,
        getUserBinderPermission: getUserBinderPermission
    };
})(jQuery);
