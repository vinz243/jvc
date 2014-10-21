do ->
  jvcApp.directive "markaIcon", ($location) ->
    (scope, element, attrs) ->
      $el = $ element
      id = $el.attr 'id'
      marka = new Marka('#' + id)

      attrs.$observe "markaIcon", (val) ->
        marka.set val.split(' ')[0]
        marka.color val.split(' ')[1]
        marka.size val.split(' ')[2]
        marka.rotate val.split(' ')[3] if val.split(' ')[3]
        return
