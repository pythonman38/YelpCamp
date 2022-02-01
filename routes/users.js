const express = require('express'),
    router = express.Router(),
    passport = require('passport'),
    catchAsync = require('../utilities/CatchAsync'),
    User = require('../models/user');

// Form to register a new user
router.get('/register', (req, res) => {
    res.render('users/register');
});

// Post form data to create a new user
router.post('/register', catchAsync(async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', `Welcome to Yelp Camp, ${user.username}!`);
            res.redirect('/campgrounds');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}));

// Form to log in an existing user
router.get('/login', (req, res) => {
    res.render('users/login');
});

// Post form data to log in the user
router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', `Welcome back, ${req.body.username}!`);
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
});

// Logs the user out of the website
router.get('/logout', (req, res) => {
    req.flash('success', 'Goodbye!');
    req.logout();
    res.redirect('/campgrounds');
});

module.exports = router;