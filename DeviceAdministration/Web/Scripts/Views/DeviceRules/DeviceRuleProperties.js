﻿IoTApp.createModule('IoTApp.DeviceRuleProperties', function () {
    "use strict";

    var self = this;

    var init = function (deviceId, ruleId, updateCallback) {
        self.updateCallback = updateCallback;
        getRulePropertiesView(deviceId, ruleId);
    }

    var getRulePropertiesView = function (deviceId, ruleId) {
        $('#loadingElement').show();
        self.deviceId = deviceId;
        self.ruleId = ruleId;

        $.ajaxSetup({ cache: false });
        $.get('/DeviceRules/GetRuleProperties', { deviceId: deviceId, ruleId: ruleId }, function (response) {
            if (!$(".details_grid").is(':visible')) {
                IoTApp.DeviceRulesIndex.toggleProperties();
            }
            onRulePropertiesDone(response);
        }).fail(function (response) {
            $('#loadingElement').hide();
            renderRetryError(resources.unableToRetrieveRuleFromService, $('#details_grid_container'), function () { getRulePropertiesView(deviceId, ruleId); });
        });
    }

    var onRulePropertiesDone = function (html) {
        $('#loadingElement').hide();
        $('#details_grid_container').empty();
        $('#details_grid_container').html(html);

        setDetailsPaneLoaderHeight();
    }

    var setDetailsPaneLoaderHeight = function () {
        /* Set the height of the Device Details progress animation background to accommodate scrolling */
        var progressAnimationHeight = $("#details_grid_container").height() + $(".grid_subhead.button_details_grid").outerHeight();

        $(".loader_container_details").height(progressAnimationHeight);
    };

    var renderRetryError = function (errorMessage, container, retryCallback) {
        var $wrapper = $('<div />');
        var $paragraph = $('<p />');

        $wrapper.addClass('device_detail_error');
        $wrapper.append($paragraph);
        var node = document.createTextNode(errorMessage);
        $paragraph.append(node);

        var button = $('<button>' + resources.retry + '</button>');

        button.on("click", function () {
            retryCallback();
        });

        $wrapper.append(button);
        container.html($wrapper);
    }

    var onBegin = function () {
        $('#button_rule_status').attr("disabled", "disabled");
    }

    var onSuccess = function (result) {
        $('#button_rule_status').removeAttr("disabled");
        if (result.success) {
            self.updateCallback();
        } else if (result.error) {
            IoTApp.Helpers.Dialog.displayError(result.error);
        } else {
            IoTApp.Helpers.Dialog.displayError(resources.ruleUpdateError);
        }
    }

    var onFailure = function (result) {
        $('#button_rule_status').removeAttr("disabled");
        IoTApp.Helpers.Dialog.displayError(resources.ruleUpdateError);
    }

    var onComplete = function () {
        $('#loadingElement').hide();
    }

    return {
        init: init,
        onBegin: onBegin,
        onSuccess: onSuccess,
        onFailure: onFailure,
        onComplete: onComplete
    }
}, [jQuery, resources]);
