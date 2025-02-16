xquery version "3.1";
(:
  Edirom Online
  Copyright (C) 2011 The Edirom Project
  http://www.edirom.de

  Edirom Online is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  Edirom Online is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with Edirom Online.  If not, see <http://www.gnu.org/licenses/>.

  ID: $Id: edition.xqm 1334 2012-06-14 12:40:33Z daniel $
:)


(:~
: This module provides library functions for Editions
:
: @author <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
:)
module namespace edition = "http://www.edirom.de/xquery/edition";

declare namespace edirom="http://www.edirom.de/ns/1.3";
declare namespace xlink="http://www.w3.org/1999/xlink";

import module namespace functx="http://www.functx.com";
(:~
: Returns a JSON representation of an Edition
:
: @param $uri The URI of the Edition's document to process
: @return The JSON representation
:)
declare function edition:toJSON($uri as xs:string) as xs:string {
    
    let $edition := doc($uri)/edirom:edition
    return
        concat('
            {',
                'id: "', $edition/string(@xml:id), '", ',
                'doc: "', $uri, '", ',
                'name: "', $edition/edirom:editionName, '"',
            '}')
};

(:~
: Returns a list of URIs pointing to Editions
:
: @return The list of URIs
:)
declare function edition:getUris() as xs:string* {
    
    for $edition in collection('/db/apps')//edirom:edition
    return 'xmldb:exist://' || document-uri($edition/root())
};

(:~
: Returns a list of URIs pointing to referenced Works
:
: @param $uri The URI of the Edition's document to process
: @return The list of URIs
:)
declare function edition:getWorkUris($uri as xs:string) as xs:string* {
    
    doc($uri)//edirom:work/@xlink:href ! string(.)
};

(:~
: Returns the URI for a specific language file
:
: @param $uri The URI of the Edition's document to process
: @param $lang The language
: @return The URI
:)
declare function edition:getLanguageFileURI($uri as xs:string, $lang as xs:string) as xs:string {

    let $doc := (
        if(doc-available($uri))
        then
            doc($uri)
        else
            doc(edition:findEdition($uri))
    )
    return
        if ($doc//edirom:language[@xml:lang eq $lang]/@xlink:href => string() != "")
        then
            $doc//edirom:language[@xml:lang eq $lang]/@xlink:href => string()
        else
            ""
};

(:~
: Returns the URI for a specific language file
:
: @param $uri The URI of the Edition's document to process
: @return the edition's languages as defined in the edition file sorted as
: complete languages in document-order followed by incomplete langauges in document-order
:)
declare function edition:getLanguageCodesSorted($uri as xs:string) as xs:string {
    
    let $editionDoc := doc($uri)
    let $languagesComplete := (
        for $lang in $editionDoc//edirom:language
        let $langCode := $lang/@xml:lang
        let $langComplete := xs:boolean($lang/@complete)
        where $langComplete = true()
        return
            $langCode
    )
    let $languagesIncomplete := (
        for $lang in $editionDoc//edirom:language
        let $langCode := $lang/@xml:lang
        let $langComplete := xs:boolean($lang/@complete)
        where $langComplete = false()
        return
            $langCode
    )
    return
        ($languagesComplete, $languagesIncomplete)
};

(:~
: Returns the URI for the preferences file
:
: @param $uri The URI of the Edition's document to process
: @return The URI of the preference file
:)
declare function edition:getPreferencesURI($uri as xs:string) as xs:string {
    
    doc($uri)//edirom:preferences/@xlink:href => string()
};

(:~
: Returns the URI of the edition specified by the submitted $editionID parameter.
: If $editionID is the empty string, returns the URI of the first edition found in '/db/apps'.
: If the submitted $editionID already qualifies to read a document, return $editionID unaltered.
:
: @param $editionID The '@xml:id' of the edirom:edition document to process
: @return The URI of the Edition file
:)
declare function edition:findEdition($editionID as xs:string?) as xs:string {
    if(not($editionID) or $editionID eq '')
    then(
        let $edition := (collection('/db/apps')//edirom:edition)[1]
        return 'xmldb:exist://' || document-uri($edition/root())
    )
    else if(doc-available($editionID)) (:already a qualified URI :)
        then
            $editionID
    else (
        let $edition := collection('/db/apps')//edirom:edition/id($editionID)
        return 'xmldb:exist://' || document-uri($edition/root())
    )
};

(:~
: Returns the name of the edition specified by $uri
:
: @param $uri The URI of the Edition's document to process
: @return the text contents of edirom:edition/edirom:editionName
:)
declare function edition:getName($uri as xs:string) as xs:string {
  doc($uri)/edirom:edition/edirom:editionName => fn:normalize-space()
};

(:~
: Returns the frontend URI of the edition, e.g. if the edirom:edition file
: submitted via $editionUri is xmldb:exist///db/apps/editionFolder/edition.xml
: and the $contextPath is /exist the string returned woud be /exist/apps/editionFolder
:
: @param $editionUri The xmldb-collection-path of the edition
: @param $contextPath the request:get-context-path() of the frontend
:
: @return xs:string
:)
declare function edition:getFrontendUri($editionUri as xs:string, $contextPath as xs:string) as xs:string {
    let $editionContext := functx:substring-before-last(substring-after($editionUri, 'xmldb:exist:///db/'), '/')
    return
        string-join(($contextPath, $editionContext), '/')
};
