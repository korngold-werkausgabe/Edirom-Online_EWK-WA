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

(: declare option exist:serialize "method=html media-type=text/html omit-xml-declaration=yes indent=yes"; :)

declare option output:method "html";
declare option output:media-type "text/html";

let $uri := request:get-parameter('uri', '')
let $docUri := if(contains($uri, '#')) then(substring-before($uri, '#')) else($uri)
let $doc := eutil:getDoc($docUri)
let $avFile := $doc//mei:avFile[1]/string(@target)


return
<html lang="de">
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Document</title>
</head>
<body>
<video width="900" height="500" controls="">
  <source src="{$avFile}" type="video/mp4"></source>
</video> 
</body>
</html>
