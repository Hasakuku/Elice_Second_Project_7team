const mongoose = require("mongoose");
const { mongodbURI } = require("../config");

const connectMongoDB = () => {
   mongoose
      .connect(mongodbURI)
      .then(console.log(`
############################
# MongoDB connect Success! #
############################`
      ))
      .catch(error => {
         console.error(error.message);
         process.exit(1);
      });
};

module.exports = connectMongoDB;