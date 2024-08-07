const express = require('express');

const sharp = require('sharp'); // Import the sharp library
const adminControllers = require('../controllers/admin.controllers');
const imageUploadMiddleware = require('../middlewares/image-upload');
const { uploadToS3 } = require('../middlewares/image-upload'); // Import the uploadToS3 function
const uuid = require('uuid').v4;

const router = express.Router();

// State Routes
router.get('/states',adminControllers.getState);

router.get('/states/new',adminControllers.getNewState);

router.post('/states', imageUploadMiddleware.configuredMultiMiddlewareState, async (req, res) => {
  try {
    // Get the uploaded files from the request
    const profileImageFile = req.files['profileimage'][0];
    const coverImageFile = req.files['coverimage'][0];
    
    // Process and upload the profile image using sharp
    if (profileImageFile) {
      const resizedProfileImageBuffer = await sharp(profileImageFile.buffer)
        .resize({ width: 800 }) // Adjust the width as needed
        .jpeg({ quality: 80 }) // Adjust the quality as needed
        .toBuffer();

      const profileImageBucket = 'ghoomein1';
      const profileImageFilename = uuid() + '-' + profileImageFile.originalname;
      const profileImageKey = 'general-data/state-data/images/' + profileImageFilename;
      await uploadToS3(profileImageBucket, profileImageKey, resizedProfileImageBuffer);
      
      req.files['profileimage'][0].filename = profileImageFilename;
    }

    // Process and upload the cover image using sharp
    if (coverImageFile) {
      const resizedCoverImageBuffer = await sharp(coverImageFile.buffer)
        .resize({ width: 1200 }) // Adjust the width as needed
        .jpeg({ quality: 70 }) // Adjust the quality as needed
        .toBuffer();

      const coverImageBucket = 'ghoomein1';
      const coverImageFilename = uuid() + '-' + coverImageFile.originalname;
      const coverImageKey = 'general-data/state-data/images/' + coverImageFilename;
      await uploadToS3(coverImageBucket, coverImageKey, resizedCoverImageBuffer);
      
      req.files['coverimage'][0].filename = coverImageFilename;
    }

    // Continue with your createNewState controller logic here
    adminControllers.createNewState(req, res);
    // ...
  } catch (err) {
    console.error("Error uploading files:", err);
    // Handle any errors that occurred during file upload
    // ...
  }
});

  

router.get('/states/:id', adminControllers.getUpdateState);

router.post('/states/:id', imageUploadMiddleware.configuredMultiMiddlewareState, async (req, res) => {
  try {
    // Get the uploaded files from the request
    const profileImageFile = req.files['profileimage'] ? req.files['profileimage'][0] : null;
    const coverImageFile = req.files['coverimage'] ? req.files['coverimage'][0] : null;
  
    if (profileImageFile) {
      // Resize and compress the profile image using sharp
      const resizedProfileImageBuffer = await sharp(profileImageFile.buffer)
        .resize({ width: 800 }) // Adjust the width as needed
        .jpeg({ quality: 80 }) // Adjust the quality as needed
        .toBuffer();
  
      // Upload the resized profile image to S3
      const profileImageBucket = 'ghoomein1';
      const profileImageFilename = uuid() + '-' + profileImageFile.originalname;
      const profileImageKey = 'general-data/state-data/images/' + profileImageFilename;
      await uploadToS3(profileImageBucket, profileImageKey, resizedProfileImageBuffer);
  
      // Update the request file object with the resized filename
      req.files['profileimage'][0].filename = profileImageFilename;
    }
  
    if (coverImageFile) {
      // Resize and compress the cover image using sharp
      const resizedCoverImageBuffer = await sharp(coverImageFile.buffer)
        .resize({ width: 1200 }) // Adjust the width as needed
        .jpeg({ quality: 70 }) // Adjust the quality as needed
        .toBuffer();
  
      // Upload the resized cover image to S3
      const coverImageBucket = 'ghoomein1';
      const coverImageFilename = uuid() + '-' + coverImageFile.originalname;
      const coverImageKey = 'general-data/state-data/images/' + coverImageFilename;
      await uploadToS3(coverImageBucket, coverImageKey, resizedCoverImageBuffer);
  
      // Update the request file object with the resized filename
      req.files['coverimage'][0].filename = coverImageFilename;
    }
  
    // Continue with your updateState controller logic here
    adminControllers.updateState(req, res);
    // ...
  } catch (err) {
    console.error("Error uploading files:", err);
    // Handle any errors that occurred during file upload
    // ...
  }
});

  

