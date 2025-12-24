// Copyright 2021 Google LLC. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


'use strict';

CastPlayer.prototype.initializeCastPlayer = function() {

    var options = {};

    // Set the receiver application ID to your own (created in the
    // Google Cast Developer Console), or optionally
    // use the chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID
    options.receiverApplicationId = '79B35A69';//'C0868879';

    // Auto join policy can be one of the following three:
    // ORIGIN_SCOPED - Auto connect from same appId and page origin
    // TAB_AND_ORIGIN_SCOPED - Auto connect from same appId, page origin, and tab
    // PAGE_SCOPED - No auto connect
    options.autoJoinPolicy = chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED;
    options.androidReceiverCompatible = false;

    cast.framework.CastContext.getInstance().setOptions(options);

    let credentialsData = new chrome.cast.CredentialsData("{\"userId\": \"abc\"}");
    cast.framework.CastContext.getInstance().setLaunchCredentialsData(credentialsData);

    this.remotePlayer = new cast.framework.RemotePlayer();
    this.remotePlayerController = new cast.framework.RemotePlayerController(this.remotePlayer);
    this.remotePlayerController.addEventListener(
        cast.framework.RemotePlayerEventType.IS_CONNECTED_CHANGED,
    );
};

/**
 * Makes human-readable message from chrome.cast.Error
 * @param {chrome.cast.Error} error
 * @return {string} error message
 */
CastPlayer.getErrorMessage = function(error) {
    switch (error.code) {
        case chrome.cast.ErrorCode.API_NOT_INITIALIZED:
            return 'The API is not initialized.' +
                (error.description ? ' :' + error.description : '');
        case chrome.cast.ErrorCode.CANCEL:
            return 'The operation was canceled by the user' +
                (error.description ? ' :' + error.description : '');
        case chrome.cast.ErrorCode.CHANNEL_ERROR:
            return 'A channel to the receiver is not available.' +
                (error.description ? ' :' + error.description : '');
        case chrome.cast.ErrorCode.EXTENSION_MISSING:
            return 'The Cast extension is not available.' +
                (error.description ? ' :' + error.description : '');
        case chrome.cast.ErrorCode.INVALID_PARAMETER:
            return 'The parameters to the operation were not valid.' +
                (error.description ? ' :' + error.description : '');
        case chrome.cast.ErrorCode.RECEIVER_UNAVAILABLE:
            return 'No receiver was compatible with the session request.' +
                (error.description ? ' :' + error.description : '');
        case chrome.cast.ErrorCode.SESSION_ERROR:
            return 'A session could not be created, or a session was invalid.' +
                (error.description ? ' :' + error.description : '');
        case chrome.cast.ErrorCode.TIMEOUT:
            return 'The operation timed out.' +
                (error.description ? ' :' + error.description : '');
    }
};


var castPlayer = new CastPlayer();

window['__onGCastApiAvailable'] = function(isAvailable) {
    if (isAvailable) {
        castPlayer.initializeCastPlayer();
    }
};
