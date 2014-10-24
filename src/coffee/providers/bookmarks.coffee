do ->
  LS_KEY = 'forums.posts.bookmarks'
  jvcApp.factory "$bookmarks", [
    "$localstorage"
    ($localstorage) ->
      return (
        add: (forumId, topicId, subject) ->
          bookmarks = $localstorage.getObject LS_KEY
          if not bookmarks.topics then bookmarks.topics = []
          bookmarks.topics.push {
            forumId: forumId,
            topicId: topicId,
            subject: subject
          }
          $localstorage.setObject LS_KEY, bookmarks
        get: ->
          return $localstorage.getObject(LS_KEY).topics or []

        has: (forumId, topicId) ->
          bookmarks = $localstorage.getObject LS_KEY
          for topic in bookmarks.topics or []
            if topic.topicId is topicId and topic.forumId is forumId
              return true
          false

        remove: (forumId, topicId) ->
          bookmarks = $localstorage.getObject LS_KEY
          bookmarks.topics = bookmarks.topics.filter (element) ->
            return element.forumId isnt forumId and element.topicId isnt topicId
          console.log bookmarks
          $localstorage.setObject LS_KEY, bookmarks
      )
  ]
