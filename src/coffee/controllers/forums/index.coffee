jvcApp.controller 'ForumsIndexCtrl', ['$scope', '$jvcApi', 'navbar', '$state', ($scope, $jvcApi, navbar, $state) ->
  $scope.loading = true

  navbar.setTitle 'Veuillez patienter...'
  navbar.setNavButton icon: 'arrow', rotation: 'left', link: 'index'

  navbar.addButton icon: 'image-tune', callback: -> $state.go 'forums.edit'
  setTimeout ->
    $jvcApi.getForumsList().then (forums) ->
      $scope.forums = forums
      $scope.loading = false
      navbar.setTitle 'Liste des forums'
      if not $scope.$$phase then $scope.$digest()

  , 600
]
