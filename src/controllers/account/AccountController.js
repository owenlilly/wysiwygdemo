const router = require('express').Router();
const RxMongo = require('rxmongo');
const Rx = require('rx');

class Response {
    constructor(isError, message, title){
        this.title = title;
        this.isError = isError;
        this.message = message;
    }
}

router
.get('/login', (req, res, next) => {
    res.render('account/login', {title: 'Login'});
    next();
})
.post('/login', (req, res, next) => {
    const RxCollection = RxMongo.collection('Users');

    RxCollection.flatMap(coll => RxMongo.find(coll, {username: req.body.username}))
                .flatMap(cursor => RxMongo.toArray(cursor))
                .subscribe(user => {
                    if(user.length > 0){
                        res.redirect('/');
                    } else {
                        res.render('account/login', {title: 'Login'});
                    }
                }, err => {
                    res.render('account/login', {title: 'Login'});
                }
                , () => next());
})
.get('/register', (req, res, next) => {
    res.render('account/register', {title: 'Register'});
    next();
})
.post('/register', (req, res, next) => {
    const RxCollection = RxMongo.collection('Users');
    const RxFind = RxCollection.flatMap(coll => RxMongo.find(coll, {username: req.body.username}))
                                .flatMap(cursor => RxMongo.toArray(cursor));
    const RxInsert = RxCollection.flatMap(coll => RxMongo.insert(coll, {username: req.body.username, password: req.body.password}));

    const responseObj = new Response(false, 'Registration successful', 'Register')
    RxFind.subscribe(found => {
        if(found.length === 0){
            RxInsert.subscribe(result => {
                res.redirect('/account/login', responseObj);
            });
        } else {
            responseObj.isError = true;
            responseObj.message = 'Username already in use';
            res.render('account/register', responseObj);
        } 
    }, err => {
        responseObj.isError = true;
        responseObj.message = `Error: ${err}`;
        res.render('account/register', responseObj);
    }, () => next());
});

module.exports = router;