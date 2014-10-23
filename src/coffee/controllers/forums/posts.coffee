jvcApp.controller 'ForumsPostsCtrl', ['$scope', '$http', '$stateParams', 'navbar', '$state', '$jvcApi', ($scope, $http, $routeParams, navbar, $state, $jvcApi) ->

  $scope.loading = true
  $scope.urls =
    back: '#/forums'
  page = 1
  $scope.more = true
  $scope.postMode = false
  $scope.addTopic = ->
    $scope.postMode = true
    setTimeout ->
      $state.go 'forums.topics.add', id: $routeParams.id
    , 500
    return
  busy = false
  navbar.setTitle 'Veuillez patienter...'
  navbar.setNavButton icon: 'arrow', rotation: 'left', link: 'forums.list'

  $scope.loadMoreTopics = ->
    if not $scope.more or busy then return
    busy = true
    $jvcApi.getTopicList($routeParams.id, page).then (list) ->
      if not $scope.posts then $scope.posts = list
      else $scope.posts.liste_topics.topic.push item for item in list.liste_topics.topic
      $scope.loading = false
      navbar.setTitle $scope.posts.liste_topics.nom_forum
      if not $scope.$$phase then $scope.$digest()
      page += 25
      busy = false
]
