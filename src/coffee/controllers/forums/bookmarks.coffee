jvcApp.controller 'BookmarksIndexCtrl', ['$bookmarks', '$scope', 'navbar', ($bookmarks, $scope, navbar) ->
  $scope.bookmarks = $bookmarks.get()

  navbar.setTitle 'Topics marqués'
  navbar.setNavButton icon: 'times', rotation: 'left', link: 'forums.list'

]
