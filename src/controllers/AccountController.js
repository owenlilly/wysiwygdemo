const router = require('express').Router();
const RxMongo = require('rxmongo');
const Rx = require('rx');

function isEmpty(str) {
    return (!str || str.trim().length < 1);
}

class ValidationError {
    constructor(hasError, message){
        this.hasError = hasError;
        this.message = message;
    }
}

class RegistrationModel {
    constructor(username, email, password, password2){
        this.username = username;
        this.email = email;
        this.password = password;
        this.password2 = password2;
    }

    validate(){
        const errors = [];

        if(isEmpty(this.username)){
            errors.push('username is required');
        }

        if(isEmpty(this.email)){
            errors.push('email is required');
        }

        if(isEmpty(this.password) || isEmpty(this.password2)){
            errors.push('password and confirmation password are require');
        } else {
            if(this.password !== this.password2){
                errors.push('passwords need to match');
            }
        }

        if(errors.length > 0){
            return new ValidationError(true, errors.toString());
        }

        return new ValidationError(false, 'All good here...');
    }
}

class Response {
    constructor(hasError, message, title){
        this.title = title;
        this.hasError = hasError;
        this.message = message;
    }
}

router
.get('/login', (req, res, next) => {
    if(req.session.username){
        res.redirect('/');
        next();
        return;
    }
    const responseObj = new Response(false, '', 'Login');
    responseObj.username = '';
    if(req.query.next){
        responseObj.next = `?next=${req.query.next}`;
    } else {
        responseObj.next = '';
    }

    res.render('account/login', responseObj);
    next();
})
.post('/login', (req, res, next) => {
    const qs = req.query;
    if(req.session.username){
        if(qs.next){
            res.redirect(qs.next);
        } else {
            res.redirect('/');
        }
        next();
        return;
    }

    const RxCollection = RxMongo.collection('Users');

    const responseObj = new Response(false, '', 'Login');

    RxCollection.flatMap(coll => RxMongo.find(coll, {username: req.body.username}))
                .flatMap(cursor => RxMongo.toArray(cursor))
                .subscribe(user => {
                    if(user.length > 0){
                        req.session.username = req.body.username;
                        if(qs.next){
                            res.redirect(qs.next);
                        } else {
                            res.redirect('/');
                        }
                    } else {
                        responseObj.hasError = true;
                        responseObj.message = 'Invalid username or password';
                        responseObj.username = req.body.username;
                        res.render('account/login', responseObj);
                    }
                }, err => {
                    responseObj.hasError = true;
                    responseObj.message = `Oops: ${err}`;
                    responseObj.username = req.body.username;
                    res.render('account/login', responseObj);
                }
                , () => next());
})
.get('/register', (req, res, next) => {
    if(req.session.username){
        res.redirect('/');
        next();
        return;
    }

    res.render('account/register', new Response(false, '', 'Register'));
    next();
})
.post('/register', (req, res, next) => {
    if(req.session.username){
        res.redirect('/');
        next();
        return;
    }
    
    const validation = new RegistrationModel(req.body.username, req.body.email, req.body.password, req.body.password2)
                            .validate();
    const responseObj = new Response(validation.hasError, 'Registration successful', 'Register')

    if(validation.hasError){
        responseObj.hasError = true;
        responseObj.message = validation.message;
        res.render('account/register', responseObj);
        next();
        return;
    }
    
    const RxCollection = RxMongo.collection('Users');
    const RxFind = RxCollection.flatMap(coll => RxMongo.find(coll, {username: req.body.username}))
                                .flatMap(cursor => RxMongo.toArray(cursor));
    const RxInsert = RxCollection.flatMap(coll => RxMongo.insert(coll, {username: req.body.username, password: req.body.password}));

    RxFind.subscribe(found => {
        if(found.length === 0){
            RxInsert.subscribe(result => {
                res.redirect('/account/login');
            });
        } else {
            responseObj.hasError = true;
            responseObj.message = 'Username already in use';
            res.render('account/register', responseObj);
        }
    }, err => {
        responseObj.hasError = true;
        responseObj.message = `Error: ${err}`;
        res.render('account/register', responseObj);
    }, () => next());
})
.get('/logout', (req, res, next) => {
    let sess = req.session;
    req.session.destroy(err => {
        if(err) {
            console.log(err);
        } else {
            res.redirect('/');
        }
    });
});

module.exports = router;