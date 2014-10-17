
jvcApp = angular.module('jvc', ['ngRoute', 'ngMaterial', 'infinite-scroll'])
config =
  domain: "http://#{window.location.host.split(':')[0]}:8101"

jvcApp.config ['$httpProvider', ($httpProvider) ->

    $httpProvider.defaults.headers.common['Authorization'] = "Basic YXBwX2FuZF9tczpEOSFtVlI0Yw=="
    return
]
jvcApp.directive "goClick", ($location) ->
  (scope, element, attrs) ->
    path = undefined
    attrs.$observe "goClick", (val) ->
      path = val
      return

    element.bind "click", ->
      scope.$apply ->
        $location.path path
        return

      return

    return
markaCache = {}
jvcApp.directive "markaIcon", ($location) ->
  (scope, element, attrs) ->
    $el = $ element
    id = $el.attr 'id'
    if not markaCache[id]
      markaCache[id] = new Marka('#' + id)
    
    attrs.$observe "markaIcon", (val) ->
      markaCache[id].set val.split(' ')[0]
      markaCache[id].color val.split(' ')[1]
      markaCache[id].size val.split(' ')[2]
      markaCache[id].rotate val.split(' ')[3] if val.split(' ')[3]
      return



