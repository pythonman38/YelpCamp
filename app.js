const express = require('express'),
    app = express(),
    path = require('path'),
    mongoose = require('mongoose'),
    Campground = require('./models/campground'),
    methodOverride = require('method-override'),
    ejsMate = require('ejs-mate'),
    catchAsync = require('./utilities/CatchAsync'),
    ExpressError = require('./utilities/ExpressError'),
    { campgroundSchema } = require('./schemas/schemas'),
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

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Middleware functions
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else next();
}

// Home page
app.get('/', (req, res) => {
    res.render('home');
});

// List of all campgrounds
app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}));

// Form to make a new campground
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
});

// Post form data to create new campground
app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`campgrounds/${campground._id}`);
}));

// Detail page for a single campground
app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show', { campground });
}));

// Form to edit a campground
app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
}));

// Post form data to edit campground
app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${campground._id}`);
}));

// Delete the campground
app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));

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