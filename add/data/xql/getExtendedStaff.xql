xquery version "3.0";

declare namespace request="http://exist-db.org/xquery/request";
declare namespace mei="http://www.music-encoding.org/ns/mei";

declare namespace tei="http://www.tei-c.org/ns/1.0";
declare namespace xmldb="http://exist-db.org/xquery/xmldb";
declare namespace system="http://exist-db.org/xquery/system";
declare namespace transform="http://exist-db.org/xquery/transform";

import module namespace eutil = "http://www.edirom.de/xquery/util" at "../xqm/util.xqm";

declare option exist:serialize "method=xhtml media-type=text/html omit-xml-declaration=yes indent=yes";

let $uri := request:get-parameter('uri', '')
let $edition := request:get-parameter('edition', '')
let $basePath := eutil:get-app-base-url()


let $mei := doc($uri)/root()
let $mdivId := $mei//mei:mdiv[1]/data(@xml:id)
return
<html>
    <head>
        <title>Verovio</title>
        <script src="https://www.verovio.org/javascript/latest/verovio-toolkit.js"></script>
        <script src="https://code.jquery.com/jquery-3.5.1.min.js" integrity="sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=" crossorigin="anonymous"></script>
        <script src="//code.iconify.design/1/1.0.6/iconify.min.js"></script>
        <script src="{$basePath}/resources/js/he.js"></script>

        <script src="{$basePath}/resources/js/tipped/tipped.js"></script>
        <link rel="stylesheet" type="text/css" href="{$basePath}/resources/css/tipped/tipped.css"/>
        
        <link rel="stylesheet" type="text/css" href="{$basePath}/resources/css/verovio-view.css"/>
        
    </head>
	<body>
        <div id="output"></div>
        <div id="toolbar" class="noselect">
            <span class="button" onclick="prevPage()">
                <span class="iconify" data-icon="mdi-chevron-left" style="font-size: 1.3em;"></span>
            </span>
            <span id="page">1</span> / <span id="pageCount">1</span>
            <span class="button" onclick="nextPage()">
                <span class="iconify" data-icon="mdi-chevron-right" style="font-size: 1.3em;"></span>
            </span>
        </div>
        <div class='lds-roller'><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
        
        <script>
            var uri = "{$uri}";
            var edition = "{$edition}";
            var movementId = "{$mdivId}";
            var appBasePath = "{$basePath}";
        </script>
        <script src="{$basePath}/resources/js/verovio-view.js"></script>
    </body>
</html>
