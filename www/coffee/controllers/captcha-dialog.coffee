jvcApp.controller 'CaptchaDialogCtrl', ['$scope', '$mdDialog', ($scope, $mdDialog) ->
  $scope.cancel = ->
    $mdDialog.hide()
  $scope.validate = ->
    $mdDialog.hide {
      code: $scope.code
    }
]
