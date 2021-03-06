mainApp.controller('mainController', function(story) {
    var self = this;

	self.articles = [];
	self.sideItems = [];
	self.username = '';

	self.deleteStory = function(index){
		var article = self.articles[index]; 
        story.deleteStory(article.id)
             .subscribe(function(response){
				 self.articles.splice(index, 1);
             }, function(error){
                 console.log(error);
             });
    }

	self.getLatestPreviews = function(){
		var rxPreviews = story.listSamples();
		Utils.loadArticlePreviews(rxPreviews)
			 .into(self.articles);
	}

	self.getPreviewsByUser = function(username){
		var rxPreviews = story.getPreviews(username);
		Utils.loadArticlePreviews(rxPreviews)
			 .into(self.articles);
	}

    var init = function(){
		Utils.setupMockSideItems(self.sideItems);
    };

    init();
})
.directive('articles', function() {
  return {
    templateUrl: 'js/directives/articles.html'
  };
});

var Utils = (function(){
	var SideItem = function(title, desc, options){
		return {
			title: title,
			desc: desc,
			options: options
		};
	}

	var Article = function(id, who, when, title, preview, url, author){
		return {
			id: id,
			who: who,
			when: when,
			title: title,
			preview: preview,
			url,
			author
		};
	}

	var setupMockSideItems = function(sideList){
		sideList.push(new SideItem('Our Picks', 'Topics worth talking about.', ['First', 'Second', 'Third']));
		sideList.push(new SideItem('Recommended', 'Topics you might like.', ['First', 'Second', 'Third']));
		sideList.push(new SideItem('Popular Tags', 'Tags other users seem to like.', ['First', 'Second', 'Third']));
	};

	var loadArticlePreviews = function(rxPreviews){
		return {
			into: function(previewList) {
				rxPreviews.flatMap(function(response){
						return Rx.Observable.from(response.data);
					})
					.map(function(story){
						story.url = story.storyId ? '/@'+story.username+'/'+story.storyId : '#';
						story.datePublished = moment(story.datePublished, moment.ISO_8601).fromNow();
						return story;
					})
					.map(function(story){
						return new Article(story._id, story.username, story.datePublished, story.topic, story.summary, story.url, story.author);
					})
					.subscribe(function(article){
						previewList.push(article);
					}, function(error){
						console.log(error);
					});
			}
		}
	}

	return {
		SideItem: SideItem,
		Article: Article,
		setupMockSideItems: setupMockSideItems,
		loadArticlePreviews: loadArticlePreviews
	}
})();
