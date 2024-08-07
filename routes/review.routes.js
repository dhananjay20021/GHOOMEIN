const express = require('express');

const imageUploadMiddleware = require('../middlewares/image-upload');
const reviewControllers =  require('../controllers/review.controller')

const router = express.Router();

router.get('/review', reviewControllers.getAllReview);

router.delete('/review/:id', reviewControllers.deleteReview);

module.exports = router;