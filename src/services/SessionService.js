const SessionService = (function(){

    const sessionValid = function(req){
        return !!req.session.username;
    }

    return {
        isValid: sessionValid
    };
})();

module.exports = SessionService;