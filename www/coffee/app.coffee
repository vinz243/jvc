
jvcApp = angular.module('jvc', ['ui.router', 'ngMaterial', 'infinite-scroll'])
config =
  domain: "http://#{window.location.host.split(':')[0]}:8101"

jvcApp.config ['$httpProvider', ($httpProvider) ->

    $httpProvider.defaults.headers.common['Authorization'] = "Basic YXBwX2FuZF9tczpEOSFtVlI0Yw=="
    return
]

do ->
  navbar = {
    title: "..."
    buttons: []
  }
  listeners = {}
  jvcApp.factory "navbar", ->
    
    return {
      setTitle: (newTitle) ->
        navbar.title = newTitle
        call(newTitle) for call in listeners.onTitle
      
      addButton: (opts) ->
        navbar.buttons.push opts
        call(title) for call in listeners.onButton
          
      setNavButton: (opts) ->
        navbar.navButton = opts
        call(opts) for call in listeners.onNavButton
        
      addHook: (domain, func) ->
        if not listeners[domain] then listeners[domain] = []
        listeners[domain].push func
    }

  jvcApp.directive "goClick" ,['$location', '$state',  ($location, $state) ->
    (scope, element, attrs) ->
      path = undefined
      params = undefined
      attrs.$observe "goClick", (val) ->
        val = val.replace /\{\{(.+)\}\}/g, (str, val) ->
          return eval 'scope.' + val
        val = val.replace /\((.+)\)/, (str, value) ->
          params = eval "(" + value + ")"
          ""
        
        path = val
        return
  
      element.bind "click", ->
        scope.$apply ->
          if path and path isnt ""
            console.log params
            $state.go path,  params
          return
  
        return
  
      return
  ]
  markaCache = {}
  jvcApp.directive "markaIcon", ($location) ->
    (scope, element, attrs) ->
      $el = $ element
      id = $el.attr 'id'
      marka = new Marka('#' + id)
      
      attrs.$observe "markaIcon", (val) ->
        marka.set val.split(' ')[0]
        marka.color val.split(' ')[1]
        marka.size val.split(' ')[2]
        marka.rotate val.split(' ')[3] if val.split(' ')[3]
        return
  
  
  
  