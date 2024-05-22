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
Ext.define('EdiromOnline.controller.SecretController', {

    extend: 'Ext.app.Controller',

    requires: [
        'Ext.Error'
    ],

    init: function() {
        window.getSecret = Ext.bind(this.getSecret, this);
    },

    initSecrets: function(editionURI) {

        Ext.Ajax.request({
            url: 'data/xql/getSecrets.xql',
            async: false,
            method: 'GET',
            params: {
                mode: 'json',
                edition: editionURI
            },success: function(response){
                this.setSecrets(Ext.JSON.decode(response.responseText));
            },
            scope: this
        });
    },

    setSecrets: function(secrets) {
        var me = this;
        me.secrets = secrets;

        for(var key in me.secrets) {
                Ext.Ajax.request({
                    url: me.secrets[key],
                    method: 'GET',
                    success: function(response){
                        eval(response.responseText);
                    },
                    scope: this
                });
        }
    },

    getSecret: function(key, lax) {
        var me = this;

        if(!me.secrets[key] && lax)
            return null;

        if(!me.secrets[key]) {
            Ext.Error.raise({
                msg: 'No secret found with this key',
                key: key,
                level: 'warn' //warn, error, fatal
            });

            return null;
        }

        return me.secrets[key];
    },
    
    // copied from Application.js
    getURLParameter: function(parameter) {
        return decodeURIComponent((new RegExp('[?|&]' + parameter + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
    }
});