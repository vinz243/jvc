jvcApp.controller 'ForumsPostCtrl', ['$scope', '$http', '$stateParams', '$sce', 'navbar', '$auth', '$q', '$jvcApi', ($scope, $http, $routeParams, $sce, navbar, $auth, $q, $jvcApi) ->
  $scope.loading = true
  page = 1
  $scope.more = true
  $scope.urls =
    back: '#/forums/' + $routeParams.id
  $scope.id = $routeParams.id
  navbar.setTitle 'Veuillez patienter...'
  navbar.setNavButton icon: 'arrow', rotation: 'left', link: 'forums.topics.list({id: "'+$routeParams.id+'"})'
  navbar.addButton icon: 'communication-textsms', callback: ->

  $scope.sendMessage = ($event) ->
    params = {}
    $auth.getSID($event).then (sid) ->
      console.log 'sid is', sid

      $http(
        method: "GET"
        url: "#{config.domain}/forums/5-#{$routeParams.id}-#{$routeParams.topic}-1-0-1-0-0.xml"
        withCredentials: true
        # headers:
          # "Cookie": "wenvjgol=#{sid}"
      )
    .then ->
      $http(
        method: "GET"
        url: "#{config.domain}/forums/5-#{$routeParams.id}-#{$routeParams.topic}-1-0-1-0-0.xml"
        withCredentials: true
        # headers:
          # "Cookie": "wenvjgol=#{sid}"
      )
    .then (res)->
      deferred = $q.defer()
      data = xml2json res.data
      params = data.new_message.params_form
      console.log params
      setTimeout deferred.resolve, 1250
      deferred.promise
    .then ->
      $http(
        method: "POST"
        url: config.domain + '/cgi-bin/jvforums/forums.cgi'
        data: params + '&yournewmessage=' + $scope.newMessageBody
        withCredentials: true
        headers:
          "Content-Type": "application/x-www-form-urlencoded"
      )
    .then console.log
  isBusy = false
  $scope.loadMorePosts = ->

    if not $scope.more or isBusy then return
    isBusy = true

    $jvcApi.getMessageList($routeParams.id, $routeParams.topic,  page).then (data) ->
      $scope.posts = data.posts
      navbar.setTitle data.response.detail_topic.sujet_topic
      if not $scope.$$phase then $scope.digest()
      page = page + 1
      isBusy = false
    .catch (data) ->
      $scope.more = false
      if not $scope.$$phase then $scope.digest()

  $scope.loadMorePosts()
]
