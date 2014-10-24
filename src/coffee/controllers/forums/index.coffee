jvcApp.controller 'ForumsIndexCtrl', ['$scope', '$jvcApi', 'navbar', '$state', '$mdSidenav', ($scope, $jvcApi, navbar, $state, $mdSidenav) ->
  $scope.loading = true

  navbar.setTitle 'Veuillez patienter...'
  navbar.setNavButton icon: 'bars', rotation: 'up', callback: ->
    isOpen = $mdSidenav('left').isOpen()
    console.log isOpen
    if isOpen
      $mdSidenav('left').close()
    else
      $mdSidenav('left').open()
  navbar.addButton icon: 'image-tune', callback: -> $state.go 'forums.edit'
  setTimeout ->
    $jvcApi.getForumsList().then (forums) ->
      $scope.forums = forums
      $scope.loading = false
      navbar.setTitle 'Liste des forums'
      if not $scope.$$phase then $scope.$digest()

  , 600
]
