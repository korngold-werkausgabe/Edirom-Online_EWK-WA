/**
 *  Edirom Online
 *  Copyright (C) 2014 The Edirom Project
 *  http://www.edirom.de
 *
 *  Edirom Online is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  Edirom Online is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with Edirom Online.  If not, see <http://www.gnu.org/licenses/>.
 */
Ext.define('EdiromOnline.controller.webSocket.WebSocket', {

    extend: 'Ext.app.Controller',

    navwin: null,

    views: [
        'webSocket.WebSocket'
    ],

    init: function () {
        this.control({
            'webSocket': {
                render: this.onRendered
            }
        });
    },

    onRendered: function (component) {
        var me = this;

        if (component.initialized) return;
        component.initialized = true;

        var app = me.application;
        me.ediromWebSocket = document.querySelector("#web-socket");
        console.log("Element:");
        console.log(me.ediromWebSocket);
        me.ediromWebSocket.addEventListener('received-message', function (e) {
            console.log("Received Event!");
            console.log("detail:");
            console.log(e.detail);
            var plist = e.detail.links;
            var linkController = app.getController('LinkController');
            linkController.loadLink(plist, { useExisting: true, onlyExisting: false });
        });
    },
});