// const multer = require('multer');
// const uuid = require('uuid').v4;

// const uploadState = multer({
//     storage: multer.diskStorage({
//         destination:'general-data/state-data/images',
//         filename: function(req, file, cb){
//             cb(null, uuid() + '-' + file.originalname);
//         }
//     })
// });


// const uploadCity  = multer({
//     storage: multer.diskStorage({
//         destination:'general-data/city-data/images',
//         filename: function(req, file, cb){
//             cb(null, uuid() + '-' + file.originalname);
//         }
//     })
// });

// const uploadPlace = multer({
//     storage: multer.diskStorage({
//         destination:'general-data/place-data/images',
//         filename: function(req, file, cb){
//             cb(null, uuid() + '-' + file.originalname);
//         }
//     })
// });

// const uploadEvent = multer({
//     storage: multer.diskStorage({
//         destination:'general-data/event-data/images',
//         filename: function(req, file, cb){
//             cb(null, uuid() + '-' + file.originalname);
//         }
//     })
// });

// const uploadUser = multer({
//     storage: multer.diskStorage({
//         destination:'general-data/user-data/images',
//         filename: function(req, file, cb){
//             cb(null, uuid() + '-' + file.originalname);
//         }
//     })
// });

// // Define the storage engine
// const uploadImageForEvent = multer({
//     storage: multer.diskStorage({
//         destination:'general-data/participant-data/images',
//         filename: function(req, file, cb){
//             cb(null, uuid() + '-' + file.originalname);
//         }
//     })
// });

// const uploadReviewImage = multer({
//     storage: multer.diskStorage({
//         destination:'general-data/review-data/images',
//         filename: function(req, file, cb){
//             cb(null, uuid() + '-' + file.originalname);
//         }
//     })
// });

// // Create the multer middleware

// const configuredMultiMiddlewareState = uploadState.fields([{name: 'profileimage', maxCount: 1}, {name: 'coverimage', maxCount: 1}])

// const configuredMultiMiddlewarePlace = uploadPlace.fields([{name: 'profileimage', maxCount: 1}, {name: 'coverimage', maxCount: 1}])

// const configuredMultiMiddlewareCity = uploadCity.fields([{name: 'profileimage', maxCount: 1}, {name: 'coverimage', maxCount: 1}])

// const configuredMultiMiddlewareEvent= uploadEvent.fields([{name: 'profileimage', maxCount: 1}, {name: 'coverimage', maxCount: 1}])

// const configuredMultiMiddlewareUser= uploadUser.fields([{name: 'profileimage', maxCount: 1}, {name: 'coverimage', maxCount: 1}])

// const imageUploadStorageForEvent = uploadImageForEvent.single('photo');

// const configuredMultiMiddlewareReview = uploadReviewImage.single('photo');


// module.exports ={
//     configuredMultiMiddlewareState: configuredMultiMiddlewareState,
//     configuredMultiMiddlewareCity: configuredMultiMiddlewareCity,
//     configuredMultiMiddlewarePlace: configuredMultiMiddlewarePlace,
//     configuredMultiMiddlewareEvent: configuredMultiMiddlewareEvent,
//     configuredMultiMiddlewareUser: configuredMultiMiddlewareUser,
//     imageUploadStorageForEvent: imageUploadStorageForEvent,
//     configuredMultiMiddlewareReview: configuredMultiMiddlewareReview
// }
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuid } = require('uuid');
const multer = require('multer');

// Import your AWS credentials and region from your aws-config.js file
const { awsCredentials, awsRegion } = require('../aws-config');

// Create an S3 client instance
const s3Client = new S3Client({ region: awsRegion, credentials: awsCredentials });

// Function to upload a file to S3
async function uploadToS3(bucket, key, body) {
  const uploadParams = {
    Bucket: bucket,
    Key: key,
    Body: body,
  };

  const uploadCommand = new PutObjectCommand(uploadParams);

  try {
    await s3Client.send(uploadCommand);
    console.log(`File uploaded successfully to S3: ${bucket}/${key}`);
    return true;
  } catch (err) {
    console.error("Error uploading file to S3:", err);
    return false;
  }
}

// Function to define multer storage for S3 uploads
function s3Storage(destination) {
  return multer.memoryStorage({
    destination: function (req, file, cb) {
      cb(null, "");
    },
    filename: function (req, file, cb) {
      cb(null, uuid() + "-" + file.originalname);
    },
  });
}

// Create multer instances for each S3 bucket
const uploadState = multer({
  storage: s3Storage('general-data/state-data/images'),
});

const uploadCity = multer({
  storage: s3Storage('general-data/city-data/images'),
});

const uploadPlace = multer({
  storage: s3Storage('general-data/place-data/images'),
});

const uploadEvent = multer({
  storage: s3Storage('general-data/event-data/images'),
});

const uploadUser = multer({
  storage: s3Storage('general-data/user-data/images'),
});

const uploadImageForEvent = multer({
  storage: s3Storage('general-data/participant-data/images'),
});

const uploadReviewImage = multer({
  storage: s3Storage('general-data/review-data/images'),
});

// Export the configured multer middleware along with the uploadToS3 function
module.exports = {
  uploadToS3, // Export the uploadToS3 function
  configuredMultiMiddlewareState: uploadState.fields([
    { name: "profileimage", maxCount: 1 },
    { name: "coverimage", maxCount: 1 },
  ]),
  configuredMultiMiddlewareCity: uploadCity.fields([
    { name: "profileimage", maxCount: 1 },
    { name: "coverimage", maxCount: 1 },
  ]),
  configuredMultiMiddlewarePlace: uploadPlace.fields([
    { name: 'profileimage', maxCount: 1 }, 
    { name: 'coverimage', maxCount: 1 }
  ]),
  configuredMultiMiddlewareEvent: uploadEvent.fields([
    { name: 'profileimage', maxCount: 1 },
    { name: 'coverimage', maxCount: 1 }
  ]),
  configuredMultiMiddlewareUser: uploadUser.fields([
    { name: 'profileimage', maxCount: 1 }, 
    { name: 'coverimage', maxCount: 1 }
  ]),
  imageUploadStorageForEvent: uploadImageForEvent.single('photo'),
  configuredMultiMiddlewareReview: uploadReviewImage.single('photo')
};
