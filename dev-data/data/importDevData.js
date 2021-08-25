const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config({ path: './config.env' });
const fs = require('fs');
const Tour = require('./../../Models/tourModel');
const User = require('../../Models/userModel');
const Review = require('../../Models/reviewModel');

//connect DB
const db = process.env.DATABASE;
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then((con) => {
    //console.log(con.connection);
    console.log('DB connected successfullY!');
  })
  .catch((err) => console.log(err));

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

const importdata = async () => {
  try {
    //await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    //await Review.create(reviews);
    //await Tour.create(tours);
    console.log('loaded data');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    //await Tour.deleteMany();
    await User.deleteMany();
    //await Review.deleteMany();
    //await Tour.deleteMany();
    console.log('deleted data');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

console.log(process.argv);
if (process.argv[2] === '--import') {
  importdata();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
