const mongoose = require('mongoose');

bookingSchema = mongoose.Schema(
  {
    user: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Booking must belong to a user'],
      },
    ],
    tour: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Booking must belong to a tour'],
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    price: {
      type: Number,
      required: [true, 'Booking must have a price'],
    },
    paid: {
      type: Boolean,
      default: true,
    },
  },
  {
    toJson: { virtuals: true },
    toObject: { virtuals: true },
  }
);

bookingSchema.pre(/^find/, function (next) {
  this.populate('user').populate({
    path: 'tour',
    select: 'name',
  });
  next();
});

const Booking = new mongoose.model('Booking', bookingSchema);
module.exports = Booking;
