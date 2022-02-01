const express = require('express'),
    router = express.Router({ mergeParams: true }),
    Campground = require('../models/campground'),
    catchAsync = require('../utilities/CatchAsync'),
    ExpressError = require('../utilities/ExpressError'),
    { reviewSchema } = require('../schemas/schemas'),
    { isLoggedIn } = require('../middleware/middleware'),
    Review = require('../models/review');

// Middleware functions
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else next();
}

// Post form data to create view and attach to campground
router.post('/', isLoggedIn, validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Review added to campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}));

// Remove the review from the campground
router.delete('/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully removed review!');
    res.redirect(`/campgrounds/${id}`);
}));

module.exports = router;