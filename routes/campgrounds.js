const express = require('express'),
    router = express.Router(),
    Campground = require('../models/campground'),
    catchAsync = require('../utilities/CatchAsync'),
    { isLoggedIn, isCampgroundAuthor, validateCampground } = require('../middleware/middleware');

// List of all campgrounds
router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}));

// Form to make a new campground
router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
});

// Post form data to create new campground
router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Successfully created a new campground!');
    res.redirect(`campgrounds/${campground._id}`);
}));

// Detail page for a single campground
router.get('/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!campground) {
        req.flash('error', 'Sorry, we could not find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}));

// Form to edit a campground
router.get('/:id/edit', isLoggedIn, isCampgroundAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Sorry, we could not find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}));

// Post form data to edit campground
router.put('/:id', isLoggedIn, isCampgroundAuthor, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash('success', "Sucessfully updated campground!");
    res.redirect(`/campgrounds/${campground._id}`);
}));

// Remove the campground (and all attached reviews)
router.delete('/:id', isLoggedIn, isCampgroundAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', "Successfully removed campground!");
    res.redirect('/campgrounds');
}));

module.exports = router;