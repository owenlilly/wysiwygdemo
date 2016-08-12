const router = require('express').Router();
const RxMongo = require('rxmongo');

class Response {
    constructor(title, isAuthenticated, username){
        this.title = title;
        this.isAuthenticated = isAuthenticated;
        this.username = username;
    }
}

router
.get('/write', (req, res, next) => {
    const response = new Response('Write Story', false, '');
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
.get('/v/:username', (req, res, next) => {
    res.send(`${req.params.username}: ${req.params.article_id}`);
    next();
})
.get('/v/:username/:storyId', (req, res, next) => {
    const response = new Response('Read', false, '');

    let sess = req.session;

    if(req.session.username){
        response.isAuthenticated = true;
        response.username = req.session.username;
    }

    const username = req.params.username;
    const storyId = req.params.storyId;

    const rxCollection = RxMongo.collection('Stories');
    rxCollection.flatMap(coll => RxMongo.find(coll, {username: username, storyId: storyId}))
                .flatMap(cursor => RxMongo.toArray(cursor))
                .subscribe(stories => {
                    if(stories.length < 1){
                        res.status(404).json({error: 'story not found'});
                    } else {
                        const story = stories[0];
                        response.data = story;
                        response.title = story.topic;

                        res.render('content/read', response);
                    }
                }, 
                error => {
                    res.status(500).json({error: error});
                },
                () => next());
});

module.exports = router;