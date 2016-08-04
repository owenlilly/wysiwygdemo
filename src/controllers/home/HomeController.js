const router = require('express').Router();

class Response {
    constructor(title, isAuthenticated, username){
        this.title = title;
        this.isAuthenticated = isAuthenticated;
        this.username = username;
    }
}

router
.get('/', (req, res, next) => { 
    const response = new Response('Home', false, '');

    let sess = req.session;

    if(req.session.username){
        response.isAuthenticated = true;
        response.username = req.session.username;
    }

    res.render('home/index', response);
    next();
})
.get('/about', (req, res, next) => {
    res.render('home/about');
    next();
})
.get('/contact', (req, res, next) => {
    res.render('home/contact');
    next();
});

module.exports = router;