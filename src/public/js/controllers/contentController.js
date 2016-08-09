mainApp.controller('contentController', function($sce, $http, story){
    var self = this;

    var storyId = undefined;
    var draftSaving = false;
    var storyProvider = function(){
        return {
            _id: storyId,
            topic: self.topic,
            story: self.story
        }
    }

    var onInit = function(editor){
        Rx.Observable.create(function(s){
            editor.on('change', function(e){
                if(!draftSaving){
                    s.onNext(e);
                } else {
                    console.log('debouncing due to draft saving...');
                }
            });
        })
        .debounce(50)
        .filter(function(e){
            return e.originalEvent && !draftSaving;
        })
        .map(function(e){ return storyProvider(); })
        .flatMap(function(_story){
            draftSaving = true;
            return story.saveDraft(_story);
        })
        .subscribe(function(res){
            draftSaving = false;
            storyId = res.data._id;
            console.log(res.data);
        });
    }

    self.story = '';
    self.topic = '';

    self.tinymceTopicOptions = { 
        menubar: false,
        inline: true,
		toolbar1: "undo redo",
        setup: placeholderFunc(onInit),
        browser_spellcheck : true
    };

    self.tinymceStoryOptions = { 
		menubar: false,
        inline: true,
		plugins: [
			"advlist autolink lists link image charmap print preview hr anchor pagebreak",
			"searchreplace wordcount visualblocks visualchars code fullscreen",
			"insertdatetime media nonbreaking save table contextmenu directionality",
			"emoticons template paste textcolor colorpicker textpattern imagetools spellchecker"
		],
		toolbar1: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify "+ 
                    "| bullist numlist outdent indent | link image media",
		image_advtab: true,
        setup: placeholderFunc(onInit),
        browser_spellcheck : true
	};

    self.publish = function(){
        story.publish(storyProvider())
            .subscribe(
            function(response){
                console.log(response.data);
                window.location = '/';
            },
            function(error){
                console.log('error');
                console.log(error);
            }
        );
    };
});

var placeholderFunc = function(onInit){

    return function(editor) {

        editor.on('init', function () {
            // Default classes of tinyMCE are a bit weird
            // I add my own class on init
            // this also sets the empty class on the editor on init
            tinymce.DOM.addClass(editor.bodyElement, 'content-editor empty' );

            onInit(editor);
        });

        // You CAN do it on 'change' event, but tinyMCE sets debouncing on that event
        // so for a tiny moment you would see the placeholder text and the text you you typed in the editor
        // the selectionchange event happens a lot more and with no debouncing, so in some situations
        // you might have to go back to the change event instead.
        editor.on('selectionchange', function () {
            if ( editor.getContent() === "" ) {
                tinymce.DOM.addClass(editor.bodyElement, 'empty' );
            } else {
                tinymce.DOM.removeClass(editor.bodyElement, 'empty' );
            }
        });
    }
};
