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
Ext.define('EdiromOnline.view.webSocket.WebSocket', {

    extend: 'Ext.container.Container',

    alias: 'widget.webSocket',

    requires: [
    ],

    items: [],

    initComponent: function () {
        var me = this;

        let webSocketJsElement = document.createElement("script");
        webSocketJsElement.setAttribute("defer", "defer");
        webSocketJsElement.setAttribute("src", "resources/webcomponents/webSocket/webSocketElement.js")
        document.querySelector("head").appendChild(webSocketJsElement);

        me.html = `<edirom-web-socket id="web-socket"></edirom-web-socket>`;

        me.callParent();

    },

    close: function () {
        this.hide();
    }
});