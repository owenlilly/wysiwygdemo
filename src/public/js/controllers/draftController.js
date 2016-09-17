mainApp.controller('mainController', function(story, DraftDto) {
    var self = this;

	self.drafts = [];
	self.sideItems = [];
	self.username = '';

	self.deleteDraft = function(index){
		var draft = self.drafts[index]; 
        story.deleteStory(draft.id)
             .subscribe(function(response){
				 self.drafts.splice(index, 1);
             }, function(error){
                 console.log(error);
             });
    }

	self.getDrafts = function(){
		var rxDrafts = story.getDrafts();
		Utils.loadDraftPreviews(rxDrafts, DraftDto)
			 .into(self.drafts);
	}
})
.directive('draft', function() {
  return {
    templateUrl: 'js/directives/draft.html'
  };
});

var Utils = (function(){
	var loadArticlePreviews = function(rxPreviews, DraftDto){
		return {
			into: function(previewList) {
				rxPreviews.flatMap(function(response){
						return Rx.Observable.from(response.data);
					})
					.map(function(story){
						story.url = '';
						story.lastUpdated = moment(story.lastUpdated, moment.ISO_8601).fromNow();
						return story;
					})
					.map(function(story){
						return new DraftDto(story._id, story.username, story.lastUpdated, story.topic, story.summary, story.url);
					})
					.subscribe(function(draft){
						previewList.push(draft);
					}, function(error){
                        console.log(error);
					});
			}
		}
	}

	return {
		loadDraftPreviews: loadArticlePreviews
	}
})();