router.delete('/states/:id', adminControllers.deleteState);




// City Routes
router.get('/cities',adminControllers.getCity);

router.get('/cities/new',adminControllers.getNewCity);

router.post('/cities', imageUploadMiddleware.configuredMultiMiddlewareCity, async (req, res) => {
  try {
    // Get the uploaded files from the request
    const profileImageFile = req.files['profileimage'][0];
    const coverImageFile = req.files['coverimage'][0];

    // Process and upload the profile image using sharp
    if (profileImageFile) {
      const resizedProfileImageBuffer = await sharp(profileImageFile.buffer)
        .resize({ width: 800 }) // Adjust the width as needed
        .jpeg({ quality: 80 }) // Adjust the quality as needed
        .toBuffer();

      const profileImageBucket = 'ghoomein1';
      const profileImageFilename = uuid() + '-' + profileImageFile.originalname;
      const profileImageKey = 'general-data/city-data/images/' + profileImageFilename;
      await uploadToS3(profileImageBucket, profileImageKey, resizedProfileImageBuffer);
      
      req.files['profileimage'][0].filename = profileImageFilename;
    }

    // Process and upload the cover image using sharp
    if (coverImageFile) {
      const resizedCoverImageBuffer = await sharp(coverImageFile.buffer)
        .resize({ width: 1200 }) // Adjust the width as needed
        .jpeg({ quality: 70 }) // Adjust the quality as needed
        .toBuffer();

      const coverImageBucket = 'ghoomein1';
      const coverImageFilename = uuid() + '-' + coverImageFile.originalname;
      const coverImageKey = 'general-data/city-data/images/' + coverImageFilename;
      await uploadToS3(coverImageBucket, coverImageKey, resizedCoverImageBuffer);
      
      req.files['coverimage'][0].filename = coverImageFilename;
    }

    // Continue with your createNewCity controller logic here
    adminControllers.createNewCity(req, res);
    // ...
  } catch (err) {
    console.error("Error uploading files:", err);
    // Handle any errors that occurred during file upload
    // ...
  }
});


router.get('/cities/:id', adminControllers.getUpdateCity);

router.post('/cities/:id', imageUploadMiddleware.configuredMultiMiddlewareCity, async (req, res) => {
  try {
    // Get the uploaded files from the request
    const profileImageFile = req.files['profileimage'] ? req.files['profileimage'][0] : null;
    const coverImageFile = req.files['coverimage'] ? req.files['coverimage'][0] : null;
  
    if (profileImageFile) {
      // Resize and compress the profile image using sharp
      const resizedProfileImageBuffer = await sharp(profileImageFile.buffer)
        .resize({ width: 800 }) // Adjust the width as needed
        .jpeg({ quality: 80 }) // Adjust the quality as needed
        .toBuffer();
  
      // Upload the resized profile image to S3
      const profileImageBucket = 'ghoomein1';
      const profileImageFilename = uuid() + '-' + profileImageFile.originalname;
      const profileImageKey = 'general-data/city-data/images/' + profileImageFilename;
      await uploadToS3(profileImageBucket, profileImageKey, resizedProfileImageBuffer);
  
      // Update the request file object with the resized filename
      req.files['profileimage'][0].filename = profileImageFilename;
    }
  
    if (coverImageFile) {
      // Resize and compress the cover image using sharp
      const resizedCoverImageBuffer = await sharp(coverImageFile.buffer)
        .resize({ width: 1200 }) // Adjust the width as needed
        .jpeg({ quality: 70 }) // Adjust the quality as needed
        .toBuffer();
  
      // Upload the resized cover image to S3
      const coverImageBucket = 'ghoomein1';
      const coverImageFilename = uuid() + '-' + coverImageFile.originalname;
      const coverImageKey = 'general-data/city-data/images/' + coverImageFilename;
      await uploadToS3(coverImageBucket, coverImageKey, resizedCoverImageBuffer);
  
      // Update the request file object with the resized filename
      req.files['coverimage'][0].filename = coverImageFilename;
    }
  
    // Continue with your updateCity controller logic here
    adminControllers.updateCity(req, res);
    // ...
  } catch (err) {
    console.error("Error uploading files:", err);
    // Handle any errors that occurred during file upload
    // ...
  }
});

