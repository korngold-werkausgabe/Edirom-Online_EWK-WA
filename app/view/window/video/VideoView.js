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
Ext.define('EdiromOnline.view.window.video.VideoView', {

    extend: 'EdiromOnline.view.window.View',

    requires: [
    ],

    alias: 'widget.videoView',

    layout: 'fit',

    cls: 'videoView',

    initComponent: function () {

        var me = this;

        let videoplayerJsElement = document.createElement("script");
        videoplayerJsElement.setAttribute("defer", "defer");
        videoplayerJsElement.setAttribute("src", "resources/webcomponents/videoplayer/videoplayerElement.js")
        document.querySelector("head").appendChild(videoplayerJsElement);

        me.html = `<edirom-videoplayer id="${me.id}-videoplayer" state="pause"></edirom-videoplayer>`;

        me.callParent();
    },

    onResize: function (newwidth, newheight, oldWidth, oldHeight) {
        console.log('onResize Event fired!');
        var me = this;
        var contEl = me.el.getById(me.id + '-videoplayer');
        contEl.set({ 'maxsize': newwidth + "x" + newheight });
    },

    setSrc: function (src) {
        var me = this;
        var contEl = me.el.getById(me.id + '-videoplayer');
        contEl.set({ 'src': src });
    },

    setMeasures: function (measureData) {
        console.log('setMeasureData Event fired!');
        var me = this;
        var contEl = me.el.getById(me.id + '-videoplayer');
        contEl.set({ 'measures': measureData });
    },
});