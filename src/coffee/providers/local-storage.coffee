do ->
  jvcApp.factory "$localstorage", [
    "$window"
    ($window) ->
      return (
        set: (key, value) ->
          $window.localStorage[key] = value
          return

        get: (key, defaultValue) ->
          $window.localStorage[key] or defaultValue

        setObject: (key, value) ->
          $window.localStorage[key] = JSON.stringify(value)
          return

        getObject: (key) ->
          JSON.parse $window.localStorage[key] or "{}"
      )
  ]
