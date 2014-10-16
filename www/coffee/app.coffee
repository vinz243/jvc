
jvcApp = angular.module('jvc', ['ngRoute', 'ngMaterial'])
config =
  domain: "http://#{window.location.host.split(':')[0]}:8101"

jvcApp.config ['$httpProvider', ($httpProvider) ->

    $httpProvider.defaults.headers.common['Authorization'] = "Basic YXBwX2FuZF9tczpEOSFtVlI0Yw=="
    return
]
