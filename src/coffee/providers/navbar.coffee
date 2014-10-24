do ->
  navbar = {
    title: "..."
    buttons: []
  }
  listeners = {}
  jvcApp.factory "navbar", ['$rootScope', '$state', ($rootScope, $state)->

    navbar = {
      title: "..."
      buttons: []
    }
    return {
      setTitle: (newTitle) ->
        navbar.title = newTitle
        call(newTitle) for call in listeners.onTitle

      addButton: (opts) ->
        opts.uid = Math.floor(Math.random() * 1e26).toString 36
        opts.type = 'new'
        navbar.buttons.push opts
        call(opts) for call in listeners.onButton
        return {
          setIcon: (icon) ->
            call(icon: icon, uid: opts.uid, type: 'change') for call in listeners.onButton
        }


      setNavButton: (opts) ->
        if opts.link
          opts.callback = ->
            params = {}
            val = opts.link
            val = val.replace /\{\{(.+)\}\}/g, (str, val) ->
              return eval 'scope.' + val
            val = val.replace /\((.+)\)/, (str, value) ->
              params = eval "(" + value + ")"
              ""
            $state.go val,  params

        navbar.navButton = opts
        call(opts) for call in listeners.onNavButton

      addHook: (domain, func) ->
        if not listeners[domain] then listeners[domain] = []
        listeners[domain].push func
    }
  ]
