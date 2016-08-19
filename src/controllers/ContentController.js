const router = require('express').Router();
const StoryService = require('src/services/StoryService');
const SessService = require('src/services/SessionService');

class Response {
    constructor(title, isAuthenticated, username){
        this.title = title;
        this.isAuthenticated = isAuthenticated;
        this.username = username;
    }
}

router
.get('/write', (req, res, next) => {
    const response = new Response('Write Story', SessService.isValid(req), '');
    const sess = req.session;

    if(!req.session.username){
        res.redirect('/account/login?next='+req.originalUrl);
        next();
        return;
    }
    
    response.isAuthenticated = true;
    response.username = req.session.username;
    res.render('content/write', response);
    next();
})
.get('/drafts', (req, res, next) => {
    const response = new Response('Drafts', SessService.isValid(req), '');
    const sess = req.session;

    if(!req.session.username){
        res.redirect('/account/login?next='+req.originalUrl);
        next();
        return;
    }
    
    response.author = req.session.username;
    response.username = req.session.username;
    res.render('content/drafts', response);
    next();
})
.get('/edit/:id', (req, res, next) => {
    const response = new Response('Edit', SessService.isValid(req), '');
    const sess = req.session;

    if(!req.session.username){
        res.redirect('/account/login?next='+req.originalUrl);
        next();
        return;
    }
    
    response.data = {id: req.params.id};
    response.username = req.session.username;
    res.render('content/edit', response);
    next();
})
.get('/@+:username', (req, res, next) => {
    const author = req.params.username;
    const response = new Response(`Writer: ${author}`, !!req.session.username, req.session.username);
    const storyService = new StoryService();

    storyService.getPreviews({username: author})
                .subscribe(stories => {
                    if(stories.length < 1){
                        res.status(404).json({error: 'story not found'});
                    } else {
                        response.author = author;
                        response.data = stories;
                        res.render('content/user', response);
                    }
                },
                error => {
                    res.status(500).json({error: error});
                },
                () => next());
})
.get('/@+:username/:storyId', (req, res, next) => {
    const response = new Response('Read', false, '');

    let sess = req.session;

    if(req.session.username){
        response.isAuthenticated = true;
        response.username = req.session.username;
    }

    const username = req.params.username;
    const storyId = req.params.storyId;
    const onNext = (story) => {
        if(!story){
            res.status(404).json({error: 'story not found'});
        } else {
            response.data = story;
            response.title = story.topic;
            res.render('content/read', response);
        }
    }
    const onError = (error) => {
        res.status(500).json({error: error});
    }
    
    const storyService = new StoryService();
    storyService.getStory(username, storyId)
                .subscribe(story => onNext(story),
                            error => onError(error),
                            () => next());
});

module.exports = router;