router.delete('/cities/:id', adminControllers.deleteCity);


// Place Routes
router.get('/places',adminControllers.getPlace);

router.get('/places/new',adminControllers.getNewPlace);

router.post('/places', imageUploadMiddleware.configuredMultiMiddlewarePlace, async (req, res) => {
  try {
    // Get the uploaded files from the request
    const profileImageFile = req.files['profileimage'][0];
    const coverImageFile = req.files['coverimage'][0];

    // Process and upload the profile image using sharp
    if (profileImageFile) {
      const resizedProfileImageBuffer = await sharp(profileImageFile.buffer)
        .resize({ width: 800 }) // Adjust the width as needed
        .jpeg({ quality: 80 }) // Adjust the quality as needed
        .toBuffer();

      const profileImageBucket = 'ghoomein1';
      const profileImageFilename = uuid() + '-' + profileImageFile.originalname;
      const profileImageKey = 'general-data/place-data/images/' + profileImageFilename;
      await uploadToS3(profileImageBucket, profileImageKey, resizedProfileImageBuffer);
      
      req.files['profileimage'][0].filename = profileImageFilename;
    }

    // Process and upload the cover image using sharp
    if (coverImageFile) {
      const resizedCoverImageBuffer = await sharp(coverImageFile.buffer)
        .resize({ width: 1200 }) // Adjust the width as needed
        .jpeg({ quality: 70 }) // Adjust the quality as needed
        .toBuffer();

      const coverImageBucket = 'ghoomein1';
      const coverImageFilename = uuid() + '-' + coverImageFile.originalname;
      const coverImageKey = 'general-data/place-data/images/' + coverImageFilename;
      await uploadToS3(coverImageBucket, coverImageKey, resizedCoverImageBuffer);
      
      req.files['coverimage'][0].filename = coverImageFilename;
    }

    // Continue with your createNewPlace controller logic here
    adminControllers.createNewPlace(req, res);
    // ...
  } catch (err) {
    console.error("Error uploading files:", err);
    // Handle any errors that occurred during file upload
    // ...
  }
});


router.get('/places/:id', adminControllers.getUpdatePlace);

router.post('/places/:id', imageUploadMiddleware.configuredMultiMiddlewarePlace, async (req, res) => {
  try {
    // Get the uploaded files from the request
    const profileImageFile = req.files['profileimage'] ? req.files['profileimage'][0] : null;
    const coverImageFile = req.files['coverimage'] ? req.files['coverimage'][0] : null;
  
    if (profileImageFile) {
      // Resize and compress the profile image using sharp
      const resizedProfileImageBuffer = await sharp(profileImageFile.buffer)
        .resize({ width: 800 }) // Adjust the width as needed
        .jpeg({ quality: 80 }) // Adjust the quality as needed
        .toBuffer();
  
      // Upload the resized profile image to S3
      const profileImageBucket = 'ghoomein1';
      const profileImageFilename = uuid() + '-' + profileImageFile.originalname;
      const profileImageKey = 'general-data/place-data/images/' + profileImageFilename;
      await uploadToS3(profileImageBucket, profileImageKey, resizedProfileImageBuffer);
  
      // Update the request file object with the resized filename
      req.files['profileimage'][0].filename = profileImageFilename;
    }
  
    if (coverImageFile) {
      // Resize and compress the cover image using sharp
      const resizedCoverImageBuffer = await sharp(coverImageFile.buffer)
        .resize({ width: 1200 }) // Adjust the width as needed
        .jpeg({ quality: 70 }) // Adjust the quality as needed
        .toBuffer();
  
      // Upload the resized cover image to S3
      const coverImageBucket = 'ghoomein1';
      const coverImageFilename = uuid() + '-' + coverImageFile.originalname;
      const coverImageKey = 'general-data/place-data/images/' + coverImageFilename;
      await uploadToS3(coverImageBucket, coverImageKey, resizedCoverImageBuffer);
  
      // Update the request file object with the resized filename
      req.files['coverimage'][0].filename = coverImageFilename;
    }
  
    // Continue with your updatePlace controller logic here
    adminControllers.updatePlace(req, res);
    // ...
  } catch (err) {
    console.error("Error uploading files:", err);
    // Handle any errors that occurred during file upload
    // ...
  }
});


