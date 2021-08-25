const mongoose = require('mongoose');
const Tour = require('./tourModel');

reviewSchema = mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Please write a review'],
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating'],
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    user: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user'],
      },
    ],
    tour: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour'],
      },
    ],
  },
  {
    toJson: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// //ecah user can worite one review only
reviewSchema.index({ user: 1, tour: 1 }, { unique: true });

reviewSchema.pre(/^find/, async function (next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name',
  // });
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

reviewSchema.statics.calcAverageRating = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  console.log(stats);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 4.5,
      ratingsQuantity: 0,
    });
  }
};

reviewSchema.post('save', function () {
  //this.construtor points to current model
  this.constructor.calcAverageRating(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  //this points to query, we need model in order to run our stats, after executing query ,we will get a document, save this document and then use this.rev.constructor in post middleware
  this.rev = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  //this points to query, we need model in order to run our stats, after executing query ,we will get a document, save this document and then use this.rev.constructor in post middleware
  await this.rev.constructor.calcAverageRating(this.rev.tour);
});

const Review = new mongoose.model('Review', reviewSchema);
module.exports = Review;
