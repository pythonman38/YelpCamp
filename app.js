const express = require('express'),
    app = express(),
    path = require('path'),
    mongoose = require('mongoose'),
    methodOverride = require('method-override'),
    ejsMate = require('ejs-mate'),
    session = require('express-session'),
    ExpressError = require('./utilities/ExpressError'),
    campgrounds = require('./routes/campgrounds'),
    reviews = require('./routes/reviews'),
    flash = require('connect-flash'),
    port = 80;

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected...');
});

const sessionConfig = {
    secret: 'thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session(sessionConfig));
app.use(flash());

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);

// Home page
app.get('/', (req, res) => {
    res.render('home');
});

// ExpressError error handler
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 400));
});

// Generic error handler
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh no! Something went wrong!';
    res.status(statusCode).render('error', { err });
});

// Default port used to run the server
app.listen(port, () => {
    console.log('Serving on localhost port 80...');
});