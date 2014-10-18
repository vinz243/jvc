jvcApp.config ['$stateProvider', '$urlRouterProvider',
  ($stateProvider, $urlRouterProvider) ->
    $stateProvider.
      state('index',
        url: '/',
        templateUrl: 'partials/index.html',
        controller: 'IndexCtrl'
      ).state('forums',
        abstract: 'true',
        templateUrl: 'partials/base.html',
      ).state('forums.list'
        url: '/forums',
        templateUrl: 'partials/forums/index.html',
        controller: 'ForumsIndexCtrl'
      ).state('forums.topics',
        abstract: true, 
        templateUrl: 'partials/base.html',
      ).state('forums.topics.list',
        url: '/forums/:id',
        templateUrl: 'partials/forums/posts.html',
        controller: 'ForumsPostsCtrl'
      ).state('forums.topics.view',
        url: '/forums/:id/:topic',
        templateUrl: 'partials/forums/post.html',
        controller: 'ForumsPostCtrl'
      )
    $urlRouterProvider.otherwise '/'
      
]

