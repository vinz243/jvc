var config, jvcApp;

jvcApp = angular.module('jvc', ['ui.router', 'ngMaterial', 'infinite-scroll']);

config = {
  domain: "http://" + (window.location.host.split(':')[0]) + ":8101",
  host: "" + (window.location.host.split(':')[0]) + ":8101"
};

jvcApp.config([
  '$httpProvider', function($httpProvider) {
    $httpProvider.defaults.headers.common['Authorization'] = "Basic YXBwX2FuZF9tczpEOSFtVlI0Yw==";
  }
]);

jvcApp.run([
  '$rootScope', function($rootScope) {
    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
      return $rootScope.containerClass = toState.containerClass;
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

jvcApp.controller('CaptchaDialogCtrl', [
  '$scope', '$mdDialog', function($scope, $mdDialog) {
    $scope.cancel = function() {
      return $mdDialog.hide();
    };
    return $scope.validate = function() {
      return $mdDialog.hide({
        code: $scope.code
      });
    };
  }
]);

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
    'navbar', '$scope', '$rootScope', function(navbar, $scope, $rootScope) {
      var buttonCallback, icon;
      icon = new Marka($('#left-nav-icon')[0]);
      $scope.buttons = [];
      buttonCallback = {};
      $rootScope.$on('$stateChangeSuccess', function() {
        return $scope.buttons = [];
      });
      $scope.call = function(uid) {
        console.log(uid, buttonCallback);
        return buttonCallback[uid]();
      };
      navbar.addHook("onTitle", function(newTitle) {
        return $scope.title = newTitle;
      });
      navbar.addHook('onNavButton', function(opts) {
        icon.set(opts.icon);
        icon.color(opts.color || "#fff");
        icon.size(opts.size || 30);
        icon.rotate(opts.rotation || "up");
        $scope.leftLink = opts.link || "";
        if (!$scope.$$phase) {
          return $scope.$digest();
        }
      });
      return navbar.addHook('onButton', function(opts) {
        var button, _i, _len, _ref;
        if (opts.type !== 'change') {
          $scope.buttons.push({
            icon: opts.icon,
            uid: opts.uid
          }, buttonCallback[opts.uid] = opts.callback);
        } else {
          _ref = $scope.buttons;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            button = _ref[_i];
            if (button.uid === opts.uid) {
              button.icon = opts.icon;
            }
          }
        }
      });
    }
  ]);
})();

jvcApp.controller('ForumsAddPostsCtrl', [
  '$scope', '$stateParams', 'navbar', '$auth', '$jvcApi', '$mdToast', '$state', function($scope, $routeParams, navbar, $auth, $jvcApi, $mdDialog, $mdToast, $state) {
    navbar.setTitle('Créer un nouveau sujet');
    navbar.setNavButton({
      icon: 'times',
      link: 'forums.topics.list({id: "' + $routeParams.id + '"})'
    });
    return $scope.createTopic = function($event) {
      var params;
      params = {};
      return $jvcApi.postContent({
        forumId: $routeParams.id,
        body: $scope.content,
        subject: $scope.subject
      }).then(function(res) {
        return $state.go('forums.topics.list', {
          id: $routeParams.id
        });
      })["catch"](function(err) {
        return $mdToast.show({
          template: "<md-toast>Erreur : " + (err.message || err.id || err) + "</md-toast>",
          hideDelay: 3000
        });
      });
    };
  }
]);

