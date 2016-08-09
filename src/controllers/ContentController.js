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

    let sess = req.session;

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
.get('/v/:username/:article_id', (req, res, next) => {
    res.send(`${req.params.username}: ${req.params.article_id}`);
    next();
});

module.exports = router;