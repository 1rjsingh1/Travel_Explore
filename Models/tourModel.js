const mongoose = require('mongoose');
const validator = require('validator');
const slugify = require('slugify');
//const User = require('./userModel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must hae a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour mst have <= 40 chars'],
      minlength: [10, 'A tour must have minimum of 10 chars'],
      //validate: [validator.isAlpha, 'Must contains letters only'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'Must have durations'],
    },
    price: {
      type: Number,
      required: true,
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be between 1 and 5'],
      max: [5, 'Rating must be between 1 and 5'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'Must have'],
    },
    difficulty: {
      type: String,
      required: [true, 'must hae difficulty'],
      enum: {
        values: ['easy', 'medium', 'hard'],
        message: 'Difficulty can be either easy or medium or hard.',
      },
    },
    priceDiscount: {
      type: Number,
      //Works only when creating new document and not on updateee
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'Price Discount {{VALUE}} must be less than price.',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'Must have description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'Must have cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      //longitude first and latitude later
      coordinates: [Number],
      address: String,
      description: String,
    },
    //embedded documents
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
      },
    ],
    //guides: Array,
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.index({ price: 1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationWeek').get(function () {
  return this.duration / 7;
});

// virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

//DOCUMENT MIDDLEWARE
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//works on save and create not on insert many
// tourSchema.pre('save', function (next) {
//   // console.log(this);
//   next();
// });

//getting users from ids stored in guides of the model.
tourSchema.pre('save', async function (next) {
  const guidesPromises = this.guides.map(async (id) => await User.findById(id));
  console.log(guidesPromises);
  this.guides = await Promise.all(guidesPromises);
  next();
});

// tourSchema.post('save', function (doc, next) {
//   //console.log(doc);
//   next();
// });

//QUERY MIDDLEWARE
// tourSchema.pre(/^find/, function (next) {
//   //console.log(this);
//   next();
// });

// tourSchema.post(/^find/, function (docs, next) {
//   //console.log(docs);
//   next();
// });

//populating queries
tourSchema.pre(/^find/, function (next) {
  this.populate({ path: 'guides', select: '-__v -passwordChangedAt' });
  next();
});

//AGGREGATION MIDDLEWARE
// tourSchema.pre('aggregate', function (next) {
//   //console.log(this.pipeline());
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
