const router = require('express').Router();
const StoryService = require('src/services/StoryService');

router
.post('/story/publish', (req, res, next) => {
    const sess = req.session;
    if(!sess.username){
        res.status(401).json({error: 'Login required'});
        next();
        return;
    }

    const username = sess.username;
    const body = req.body;
    const storyService = new StoryService();

    storyService.publish(username, body)
                .subscribe(result => {
                        res.json(body);
                    },
                    error => {
                        res.status(500).json({error: error});
                    },
                    () => next()
                );
})
.post('/story/update', (req, res, next) => {
    const sess = req.session;
    if(!sess.username){
        res.status(401).json({error: 'Login required'});
        next();
        return;
    }

    const storyService = new StoryService();
    const updates = req.body;

    storyService.update(req.session.username, updates)
                .subscribe(result => {
                    res.json(updates);
                }, error => {
                    res.status(500).json({error: error});
                }, () => next());
})
.post('/story/save-draft', (req, res, next) => {
    const sess = req.session;
    if(!sess.username){
        res.status(401).json({error: 'Login required'});
        next();
        return;
    }

    const storyService = new StoryService();
    let body = req.body;
    body.isDraft = true;

    storyService.saveDraft(sess.username, body)
        .subscribe(result => {
            res.json(body);
        },
        error => {
            res.status(500).json({error: error});
        },
        () => next());
})
.delete('/story', (req, res, next) => {
    const sess = req.session;
    if(!sess.username){
        res.status(401).json({error: 'Login required'});
        next();
        return;
    }

    res.json({status: 'Deleted!'});
    next();
})
.get('/story', (req, res, next) => {

    const storyService = new StoryService();

    storyService.getPreviews({isDraft: false})
                .subscribe(
                    stories => {
                        res.json(stories);
                    },
                    error => {
                        res.status(500).json({error: error});
                    },
                    () => next()
                );
})
.get('/story/byid/:id', function(req, res, next){
    const storyService = new StoryService();

    storyService.getByIdAndUsername(req.params.id, req.session.username)
                .subscribe(
                    story => {
                        if(!story){
                            res.status(404).json({error: `Story not found for id ${req.params.id}`});
                            return;
                        }
                        res.json(story);
                    },
                    error => {
                        res.status(500).json({error: error});
                    },
                    () => next()
                );
})
.get('/story/user/:username', function(req, res, next){

    const match = {
        isDraft: false, 
        username: req.params.username
    };
    const storyService = new StoryService();

    storyService.getPreviews(match)
                .subscribe(
                    stories => {
                        res.json(stories);
                    },
                    error => {
                        res.status(500).json({error: error});
                    },
                    () => next()
                );
})
.get('/story/drafts', function(req, res, next) {

    const sess = req.session;
    if(!sess.username){
        res.status(401).json({error: 'Login required'});
        next();
        return;
    }
    
    const storyService = new StoryService();

    storyService.getPreviews({username: req.session.username, isDraft: true})
                .subscribe(drafts => {
                    res.json(drafts);
                }, error => {
                    res.status(500).json({error: error});
                }, () => next());
});

module.exports = router;