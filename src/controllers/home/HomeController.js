const router = require('express').Router();

router
.get('/', (req, res, next) => { 
    res.render('home/index');
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