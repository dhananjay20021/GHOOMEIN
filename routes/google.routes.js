const express = require('express');
const passport = require('passport');
const router = express.Router();
const { createUserSession } = require('../util/authentication'); // Replace with the actual path to your authentication.js file
const { destroyUserAuthSession } = require('../util/authentication'); // Replace with the actual path to your authentication.js file

// Auth with Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callback route after successful authentication
router.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // If authentication is successful, create the user session and redirect to a secure page
    createUserSession(req, req.user, () => {
      res.redirect('/'); // Replace '/' with the path to your homepage or any other page you want after successful login
    });
  }
);

router.post('/logout', function logout(req, res) {
  req.logout(function (err) {
    if (err) {
      console.error('Logout error:', err);
      // Handle the error appropriately
    }
    destroyUserAuthSession(req);
    req.session.flashData = { successMessage: 'Logged out successfully' };
    res.redirect('/');
  });
});


module.exports = router;