jvcApp.controller('EditForumsIndexCtrl', [
  '$scope', '$jvcApi', 'navbar', '$localstorage', function($scope, $jvcApi, navbar, $localstorage) {
    $scope.loading = true;
    $scope.hide = $localstorage.getObject('forums.index.hide' || {});
    $scope.$watch('hide', function(value) {
      return $localstorage.setObject('forums.index.hide', value);
    }, true);
    navbar.setTitle('Veuillez patienter...');
    navbar.setNavButton({
      icon: 'times',
      rotation: 'left',
      link: 'forums.list'
    });
    navbar.addButton({
      icon: 'content-select-all',
      callback: function() {
        var section, sub, _i, _len, _ref, _results;
        _ref = $scope.forums;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          section = _ref[_i];
          _results.push((function() {
            var _j, _len1, _ref1, _results1;
            _ref1 = section.subsections;
            _results1 = [];
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
              sub = _ref1[_j];
              _results1.push($scope.hide[sub.id] = true);
            }
            return _results1;
          })());
        }
        return _results;
      }
    });
    return setTimeout(function() {
      return $jvcApi.getForumsList(false).then(function(forums) {
        $scope.forums = forums;
        $scope.loading = false;
        navbar.setTitle('Cacher des sections');
        if (!$scope.$$phase) {
          return $scope.$digest();
        }
      });
    }, 600);
  }
]);

