mainApp.controller('mainController', function($sce, story) {
    var self = this;

	self.articles = [];
	self.sideItems = [];

    var init = function(){
		setupMockSideItems();
		console.log(self.sideItems[0]);

		story.listSamples()
			.flatMap(function(respose){
				return Rx.Observable.from(respose.data);
			})
			.map(function(stry){
				return new Article(stry.username, moment(stry.datePublished, moment.ISO_8601).fromNow(), 
									stry.topic, stry.summary);
			})
			.subscribe(function(article){
				console.log(article);
				self.articles.push(article);
			}, function(error){
				console.log(error);
			});
    };

	var setupMockArticles = function(){
		self.articles.push(new Article('John Doe', '1 day ago', 'Insuring Your Vehicle', $sce.trustAsHtml(loremIpsum)));
		self.articles.push(new Article('Kadine June', '2 days ago', 'How To Import a Vehicle', $sce.trustAsHtml(loremIpsum)));
		self.articles.push(new Article('Jane Doe', '3 days ago', 'Buying Your First Home', $sce.trustAsHtml(loremIpsum)));
		self.articles.push(new Article('Deborah Snow', '3 days ago', 'Tracing Your Family Tree', $sce.trustAsHtml(loremIpsum)));
		self.articles.push(new Article('Barbara Grene', '3 days ago', 'Paying Traffic Tickets Online', $sce.trustAsHtml(loremIpsum)));
		self.articles.push(new Article('Aden Jolt', '3 days ago', 'Applying For University', $sce.trustAsHtml(loremIpsum)));
		self.articles.push(new Article('Bryan Deluce', '3 days ago', 'Understanding Flexi-Workweek', $sce.trustAsHtml(loremIpsum)));
	};

	var setupMockSideItems = function(){
		self.sideItems.push(new SideItem('Our Picks', 'Topics worth talking about.', ['First', 'Second', 'Third']));
		self.sideItems.push(new SideItem('Recommended', 'Topics you might like.', ['First', 'Second', 'Third']));
		self.sideItems.push(new SideItem('Popular Tags', 'Tags other users seem to like.', ['First', 'Second', 'Third']));
	};

    init();
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

var Article = function(who, when, title, preview){
	return {
		who: who,
		when: when,
		title: title,
		preview: preview
	};
}
