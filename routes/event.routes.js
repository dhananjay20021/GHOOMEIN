const express = require('express');

const sharp = require('sharp'); // Import the sharp library
const eventsControllers = require('../controllers/events.controller');
const imageUploadMiddleware = require('../middlewares/image-upload');
const { uploadToS3 } = require('../middlewares/image-upload'); // Import the uploadToS3 function
const uuid = require('uuid').v4;
const router = express.Router();

router.get('/events', eventsControllers.getAllEvents);
router.get('/events/ongoing', eventsControllers.getAllOngoingEvents);
router.get('/events/upcoming', eventsControllers.getAllUpcomingEvents);
router.get('/events/previous', eventsControllers.getAllPreviousEvents);
router.get('/events/:id', eventsControllers.getEventDetails);
router.get('/events/:id/aboutevents', eventsControllers.getEventAboutPage);
router.get('/events/:id/rewardevents', eventsControllers.getEventRewardPage);
router.get('/events/:id/rulesevents', eventsControllers.getEventRulesPage);
router.get('/events/:id/userRank', eventsControllers.getUserRankPage);
router.get('/events/:id/participate', eventsControllers.getParticipatePage);

router.post('/events/:id/participate', imageUploadMiddleware.imageUploadStorageForEvent, async (req, res) => {
  try {
    // Get the uploaded file from the request
    const file = req.file; // Use req.file instead of req.files

    // Resize and compress the participant image using sharp
    const resizedParticipantImageBuffer = await sharp(file.buffer)
      .resize({ width: 800 }) // Adjust the width as needed
      .jpeg({ quality: 80 }) // Adjust the quality as needed
      .toBuffer();

    // Upload the resized participant image to S3
    const participantImageBucket = 'ghoomein1';
    const participantImageFilename = uuid() + '-' + file.originalname;
    const participantImageKey = 'general-data/participant-data/images/' + participantImageFilename;
    await uploadToS3(participantImageBucket, participantImageKey, resizedParticipantImageBuffer);

    req.file.filename = participantImageFilename; // Use participantImageFilename here

    // Continue with your createParticipant controller logic here
    eventsControllers.createParticipant(req, res);
    // ...
  } catch (err) {
    console.error("Error uploading file:", err);
    // Handle any errors that occurred during file upload
    // ...
  }
});


router.post('/events/:eventId/participants/:participantId/vote', eventsControllers.voteForParticipant);

module.exports = router; 