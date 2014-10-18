do ->
  jvcApp.controller "NavBarCtrl", ['navbar', '$scope', (navbar, $scope) ->
    icon = new Marka $('#left-nav-icon')[0]
    navbar.addHook "onTitle", (newTitle) ->
      $scope.title = newTitle
    navbar.addHook 'onNavButton', (opts) ->  
      icon.set opts.icon
      icon.color opts.color or "#fff"
      icon.size opts.size or 30
      icon.rotate opts.rotation or "up"
      $scope.leftLink = opts.link or ""
      $scope.$digest() unless $scope.$$phase
      
  ]