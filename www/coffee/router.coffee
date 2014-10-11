
jvcApp.config ['$routeProvider',
  ($routeProvider) ->
    $routeProvider.
      when('/',
        templateUrl: 'partials/index.html',
        controller: 'IndexCtrl'
      ).otherwise(
        redirectTo: '/'
      )
]
