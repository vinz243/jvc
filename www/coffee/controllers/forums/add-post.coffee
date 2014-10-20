jvcApp.controller('ForumsAddPostsCtrl', ['$scope', '$http', '$stateParams', '$sce', 'navbar', '$auth', '$q', '$mdDialog', '$mdToast', '$state', ($scope, $http, $routeParams, $sce, navbar, $auth, $q, $mdDialog, $mdToast, $state) ->
  navbar.setTitle 'Créer un nouveau sujet'
  navbar.setNavButton icon: 'times', link: 'forums.topics.list({id: "'+$routeParams.id+'"})'

  $scope.createTopic = ($event) ->
    params = {}
    $auth.getSID($event).then (sid) ->
      console.log 'sid is', sid

      $http(
        method: "GET"
        url: "#{config.domain}/forums/5-#{$routeParams.id}-0-1-0-1-0-0.xml"
        withCredentials: true
        # headers:
          # "Cookie": "wenvjgol=#{sid}"
      )
    .then ->
      $http(
        method: "GET"
        url: "#{config.domain}/forums/5-#{$routeParams.id}-0-1-0-1-0-0.xml"
        withCredentials: true
        # headers:
          # "Cookie": "wenvjgol=#{sid}"
      )
    .then (res)->
      deferred = $q.defer()
      data = xml2json res.data
      params = data.new_topic.params_form
      console.log params
      setTimeout deferred.resolve, 1250
      deferred.promise
    .then ->
      $http(
        method: "POST"
        url: config.domain + '/cgi-bin/jvforums/forums.cgi'
        data: params + '&' + $.param(yournewmessage: $scope.content, newsujet: $scope.subject)
        withCredentials: true
        headers:
          "Content-Type": "application/x-www-form-urlencoded"
      )
    .then (res) ->
      data = xml2json res.data
      deferred = $q.defer()
      if data.new_topic?.erreur?.captcha
        params = data.new_topic.params_form
        return $mdDialog.show(
            controller: 'CaptchaDialogCtrl',
            event: $event,
            clickOutsideToClose: false,
            template: """
              <md-dialog>
                 <div class="dialog-content">
                   <div >
                      Votre compte a moins de deux mois d'activit&eacute;.<br /> Veuillez remplir ce captcha d'abord <br />
                      <div layout="horizontal" layout-align="center" padding>
                        <img src="#{data.new_topic.erreur.captcha}" />
                      </div>
                      <div layout="horizontal" layout-align="center" padding>
                        <md-text-float label="Votre r&eacute;ponse" ng-model="code"> </md-text-float>
                      </div>
                   </div>
                 </div>
                 <div class="dialog-actions">
                  <md-button ng-click="cancel()">
                    Annuler
                  </md-button>
                  <md-button ng-click="validate()" class="md-theme-green">
                    Valider
                  </md-button>
                </div>
              </md-dialog>
            """
          ).then (r) ->
            console.log 'res',  params + r.code
            $http(
              method: "POST"
              url: config.domain + '/cgi-bin/jvforums/forums.cgi'
              data:  params + r.code
              withCredentials: true
              headers:
                "Content-Type": "application/x-www-form-urlencoded"
            )
      else if data.new_topic?.erreur
        deferred.reject data.new_topic.erreur.texte_erreur
      deferred.resolve res
      deferred.promise
    .then (res) ->
      $state.go 'forums.topics.list', id: $routeParams.id
    .catch (err) ->
      $mdToast.show
        template: "<md-toast>#{err.message}</md-toast>",
        hideDelay: 3000
])
