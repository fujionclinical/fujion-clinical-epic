'use strict';

define('fcf-epic', ['fcf-epic-css'], function() {

    var AglAction = {
        /**
         * Performs the initial handshake with the AGL web service, returning an access token to accompany future requests.
         */
        INITIAL_HANDSHAKE: "Epic.Clinical.Informatics.Web.InitiateHandshake",
        /**
         * Places an order in the Epic EMR.
         */
        POST_ORDER: "Epic.Clinical.Informatics.Web.PostOrder",
        /**
         * Removes an order which triggered search.
         */
        REMOVE_TRIGGER_ORDER: "Epic.Clinical.Informatics.Web.RemoveTriggerOrder",
        /**
         * Removes order(s) in BPA web service workflow.
         */
        REMOVE_SPECIFIED_ORDER: "Epic.Clinical.Informatics.Web.RemoveSpecifiedOrder",
        /**
         * Replaces one order with another.
         */
        REPLACE_UNSIGNED_ORDER: "Epic.Clinical.Informatics.Web.ReplaceUnsignedOrder",
        /**
         * Posts a value to a flowsheet row.
         */
        POST_FLOWSHEET_ROW: "Epic.Clinical.Informatics.Web.PostFlowsheetRow",
        /**
         * Opens an external browser window.
         */
        OPEN_EXTERNAL_WINDOW: "Epic.Clinical.Informatics.Web.OpenExternalWindow",
        /**
         * Closes the current AGL activity.
         */
        CLOSE_ACTIVITY: "Epic.Clinical.Informatics.Web.CloseActivity",
        /**
         * Closes the current activity and aborts the signing process.
         */
        CLOSE_AND_CANCEL: "Epic.Clinical.Informatics.Web.CloseAndCancel",
        /**
         * Closes the current activity and continues the signing process.
         */
        CLOSE_AND_CONTINUE: "Epic.Clinical.Informatics.Web.CloseAndContinue",
        /**
         * Saves some state in case of hibernation.
         */
        SAVE_STATE: "Epic.Clinical.Informatics.Web.SaveState",
        /**
         * Launches an Epic activity (Epic 2018+).
         */
        LAUNCH_ACTIVITY: "Epic.Clinical.Informatics.Web.LaunchActivity"
    };

    var HEADER =
        '<div class="fcf-epic-header">' +
            '<span></span>' +
            '<span class="fa fa-shopping-cart"></span>' +
            '<span class="badge badge-pill badge-primary"></span>' +
        '</div>';

    var agl_sessions = [];

    var okResponse = {actionExecuted: true, errorCodes: []};

    function messageListener(event) {
        var request = event.data;

        if (!request || !request.action || !event.source) {
            return;
        }

        var session = getSession(event.source);

        console.log('Received AGL Request: ' + JSON.stringify(request, null, 2));
        var response;

        switch (request.action) {
            case AglAction.INITIAL_HANDSHAKE:
                response = initialHandshake(request, session);
                break;

            case AglAction.POST_ORDER:
                response = validate(request, session) || postOrder(request, session);
                break;

            case AglAction.REMOVE_TRIGGER_ORDER:
                response = validate(request, session) || removeTriggerOrder(request, session);
                break;

            case AglAction.REMOVE_SPECIFIED_ORDER:
                response = validate(request, session) || removeSpecifiedOrder(request, session);
                break;

            case AglAction.REPLACE_UNSIGNED_ORDER:
                response = validate(request, session) || replaceUnsignedOrder(request, session);
                break;

            case AglAction.POST_FLOWSHEET_ROW:
                response = validate(request, session) || postFlowsheetRow(request, session);
                break;

            case AglAction.OPEN_EXTERNAL_WINDOW:
                response = validate(request, session) || openExternalWindow(request, session);
                break;

            case AglAction.CLOSE_ACTIVITY:
                response = validate(request, session) || closeActivity(request, session);
                break;

            case AglAction.CLOSE_AND_CANCEL:
                response = validate(request, session) || closeAndCancel(request, session);
                break;

            case AglAction.CLOSE_AND_CONTINUE:
                response = validate(request, session) || closeAndContinue(request, session);
                break;

            case AglAction.SAVE_STATE:
                response = validate(request, session) || saveState(request, session);
                break;

            case AglAction.LAUNCH_ACTIVITY:
                response = validate(request, session) || launchActivity(request, session);
                break;

            default:
                response = badRequest(request, session);
        }

        response.errorCodes = response.errorCodes || [];
        console.log('Sent AGL Response: ' + JSON.stringify(response, null, 2));
        sendResponse(response, session);
    }

    function getSession(source) {
        var session = _.find(agl_sessions, function (s) {
            return s.source === source;
        });

        if (!session) {
            var header = $(HEADER).hide().insertBefore(getIFrame(source));
            session = {source: source, cart: [], header: header};
            agl_sessions.push(session);
            header.find('.fa').tooltip({
                html: true,
                title: function() {return '<span class="text-monospace">' + session.cart.join('\n') + '</span>'}
            });
        }

        return session;
    }

    function updateHeader(session) {
        var cart = session.cart,
            header = session.header;
        cart.length ? header.show() : header.hide();
        header.find('.badge').text(cart.length);
    }

    function initialHandshake(request, session) {
        session.token = createToken();
        session.cart.length = 0;
        session.header.hide();

        return {
            actionExecuted: true,
            token: session.token,
            actions: _.values(AglAction),
            version: '10.0',
            state: session.state
        }
    }

    function validate(request, session) {
        if (request.token == null) {
            return badRequest(request, 'No token in request.');
        } else if (request.token !== session.token) {
            return badRequest(request, 'Bad AGL token: ' + request.token)
        } else {
            return null;
        }
    }

    function postOrder(request, session) {
        if (!request.args || request.args.OrderKey == null) {
            return badRequest(request, 'No order key in request.', [0]);
        } else {
            session.cart.push('Order for key ' + request.args.OrderKey);
            updateHeader(session);
            return okResponse;
        }
    }

    function removeTriggerOrder(request) {
        if (request.args) {
            return badRequest(request, request.action + ' requires no arguments.  The following arguments were provided: ' + request.args);
        } else {
            return okResponse;
        }
    }

    function removeSpecifiedOrder(request) {
        if (typeof request.args !== 'string') {
            return badRequest(request, 'Bad or missing arguments provided for ' + request.action);
        } else {
            return okResponse;
        }
    }

    function replaceUnsignedOrder(request) {
        if (!request.args || _.keys(request.args).length === 0) {
            return badRequest(request, 'No arguments provided for ' + request.action);
        } else {
            return okResponse;
        }
    }

    function postFlowsheetRow(request) {
        if (!request.args || request.args.RowValue == null) {
            return badRequest(request, request.action + ' requires a RowValue.');
        } else {
            return okResponse;
        }
    }

    function openExternalWindow(request) {
        if (typeof request.args !== 'string' && !Array.isArray(request.args)) {
            return badRequest(request, request.action + ' requires a destination URL.');
        } else {
            var args = Array.isArray(request.args) ? request.args : [request.args]
            window.open.apply(window, args);
            return okResponse;
        }
    }

    function closeActivity(request, session) {
        return close(request, session);
    }

    function closeAndCancel(request, session) {
        return close(request, session);
    }

    function closeAndContinue(request, session) {
        return close(request, session);
    }

    function close(request, session) {
        session.token = null;
        session.state = null;
        session.cart = [];
        updateHeader(session);
        var iframe = getIFrame(session.source);

        if (iframe) {
            iframe.src = 'about:blank';
            return okResponse;
        } else {
            return badRequest(request, 'No iframe found for the request.')
        }
    }

    function getIFrame(source) {
        return _.find(window.document.getElementsByTagName('iframe'), function(iframe) {
            return iframe.contentWindow === source;
        });
    }

    function saveState(request, session) {
        session.state = request.args;
        return okResponse;
    }

    function launchActivity(request) {
        if (!request.args || request.args.ActivityKey == null) {
            return badRequest(request, request.action + ' requires an ActivityKey.')
        } else {
            alert('Received AGL launch activity request: ' + request.args.ActivityKey);
            return okResponse
        }
    }

    /**
     * For requests that are unrecognized or invalid.
     *
     * @param request The AGL request.
     * @param error Optional error text.  If not provided, default error text will be used.
     * @param errorCodes Optional array of error codes.
     */
    function badRequest(request, error, errorCodes) {
        return {
            actionExecuted: false,
            error: error || 'Bad request: ' + JSON.stringify(request, null, 2),
            errorCodes: errorCodes
        };
    }

    function createToken() {
        return (Math.random() * 1e32).toString(36);
    }

    /**
     * Send a response back to the iframe window.
     *
     * @param response The AGL response.
     */
    function sendResponse(response, session) {
        if (response) {
            session.source.postMessage(response, '*');
        }
    }

    window.addEventListener('message', messageListener, false);
});
