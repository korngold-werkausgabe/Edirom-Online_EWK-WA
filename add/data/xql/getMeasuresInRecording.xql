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

  ID: $Id: getMeasuresOnPage.xql 1273 2012-03-09 16:27:21Z daniel $
:)

(:~
    Returns a JSON sequence with all measures on a specific page.
    
    @author <a href="mailto:roewenstrunk@edirom.de">Daniel Röwenstrunk</a>
:)

declare namespace request="http://exist-db.org/xquery/request";
declare namespace mei="http://www.music-encoding.org/ns/mei";
declare namespace xlink="http://www.w3.org/1999/xlink";
declare namespace xmldb="http://exist-db.org/xquery/xmldb";
declare namespace output="http://www.w3.org/2010/xslt-xquery-serialization";

declare option output:method "json";
declare option output:media-type "application/json";

(:~
    Finds all measures on a page.
    
    @param $mei The sourcefile
    @param $surface The surface to look at
    @returns A list of json objects with measure information
:)
declare function local:getMeasures($mei as node()) as map(*)* {

    for $measure in $mei//mei:measure
    let $measureRef := concat('#', string($measure/@xml:id))

    let $clips := $mei//mei:recording/mei:clip[@startid=$measureRef]
    return
        for $clip in $clips
        let $begin := string($clip/@begin)
        let $end := string($clip/@end)
        return
            map {
                "measureId": string($measure/@xml:id),
                "measureLabel": string($measure/@label),
                "begin": $begin,
                "end": $end
            }
};

let $uri := request:get-parameter('uri', '')
let $mei := doc($uri)/root()

return (
    array {
        local:getMeasures($mei)
    }
)