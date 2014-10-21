jvcApp.controller 'IndexCtrl', ['$scope', 'navbar', ($scope, navbar) ->
  navbar.setTitle 'Appli JVC non officielle'
  navbar.setNavButton icon: 'bars'
]
