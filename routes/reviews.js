const express = require('express'),
    router = express.Router({ mergeParams: true }),
    Campground = require('../models/campground'),
    catchAsync = require('../utilities/CatchAsync'),
    { isLoggedIn, validateReview, isReviewAuthor } = require('../middleware/middleware'),
    Review = require('../models/review');

// Post form data to create view and attach to campground
router.post('/', isLoggedIn, validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Review added to campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}));

// Remove the review from the campground
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully removed review!');
    res.redirect(`/campgrounds/${id}`);
}));

module.exports = router;