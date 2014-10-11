
# default options based on https://github.com/Leonidas-from-XIV/node-xml2js

# extracted from jquery
parseXML = (data) ->
  xml = undefined
  tmp = undefined
  return null  if not data or typeof data isnt "string"
  try
    if window.DOMParser # Standard
      tmp = new DOMParser()
      xml = tmp.parseFromString(data, "text/xml")
    else # IE
      xml = new ActiveXObject("Microsoft.XMLDOM")
      xml.async = "false"
      xml.loadXML data
  catch e
    xml = `undefined`
  throw new Error("Invalid XML: " + data)  if not xml or not xml.documentElement or xml.getElementsByTagName("parsererror").length
  xml
normalize = (value, options) ->
  return (value or "").trim()  unless not options.normalize
  value
xml2jsonImpl = (xml, options) ->
  i = undefined
  result = {}
  attrs = {}
  node = undefined
  child = undefined
  name = undefined
  result[options.attrkey] = attrs
  if xml.attributes and xml.attributes.length > 0
    i = 0
    while i < xml.attributes.length
      item = xml.attributes.item(i)
      attrs[item.nodeName] = item.value
      i++

  # element content
  result[options.charkey] = normalize(xml.textContent, options)  if xml.childElementCount is 0
  i = 0
  while i < xml.childNodes.length
    node = xml.childNodes[i]
    if node.nodeType is 1
      if node.attributes.length is 0 and node.childElementCount is 0
        child = normalize(node.textContent, options)
      else
        child = xml2jsonImpl(node, options)
      name = node.nodeName
      if result.hasOwnProperty(name)

        # For repeating elements, cast/promote the node to array
        val = result[name]
        unless Array.isArray(val)
          val = [val]
          result[name] = val
        val.push child
      else
        result[name] = child
    i++
  result

###*
w
Converts an xml document or string to a JSON object.

@param xml
###
xml2json = (xml, options) ->
  return xml  unless xml
  options = options or defaultOptions
  xml = parseXML(xml).documentElement  if typeof xml is "string"
  root = {}
  if typeof xml.attributes is "undefined"
    root[xml.nodeName] = xml2jsonImpl(xml, options)
  else if xml.attributes.length is 0 and xml.childElementCount is 0
    root[xml.nodeName] = normalize(xml.textContent, options)
  else
    root[xml.nodeName] = xml2jsonImpl(xml, options)
  root
defaultOptions =
  attrkey: "$"
  charkey: "_"
  normalize: false

window.xml2json = xml2json
