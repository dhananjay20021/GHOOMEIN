const express = require('express');

const sharp = require('sharp'); // Import the sharp library

const userDetailsController = require('../controllers/user.controller')
const imageUploadMiddleware = require('../middlewares/image-upload');
const { uploadToS3 } = require('../middlewares/image-upload'); // Import the uploadToS3 function
const uuid = require('uuid').v4;

const router = express.Router();

//router.get('/user/:id', userDetailsController.getUserDetails);
router.get('/user/:id', userDetailsController.getUserDetails);

router.get('/update-profile/:id', userDetailsController.getUpdateUser);

// router.post('/user/:id', imageUploadMiddleware.configuredMultiMiddlewareUser, async (req, res) => {
//   try {
//     // Get the uploaded files from the request
//     if (req.files && req.files['profileimage'] && req.files['profileimage'][0]) {
//     const profileImageFile = req.files['profileimage'][0]; // Assuming 'profileimage' is the field name

//     // Upload the profile image to S3
//     const profileImageBucket = 'ghoomein1'; // Replace with your S3 bucket name
//     const profileImageFilename = uuid() + '-' + profileImageFile.originalname;
//     const profileImageKey = 'general-data/user-data/images/' + profileImageFilename; // Set the desired folder path and filename
//     const profileImageBody = profileImageFile.buffer; // Use the file buffer as the file content
//     await uploadToS3(profileImageBucket, profileImageKey, profileImageBody);
//     req.files['profileimage'][0].filename = profileImageFilename;
//     }
//     // Upload the cover image to S3
//     if (req.files && req.files['coverimage'] && req.files['coverimage'][0]) {
//     const coverImageFile = req.files['coverimage'][0]; // Assuming 'coverimage' is the field name
//     const coverImageBucket = 'ghoomein1'; // Replace with your S3 bucket name
//     const coverImageFilename = uuid() + '-' + coverImageFile.originalname;
//     const coverImageKey = 'general-data/user-data/images/' + coverImageFilename; // Set the desired folder path and filename
//     const coverImageBody = coverImageFile.buffer; // Use the file buffer as the file content
//     await uploadToS3(coverImageBucket, coverImageKey, coverImageBody);
//     req.files['coverimage'][0].filename = coverImageFilename;
//     }
//     // Continue with your createNewState controller logic here
//     userDetailsController.updateUser(req, res);
//     // ...
//   } catch (err) {
//     console.error("Error uploading files:", err);
//     // Handle any errors that occurred during file upload
//     // ...
//   }
// });

router.post('/user/:id', imageUploadMiddleware.configuredMultiMiddlewareUser, async (req, res) => {
  try {
    // Check if new profile image is provided
    if (req.files && req.files['profileimage'] && req.files['profileimage'][0]) {
      const profileImageFile = req.files['profileimage'][0];
      
      // Resize and compress the profile image using sharp
      const resizedProfileImageBuffer = await sharp(profileImageFile.buffer)
        .resize({ width: 400 }) // Adjust the width as needed
        .jpeg({ quality: 70 }) // Adjust the quality as needed
        .toBuffer();

      // Upload the resized profile image to S3
      const profileImageBucket = 'ghoomein1';
      const profileImageFilename = uuid() + '-' + profileImageFile.originalname;
      const profileImageKey = 'general-data/user-data/images/' + profileImageFilename;
      await uploadToS3(profileImageBucket, profileImageKey, resizedProfileImageBuffer);

      // Update the request body with the resized filename
      req.files['profileimage'][0].filename = profileImageFilename;
    }

    // Check if new cover image is provided
    if (req.files && req.files['coverimage'] && req.files['coverimage'][0]) {
      const coverImageFile = req.files['coverimage'][0];
      
      // Resize and compress the cover image using sharp
      const resizedCoverImageBuffer = await sharp(coverImageFile.buffer)
        .resize({ width: 1200 }) // Adjust the width as needed
        .jpeg({ quality: 70 }) // Adjust the quality as needed
        .toBuffer();

      // Upload the resized cover image to S3
      const coverImageBucket = 'ghoomein1';
      const coverImageFilename = uuid() + '-' + coverImageFile.originalname;
      const coverImageKey = 'general-data/user-data/images/' + coverImageFilename;
      await uploadToS3(coverImageBucket, coverImageKey, resizedCoverImageBuffer);

      // Update the request body with the resized filename
      req.files['coverimage'][0].filename = coverImageFilename;
    }

    // Continue with your updateUser controller logic here
    userDetailsController.updateUser(req, res);
    // ...
  } catch (err) {
    console.error("Error uploading files:", err);
    // Handle any errors that occurred during file upload
    // ...
  }
});


router.get('/user/:id/about', userDetailsController.getUserAbout);

router.get('/user/:id/review', userDetailsController.getUserReview);

/*router.get('/user/:id/review', imageUploadMiddleware.configuredMultiMiddlewareReview,(req, res) => {
    const userId = req.params.id;
    userDetailsController.getUserReview(req, res);
  });
*/
router.get('/user/:id/events', userDetailsController.getUserEvents);
 
module.exports = router;