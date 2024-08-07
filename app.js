require("dotenv").config();

const path = require("path");
const express = require("express");
const expressSession = require('express-session');
const createSessionConfig = require('./config/session');
const passport = require('passport');
const db = require("./data/database");
const errorHandlerMiddleware = require('./middlewares/error-handler');
const checkAuthStatusMiddleware = require('./middlewares/check-auth');
const protectRoutesMiddleware = require('./middlewares/protect-routes');
const authRoutes = require("./routes/auth.routes");
const homepageRoutes = require("./routes/homepage.routes");
const userPageRoutes = require("./routes/user.routes");
const stateRoutes = require("./routes/state.routes");
const cityRoutes = require("./routes/city.routes");
const placeRoutes = require("./routes/place.routes");
const eventRoutes = require("./routes/event.routes");
const baseRoutes = require('./routes/base.routes');
const adminRoutes = require('./routes/admin.routes');
const reviewRoutes = require('./routes/review.routes');
const participantRoutes = require('./routes/participant.routes');
const googleRoutes = require('./routes/google.routes');
const searchRoutes = require('./routes/search.routes');
const moment = require('moment');

process.env.TZ = 'Asia/Kolkata';

const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const sessionConfig = createSessionConfig();
app.use(expressSession(sessionConfig)); // Use the session configuration with the session middleware

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static("public"));
app.use('/review/assets', express.static("general-data"));
app.use('/state/assets', express.static("general-data"));
app.use('/city/assets', express.static("general-data"));
app.use('/place/assets', express.static("general-data"));
app.use('/event/assets', express.static("general-data"));
app.use('/user/assets', express.static("general-data"));
app.use('/participant/assets', express.static("general-data"));

app.use(express.urlencoded({ extended: false }));

app.locals.formatDate = function(date) {
  return moment(date).format('DD MMM YYYY');
};

app.use(baseRoutes);
app.use(authRoutes);
app.use(googleRoutes);
app.use(searchRoutes);
app.use(checkAuthStatusMiddleware);
app.use(homepageRoutes);
app.use(userPageRoutes);
app.use(stateRoutes);
app.use(cityRoutes);
app.use(placeRoutes);
app.use(eventRoutes);
app.use(participantRoutes);
app.use(reviewRoutes);
app.use(protectRoutesMiddleware);
app.use('/admin', adminRoutes);

// Add the search routes



app.use(errorHandlerMiddleware);

let port = 8000;

if(process.env.PORT){
  port= process.env.PORT;
}

db.connectToDatabase()
  .then(function () {
    app.listen(port); 
  })
  .catch(function (error) {
    console.log("failed to connect to the database!");
    console.log(error);
  });

//   let port = 8000;

// if (process.env.PORT) {
//   port = process.env.PORT;
// }

// db.connectToDatabase()
//   .then(function () {
//     app.listen(port, () => {
//       console.log(`HTTP server running on port ${port}`);
//     });
//   })
//   .catch(function (error) {
//     console.log("Failed to connect to the database!");
//     console.log(error);
//   });

// const https = require('https');
// const fs = require('fs');
// const https_options = https.createServer(
//   {
//   ca: fs.readFileSync(path.join(__dirname, 'cert', "ca_bundle.pem")),
//   key: fs.readFileSync(path.join(__dirname, 'cert', "private.pem")),
//   cert: fs.readFileSync(path.join(__dirname, 'cert', "certificate.pem")),
// }, app )

// https_options.listen(8443, ()=> console.log('Secure server on port 8443'))