router.delete('/places/:id', adminControllers.deletePlace);


// Review Routes
router.get('/reviews',adminControllers.getReveiew);

router.get('/reviews/new',adminControllers.getNewReview);

router.post('/reviews', adminControllers.createNewReview);

router.get('/reviews/:id', adminControllers.getUpdateReview);

router.post('/reviews/:id', adminControllers.updateReview);

router.delete('/reviews/:id', adminControllers.deleteReview);


// Event Routes
router.get('/events',adminControllers.getEvents);

router.get('/events/new',adminControllers.getNewEvents);

router.post('/events', imageUploadMiddleware.configuredMultiMiddlewareEvent, async (req, res) => {
  try {
    // Get the uploaded files from the request
    const profileImageFile = req.files['profileimage'][0];
    const coverImageFile = req.files['coverimage'][0];

    // Process and upload the profile image using sharp
    if (profileImageFile) {
      const resizedProfileImageBuffer = await sharp(profileImageFile.buffer)
        .resize({ width: 800 }) // Adjust the width as needed
        .jpeg({ quality: 80 }) // Adjust the quality as needed
        .toBuffer();

      const profileImageBucket = 'ghoomein1';
      const profileImageFilename = uuid() + '-' + profileImageFile.originalname;
      const profileImageKey = 'general-data/event-data/images/' + profileImageFilename;
      await uploadToS3(profileImageBucket, profileImageKey, resizedProfileImageBuffer);
      
      req.files['profileimage'][0].filename = profileImageFilename;
    }

    // Process and upload the cover image using sharp
    if (coverImageFile) {
      const resizedCoverImageBuffer = await sharp(coverImageFile.buffer)
        .resize({ width: 1200 }) // Adjust the width as needed
        .jpeg({ quality: 70 }) // Adjust the quality as needed
        .toBuffer();

      const coverImageBucket = 'ghoomein1';
      const coverImageFilename = uuid() + '-' + coverImageFile.originalname;
      const coverImageKey = 'general-data/event-data/images/' + coverImageFilename;
      await uploadToS3(coverImageBucket, coverImageKey, resizedCoverImageBuffer);
      
      req.files['coverimage'][0].filename = coverImageFilename;
    }

    // Continue with your createNewEvent controller logic here
    adminControllers.createNewEvent(req, res);
    // ...
  } catch (err) {
    console.error("Error uploading files:", err);
    // Handle any errors that occurred during file upload
    // ...
  }
});

router.get('/events/:id', adminControllers.getUpdateEvent);

router.post('/events/:id', imageUploadMiddleware.configuredMultiMiddlewareEvent, async (req, res) => {
  try {
    const eventId = req.params.id;

    // Check if new profile image is provided
    if (req.files && req.files['profileimage'] && req.files['profileimage'][0]) {
      const profileImageFile = req.files['profileimage'][0];
      
      // Resize and compress the profile image using sharp
      const resizedProfileImageBuffer = await sharp(profileImageFile.buffer)
        .resize({ width: 800 }) // Adjust the width as needed
        .jpeg({ quality: 80 }) // Adjust the quality as needed
        .toBuffer();

      // Upload the resized profile image to S3
      const profileImageBucket = 'ghoomein1';
      const profileImageFilename = uuid() + '-' + profileImageFile.originalname;
      const profileImageKey = 'general-data/event-data/images/' + profileImageFilename;
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
      const coverImageKey = 'general-data/event-data/images/' + coverImageFilename;
      await uploadToS3(coverImageBucket, coverImageKey, resizedCoverImageBuffer);

      // Update the request body with the resized filename
      req.files['coverimage'][0].filename = coverImageFilename;
    }

    // Continue with your updateEvent controller logic here
    adminControllers.updateEvent(req, res);
    // ...
  } catch (err) {
    console.error("Error uploading files:", err);
    // Handle any errors that occurred during file upload
    // ...
  }
});



router.delete('/events/:id', adminControllers.deleteEvent);

module.exports = router;