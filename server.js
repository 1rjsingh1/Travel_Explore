//handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception', err);
});

const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config({ path: './config.env' });
const app = require('./app');

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
  });

//listen
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

//handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejections', err.name, err.message);
  server.close(() => {
    console.log('Shutting Down');
    process.exit(1);
  });
});
