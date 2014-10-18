var config, jvcApp;

jvcApp = angular.module('jvc', ['ui.router', 'ngMaterial', 'infinite-scroll']);

config = {
  domain: "http://" + (window.location.host.split(':')[0]) + ":8101"
};

jvcApp.config([
  '$httpProvider', function($httpProvider) {
    $httpProvider.defaults.headers.common['Authorization'] = "Basic YXBwX2FuZF9tczpEOSFtVlI0Yw==";
  }
]);

(function() {
  var listeners, markaCache, navbar;
  navbar = {
    title: "...",
    buttons: []
  };
  listeners = {};
  jvcApp.factory("navbar", function() {
    return {
      setTitle: function(newTitle) {
        var call, _i, _len, _ref, _results;
        navbar.title = newTitle;
        _ref = listeners.onTitle;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          call = _ref[_i];
          _results.push(call(newTitle));
        }
        return _results;
      },
      addButton: function(opts) {
        var call, _i, _len, _ref, _results;
        navbar.buttons.push(opts);
        _ref = listeners.onButton;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          call = _ref[_i];
          _results.push(call(title));
        }
        return _results;
      },
      setNavButton: function(opts) {
        var call, _i, _len, _ref, _results;
        navbar.navButton = opts;
        _ref = listeners.onNavButton;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          call = _ref[_i];
          _results.push(call(opts));
        }
        return _results;
      },
      addHook: function(domain, func) {
        if (!listeners[domain]) {
          listeners[domain] = [];
        }
        return listeners[domain].push(func);
      }
    };
  });
  jvcApp.directive("goClick", [
    '$location', '$state', function($location, $state) {
      return function(scope, element, attrs) {
        var params, path;
        path = void 0;
        params = void 0;
        attrs.$observe("goClick", function(val) {
          val = val.replace(/\{\{(.+)\}\}/g, function(str, val) {
            return eval('scope.' + val);
          });
          val = val.replace(/\((.+)\)/, function(str, value) {
            params = eval("(" + value + ")");
            return "";
          });
          path = val;
        });
        element.bind("click", function() {
          scope.$apply(function() {
            if (path && path !== "") {
              console.log(params);
              $state.go(path, params);
            }
          });
        });
      };
    }
  ]);
  markaCache = {};
  return jvcApp.directive("markaIcon", function($location) {
    return function(scope, element, attrs) {
      var $el, id, marka;
      $el = $(element);
      id = $el.attr('id');
      marka = new Marka('#' + id);
      return attrs.$observe("markaIcon", function(val) {
        marka.set(val.split(' ')[0]);
        marka.color(val.split(' ')[1]);
        marka.size(val.split(' ')[2]);
        if (val.split(' ')[3]) {
          marka.rotate(val.split(' ')[3]);
        }
      });
    };
  });
})();

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
  '$scope', 'navbar', function($scope, navbar) {
    navbar.setTitle('Appli JVC non officielle');
    return navbar.setNavButton({
      icon: 'bars'
    });
  }
]);

(function() {
  return jvcApp.controller("NavBarCtrl", [
    'navbar', '$scope', function(navbar, $scope) {
      var icon;
      icon = new Marka($('#left-nav-icon')[0]);
      navbar.addHook("onTitle", function(newTitle) {
        return $scope.title = newTitle;
      });
      return navbar.addHook('onNavButton', function(opts) {
        icon.set(opts.icon);
        icon.color(opts.color || "#fff");
        icon.size(opts.size || 30);
        icon.rotate(opts.rotation || "up");
        $scope.leftLink = opts.link || "";
        if (!$scope.$$phase) {
          return $scope.$digest();
        }
      });
    }
  ]);
})();

jvcApp.controller('ForumsIndexCtrl', [
  '$scope', '$http', 'navbar', function($scope, $http, navbar) {
    $scope.loading = true;
    navbar.setTitle('Veuillez patienter...');
    navbar.setNavButton({
      icon: 'arrow',
      rotation: 'left',
      link: 'index'
    });
    return setTimeout(function() {
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
        $scope.forums = forums;
        $scope.loading = false;
        navbar.setTitle('Liste des forums');
        if (!$scope.$$phase) {
          return $scope.$digest();
        }
      });
    }, 600);
  }
]);

