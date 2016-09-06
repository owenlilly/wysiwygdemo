mainApp.factory('DraftDto', function($http){
    return function(id, who, when, title, preview, url){
        return {
            id: id,
            who: who,
            when: when,
            title: title,
            preview: preview,
            url
        };
    }
});