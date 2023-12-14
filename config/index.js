const dotenv = require("dotenv");

dotenv.config();

module.exports = {
   port: parseInt(process.env.PORT) || 3000,
   mongodbURI: process.env.MONGODB_URL,
   jwtSecret: process.env.JWT_SECRET,
   frontendURI: process.env.FRONTEND_URL,
};
