jvcApp.controller 'ForumsPostCtrl', ['$scope', '$http', '$routeParams', '$sce', ($scope, $http, $routeParams, $sce) ->
  $scope.loading = true
  $http.get(config.domain + '/forums/1-' + $routeParams.id + '-' + $routeParams.topic + '-1-0-1-0-0.xml').success (data) ->
    res = xml2json data
    $scope.loading = false
    if not $scope.$$phase then $scope.$digest()
    $content = $ $.parseXML("<content>" + res.detail_topic.contenu + "</content>")
    posts = []
    $content.find('ul').each (index) ->
      obj = {}
      $el = $(this)
      $el.find('a.pseudo').find('b').remove()
      $el.find('.date').find('a').remove()
      obj.author = $el.find('a.pseudo').html()
      obj.body = $sce.trustAsHtml $el.find('.message').html()
      obj.ts = $el.find('.date').html()
      posts.push obj

    $scope.posts = posts
]
