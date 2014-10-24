jvcApp.controller 'ForumsPostCtrl', ['$scope', '$mdToast', '$stateParams', 'navbar', '$jvcApi', '$state', '$bookmarks', ($scope, $mdToast, $routeParams, navbar, $jvcApi, $state, $bookmarks) ->
  $scope.loading = true
  $('body, html').scrollTop 0
  page = 1
  $scope.more = true
  $scope.urls =
    back: '#/forums/' + $routeParams.id
  $scope.id = $routeParams.id
  navbar.setTitle 'Veuillez patienter...'
  navbar.setNavButton icon: 'arrow', rotation: 'left', link: 'forums.topics.list({id: "'+$routeParams.id+'"})'
  navbar.addButton icon: "action-bookmark#{if not $bookmarks.has $routeParams.id, $routeParams.topic then '-outline' else ''}", callback: ->
    if $scope.title
      if not $bookmarks.has $routeParams.id, $routeParams.topic
        $bookmarks.add $routeParams.id, $routeParams.topic, $scope.title
        $mdToast.show
          template: "<md-toast>Le topic a bien été ajouté au marque-page</md-toast>",
          hideDelay: 3000
      else
        $bookmarks.remove $routeParams.id, $routeParams.topic
        $mdToast.show
          template: "<md-toast>Le topic a bien été supprimé de vos marque-pages</md-toast>",
          hideDelay: 3000




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
      if not $scope.posts then $scope.posts = data.posts
      else $scope.posts.push post for post in data.posts
      if not $scope.title
        navbar.setTitle data.response.detail_topic.sujet_topic
        $scope.title = data.response.detail_topic.sujet_topic
      if not $scope.$$phase then $scope.digest()
      page = page + 1
      isBusy = false
    .catch (data) ->
      $scope.more = false
      if not $scope.$$phase then $scope.digest()

  $scope.loadMorePosts()
]