jvcApp.controller('ForumsIndexCtrl', [
  '$scope', '$jvcApi', 'navbar', '$state', function($scope, $jvcApi, navbar, $state) {
    $scope.loading = true;
    navbar.setTitle('Veuillez patienter...');
    navbar.setNavButton({
      icon: 'arrow',
      rotation: 'left',
      link: 'index'
    });
    navbar.addButton({
      icon: 'image-tune',
      callback: function() {
        return $state.go('forums.edit');
      }
    });
    return setTimeout(function() {
      return $jvcApi.getForumsList().then(function(forums) {
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
  '$scope', '$mdToast', '$stateParams', 'navbar', '$jvcApi', '$state', '$bookmarks', function($scope, $mdToast, $routeParams, navbar, $jvcApi, $state, $bookmarks) {
    var bookmarkButton, isBusy, page;
    $scope.loading = true;
    $('body, html').scrollTop(0);
    page = 1;
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
    bookmarkButton = navbar.addButton({
      icon: "action-bookmark" + (!$bookmarks.has($routeParams.id, $routeParams.topic) ? '-outline' : ''),
      callback: function() {
        if ($scope.title) {
          if (!$bookmarks.has($routeParams.id, $routeParams.topic)) {
            $bookmarks.add($routeParams.id, $routeParams.topic, $scope.title);
            $mdToast.show({
              template: "<md-toast>Le topic a bien été ajouté au marque-page</md-toast>",
              hideDelay: 3000
            });
            return bookmarkButton.setIcon('action-bookmark');
          } else {
            $bookmarks.remove($routeParams.id, $routeParams.topic);
            $mdToast.show({
              template: "<md-toast>Le topic a bien été supprimé de vos marque-pages</md-toast>",
              hideDelay: 3000
            });
            return bookmarkButton.setIcon('action-bookmark-outline');
          }
        }
      }
    });
    $scope.sendMessage = function($event) {
      var params;
      params = {};
      return $jvcApi.postContent({
        forumId: $routeParams.id,
        topicId: $routeParams.topic,
        body: $scope.newMessageBody
      }).then(function(res) {
        return $state.go($state.current, $routeParams, {
          reload: true
        });
      })["catch"](function(err) {
        return $mdToast.show({
          template: "<md-toast>Erreur : " + (err.message || err.id || err) + "</md-toast>",
          hideDelay: 3000
        });
      });
    };
    isBusy = false;
    $scope.loadMorePosts = function() {
      if (!$scope.more || isBusy) {
        return;
      }
      isBusy = true;
      return $jvcApi.getMessageList($routeParams.id, $routeParams.topic, page).then(function(data) {
        var post, _i, _len, _ref;
        if (!$scope.posts) {
          $scope.posts = data.posts;
        } else {
          _ref = data.posts;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            post = _ref[_i];
            $scope.posts.push(post);
          }
        }
        if (!$scope.title) {
          navbar.setTitle(data.response.detail_topic.sujet_topic);
          $scope.title = data.response.detail_topic.sujet_topic;
        }
        if (!$scope.$$phase) {
          $scope.digest();
        }
        page = page + 1;
        return isBusy = false;
      })["catch"](function(data) {
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
  '$scope', '$http', '$stateParams', 'navbar', '$state', '$jvcApi', function($scope, $http, $routeParams, navbar, $state, $jvcApi) {
    var busy, page;
    $scope.loading = true;
    $scope.urls = {
      back: '#/forums'
    };
    page = 1;
    $scope.more = true;
    $scope.postMode = false;
    $scope.addTopic = function() {
      $scope.postMode = true;
      setTimeout(function() {
        return $state.go('forums.topics.add', {
          id: $routeParams.id
        });
      }, 500);
    };
    busy = false;
    navbar.setTitle('Veuillez patienter...');
    navbar.setNavButton({
      icon: 'arrow',
      rotation: 'left',
      link: 'forums.list'
    });
    return $scope.loadMoreTopics = function() {
      if (!$scope.more || busy) {
        return;
      }
      busy = true;
      return $jvcApi.getTopicList($routeParams.id, page).then(function(list) {
        var item, _i, _len, _ref;
        if (!$scope.posts) {
          $scope.posts = list;
        } else {
          _ref = list.liste_topics.topic;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            item = _ref[_i];
            $scope.posts.liste_topics.topic.push(item);
          }
        }
        $scope.loading = false;
        navbar.setTitle($scope.posts.liste_topics.nom_forum);
        if (!$scope.$$phase) {
          $scope.$digest();
        }
        page += 25;
        return busy = false;
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
    }).state('forums.edit', {
      url: '/forums/edit',
      templateUrl: 'partials/forums/edit-index.html',
      controller: 'EditForumsIndexCtrl'
    }).state('forums.topics', {
      abstract: true,
      templateUrl: 'partials/base.html'
    }).state('forums.topics.view', {
      url: '/forums/:id/view/:topic',
      templateUrl: 'partials/forums/post.html',
      controller: 'ForumsPostCtrl'
    }).state('forums.topics.list', {
      url: '/forums/:id',
      templateUrl: 'partials/forums/posts.html',
      controller: 'ForumsPostsCtrl'
    }).state('forums.topics.add', {
      url: '/forums/:id/new',
      templateUrl: 'partials/forums/add.html',
      controller: 'ForumsAddPostsCtrl',
      containerClass: 'new-topic-route'
    });
    return $urlRouterProvider.otherwise('/');
  }
]);

(function() {
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

(function() {
  var LS_KEY;
  LS_KEY = 'forums.posts.bookmarks';
  return jvcApp.factory("$bookmarks", [
    "$localstorage", function($localstorage) {
      return {
        add: function(forumId, topicId, subject) {
          var bookmarks;
          bookmarks = $localstorage.getObject(LS_KEY);
          if (!bookmarks.topics) {
            bookmarks.topics = [];
          }
          bookmarks.topics.push({
            forumId: forumId,
            topicId: topicId,
            subject: subject
          });
          return $localstorage.setObject(LS_KEY, bookmarks);
        },
        get: function() {
          return $localstorage.getObject(LS_KEY).topics || [];
        },
        has: function(forumId, topicId) {
          var bookmarks, topic, _i, _len, _ref;
          bookmarks = $localstorage.getObject(LS_KEY);
          _ref = bookmarks.topics || [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            topic = _ref[_i];
            if (topic.topicId === topicId && topic.forumId === forumId) {
              return true;
            }
          }
          return false;
        },
        remove: function(forumId, topicId) {
          var bookmarks;
          bookmarks = $localstorage.getObject(LS_KEY);
          bookmarks.topics = bookmarks.topics.filter(function(element) {
            return element.forumId !== forumId && element.topicId !== topicId;
          });
          return $localstorage.setObject(LS_KEY, bookmarks);
        }
      };
    }
  ]);
})();

(function() {
  return jvcApp.directive("goClick", [
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
})();

(function() {
  var EBUSY, ENET, ENOTIMP, addNewContent, buildError, getForumContent, getPostParams, isBusy, loadForums, postMessage, promptCaptchaAndPost;
  isBusy = false;
  buildError = function(message, code) {
    var err;
    err = new Error(message);
    err.id = code;
    return err;
  };
  EBUSY = buildError("There is already a task in progress. Please retry later", "ENET");
  ENET = buildError("The http request failed");
  ENOTIMP = buildError("This function is not implemented yet");

  /*
  @param Q the $q object passed by $jvcAPi factory
  @param mode what to do if busy. ABORT, CONTINUE or WAIT
   */
  loadForums = function(Q, $http, hide, mode) {
    var deferred;
    if (hide == null) {
      hide = {};
    }
    if (mode == null) {
      mode = "ABORT";
    }
    deferred = Q.defer();
    if (isBusy && mode === "ABORT") {
      deferred.reject(EBUSY);
      return deferred.promise;
    }
    isBusy = true;
    $http.get(config.domain + '/forums_index.xml').then(function(data) {
      var forums, list, sec, section, sub, sublist, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _ref, _ref1, _ref2, _ref3, _ref4, _section;
      list = xml2json(data.data);
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
          if (hide[sub.id] !== true) {
            _section.subsections.push(sub);
          }
        }
        forums.push(_section);
      }
      return deferred.resolve(forums);
    })["catch"](function(data, status, headers, config) {
      return deferred.reject(ENET);
    })["finally"](function() {
      return isBusy = false;
    });
    return deferred.promise;
  };

  /*
  Returns a topic or a message
   */
  getForumContent = function(Q, $http, mode, forumId, topicId, page) {
    var deferred;
    if (mode == null) {
      mode = "ABORT";
    }
    if (topicId == null) {
      topicId = 0;
    }
    if (page == null) {
      page = 1;
    }
    deferred = Q.defer();
    if (isBusy && mode === "ABORT") {
      deferred.reject(EBUSY);
      return deferred.promise;
    }
    isBusy = true;
    $http.get("" + config.domain + "/forums/" + (topicId !== 0 ? 1 : 0) + "-" + forumId + "-" + topicId + "-1-0-" + page + "-0-0.xml").then(function(data) {
      return deferred.resolve(xml2json(data.data));
    })["catch"](function() {
      return deferred.reject(ENET);
    })["finally"](function() {
      return isBusy = false;
    });
    return deferred.promise;
  };
  getPostParams = function($http, forumId, topicId) {
    if (topicId == null) {
      topicId = 0;
    }
    return $http({
      method: "GET",
      url: "" + config.domain + "/forums/5-" + forumId + "-" + topicId + "-1-0-1-0-0.xml",
      withCredentials: true
    });
  };
  postMessage = function($http, params, content, subject, captcha) {
    var data;
    data = {
      yournewmessage: content
    };
    if (subject) {
      data.newsujet = subject;
    }
    if (captcha) {
      data.code = captcha;
    }
    return $http({
      method: "POST",
      url: config.domain + '/cgi-bin/jvforums/forums.cgi',
      data: params + '&' + $.param(data),
      withCredentials: true,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });
  };
  promptCaptchaAndPost = function($http, params, content, subject, captcha) {
    return $mdDialog.show({
      controller: 'CaptchaDialogCtrl',
      event: $event,
      clickOutsideToClose: false,
      template: "<md-dialog>\n   <div class=\"dialog-content\">\n     <div >\n        Votre compte a moins de deux mois d'activit&eacute;.<br /> Veuillez remplir ce captcha d'abord <br /> <br />\n        <div layout=\"horizontal\" layout-align=\"center\" padding>\n          <img src=\"" + data.new_topic.erreur.captcha + "\" />\n        </div>\n        <br />\n        <br />\n        <div layout=\"horizontal\" layout-align=\"center\" padding>\n          <md-text-float label=\"Votre r&eacute;ponse\" ng-model=\"code\"> </md-text-float>\n        </div>\n     </div>\n   </div>\n   <div class=\"dialog-actions\">\n    <md-button ng-click=\"cancel()\">\n      Annuler\n    </md-button>\n    <md-button ng-click=\"validate()\" class=\"md-theme-green\">\n      Valider\n    </md-button>\n  </div>\n</md-dialog>"
    }).then(function(r) {
      return $http({
        method: "POST",
        url: config.domain + '/cgi-bin/jvforums/forums.cgi',
        data: params + r.code,
        withCredentials: true,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      });
    }).then(function(res) {
      var _ref, _ref1;
      if ((_ref = data["new_" + (opts.topicId ? 'message' : 'topic')]) != null ? (_ref1 = _ref.erreur) != null ? _ref1.captcha : void 0 : void 0) {
        params = data["new_" + (opts.topicId ? 'message' : 'topic')].params_form;
        return promptCaptchaAndPost($http, params, content, subject, captcha);
      }
      return {
        status: "done"
      };
    });
  };

  /*
  @param opts
    topicId the target topic if the message is an anwser
    forumId the forum target id
    body    the message body
    title   the message subject if it's a new topic
   */
  addNewContent = function($q, $http, sid, mode, opts) {
    return getPostParams($http, opts.forumId, opts.topicId).then(function(res) {
      var data, deferred, params;
      deferred = $q.defer();
      data = xml2json(res.data);
      console.log(data);
      params = data["new_" + (opts.topicId ? 'message' : 'topic')].params_form;
      setTimeout(function() {
        return deferred.resolve(params);
      }, 1100);
      return deferred.promise;
    }).then(function(params) {
      return postMessage($http, params, opts.body, opts.title);
    }).then(function(res) {
      var data, deferred, params, _ref, _ref1, _ref2;
      data = xml2json(res.data);
      deferred = $q.defer();
      if ((_ref = data.new_topic) != null ? (_ref1 = _ref.erreur) != null ? _ref1.captcha : void 0 : void 0) {
        params = data.new_topic.params_form;
        return promptCaptchaAndPost($http, params, opts.body, opts.title);
      } else if ((_ref2 = data.new_topic) != null ? _ref2.erreur : void 0) {
        deferred.reject(data.new_topic.erreur.texte_erreur);
      }
      deferred.resolve(res);
      return deferred.promise;
    });
  };
  return jvcApp.factory('$jvcApi', [
    '$http', '$q', '$sce', '$auth', '$localstorage', function($http, $q, $sce, $auth, $localstorage) {
      return {
        getForumsList: function(hide) {
          if (hide == null) {
            hide = true;
          }
          return loadForums($q, $http, (hide ? $localstorage.getObject('forums.index.hide') : void 0));
        },
        getTopicList: function(id, page, mode) {
          if (page == null) {
            page = 1;
          }
          if (mode == null) {
            mode = "ABORT";
          }
          return getForumContent($q, $http, mode, id, 0, page).then(function(list) {
            var matched, re, topic, _i, _len, _ref;
            _ref = list.liste_topics.topic;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              topic = _ref[_i];
              re = /jv:\/\/forums\/.-(\d+)-(\d+).+/i;
              matched = re.exec(topic.lien_topic);
              topic.fid = matched[1];
              topic.id = matched[2];
            }
            return list;
          });
        },
        getMessageList: function(id, topicId, page, mode) {
          if (page == null) {
            page = 2;
          }
          if (mode == null) {
            mode = "ABORT";
          }
          return getForumContent($q, $http, mode, id, topicId, page).then(function(data) {
            var $content, posts, res;
            res = data;
            console.log(res);
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
            return {
              response: res,
              posts: posts
            };
          });
        },
        postContent: function(data) {
          return $auth.getSID().then(function(sid) {
            return addNewContent($q, $http, sid, "ABORT", data);
          });
        }
      };
    }
  ]);
})();

(function() {
  var isConnected, sid, user;
  isConnected = false;
  user = void 0;
  sid = "";
  jvcApp.controller('LoginDialogCtrl', [
    '$scope', '$mdDialog', function($scope, $mdDialog) {
      $scope.connecting = false;
      $scope.cancel = function() {
        return $mdDialog.hide();
      };
      return $scope.connect = function() {
        return $mdDialog.hide({
          username: $scope.username,
          password: $scope.password
        });
      };
    }
  ]);
  return jvcApp.factory('$auth', [
    '$http', '$q', '$mdDialog', '$md5', function($http, $q, $mdDialog, $md5) {
      return {
        getSID: function($event) {
          var deferred;
          deferred = $q.defer();
          if (!isConnected) {
            $mdDialog.show({
              controller: 'LoginDialogCtrl',
              event: $event,
              clickOutsideToClose: false,
              template: "<md-dialog>\n   <div class=\"dialog-content\">\n     <div >\n        Veuillez vous connecter :\n        <form>\n          <md-text-float label=\"Nom d'utilisateur\" ng-model=\"username\"> </md-text-float>\n          <md-text-float type=\"password\" label=\"Mot de passe\" ng-model=\"password\"> </md-text-float>\n       </form>\n     </div>\n   </div>\n   <div class=\"dialog-actions\">\n    <md-button ng-click=\"cancel()\">\n      Annuler\n    </md-button>\n    <md-button ng-click=\"connect()\" class=\"md-theme-green\">\n      Se connecter\n    </md-button>\n  </div>\n</md-dialog>"
            }).then(function(credentials) {
              var hash, stamp, username;
              if (!credentials) {
                return deferred.reject(new Error('EOPERATION_CANCELED'));
              }
              stamp = Date.now();
              username = credentials.username;
              hash = $md5(username + credentials.password + "OpX234" + stamp);
              return $http({
                method: "POST",
                url: config.domain + '/mon_compte/connexion.php',
                data: $.param({
                  newnom: username,
                  stamp: stamp,
                  hash: hash
                }),
                withCredentials: true,
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded"
                }
              });
            }).then(function(response) {
              var $data, cookieData;
              $data = $($.parseXML(response.data));
              cookieData = $data.find('cookie').html();
              sid = /<!\[CDATA\[wenvjgol=(.+)\]\]>/gi.exec(cookieData)[1];
              return deferred.resolve(sid);
            });
          }
          return deferred.promise;
        }
      };
    }
  ]);
})();

(function() {
  return jvcApp.factory("$localstorage", [
    "$window", function($window) {
      return {
        set: function(key, value) {
          $window.localStorage[key] = value;
        },
        get: function(key, defaultValue) {
          return $window.localStorage[key] || defaultValue;
        },
        setObject: function(key, value) {
          $window.localStorage[key] = JSON.stringify(value);
        },
        getObject: function(key) {
          return JSON.parse($window.localStorage[key] || "{}");
        }
      };
    }
  ]);
})();


/*
Originally made by Joseph Myers (http://www.myersdaily.org/joseph/javascript/md5-text.html)
Extended to ASCII and UTF16 characters by wbond (https://github.com/wbond/md5-js)
 */
jvcApp.service("$md5", [
  function() {
    var add32, cmn, ff, gg, hex, hex_chr, hh, ii, md5, md51, md5blk, md5cycle, rhex;
    md5cycle = function(x, k) {
      var a, b, c, d;
      a = x[0];
      b = x[1];
      c = x[2];
      d = x[3];
      a = ff(a, b, c, d, k[0], 7, -680876936);
      d = ff(d, a, b, c, k[1], 12, -389564586);
      c = ff(c, d, a, b, k[2], 17, 606105819);
      b = ff(b, c, d, a, k[3], 22, -1044525330);
      a = ff(a, b, c, d, k[4], 7, -176418897);
      d = ff(d, a, b, c, k[5], 12, 1200080426);
      c = ff(c, d, a, b, k[6], 17, -1473231341);
      b = ff(b, c, d, a, k[7], 22, -45705983);
      a = ff(a, b, c, d, k[8], 7, 1770035416);
      d = ff(d, a, b, c, k[9], 12, -1958414417);
      c = ff(c, d, a, b, k[10], 17, -42063);
      b = ff(b, c, d, a, k[11], 22, -1990404162);
      a = ff(a, b, c, d, k[12], 7, 1804603682);
      d = ff(d, a, b, c, k[13], 12, -40341101);
      c = ff(c, d, a, b, k[14], 17, -1502002290);
      b = ff(b, c, d, a, k[15], 22, 1236535329);
      a = gg(a, b, c, d, k[1], 5, -165796510);
      d = gg(d, a, b, c, k[6], 9, -1069501632);
      c = gg(c, d, a, b, k[11], 14, 643717713);
      b = gg(b, c, d, a, k[0], 20, -373897302);
      a = gg(a, b, c, d, k[5], 5, -701558691);
      d = gg(d, a, b, c, k[10], 9, 38016083);
      c = gg(c, d, a, b, k[15], 14, -660478335);
      b = gg(b, c, d, a, k[4], 20, -405537848);
      a = gg(a, b, c, d, k[9], 5, 568446438);
      d = gg(d, a, b, c, k[14], 9, -1019803690);
      c = gg(c, d, a, b, k[3], 14, -187363961);
      b = gg(b, c, d, a, k[8], 20, 1163531501);
      a = gg(a, b, c, d, k[13], 5, -1444681467);
      d = gg(d, a, b, c, k[2], 9, -51403784);
      c = gg(c, d, a, b, k[7], 14, 1735328473);
      b = gg(b, c, d, a, k[12], 20, -1926607734);
      a = hh(a, b, c, d, k[5], 4, -378558);
      d = hh(d, a, b, c, k[8], 11, -2022574463);
      c = hh(c, d, a, b, k[11], 16, 1839030562);
      b = hh(b, c, d, a, k[14], 23, -35309556);
      a = hh(a, b, c, d, k[1], 4, -1530992060);
      d = hh(d, a, b, c, k[4], 11, 1272893353);
      c = hh(c, d, a, b, k[7], 16, -155497632);
      b = hh(b, c, d, a, k[10], 23, -1094730640);
      a = hh(a, b, c, d, k[13], 4, 681279174);
      d = hh(d, a, b, c, k[0], 11, -358537222);
      c = hh(c, d, a, b, k[3], 16, -722521979);
      b = hh(b, c, d, a, k[6], 23, 76029189);
      a = hh(a, b, c, d, k[9], 4, -640364487);
      d = hh(d, a, b, c, k[12], 11, -421815835);
      c = hh(c, d, a, b, k[15], 16, 530742520);
      b = hh(b, c, d, a, k[2], 23, -995338651);
      a = ii(a, b, c, d, k[0], 6, -198630844);
      d = ii(d, a, b, c, k[7], 10, 1126891415);
      c = ii(c, d, a, b, k[14], 15, -1416354905);
      b = ii(b, c, d, a, k[5], 21, -57434055);
      a = ii(a, b, c, d, k[12], 6, 1700485571);
      d = ii(d, a, b, c, k[3], 10, -1894986606);
      c = ii(c, d, a, b, k[10], 15, -1051523);
      b = ii(b, c, d, a, k[1], 21, -2054922799);
      a = ii(a, b, c, d, k[8], 6, 1873313359);
      d = ii(d, a, b, c, k[15], 10, -30611744);
      c = ii(c, d, a, b, k[6], 15, -1560198380);
      b = ii(b, c, d, a, k[13], 21, 1309151649);
      a = ii(a, b, c, d, k[4], 6, -145523070);
      d = ii(d, a, b, c, k[11], 10, -1120210379);
      c = ii(c, d, a, b, k[2], 15, 718787259);
      b = ii(b, c, d, a, k[9], 21, -343485551);
      x[0] = add32(a, x[0]);
      x[1] = add32(b, x[1]);
      x[2] = add32(c, x[2]);
      x[3] = add32(d, x[3]);
    };
    cmn = function(q, a, b, x, s, t) {
      a = add32(add32(a, q), add32(x, t));
      return add32((a << s) | (a >>> (32 - s)), b);
    };
    ff = function(a, b, c, d, x, s, t) {
      return cmn((b & c) | ((~b) & d), a, b, x, s, t);
    };
    gg = function(a, b, c, d, x, s, t) {
      return cmn((b & d) | (c & (~d)), a, b, x, s, t);
    };
    hh = function(a, b, c, d, x, s, t) {
      return cmn(b ^ c ^ d, a, b, x, s, t);
    };
    ii = function(a, b, c, d, x, s, t) {
      return cmn(c ^ (b | (~d)), a, b, x, s, t);
    };
    md51 = function(s) {
      var i, n, state, tail, txt;
      if (/[\x80-\xFF]/.test(s)) {
        s = unescape(encodeURI(s));
      }
      txt = "";
      n = s.length;
      state = [1732584193, -271733879, -1732584194, 271733878];
      i = void 0;
      i = 64;
      while (i <= s.length) {
        md5cycle(state, md5blk(s.substring(i - 64, i)));
        i += 64;
      }
      s = s.substring(i - 64);
      tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      i = 0;
      while (i < s.length) {
        tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
        i++;
      }
      tail[i >> 2] |= 0x80 << ((i % 4) << 3);
      if (i > 55) {
        md5cycle(state, tail);
        i = 0;
        while (i < 16) {
          tail[i] = 0;
          i++;
        }
      }
      tail[14] = n * 8;
      md5cycle(state, tail);
      return state;
    };
    md5blk = function(s) {
      var i, md5blks;
      md5blks = [];
      i = void 0;
      i = 0;
      while (i < 64) {
        md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24);
        i += 4;
      }
      return md5blks;
    };
    rhex = function(n) {
      var j, s;
      s = "";
      j = 0;
      while (j < 4) {
        s += hex_chr[(n >> (j * 8 + 4)) & 0x0f] + hex_chr[(n >> (j * 8)) & 0x0f];
        j++;
      }
      return s;
    };
    hex = function(x) {
      var i;
      i = 0;
      while (i < x.length) {
        x[i] = rhex(x[i]);
        i++;
      }
      return x.join("");
    };
    add32 = function(a, b) {
      return (a + b) & 0xffffffff;
    };
    hex_chr = "0123456789abcdef".split("");
    md5 = function(s) {
      return hex(md51(s));
    };
    if (md5("hello") !== "5d41402abc4b2a76b9719d911017c592") {
      add32 = function(x, y) {
        var lsw, msw;
        lsw = (x & 0xffff) + (y & 0xffff);
        msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xffff);
      };
    }
    return md5;
  }
]);

(function() {
  var listeners, navbar;
  navbar = {
    title: "...",
    buttons: []
  };
  listeners = {};
  return jvcApp.factory("navbar", [
    '$rootScope', function($rootScope) {
      navbar = {
        title: "...",
        buttons: []
      };
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
          var call, _i, _len, _ref;
          opts.uid = Math.floor(Math.random() * 1e26).toString(36);
          opts.type = 'new';
          navbar.buttons.push(opts);
          _ref = listeners.onButton;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            call = _ref[_i];
            call(opts);
          }
          return {
            setIcon: function(icon) {
              var _j, _len1, _ref1, _results;
              _ref1 = listeners.onButton;
              _results = [];
              for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                call = _ref1[_j];
                _results.push(call({
                  icon: icon,
                  uid: opts.uid,
                  type: 'change'
                }));
              }
              return _results;
            }
          };
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
    }
  ]);
})();
