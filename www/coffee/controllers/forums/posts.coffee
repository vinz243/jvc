jvcApp.controller 'ForumsPostsCtrl', ['$scope', '$http', '$stateParams', 'navbar', '$state', ($scope, $http, $routeParams, navbar, $state) ->
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
    $http.get(config.domain + '/forums/0-' + $routeParams.id + '-0-1-0-' + page + '-0-0.xml').success (data) ->
      list = xml2json(data)
      # process urls:
      for topic in list.liste_topics.topic
        re = /jv:\/\/forums\/.-(\d+)-(\d+).+/i;
        matched = re.exec topic.lien_topic
        topic.fid = matched[1]
        topic.id = matched[2]

      $scope.posts = list
      $scope.loading = false
      navbar.setTitle $scope.posts.liste_topics.nom_forum
      if not $scope.$$phase then $scope.$digest()
      page += 25
      busy = false
]
