const router = require('express').Router();

class Response {
    constructor(title, isAuthenticated, username){
        this.title = title;
        this.isAuthenticated = isAuthenticated;
        this.username = username;
    }
}

router
.get('/:username', (req, res, next) => {
    
    let sess = req.session;

    const response = new Response('Profile', false, '');
    
    if(sess && sess.username){
        const username = sess.username;
        response.username = username;
        response.isAuthenticated = true;

        if(username === req.params.username){
            res.render('profile/edit', response);
            next();
        } else {
            res.render('profile/view', response);
            next();
        }
    } else {

        res.render('profile/view', response);
        next();
    }
});

module.exports = router;