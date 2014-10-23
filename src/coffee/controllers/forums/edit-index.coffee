jvcApp.controller 'EditForumsIndexCtrl', ['$scope', '$jvcApi', 'navbar', '$localstorage', ($scope, $jvcApi, navbar, $localstorage) ->
  $scope.loading = true
  $scope.hide = $localstorage.getObject 'forums.index.hide' or {}
  $scope.$watch 'hide', (value) ->
    $localstorage.setObject 'forums.index.hide', value
  , true
  navbar.setTitle 'Veuillez patienter...'
  navbar.setNavButton icon: 'times', rotation: 'left', link: 'forums.list'

  navbar.addButton icon: 'content-select-all', callback: ->
    for section in $scope.forums
      for sub in section.subsections
        $scope.hide[sub.id] = true

  setTimeout ->
    $jvcApi.getForumsList(false).then (forums) ->
      $scope.forums = forums
      $scope.loading = false
      navbar.setTitle 'Cacher des sections'
      if not $scope.$$phase then $scope.$digest()

  , 600
]
