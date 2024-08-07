const express = require('express');

const sharp = require('sharp'); // Import the sharp library

const placesControllers =  require('../controllers/places.controller');

const reviewControllers =  require('../controllers/review.controller');

const imageUploadMiddleware = require('../middlewares/image-upload');

const { uploadToS3 } = require('../middlewares/image-upload'); // Import the uploadToS3 function
const uuid = require('uuid').v4;

const router = express.Router();

router.get('/places', placesControllers.getAllPlaces);

router.get('/places/:id', placesControllers.getPlaceDetails);

router.get('/places/:id/review', placesControllers.reviewPlace)

router.post('/places/:id/review', imageUploadMiddleware.configuredMultiMiddlewareReview, async (req, res,next) => {
  try {
    // Get the uploaded file from the request
    const imageFile = req.file;

    if (imageFile) {
      // Resize and compress the image using sharp
      const resizedImageBuffer = await sharp(imageFile.buffer)
        .resize({ width: 800 }) // Adjust the width as needed
        .jpeg({ quality: 80 }) // Adjust the quality as needed
        .toBuffer();

      // Upload the resized image to S3
      const reviewImageBucket = 'ghoomein1'; // Replace with your S3 bucket name
      const reviewImageFilename = uuid() + '-' + imageFile.originalname;
      const reviewImageKey = 'general-data/review-data/images/' + reviewImageFilename;
      await uploadToS3(reviewImageBucket, reviewImageKey, resizedImageBuffer);

      // Update the request file object with the resized filename
      req.file.filename = reviewImageFilename;
    }

    // Continue with your createNewReview controller logic here
    reviewControllers.createNewReview(req, res,next);
    // ...
  } catch (err) {
    console.error("Error uploading file:", err);
    // Handle any errors that occurred during file upload
    // ...
  }
});


router.get('/places/:id/review/:id', placesControllers.getUpdateReview);

router.post('/places/:id/review/:id', imageUploadMiddleware.configuredMultiMiddlewareReview, async (req, res) => {
  try {
    // Get the uploaded file from the request
    const reviewImageFile = req.file;
  
    if (reviewImageFile) {
      // Resize and compress the review image using sharp
      const resizedReviewImageBuffer = await sharp(reviewImageFile.buffer)
        .resize({ width: 800 }) // Adjust the width as needed
        .jpeg({ quality: 80 }) // Adjust the quality as needed
        .toBuffer();
  
      // Upload the resized review image to S3
      const reviewImageBucket = 'ghoomein1'; // Replace with your S3 bucket name
      const reviewImageFilename = uuid() + '-' + reviewImageFile.originalname;
      const reviewImageKey = `general-data/review-data/images/${reviewImageFilename}`; // Include review ID in the key
      await uploadToS3(reviewImageBucket, reviewImageKey, resizedReviewImageBuffer);
      req.file.filename = reviewImageFilename;
    }
  
    // Continue with your updateReview controller logic here
    reviewControllers.updateReview(req, res);
    // ...
  } catch (err) {
    console.error("Error uploading file:", err);
    // Handle any errors that occurred during file upload
    // ...
  }
});


module.exports = router;