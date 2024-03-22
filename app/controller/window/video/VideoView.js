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
Ext.define('EdiromOnline.controller.window.video.VideoView', {

    extend: 'Ext.app.Controller',

    views: [
        'window.video.VideoView'
    ],

    init: function () {
        this.control({
            'videoView': {
                afterlayout: this.onAfterLayout
            }
        });
    },

    onAfterLayout: function (view) {

        var me = this;

        if (view.initialized) return;
        view.initialized = true;

        var uri = view.uri;
        var type = view.type;

        this.getVideoUrl('data/xql/getVideoSrc.xql?uri=' + uri);
        view.setSrc(this.videoUrl);
    },

    getVideoUrl: function (requestUrl) {
        Ext.Ajax.request({
            url: requestUrl,
            async: false,
            method: 'GET',
            dataType: "text",
            success: function (response) {
                this.videoUrl = response.responseText;
            },
            scope: this
        });
    }

});