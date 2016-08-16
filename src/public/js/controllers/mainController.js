mainApp.controller('mainController', function($sce, story) {
    var self = this;

	self.articles = [];
	self.sideItems = [];

	self.getUserStoryPreviews = function(){
		
	}

    var init = function(){
		setupMockSideItems();
		console.log(self.sideItems[0]);

		story.listSamples()
			.flatMap(function(response){
				return Rx.Observable.from(response.data);
			})
			.map(function(stry){
				stry.url = stry.storyId ? '/@'+stry.username+'/'+stry.storyId : '#';
				stry.datePublished = moment(stry.datePublished, moment.ISO_8601).fromNow();
				return stry;
			})
			.map(function(stry){
				return new Article(stry.username, stry.datePublished, stry.topic, stry.summary, stry.url);
			})
			.subscribe(function(article){
				console.log(article);
				self.articles.push(article);
			}, function(error){
				console.log(error);
			});
    };

	var setupMockSideItems = function(){
		self.sideItems.push(new SideItem('Our Picks', 'Topics worth talking about.', ['First', 'Second', 'Third']));
		self.sideItems.push(new SideItem('Recommended', 'Topics you might like.', ['First', 'Second', 'Third']));
		self.sideItems.push(new SideItem('Popular Tags', 'Tags other users seem to like.', ['First', 'Second', 'Third']));
	};

    init();
})
.directive('articles', function() {
  return {
    templateUrl: 'js/directives/articles.html'
  };
});

var loremIpsum = '<p>Lorem ipsum dolor sit amet, quaerendum scribentur consectetuer quo te, vel falli doming no. '+ 
'Decore repudiandae te sit, no est quas cotidieque. An wisi soluta deterruisset nec, mei labitur legimus scriptorem '+ 
'id. Ex nec justo doctus. Natum debet expetendis his ut, sit posse platonem ne, an nec dolor splendide contentiones.</p>' +
'<p>Quidam persecuti ne nam. Ex ferri habemus pri. Ne melius atomorum vim, sensibus efficiantur necessitatibus no sed, '+ 
'reque facilis comprehensam no per. Ut iuvaret detracto vel, in mel blandit gubergren. Usu deserunt antiopam no, ex nam primis aperiam...</p>'

var SideItem = function(title, desc, options){
	return {
		title: title,
		desc: desc,
		options: options
	};
}

var Article = function(who, when, title, preview, url){
	return {
		who: who,
		when: when,
		title: title,
		preview: preview,
		url
	};
}
