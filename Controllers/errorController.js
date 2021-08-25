const appError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path} : ${err.value}.`;
  return new appError(message, 400);
};

const handleDuplicateKeyDB = (err) => {
  const message = `Duplicate Key : ${err.keyValue.name}`;
  return new appError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errorMessages = Object.values(err.errors).map((ele) => ele.message);
  //console.log(errorMessages);
  const message = `${errorMessages.join(' ')}`;
  return new appError(message, 400);
};

const handleJsonWebTokenError = () => {
  const message = `Invalid Token. Please login again`;
  return new appError(message, 401);
};

const handleExpiredJWTError = () => {
  const message = `Token has expired. Please login again`;
  return new appError(message, 401);
};

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      err,
    });
  } else {
    console.log(err);
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }
};

const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      res.status(500).json({
        status: 'fail',
        message: 'Something went wrong!',
      });
    }
  } else {
    console.log(err);
    if (err.isOperational) {
      res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: err.message,
      });
    } else {
      res.status(500).render('error', {
        title: 'Something went wrong!',
        msg: 'Please try again later!',
      });
    }
  }
};

module.exports = (err, req, res, next) => {
  err.status = err.status || 'error';
  err.statusCode = err.statusCode || 500;
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else {
    let error = { ...err };
    error.name = err.name;
    error.message = err.message;
    if (err.name === 'CastError') {
      error = handleCastErrorDB(error);
    }
    if (error.code === 11000) {
      error = handleDuplicateKeyDB(error);
    }
    if (error.name === 'ValidationError') {
      error = handleValidationErrorDB(error);
    }
    if (error.name === 'JsonWebTokenError') {
      error = handleJsonWebTokenError();
    }
    if (error.name === 'TokenExpiredError') {
      error = handleExpiredJWTError();
    }
    sendErrorProd(error, req, res);
  }
};
