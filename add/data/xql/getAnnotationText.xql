xquery version "1.0";
(:
 : For LICENSE-Details please refer to the LICENSE file in the root directory of this repository. 
:)

(:~
    Returns the HTML for the textual content of a specific annotation for an AnnotationView.
    
    @author <a href="mailto:kepper@edirom.de">Johannes Kepper</a>
:)

(: IMPORTS ================================================================= :)

import module namespace annotation = "http://www.edirom.de/xquery/annotation" at "../xqm/annotation.xqm";
import module namespace eutil = "http://www.edirom.de/xquery/eutil" at "../xqm/eutil.xqm";

declare namespace request="http://exist-db.org/xquery/request";
declare namespace mei="http://www.music-encoding.org/ns/mei";
declare namespace edirom_image="http://www.edirom.de/ns/image";

declare namespace xmldb="http://exist-db.org/xquery/xmldb";
declare namespace output = "http://www.w3.org/2010/xslt-xquery-serialization";

declare option output:method "xhtml";
declare option output:media-type "text/html";

declare variable $lang := request:get-parameter('lang', '');


let $edition := request:get-parameter('edition', '')
let $uri := request:get-parameter('uri', '')
let $docUri := substring-before($uri, '#')
let $internalId := substring-after($uri, '#')
let $doc := doc($docUri)
let $annot := $doc/id($internalId)

return
    
    <div class="annotView">
        <div class="contentBox">
            <h1>{eutil:getLocalizedName($annot, $lang)}</h1>
            {annotation:getContent($annot, '', $edition)} 
        </div>
    </div>