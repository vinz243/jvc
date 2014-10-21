do ->
  isConnected = false
  user = undefined
  sid = ""
  jvcApp.controller 'LoginDialogCtrl', ['$scope', '$mdDialog', ($scope, $mdDialog) ->
    $scope.connecting = false
    $scope.cancel = ->
      $mdDialog.hide()
    $scope.connect = ->
      $mdDialog.hide {
        username: $scope.username
        password: $scope.password
      }

  ]
  jvcApp.factory '$auth', ['$http', '$q', '$mdDialog', '$md5', ($http, $q, $mdDialog, $md5) ->
    return {
      getSID: ($event) ->
        deferred = $q.defer()
        if not isConnected
          $mdDialog.show(
            controller: 'LoginDialogCtrl',
            event: $event,
            clickOutsideToClose: false,
            template: """
              <md-dialog>
                 <div class="dialog-content">
                   <div >
                      Veuillez vous connecter :
                      <form>
                        <md-text-float label="Nom d'utilisateur" ng-model="username"> </md-text-float>
                        <md-text-float type="password" label="Mot de passe" ng-model="password"> </md-text-float>
                     </form>
                   </div>
                 </div>
                 <div class="dialog-actions">
                  <md-button ng-click="cancel()">
                    Annuler
                  </md-button>
                  <md-button ng-click="connect()" class="md-theme-green">
                    Se connecter
                  </md-button>
                </div>
              </md-dialog>
            """
          ).then (credentials) ->
            if not credentials then return deferred.reject new Error('EOPERATION_CANCELED')
            stamp = Date.now()
            username = credentials.username
            hash = $md5(username + credentials.password + "OpX234" + stamp)
            $http(
              method: "POST"
              url: config.domain + '/mon_compte/connexion.php'
              data: $.param(newnom: username, stamp: stamp, hash: hash)
              withCredentials: true
              headers:
                "Content-Type": "application/x-www-form-urlencoded"
            )
          .then (response) ->
            $data = $ $.parseXML(response.data)
            cookieData = $data.find('cookie').html()
            sid = /<!\[CDATA\[wenvjgol=(.+)\]\]>/gi.exec(cookieData)[1]
            deferred.resolve sid
          # .fail deferred.reject

        deferred.promise
    }


  ]
