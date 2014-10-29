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

  console.log 'Hey!'
  setTimeout ->
    console.log 'Getting list'
    $jvcApi.getForumsList().then (forums) ->
      console.log 'Got it!'
      $scope.forums = forums
      $scope.loading = false
      navbar.setTitle 'Liste des forums'
      if not $scope.$$phase then $scope.$digest()
    .catch (data, status, headers, config) ->
      console.log data
      console.log status
      console.log headers
      console.log config

  , 600
]
