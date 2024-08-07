function checkAuthStatus(req, res, next) {
    const uid = req.session.uid;

    // console.log('Session User ID:', uid, 'at', new Date());

    if (uid) {
        // If the user is authenticated, set authentication-related locals
        res.locals.uid = uid;
        res.locals.isAuth = true;
        res.locals.isAdmin = req.session.isAdmin;
    } else {
        // If the user is not authenticated, set isAuth to false
        res.locals.isAuth = false;
        // You can also set other authentication-related locals to default values here if needed
        res.locals.uid = null;
        res.locals.isAdmin = false;
    }

    next();
}

module.exports = checkAuthStatus;
