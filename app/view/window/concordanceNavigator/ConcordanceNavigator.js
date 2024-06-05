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
Ext.define('EdiromOnline.view.window.concordanceNavigator.ConcordanceNavigator', {

    extend: 'Ext.window.Window',

    mixins: {
        observable: 'Ext.util.Observable'
    },

    alias: 'widget.concordanceNavigator',

    requires: [
        'Ext.button.Button',
        'Ext.container.Container',
        'Ext.form.Label',
        'Ext.form.field.Text',
        'EdiromOnline.view.utils.EnhancedSlider'
    ],

    stateful: false,
    isWindow: true,
    //closeAction: 'hide',
    constrainHeader: true,
    minimizable: false,
    maximizable: false,
    closable: true,
    resizeHandles: 'e w',
    shadow: false,

    layout: 'anchor',
    border: 0,
    bodyBorder: false,

    padding: 0,


    bodyPadding: '12',

    cls: 'ediromConcordanceNavigatorWindow ediromWindow',

    defaults: {
        border: false
    },

    items: [],

    expandedHeight: 230,
    collapsedHeight: 165,

    width: 250,
    height: 465,
    x: 250,
    y: 200,

    initComponent: function () {
        var me = this;

        me.title = getLangString('view.window.concordanceNavigator.ConcordanceNavigator_Title');

        me.showConnectionButtonLabel = getLangString('view.window.concordanceNavigator.ConcordanceNavigator_Show');

        let concordanceNavigatorJsElement = document.createElement("script");
        concordanceNavigatorJsElement.setAttribute("defer", "defer");
        concordanceNavigatorJsElement.setAttribute("src", "resources/webcomponents/concordanceNavigator/concordanceNavigatorElement.js")
        document.querySelector("head").appendChild(concordanceNavigatorJsElement);


        me.html = `<edirom-concordance-navigator id="${me.id}-concordance-navigator" data-show-connection-button-label="${me.showConnectionButtonLabel}"></edirom-concordance-navigator>`;

        me.callParent();

    },

    setConcordances: function (concordanceStore) {
        var me = this;
        const ediromConcordanceNavigator = document.querySelector(`#${me.id}-concordance-navigator`);
        let concordanceStoreRaw = [];
        for (let concordance of concordanceStore.data.items) {
            concordanceStoreRaw.push(concordance.raw);
        }

        ediromConcordanceNavigator.setAttribute("data-concordances", JSON.stringify(concordanceStoreRaw));
    }
});