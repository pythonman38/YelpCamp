const express = require('express'),
    router = express.Router({ mergeParams: true }),
    reviews = require('../controllers/reviews'),
    catchAsync = require('../utilities/CatchAsync'),
    { isLoggedIn, validateReview, isReviewAuthor } = require('../middleware/middleware');

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;