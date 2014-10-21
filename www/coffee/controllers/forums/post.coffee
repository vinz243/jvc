jvcApp.controller 'ForumsPostCtrl', ['$scope', '$mdToast', '$stateParams', 'navbar', '$jvcApi', '$state', ($scope, $mdToast, $routeParams, navbar, $jvcApi, $state) ->
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
    $jvcApi.postContent
      forumId: $routeParams.id
      topicId: $routeParams.topic
      body: $scope.newMessageBody
    .then (res) ->
      $state.go $state.current, $routeParams, reload: true
    .catch (err) ->
      $mdToast.show
        template: "<md-toast>Erreur : #{err.message or err.id or err}</md-toast>",
        hideDelay: 3000

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
