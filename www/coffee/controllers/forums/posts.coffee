jvcApp.controller 'ForumsPostsCtrl', ['$scope', '$http', '$stateParams', 'navbar', ($scope, $http, $routeParams, navbar) ->
  $scope.loading = true
  $scope.urls =
    back: '#/forums'
  page = 1
  $scope.more = true
  navbar.setTitle 'Veuillez patienter...'
  navbar.setNavButton icon: 'arrow', rotation: 'left', link: 'forums.list'
  $scope.loadMoreTopics = ->
    if not $scope.more then return
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
]
