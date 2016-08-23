const RxCollection = require('rxmongo').RxCollection;
const RxMongo = require('rxmongo').RxMongo;
const Rx = require('rx');
const ObjectID = require('mongodb').ObjectID;


const AccountService = (function(){

    function AccountService(){
        this.rxCollection = new RxCollection('Users');
    }

    AccountService.prototype.find = function(query){
        return this.rxCollection
                    .find(query);
    }

    // emits boolean
    AccountService.prototype.exists = function(query){
        const first = this.find(query)
                            .limit(1)
                            .first();

        return Rx.Observable.create(s => {
            first.subscribe(found => {
                s.onNext(!!found);
            }, error => {
                s.onError(error);
            }, () => s.onCompleted());
        });
    }

    AccountService.prototype.usernameExists = function(username){
        return this.exists({username: username});
    }

    AccountService.prototype.emailExists = function(email){
        return this.exists({email: email});
    }

    AccountService.prototype.findByUsername = function(username){
        return this.find({username: username})
                    .limit(1)
                    .single();
    }

    AccountService.prototype.createUser = function(user){

        const rxExistsEmail = this.emailExists(user.email);
        const rxExistsUsername = this.usernameExists(user.username);
        const rxCreateUser = this.rxCollection.insert(user);

        const rxZipped = Rx.Observable.zip(
            rxExistsEmail,
            rxExistsUsername,
            function(emailExits, usernameExits){
                if(emailExits || usernameExits){
                    const errors = [];

                    if(emailExits){
                        errors.push('Email address exists');
                    }
                    if(usernameExits){
                        errors.push('Username exists');
                    }

                    throw new Error(errors);
                }

                return rxCreateUser;
            }
        );

        return rxZipped
               .flatMap(obs => obs); // flatMap to Observable<User> because since
                                     // .zip returns an Observable, our Observable<User>
                                     // return value became Observable<Observable<User>
    }

    return AccountService;
})();

module.exports = AccountService;