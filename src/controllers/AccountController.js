const router = require('express').Router();
const RxMongo = require('rxmongo').RxMongo;
const Rx = require('rx');
const AccountService = require('src/services/AccountService');

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
    }

    responseObj.next = responseObj.next || '';
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

    const responseObj = new Response(false, '', 'Login');

    new AccountService()
    .findByUsername(req.body.username)
    .subscribe(
        account => {
            if(account){
                if(account.password !== req.body.password){
                    res.redirect('login');
                    return;
                }

                req.session.username = account.username;
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
        }, 
        err => {
            responseObj.hasError = true;
            responseObj.message = `Oops: ${err}`;
            responseObj.username = req.body.username;
            res.render('account/login', responseObj);
        }, 
        () => next()
    );
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

    const account = {
        fullname: req.body.fullname,
        username: req.body.username,
        password: req.body.password,
        email: req.body.email
    };

    new AccountService()
    .createUser(account)
    .subscribe(
        result => {
            res.redirect('login');
            next();
        }, err => {
            responseObj.hasError = true;
            responseObj.message = `Error: ${err.message}`;
            res.render('account/register', responseObj);
        }, () => {
            next();
        }
    );
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