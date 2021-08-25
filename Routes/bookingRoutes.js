const express = require('express');
const bookingController = require('../Controllers/bookingController');
const authController = require('../Controllers/authController');
const router = express.Router();

router.use(authController.protect);

router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);

router.use(authController.restrictTo('admin', 'lead-guide'));

router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createOneBooking);

router
  .route('/:id')
  .get(bookingController.getOneBooking)
  .patch(bookingController.upateOneBooking)
  .delete(bookingController.deleteOneBooking);

module.exports = router;
