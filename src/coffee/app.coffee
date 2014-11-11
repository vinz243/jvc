
jvcApp = angular.module('jvc', ['ui.router', 'ngMaterial', 'infinite-scroll'])
config =
  domain: "http://%INET_ADDR%"
  host: "%INET_ADDR%"

jvcApp.config ['$httpProvider', ($httpProvider) ->

    $httpProvider.defaults.headers.common['Authorization'] = "Basic YXBwX2FuZF9tczpEOSFtVlI0Yw=="

    return
]
jvcApp.run ['$rootScope', ($rootScope) ->

    $rootScope.$on '$stateChangeSuccess', (event, toState, toParams, fromState, fromParams) ->
      $rootScope.containerClass = toState.containerClass;
    return
]
