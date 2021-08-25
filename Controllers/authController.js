const { promisify } = require('util');
const User = require('../Models/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const appError = require('../utils/appError');
const Email = require('../utils/email');
const crypto = require('crypto');
const { resolve } = require('path');

const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const sendJWTToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  //sending jwt in a cookie
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.logout = catchAsync(async (req, res) => {
  res.cookie('jwt', 'loggedOut', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
});

exports.signUp = catchAsync(async (req, res, next) => {
  //security flaw as any user can sepcify the role as admin

  if (req.body.role === 'admin') req.body.role = undefined;
  const newUser = await User.create(req.body);
  // const newUser = await User.create({
  //   name: req.body.name,
  //   email: req.body.email,
  //   password: req.body.password,
  //   passwordConfirm: req.body.passwordConfirm,
  // });

  //sending welcom mail
  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser, url).sendWelcome();

  //after signing in, he should be logged in also
  sendJWTToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new appError('Please enter email and password!', 400));
  }
  const user = await User.findOne({ email }).select('password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new appError('Invalid login credentials!', 401));
  }

  sendJWTToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  //check if token is there
  let token = '';
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(new appError('You are not logged in! Please login first', 401));
  }

  //verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //check if user still exists
  const currUser = await User.findById(decoded.id);
  if (!currUser)
    return next(
      new appError('The user belonging to this token no longer exists')
    );

  //check if user has recently changed his password
  const changed = await currUser.changedPasswordAfter(decoded.iat);
  if (changed) {
    return next(
      new appError(
        'Password is modified after the token was issued!. Please login again!',
        401
      )
    );
  }

  //GRANT ACCESS TO PROTECTED ROUTE
  req.user = currUser;
  res.locals.user = currUser;
  next();
});

exports.isLoggedIn = async (req, res, next) => {
  //check if token is there
  try {
    if (req.cookies.jwt) {
      //verification token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      //check if user still exists
      const currUser = await User.findById(decoded.id);
      if (!currUser) return next();

      //check if user has recently changed his password
      const changed = await currUser.changedPasswordAfter(decoded.iat);
      if (changed) {
        return next();
      }

      //THERE IS A LOGGED IN USER
      res.locals.user = currUser;
      //req.user = currUser;
      return next();
    }
  } catch (err) {
    return next();
  }

  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new appError('Permission not granted', 403));
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1.) get user based on email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new appError('No user exists', 404));
  }
  //2.) generate random token
  const resetToken = await user.generateResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // const message = `Forgot your password? Submit a patch request to ${resetUrl} with your new password and passwordConfirm`;

  try {
    // await sendEmail({
    //   email: user.email,
    //   subject: `Password reset token (valid for 10 minutes only)`,
    //   message,
    // });
    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/api/users/resetpassword/${resetToken}`;

    await new Email(user, resetUrl).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to your email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpiresAt = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new appError('There was an error sending the mail, Try again later.', 500)
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1.) get user token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  //2.) if token not expired and user exitss,set new passowrd

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpiresAt: { $gt: Date.now() },
  });
  if (!user) {
    return next(new appError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  user.passwordResetToken = undefined;
  user.passwordResetExpiresAt = undefined;
  await user.save();

  //3.)update changed passowrd property
  //4.) login user , send jwt token
  sendJWTToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1.) user from collection
  const user = await User.findById(req.user.id).select('password');
  if (!user) {
    return next(new appError('No user found', 400));
  }

  //2.)posted passord is corect
  if (!(await user.correctPassword(req.body.currpassword, user.password)))
    return next(new appError('Incorrect password', 401));

  //3.)update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  //4.)login user and send jwt
  sendJWTToken(user, 201, res);
});
