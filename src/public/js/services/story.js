mainApp.factory('story', function($http){
    var rxPromise = function(promise){
        return Rx.Observable.create(
            function(s){
                promise.then(
                    function(response) {
                        s.onNext(response);
                        s.onCompleted();
                    }, function(error) {
                        s.onError(error);
                        s.onCompleted();
                    }
                );
            }
        );
    };

    var rxPost = function(url, data){
        return rxPromise($http.post(url, data));
    };

    var rxGet = function(url){
        return rxPromise($http.get(url));
    };

    var rxDelete = function(url){
        return rxPromise($http.delete(url));
    }

    return {
        saveDraft: function(story){
            return rxPost('/api/story/save-draft', story);
        },
        update: function(updates){
            return rxPost('/api/story/update', updates);
        },
        publish: function(story){
            return rxPost('/api/story/publish', story);
        },
        listSamples: function(){
            return rxGet('/api/story');
        },
        getPreviews: function(username){
            return rxGet('/api/story/user/'+username);
        },
        getById: function(id){
            return rxGet('/api/story/byid/'+id);
        },
        getDraftById: function(id){
            return rxGet('/api/story/draft/'+id);
        },
        getStory: function(username, storyId){
            return rxGet('/@'+username+'/'+storyId);
        },
        getDrafts: function(){
            return rxGet('/api/story/drafts');
        },
        deleteStory: function(id){
            return rxDelete('/api/story/delete/'+id);
        }
    };
});