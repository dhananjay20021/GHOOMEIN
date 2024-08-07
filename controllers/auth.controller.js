const User = require('../models/user.model');
const crypto = require('crypto');
const { createUserSession } = require('../util/authentication');
const { destroyUserAuthSession } = require('../util/authentication');
const validation = require('../util/validation');
const sessionFlash = require('../util/session-flash');
const { sendVerificationEmail } = require('../mailer');
const { generateResetToken, sendResetPasswordEmail } = require('../mailer');
const db = require('../data/database'); // Import the db object
const passport = require('../passport');
const City = require("../models/city.model");
const Place = require("../models/place.model");

async function getSignUp(req, res) {
  let sessionData = sessionFlash.getSessionData(req);

  if(!sessionData){
      sessionData = {
      firstname:'',
      surname: '',
      email: '',
      mobilenumber: '',
      password: '',
      dateofbirth: '',
      monthofbirth:'',
      yearofbirth: '',
      gender: '',
      profileimage: '',
      coverimage: '',
    }
  }  
  const places = await Place.findAll();
  const cities = await City.findAll();
  res.render("customer/auth/signup", { inputData: sessionData, cities:cities, places:places });
}

async function signUp(req, res, next) {
  const enteredData = {
    firstname: req.body.firstname,
    surname: req.body.surname,
    email: req.body.email,
    mobilenumber: req.body.mobilenumber,
    password: req.body.password,
    dateofbirth: req.body.dateofbirth,
    monthofbirth: req.body.monthofbirth,
    yearofbirth: req.body.yearofbirth,
    gender: req.body.gender,
    profileimage: req.body.profileimage,
    coverimage: req.body.coverimage,
  };

  console.log('Entered Data:', enteredData);

  if (!validation.userDetailsAreValid(
    req.body.firstname,
    req.body.surname,
    req.body.email,
    req.body.mobilenumber,
    req.body.password,
    req.body.dateofbirth,
    req.body.monthofbirth,
    req.body.yearofbirth,
    req.body.gender,
    req.body.profileimage,
    req.body.coverimage
  )) {
    sessionFlash.flashDataToSession(req, {
      errorMessage: 'Please check your inputs. Password must be at least 6 characters long',
      ...enteredData,
    }, function () {
      res.redirect('/signup');
    });
    return;
  }

  const user = new User(enteredData);

  try {
    const existsAlready = await user.existsAlready();
    if (existsAlready) {
      sessionFlash.flashDataToSession(req, {
        errorMessage: 'User already exists! Try logging in',
        ...enteredData,
      }, function() {
        res.redirect('/signup');
      });
      return;
    }

    await user.signup();
    console.log('User saved successfully');
  } catch (error) {
    next(error);
    return;
  }

  res.redirect('/verificationmessage');
}



async function getLogin(req, res) {
  console.log(req.body);
  let sessionData = sessionFlash.getSessionData(req);

  if(!sessionData){
      sessionData = {
      email: '',
      mobilenumber: '',
      password: '',
    }
  }  
  const places = await Place.findAll();
  const cities = await City.findAll();
  res.render("customer/auth/login", { inputData: sessionData, cities:cities, places:places  });
}


function login(req, res, next) {
  passport.authenticate('local', async (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.session.flashData = {
        errorMessage: info.message || 'Invalid email or password',
        email: req.body.email,
      };
      return res.redirect('/login');
    }

    if (!user.isVerified) {
      req.session.flashData = {
        errorMessage: 'You are not verified. Please check your email for verification instructions.',
        email: req.body.email,
      };
      return res.redirect('/login');
    }

    const isAdmin = user.isAdmin;

    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      createUserSession(req, user, () => {
        req.session.flashData = { successMessage: 'Logged in successfully' };
        res.redirect('/');
      }, isAdmin);
    });
  })(req, res, next);
}


function logout(req, res) {
  req.logout(function (err) {
    if (err) {
      console.error('Logout error:', err);
      // Handle the error appropriately
    }
    destroyUserAuthSession(req);
    req.session.flashData = { successMessage: 'Logged out successfully' };
    res.redirect('/');
  });
}


async function getVerification(req, res) {
  const { verificationToken } = req.params;

  try {
    const userCollection = db.getDb().collection('users');
    const user = await userCollection.findOneAndUpdate(
      { verificationToken, isVerified: false },
      { $set: { isVerified: true, verificationToken: null } },
      { returnOriginal: false }
    );
    const places = await Place.findAll();
    const cities = await City.findAll();
    if (user.value) {
      res.render("customer/auth/verification", { verificationToken, cities:cities, places:places  });
    } else {
      res.redirect("/login"); // Redirect to login page after verification
    }
  } catch (error) {
    console.error('Error updating verification status:', error);
    res.redirect("/"); // Error occurred during verification
  }
}



async function getForgotPassword(req, res) {
  const places = await Place.findAll();
  const cities = await City.findAll();
  res.render('customer/auth/forgot-password', {cities:cities, places:places} );
}


async function postForgotPassword(req, res) {
  const { email } = req.body;

  const places = await Place.findAll();
  const cities = await City.findAll();

  // Generate a reset token and save it in the user's document in the database
  const resetToken = await generateResetToken(email);

  // Send a reset password email to the user
  await sendResetPasswordEmail(email, resetToken);

  res.redirect('/forgetpassowrdverification');
}

async function getResetPassword(req, res) {
  const { resetToken } = req.params;
  const places = await Place.findAll();
  const cities = await City.findAll();
  res.render('customer/auth/reset-password', { resetToken, cities:cities, places:places  });
}

async function postResetPassword(req, res) {
  const resetToken = req.params.resetToken;
  const newPassword = req.body.password;
  const newResetToken = crypto.randomBytes(20).toString('hex');

  try {
    await User.resetPassword(resetToken, newPassword, newResetToken);
    res.redirect('/login');
  } catch (error) {
    console.error('Error resetting password:', error);
    res.redirect('/');
  }
}




module.exports = {
  getSignUp: getSignUp,
  getLogin: getLogin,
  signUp: signUp,
  login: login,
  logout: logout,
  getVerification:getVerification,
  getForgotPassword: getForgotPassword,
  postForgotPassword:postForgotPassword,
  getResetPassword: getResetPassword,
  postResetPassword: postResetPassword
};