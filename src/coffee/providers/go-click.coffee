do ->
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
