

var config, jvcApp;

jvcApp = angular.module('jvc', ['ngRoute']);

config = {
  domain: "http://" + (window.location.host.split(':')[0]) + ":8101"
};

jvcApp.config([
  '$httpProvider', function($httpProvider) {
    $httpProvider.defaults.headers.common['Authorization'] = "Basic YXBwX2FuZF9tczpEOSFtVlI0Yw==";
  }
]);

jvcApp.config([
  '$routeProvider', function($routeProvider) {
    return $routeProvider.when('/', {
      templateUrl: 'partials/index.html',
      controller: 'IndexCtrl'
    }).when('/forums', {
      templateUrl: 'partials/forums/index.html',
      controller: 'ForumsIndexCtrl'
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

jvcApp.controller('IndexCtrl', [
  '$scope', '$http', function($scope, $http) {
    return $scope.name = "world!";
  }
]);

jvcApp.controller('ForumsIndexCtrl', [
  '$scope', '$http', function($scope, $http) {
    $scope.loading = true;
    return $http.get(config.domain + '/forums_index.xml').success(function(data) {
      var forums, list, sec, section, sub, sublist, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _ref, _ref1, _ref2, _ref3, _ref4, _section;
      list = xml2json(data);
      forums = [];
      _ref = list.listeforums.section;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        section = _ref[_i];
        _section = {};
        _section.name = section.nom;
        _section.rank = section.rang;
        _section.subsections = [];
        sublist = [];
        if (Array.isArray(section.sous_section)) {
          _ref1 = section.sous_section;
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            sec = _ref1[_j];
            if (Array.isArray(sec.ligne)) {
              _ref2 = sec.ligne;
              for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
                sub = _ref2[_k];
                sublist.push(sub);
              }
            } else {
              _ref3 = sec.ligne.forum;
              for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
                sub = _ref3[_l];
                sublist.push(sub);
              }
            }
          }
        } else if ((_ref4 = section.sous_section.ligne) != null ? _ref4.forum : void 0) {
          sublist = section.sous_section.ligne.forum;
        } else if (section.sous_section.ligne) {
          sublist = section.sous_section.ligne;
        }
        for (_m = 0, _len4 = sublist.length; _m < _len4; _m++) {
          sub = sublist[_m];
          _section.subsections.push(sub);
        }
        forums.push(_section);
      }
      console.log(forums);
      $scope.forums = forums;
      $scope.loading = false;
      if (!$scope.$$phase) {
        $scope.$digest();
      }
      return console.log(list);
    });
  }
]);
