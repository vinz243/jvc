jvcApp.controller 'ForumsIndexCtrl', ['$scope', '$jvcApi', 'navbar', ($scope, $jvcApi, navbar) ->
  $scope.loading = true

  navbar.setTitle 'Veuillez patienter...'
  navbar.setNavButton icon: 'arrow', rotation: 'left', link: 'index'

  setTimeout ->
    $jvcApi.getForumsList().then (forums) ->
      $scope.forums = forums
      $scope.loading = false
      navbar.setTitle 'Liste des forums'
      if not $scope.$$phase then $scope.$digest()

  , 600
]
