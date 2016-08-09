mainApp.factory('story', function($http){
    var rxPromise = function(promise){
        return Rx.Observable.create(function(s){
            promise.then(function(response) {
                            s.onNext(response);
                            s.onCompleted();
                        }, function(error) {
                            s.onError(error);
                            s.onCompleted();
                        });
        });
    };

    var rxPost = function(url, data){
        return rxPromise($http.post(url, data));
    };

    var rxGet = function(url){
        return rxPromise($http.get(url));
    };

    return {
        saveDraft: function(story){
            story.isDraft = true;
            return rxPost('/api/story/save-draft', story);
        }, 
        publish: function(story){
            story.isDraft = false;
            return rxPost('/api/story/publish', story);
        },
        listSamples: function(){
            return rxGet('/api/story');
        }
    };
});