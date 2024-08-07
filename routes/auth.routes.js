const express = require('express');

const authController = require('../controllers/auth.controller')

const router = express.Router();

router.get('/signup', authController.getSignUp);
router.post('/signup', authController.signUp);
router.get('/login', authController.getLogin);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/verify/:verificationToken', authController.getVerification);
router.post('/verify/:verificationToken', authController.getVerification);
router.get('/forgot-password', authController.getForgotPassword);
router.post('/forgot-password', authController.postForgotPassword);
router.get('/reset-password/:resetToken', authController.getResetPassword);
router.post('/reset-password/:resetToken', authController.postResetPassword);


module.exports = router;