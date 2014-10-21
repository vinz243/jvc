jvcApp.controller('ForumsAddPostsCtrl', ['$scope', '$stateParams', 'navbar', '$auth', '$jvcApi', '$mdToast', '$state', ($scope, $routeParams, navbar, $auth, $jvcApi, $mdDialog, $mdToast, $state) ->
  navbar.setTitle 'Créer un nouveau sujet'
  navbar.setNavButton icon: 'times', link: 'forums.topics.list({id: "'+$routeParams.id+'"})'

  $scope.createTopic = ($event) ->
    params = {}

    $jvcApi.postContent
      forumId: $routeParams.id
      body: $scope.content
      subject:  $scope.subject
    .then (res) ->
      $state.go 'forums.topics.list', id: $routeParams.id
    .catch (err) ->
      $mdToast.show
        template: "<md-toast>Erreur : #{err.message or err.id or err}</md-toast>",
        hideDelay: 3000
])
