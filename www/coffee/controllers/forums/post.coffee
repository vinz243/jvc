jvcApp.controller 'ForumsPostCtrl', ['$scope', '$http', '$stateParams', '$sce', 'navbar', ($scope, $http, $routeParams, $sce, navbar) ->
  $scope.loading = true
  page = 1
  pending = false
  $scope.more = true
  $scope.urls = 
    back: '#/forums/' + $routeParams.id
  $scope.id = $routeParams.id
  navbar.setTitle 'Veuillez patienter...'
  navbar.setNavButton icon: 'arrow', rotation: 'left', link: 'forums.topics.list({id: "'+$routeParams.id+'"})'
  
  $scope.loadMorePosts = -> 
    
    if not $scope.more or pending then return
    pending = true
    $http.get(config.domain + '/forums/1-' + $routeParams.id + '-' + $routeParams.topic + '-' + page + '-0-1-0-0.xml').success (data) ->
      if not data or data is ""
        $scope.more = false
        return
      res = xml2json data
      
      
      if not $scope.$$phase then $scope.$digest()
      $content = $ $.parseXML("<content>" + res.detail_topic.contenu + "</content>")
      posts = []
      $content.find('ul').each (index) ->
        obj = {}
        $el = $(this)
        $el.find('a.pseudo').find('b').remove()
        
        $el.find('.date').find('a').remove()
        $el.find('.date').find('span').replaceWith('sur <i class="icon ion-iphone"></i>')
        obj.author = $sce.trustAsHtml $el.find('a.pseudo').html()
        obj.body = $sce.trustAsHtml $el.find('.message').html()
        obj.ts = $el.find('.date').html()
        obj.title = $sce.trustAsHtml(obj.author + ' - ' + obj.ts)
        posts.push obj
  
      $scope.posts = posts  
      navbar.setTitle res.detail_topic.sujet_topic
      if not $scope.$$phase then $scope.digest()
      page = page + 1
      pending = false
    .error (data) ->
      $scope.more = false
      if not $scope.$$phase then $scope.digest()
      
  $scope.loadMorePosts()
]
