mainApp.controller('mainController', function(story, DraftDto) {
    var self = this;

	self.drafts = [];
	self.sideItems = [];
	self.username = '';

	self.deleteDraft = function(index){
		var draft = self.drafts[index]; 
        story.deleteStory(draft.id)
             .subscribe(function(response){
				 window.location.reload();
             }, function(error){
                 console.log(error);
             });
    }

	self.getDrafts = function(){
		var rxDrafts = story.getDrafts();
		var storyMapper = function(stry){
			stry.url = '';
			stry.datePublished = '---';
			return stry;
		}
		Utils.loadDraftPreviews(rxDrafts, storyMapper, DraftDto)
			 .into(self.drafts);
	}
})
.directive('draft', function() {
  return {
    templateUrl: 'js/directives/draft.html'
  };
});

var Utils = (function(){
	var loadArticlePreviews = function(rxPreviews, storyMapper, DraftDto){
		return {
			into: function(previewList) {
				rxPreviews.flatMap(function(response){
						return Rx.Observable.from(response.data);
					})
					.map(function(story){
						if(storyMapper){
							return storyMapper(story);
						}
						story.url = story.storyId ? '/@'+story.username+'/'+story.storyId : '#';
						story.datePublished = moment(story.datePublished, moment.ISO_8601).fromNow();
						return story;
					})
					.map(function(story){
						return new DraftDto(story._id, story.username, story.datePublished, story.topic, story.summary, story.url);
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
