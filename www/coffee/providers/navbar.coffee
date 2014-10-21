do ->
  navbar = {
    title: "..."
    buttons: []
  }
  listeners = {}
  jvcApp.factory "navbar", ['$rootScope', ($rootScope)->

    navbar = {
      title: "..."
      buttons: []
    }
    return {
      setTitle: (newTitle) ->
        navbar.title = newTitle
        call(newTitle) for call in listeners.onTitle

      addButton: (opts) ->
        navbar.buttons.push opts
        call(opts) for call in listeners.onButton

      setNavButton: (opts) ->
        navbar.navButton = opts
        call(opts) for call in listeners.onNavButton

      addHook: (domain, func) ->
        if not listeners[domain] then listeners[domain] = []
        listeners[domain].push func
    }
  ]
