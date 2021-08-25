const Tour = require('../Models/tourModel');
const appError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../Models/bookingModel');
const factory = require('../Controllers/handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  //!.) get currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  //2.) create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user._id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tours/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
        amount: tour.price * 100,
        currency: 'inr',
        quantity: 1,
      },
    ],
  });

  //3.)create session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  //temporary because unsecure
  const { tour, user, price } = req.query;
  if (!tour && !user && !price) return next();

  await Booking.create({ tour, user, price });

  res.redirect(req.originalUrl.split('?')[0]);
  //next();
});

exports.getAllBookings = factory.getAll(Booking);
exports.getOneBooking = factory.getOne(Booking);
exports.createOneBooking = factory.createOne(Booking);
exports.upateOneBooking = factory.updateOne(Booking);
exports.deleteOneBooking = factory.deleteOne(Booking);
