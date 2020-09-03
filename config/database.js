require('dotenv').config();

const mongoose = require('mongoose');
require('colors');

//require database URL from properties file
const dbURL = process.env.MONGO_URL;

module.exports = function runDB() {
  mongoose.connect(`${dbURL}`, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });

  mongoose.connection.on('connected', function () {
    // eslint-disable-next-line no-console
    console.log(`Mongoose default connection is open to ${dbURL}`.green);
  });

  mongoose.connection.on('error', function (err) {
    // eslint-disable-next-line no-console
    console.log(`Mongoose default connection has occurred: ${err} error'`.red);
  });

  mongoose.connection.on('disconnected', function () {
    // eslint-disable-next-line no-console
    console.log(`Mongoose default connection is disconnected`.yellow);
  });

  process.on('SIGINT', function () {
    mongoose.connection.close(function () {
      // eslint-disable-next-line no-console
      console.log(
        `Mongoose default connection is disconnected due to application termination`
          .magenta
      );
      process.exit(0);
    });
  });
};
