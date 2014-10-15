jvcApp.controller 'ForumsIndexCtrl', ['$scope', '$http', ($scope, $http) ->
  $scope.loading = true
  $http.get(config.domain + '/forums_index.xml').success (data) ->
    list = xml2json(data)
    # normalize
    forums = []
    for section in list.listeforums.section
      _section = {}
      _section.name = section.nom
      _section.rank = section.rang
      _section.subsections = []
      sublist = []
      if Array.isArray section.sous_section
        for sec in section.sous_section
          if Array.isArray sec.ligne
            for sub in sec.ligne
              sublist.push sub
          else
            for sub in sec.ligne.forum
              sublist.push sub
      else if section.sous_section.ligne?.forum then sublist = section.sous_section.ligne.forum
      else if section.sous_section.ligne then sublist = section.sous_section.ligne
      for sub in sublist
        _section.subsections.push sub
      forums.push _section
    console.log forums
    $scope.forums = forums
    $scope.loading = false
    if not $scope.$$phase then $scope.$digest()
    console.log list
]
