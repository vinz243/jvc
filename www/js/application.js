var jvcApp;

jvcApp = angular.module('jvc', ['ngRoute']);

jvcApp.controller('IndexCtrl', [
  '$scope', '$http', function($scope, $http) {
    return $scope.name = "world!";
  }
]);

jvcApp.config([
  '$routeProvider', function($routeProvider) {
    return $routeProvider.when('/', {
      templateUrl: 'partials/index.html',
      controller: 'IndexCtrl'
    }).otherwise({
      redirectTo: '/'
    });
  }
]);

var defaultOptions, normalize, parseXML, xml2json, xml2jsonImpl;

parseXML = function(data) {
  var e, tmp, xml;
  xml = void 0;
  tmp = void 0;
  if (!data || typeof data !== "string") {
    return null;
  }
  try {
    if (window.DOMParser) {
      tmp = new DOMParser();
      xml = tmp.parseFromString(data, "text/xml");
    } else {
      xml = new ActiveXObject("Microsoft.XMLDOM");
      xml.async = "false";
      xml.loadXML(data);
    }
  } catch (_error) {
    e = _error;
    xml = undefined;
  }
  if (!xml || !xml.documentElement || xml.getElementsByTagName("parsererror").length) {
    throw new Error("Invalid XML: " + data);
  }
  return xml;
};

normalize = function(value, options) {
  if (!!options.normalize) {
    return (value || "").trim();
  }
  return value;
};

xml2jsonImpl = function(xml, options) {
  var attrs, child, i, item, name, node, result, val;
  i = void 0;
  result = {};
  attrs = {};
  node = void 0;
  child = void 0;
  name = void 0;
  result[options.attrkey] = attrs;
  if (xml.attributes && xml.attributes.length > 0) {
    i = 0;
    while (i < xml.attributes.length) {
      item = xml.attributes.item(i);
      attrs[item.nodeName] = item.value;
      i++;
    }
  }
  if (xml.childElementCount === 0) {
    result[options.charkey] = normalize(xml.textContent, options);
  }
  i = 0;
  while (i < xml.childNodes.length) {
    node = xml.childNodes[i];
    if (node.nodeType === 1) {
      if (node.attributes.length === 0 && node.childElementCount === 0) {
        child = normalize(node.textContent, options);
      } else {
        child = xml2jsonImpl(node, options);
      }
      name = node.nodeName;
      if (result.hasOwnProperty(name)) {
        val = result[name];
        if (!Array.isArray(val)) {
          val = [val];
          result[name] = val;
        }
        val.push(child);
      } else {
        result[name] = child;
      }
    }
    i++;
  }
  return result;
};


/**
w
Converts an xml document or string to a JSON object.

@param xml
 */

xml2json = function(xml, options) {
  var root;
  if (!xml) {
    return xml;
  }
  options = options || defaultOptions;
  if (typeof xml === "string") {
    xml = parseXML(xml).documentElement;
  }
  root = {};
  if (typeof xml.attributes === "undefined") {
    root[xml.nodeName] = xml2jsonImpl(xml, options);
  } else if (xml.attributes.length === 0 && xml.childElementCount === 0) {
    root[xml.nodeName] = normalize(xml.textContent, options);
  } else {
    root[xml.nodeName] = xml2jsonImpl(xml, options);
  }
  return root;
};

defaultOptions = {
  attrkey: "$",
  charkey: "_",
  normalize: false
};

window.xml2json = xml2json;
