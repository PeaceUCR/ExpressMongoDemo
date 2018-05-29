/**
 * Created by hea on 3/13/18.
 */
function checKSession(req, res, next) {
    console.log(req.session);
    //console.log(req.path);
    //prevent check working on register and login
    if((req.session.user===undefined)&&(req.path!=='/login')&&(req.path!=='/addUser')){
        //if redirect please remember for later redirect after login successful
        //https://stackoverflow.com/questions/13335881/redirecting-to-previous-page-after-authentication-in-node-js-using-passport-js
        req.session.returnTo = req.path;
        res.redirect('/login');

    }else{
        next();
    }
}

module.exports = checKSession;