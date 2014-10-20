do ->
  jvcApp.controller "NavBarCtrl", ['navbar', '$scope', '$rootScope', (navbar, $scope, $rootScope) ->
    icon = new Marka $('#left-nav-icon')[0]
    $scope.buttons = []
    buttonCallback = {}
    $rootScope.$on '$stateChangeSuccess', ->
      $scope.buttons = []
    $scope.call = (uid) ->
      console.log uid, buttonCallback
      buttonCallback[uid]()

    navbar.addHook "onTitle", (newTitle) ->
      $scope.title = newTitle

    navbar.addHook 'onNavButton', (opts) ->
      icon.set opts.icon
      icon.color opts.color or "#fff"
      icon.size opts.size or 30
      icon.rotate opts.rotation or "up"
      $scope.leftLink = opts.link or ""
      $scope.$digest() unless $scope.$$phase

    navbar.addHook 'onButton', (opts) ->
      uid = Math.floor(Math.random() * 1e26).toString 36

      $scope.buttons.push
        icon: opts.icon
        uid: uid

      buttonCallback[uid] = opts.callback
      return


  ]
