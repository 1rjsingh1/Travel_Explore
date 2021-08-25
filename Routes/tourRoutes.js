const express = require('express');
const tourController = require('../Controllers/tourControllers');
const authController = require('../Controllers/authController');
//const reviewController = require('../Controllers/reviewController');
const reviewRouter = require('../Routes/reviewRoutes');
const Tour = require('../Models/tourModel');
const router = express.Router();
//router.param('id', tourController.checkId);

// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview
//   );

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImage,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

router.use('/:tourId/reviews', reviewRouter);

router
  .route('/top-5-cheapest')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);

router
  .route('/monthly-plans/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );

//for tours starting near me
router
  .route('/tours-within/:distance/center/:latlong/unit/:unit')
  .get(tourController.getToursWithin);

//calculating distance from a certain point to all other tours
router.route('/distances/:latlong/unit/:unit').get(tourController.getDistances);
//
module.exports = router;
