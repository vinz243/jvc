do ->


  isBusy = false # Do not perform ntwo th in gs at the same time


  buildError = (message, code) ->
    err = new Error message
    err.id = code
    return err

  EBUSY = buildError "There is already a task in progress. Please retry later", "ENET"
  ENET = buildError "The http request failed"
  ENOTIMP = buildError "This function is not implemented yet"

  ###
  @param Q the $q object passed by $jvcAPi factory
  @param mode what to do if busy. ABORT, CONTINUE or WAIT
  ###
  loadForums = (Q, $http,  mode="ABORT") ->
    deferred = Q.defer()
    if isBusy and mode is "ABORT"
      deferred.reject EBUSY
      return deferred.promise

    isBusy = true

    $http.get(config.domain + '/forums_index.xml').then (data) ->
      list = xml2json(data.data)
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

      console.log "resolve"
      deferred.resolve forums
    .catch (data, status, headers, config) ->
      deferred.reject ENET
    .finally ->
      isBusy = false
    deferred.promise

  ###
  Returns a topic or a message
  ###
  getForumContent = (Q, $http, mode="ABORT", forumId, topicId=0, page=1) ->
    deferred = Q.defer()
    if isBusy and mode is "ABORT"
      deferred.reject EBUSY
      return deferred.promise

    isBusy = true

    $http.get("#{config.domain}/forums/#{if topicId isnt 0 then 1 else 0}-#{forumId}-#{topicId}-1-0-#{page}-0-0.xml").then (data) ->
      deferred.resolve xml2json(data.data)
    .catch ->
      deferred.reject ENET
    .finally ->
      isBusy = false

    deferred.promise


  jvcApp.factory '$jvcApi', ['$http', '$q', '$sce', ($http, $q, $sce) ->
      return {
        getForumsList: () ->
          loadForums $q, $http

        getTopicList: (id, page=1, mode="ABORT") ->
          getForumContent($q, $http, mode, id, 0, page).then (list) ->
            # process urls:
            for topic in list.liste_topics.topic
              re = /jv:\/\/forums\/.-(\d+)-(\d+).+/i;
              matched = re.exec topic.lien_topic
              topic.fid = matched[1]
              topic.id = matched[2]
            return list

        getMessageList: (id, topicId, page=2, mode="ABORT") ->
          getForumContent($q, $http, mode, id, topicId, page).then (data) ->
            res = data
            console.log res
            $content = $ $.parseXML("<content>" + res.detail_topic.contenu + "</content>")
            posts = []
            $content.find('ul').each (index) ->
              obj = {}
              $el = $(this)
              $el.find('a.pseudo').find('b').remove()

              $el.find('.date').find('a').remove()
              $el.find('.date').find('span').replaceWith('sur <i class="icon ion-iphone"></i>')
              obj.author = $sce.trustAsHtml $el.find('a.pseudo').html()
              obj.body = $sce.trustAsHtml $el.find('.message').html()
              obj.ts = $el.find('.date').html()
              obj.title = $sce.trustAsHtml(obj.author + ' - ' + obj.ts)
              posts.push obj
            return {response: res, posts: posts}
      }

  ]