jvcApp.controller('ForumsPostCtrl', [
  '$scope', '$http', '$stateParams', '$sce', 'navbar', function($scope, $http, $routeParams, $sce, navbar) {
    var page, pending;
    $scope.loading = true;
    page = 1;
    pending = false;
    $scope.more = true;
    $scope.urls = {
      back: '#/forums/' + $routeParams.id
    };
    $scope.id = $routeParams.id;
    navbar.setTitle('Veuillez patienter...');
    navbar.setNavButton({
      icon: 'arrow',
      rotation: 'left',
      link: 'forums.topics.list({id: "' + $routeParams.id + '"})'
    });
    $scope.loadMorePosts = function() {
      if (!$scope.more || pending) {
        return;
      }
      pending = true;
      return $http.get(config.domain + '/forums/1-' + $routeParams.id + '-' + $routeParams.topic + '-' + page + '-0-1-0-0.xml').success(function(data) {
        var $content, posts, res;
        if (!data || data === "") {
          $scope.more = false;
          return;
        }
        res = xml2json(data);
        if (!$scope.$$phase) {
          $scope.$digest();
        }
        $content = $($.parseXML("<content>" + res.detail_topic.contenu + "</content>"));
        posts = [];
        $content.find('ul').each(function(index) {
          var $el, obj;
          obj = {};
          $el = $(this);
          $el.find('a.pseudo').find('b').remove();
          $el.find('.date').find('a').remove();
          $el.find('.date').find('span').replaceWith('sur <i class="icon ion-iphone"></i>');
          obj.author = $sce.trustAsHtml($el.find('a.pseudo').html());
          obj.body = $sce.trustAsHtml($el.find('.message').html());
          obj.ts = $el.find('.date').html();
          obj.title = $sce.trustAsHtml(obj.author + ' - ' + obj.ts);
          return posts.push(obj);
        });
        $scope.posts = posts;
        navbar.setTitle(res.detail_topic.sujet_topic);
        if (!$scope.$$phase) {
          $scope.digest();
        }
        page = page + 1;
        return pending = false;
      }).error(function(data) {
        $scope.more = false;
        if (!$scope.$$phase) {
          return $scope.digest();
        }
      });
    };
    return $scope.loadMorePosts();
  }
]);

jvcApp.controller('ForumsPostsCtrl', [
  '$scope', '$http', '$stateParams', 'navbar', function($scope, $http, $routeParams, navbar) {
    var page;
    $scope.loading = true;
    $scope.urls = {
      back: '#/forums'
    };
    page = 1;
    $scope.more = true;
    navbar.setTitle('Veuillez patienter...');
    navbar.setNavButton({
      icon: 'arrow',
      rotation: 'left',
      link: 'forums.list'
    });
    return $scope.loadMoreTopics = function() {
      if (!$scope.more) {
        return;
      }
      return $http.get(config.domain + '/forums/0-' + $routeParams.id + '-0-1-0-' + page + '-0-0.xml').success(function(data) {
        var list, matched, re, topic, _i, _len, _ref;
        list = xml2json(data);
        _ref = list.liste_topics.topic;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          topic = _ref[_i];
          re = /jv:\/\/forums\/.-(\d+)-(\d+).+/i;
          matched = re.exec(topic.lien_topic);
          topic.fid = matched[1];
          topic.id = matched[2];
        }
        $scope.posts = list;
        $scope.loading = false;
        navbar.setTitle($scope.posts.liste_topics.nom_forum);
        if (!$scope.$$phase) {
          $scope.$digest();
        }
        return page += 25;
      });
    };
  }
]);

jvcApp.config([
  '$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    $stateProvider.state('index', {
      url: '/',
      templateUrl: 'partials/index.html',
      controller: 'IndexCtrl'
    }).state('forums', {
      abstract: 'true',
      templateUrl: 'partials/base.html'
    }).state('forums.list', {
      url: '/forums',
      templateUrl: 'partials/forums/index.html',
      controller: 'ForumsIndexCtrl'
    }).state('forums.topics', {
      abstract: true,
      templateUrl: 'partials/base.html'
    }).state('forums.topics.view', {
      url: '/forums/:id/:topic',
      templateUrl: 'partials/forums/post.html',
      controller: 'ForumsPostCtrl'
    }).state('forums.topics.list', {
      url: '/forums/:id',
      templateUrl: 'partials/forums/posts.html',
      controller: 'ForumsPostsCtrl'
    });
    return $urlRouterProvider.otherwise('/');
  }
]);


