mainApp.controller('mainController', function($sce) {
    var self = this;

    self.editorReady = false;
	self.articles = [];

    var init = function(){
        // setupTinyMce('div.editable');
        // self.editorReady = true;
		setupMockArticles();
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

    init();
});

var loremIpsum = '<p>Lorem ipsum dolor sit amet, quaerendum scribentur consectetuer quo te, vel falli doming no. '+ 
'Decore repudiandae te sit, no est quas cotidieque. An wisi soluta deterruisset nec, mei labitur legimus scriptorem '+ 
'id. Ex nec justo doctus. Natum debet expetendis his ut, sit posse platonem ne, an nec dolor splendide contentiones.</p>' +
'<p>Quidam persecuti ne nam. Ex ferri habemus pri. Ne melius atomorum vim, sensibus efficiantur necessitatibus no sed, '+ 
'reque facilis comprehensam no per. Ut iuvaret detracto vel, in mel blandit gubergren. Usu deserunt antiopam no, ex nam primis aperiam...</p>'

var Article = function(who, when, title, preview){
	return {
		who: who,
		when: when,
		title: title,
		preview: preview
	};
}

var setupTinyMce = function(selector){
    tinymce.init({ 
		selector: selector,
		menubar: false,
        inline: true,
		plugins: [
			"advlist autolink lists link image charmap print preview hr anchor pagebreak",
			"searchreplace wordcount visualblocks visualchars code fullscreen",
			"insertdatetime media nonbreaking save table contextmenu directionality",
			"emoticons template paste textcolor colorpicker textpattern imagetools spellchecker"
		],
		toolbar1: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent",
		toolbar2: "print preview spellchecker | forecolor backcolor emoticons | link image media",
		image_advtab: true
	});
};