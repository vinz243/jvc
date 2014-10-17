jvcApp.controller 'ForumsPostsCtrl', ['$scope', '$http', '$routeParams', ($scope, $http, $routeParams) ->
  $scope.loading = true
  $scope.urls =
    back: '#/forums'
  page = 1
  $scope.more = true
  $scope.loadMoreTopics = ->
    if not $scope.more then return
    $http.get(config.domain + '/forums/0-' + $routeParams.id + '-0-1-0-' + page + '-0-0.xml').success (data) ->
      list = xml2json(data)
      # process urls:
      for topic in list.liste_topics.topic
        re = /jv:\/\/forums\/.-(\d+)-(\d+).+/i;
        matched = re.exec topic.lien_topic
        topic.url = "/forums/#{matched[1]}/#{matched[2]}"
  
      $scope.posts = list
      $scope.loading = false
      if not $scope.$$phase then $scope.$digest()
      page += 25
]
