jvcApp.config ['$routeProvider',
  ($routeProvider) ->
    $routeProvider.
      when('/',
        templateUrl: 'partials/index.html',
        controller: 'IndexCtrl'
      ).when('/forums',
        templateUrl: 'partials/forums/index.html',
        controller: 'ForumsIndexCtrl'
      ).otherwise(
        redirectTo: '/'
      )
]
