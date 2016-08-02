mainApp.controller('mainController', function() {
    var self = this;

    self.editorReady = false;

    var init = function(){
        // setupTinyMce('div.editable');
        // self.editorReady = true;
    };

    init();
});

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