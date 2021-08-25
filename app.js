const path = require('path');
const express = require('express');
const globalErrorHandler = require('./Controllers/errorController');
const appError = require('./utils/appError');
const tourRouter = require('./Routes/tourRoutes');
const userRouter = require('./Routes/userRoutes');
const reviewRouter = require('./Routes/reviewRoutes');
const viewRouter = require('./Routes/viewRoutes');
const bookingRouter = require('./Routes/bookingRoutes');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const MongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const app = express();

//setting view engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//body parsisng, reading data from req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

//serve static files
//app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

//Set security http headers
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", 'https:', 'http:', 'data:', 'ws:'],
      baseUri: ["'self'"],
      fontSrc: ["'self'", 'https:', 'http:', 'data:'],
      scriptSrc: ["'self'", 'https:', 'http:', 'blob:'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https:', 'http:'],
    },
  })
);

//deveelpmnet logging
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//to implement number of reuests a client can make to a server.
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again after an hour.',
});
app.use('/api', limiter);

//data sanitization against nosql injections
app.use(MongoSanitize());

//data sanitization against xss
app.use(xss());

//prevent http parameter pollution.
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

//route handlers

app.use('/api/tours', tourRouter);
app.use('/api/users', userRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/booking', bookingRouter);
app.use('/', viewRouter);

//To handle unhandled routes
app.all('*', (req, res, next) => {
  const err = new appError(
    `Could not find ${req.originalUrl} on this server`,
    404
  );

  next(err);
});

//global error handling middleware
app.use(globalErrorHandler);

module.exports = app;
