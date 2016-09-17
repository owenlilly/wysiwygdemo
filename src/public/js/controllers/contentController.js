mainApp.controller('contentController', function(story){
    var self = this;

    var changeCount = 0;
    var storyId = undefined;
    var draftSaving = false;
    var rxChangeNotifier = story.saveDraft;
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
                if(!self.saving){
                    s.onNext(e);
                } else {
                    console.log('debouncing due to draft saving...');
                }
            });
        })
        .debounce(50)
        .filter(function(e){
            var filterOut = !!e.originalEvent && !self.saving;
            console.log('change #: '+ ++changeCount+', filtered out: '+ !filterOut);
            return filterOut;
        })
        .map(function(e){ return storyProvider(); })
        .flatMap(function(_story){
            self.saving = true;
            return rxChangeNotifier(_story);
        })
        .subscribe(function(res){
            self.saving = false;
            storyId = res.data._id;
            console.log(res.data);
        }, function(error){
            self.saving = false;
            console.log(error);
        });
    }

    self.story = '';
    self.topic = '';
    self.saving = false;

    self.deleteStory = function(id){
        console.log(id);
        story.deleteStory(id)
             .subscribe(function(response){
                 console.log(response);
                 window.location = '/';
             }, function(error){
                 console.log(error);
             });
    }

    self.getStoryById = function(id){
        storyId = id;
        rxChangeNotifier = story.update;
		story.getById(id)
                .subscribe(function(response){
                    var s = response.data;
                    self.topic = s.topic;
                    self.story = s.story;
                }, function(err){
                    console.log(err);
                });
	}

    self.getDraftById = function(id){
        storyId = id;
        rxChangeNotifier = story.update;
		story.getDraftById(id)
                .subscribe(function(response){
                    var s = response.data;
                    self.topic = s.topic;
                    self.story = s.story;
                }, function(err){
                    console.log(err);
                });
	}

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

    self.saveDraft = function(){
        story.update(storyProvider())
            .subscribe(
            function(response){
                console.log(response.data);
                window.location = '/drafts';
            },
            function(error){
                console.log('error');
                console.log(error);
            }
        );
    }

    self.saveUpdates = function(){
        story.update(storyProvider())
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
    }
});

var placeholderFunc = function(onInit){

    return function(editor) {

        editor.on('init', function () {
            // Default classes of tinyMCE are a bit weird
            // I add my own class on init
            // this also sets the empty class on the editor on init
            tinymce.DOM.addClass(editor.bodyElement, 'content-editor empty' );
            
            refreshPlaceholder();

            onInit(editor);
        });

        // You CAN do it on 'change' event, but tinyMCE sets debouncing on that event
        // so for a tiny moment you would see the placeholder text and the text you you typed in the editor
        // the selectionchange event happens a lot more and with no debouncing, so in some situations
        // you might have to go back to the change event instead.
        editor.on('selectionchange', function () {
            refreshPlaceholder();
        });

        var refreshPlaceholder = function(){
            if ( editor.getContent() === "" ) {
                tinymce.DOM.addClass(editor.bodyElement, 'empty' );
            } else {
                tinymce.DOM.removeClass(editor.bodyElement, 'empty' );
            }
        }
    }
};
