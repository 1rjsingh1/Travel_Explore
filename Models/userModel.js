const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const Userschema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: {
      validator: validator.isEmail,
      message: 'This is not a valid email',
    },
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'A password is required'],
    minlength: 8,
    select: false,
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm the password'],
    validate: {
      //Works only for CREATE and SAVE !!!!!!!!!!!
      validator: function (ele) {
        return ele === this.password;
      },
      message: 'Passwords doesnt match',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpiresAt: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

Userschema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

Userschema.pre('save', async function (next) {
  //only run if password is modified.
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

Userschema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

Userschema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

Userschema.methods.changedPasswordAfter = async function (JwtTimestamp) {
  if (this.passwordChangedAt) {
    //this.passwordChangedAt > JwtTimestamp
    const changedTimestamp = this.passwordChangedAt.getTime() / 1000;
    if (Number(changedTimestamp) > Number(JwtTimestamp)) return true;
  }

  return false;
};

Userschema.methods.generateResetPasswordToken = async function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log(resetToken, this.passwordResetToken);
  this.passwordResetExpiresAt = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', Userschema);
module.exports = User;
