module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'Sorry, you must be signed in to use this feature!');
        return res.redirect('/login');
    }
    next();
}
