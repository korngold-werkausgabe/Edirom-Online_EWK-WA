xquery version "3.1";
(:
  Edirom Online
  Copyright (C) 2015 The Edirom Project
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
:)

import module namespace eutil="http://www.edirom.de/xquery/util" at "../xqm/util.xqm";

declare namespace request="http://exist-db.org/xquery/request";
declare namespace mei="http://www.music-encoding.org/ns/mei";
declare namespace output = "http://www.w3.org/2010/xslt-xquery-serialization";


declare option output:method "text";
declare option output:media-type "text";

let $uri := request:get-parameter('uri', '')
let $docUri := if(contains($uri, '#')) then(substring-before($uri, '#')) else($uri)
let $doc := eutil:getDoc($docUri)
let $siglum := $doc//mei:sourceDesc/mei:source/mei:identifier[@type="siglum"]/text()


return
$siglum
