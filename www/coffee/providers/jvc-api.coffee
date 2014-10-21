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

  getPostParams = ($http, forumId, topicId=0) ->
    return $http(
        method: "GET"
        url:  "#{config.domain}/forums/5-#{forumId}-#{topicId}-1-0-1-0-0.xml"
        withCredentials: true
        # headers:
          # "Cookie": "wenvjgol=#{sid}"
    )

  postMessage = ($http, params, content, subject, captcha) ->
    data = {
      yournewmessage: content
    }
    data.newsujet = subject if subject
    data.code = captcha if captcha
    $http(
      method: "POST"
      url: config.domain + '/cgi-bin/jvforums/forums.cgi'
      data: params + '&' + $.param data
      withCredentials: true
      headers:
        "Content-Type": "application/x-www-form-urlencoded"
    )

  promptCaptchaAndPost = ($http, params, content, subject, captcha) ->
    $mdDialog.show(
      controller: 'CaptchaDialogCtrl',
      event: $event,
      clickOutsideToClose: false,
      template: """
          <md-dialog>
             <div class="dialog-content">
               <div >
                  Votre compte a moins de deux mois d'activit&eacute;.<br /> Veuillez remplir ce captcha d'abord <br /> <br />
                  <div layout="horizontal" layout-align="center" padding>
                    <img src="#{data.new_topic.erreur.captcha}" />
                  </div>
                  <br />
                  <br />
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
      $http(
        method: "POST"
        url: config.domain + '/cgi-bin/jvforums/forums.cgi'
        data:  params + r.code
        withCredentials: true
        headers:
          "Content-Type": "application/x-www-form-urlencoded"
      )
    .then (res) ->
      if data["new_#{if opts.topicId then 'message' else 'topic'}"]?.erreur?.captcha
        params = data["new_#{if opts.topicId then 'message' else 'topic'}"].params_form
        return promptCaptchaAndPost($http, params, content, subject, captcha)
      return {status: "done"}


  ###
  @param opts
    topicId the target topic if the message is an anwser
    forumId the forum target id
    body    the message body
    title   the message subject if it's a new topic
  ###
  addNewContent = ($q, $http, sid, mode, opts) ->

    getPostParams($http, opts.forumId, opts.topicId).then (res)->
      # Wait 1"
      deferred = $q.defer()

      data = xml2json res.data
      console.log data
      params = data["new_#{if opts.topicId then 'message' else 'topic'}"].params_form

      setTimeout ->
        deferred.resolve params
      , 1100

      deferred.promise

    .then (params) ->

      # Post the message
      return postMessage($http, params, opts.body, opts.title)

    .then (res) ->
      data = xml2json res.data
      deferred = $q.defer()

      if data.new_topic?.erreur?.captcha
        params = data.new_topic.params_form

        return promptCaptchaAndPost($http, params, opts.body, opts.title)

      else if data.new_topic?.erreur
        deferred.reject data.new_topic.erreur.texte_erreur

      deferred.resolve res
      deferred.promise


  jvcApp.factory '$jvcApi', ['$http', '$q', '$sce', '$auth', '$mdToast', ($http, $q, $sce, $auth) ->
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
        postContent: (data) ->
          $auth.getSID().then (sid) ->
            addNewContent($q, $http, sid, "ABORT", data)

      }

  ]
