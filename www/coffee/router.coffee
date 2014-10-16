jvcApp.config ['$routeProvider',
  ($routeProvider) ->
    $routeProvider.
      when('/',
        templateUrl: 'partials/index.html',
        controller: 'IndexCtrl'
      ).when('/forums',
        templateUrl: 'partials/forums/index.html',
        controller: 'ForumsIndexCtrl'
      ).when('/forums/:id/:topic',
        templateUrl: 'partials/forums/post.html',
        controller: 'ForumsPostCtrl'
      ).when('/forums/:id',
        templateUrl: 'partials/forums/posts.html',
        controller: 'ForumsPostsCtrl'
      ).otherwise(
        redirectTo: '/'
      )
]

