const User = require('../models/user.model');
const db = require('../data/database');
const Review = require('../models/review.model');
const Event = require('../models/event.model');
const { ObjectId } = require('mongodb');
const mongodb = require('mongodb');
const City = require("../models/city.model");
const Place = require("../models/place.model");

async function getUserDetails(req, res){
        const user = await User.findById(req.params.id);
        const eventId = req.query.eventId;
        user.eventId = eventId;
        const places = await Place.findAll();
        const cities = await City.findAll();
        res.render('customer/user/user-profilepage', {user: user, cities:cities, places:places})
}

async function getUserAbout(req, res){
    const user = await User.findById(req.params.id);
    res.render('customer/user/useraboutpage', {user: user})
}

async function getUserReviewWithPlace(userId,eventId) {
  var reviews = await db.getDb().collection("reviews").find({ userId: new ObjectId(userId) }).toArray();
  if(eventId != 'null'){
    console.log("eventId ",eventId);
    const events = await db.getDb().collection("events").find({ _id: new ObjectId(eventId) }).toArray();
    if(events && events[0].eventtype == 'reviewPhotoType'){
      var reviews = await db.getDb().collection("reviews").find({
        userId: new ObjectId(userId),
        $or: [
          { photo: { $exists: false } },
          { photo: { $ne: null } }
        ]
      }).toArray();
      return reviewReturn = getUserReviewWithPlaceEventType(reviews);
    } else{
      var reviews = await db.getDb().collection("reviews").find({ userId: new ObjectId(userId) }).toArray();
      return reviewReturn = getUserReviewWithPlaceEventType(reviews);
    }
  } else {
    return reviewReturn = getUserReviewWithPlaceEventType(reviews);
  }
}   

async function getUserReviewWithPlaceEventType(reviews){
    
  const placeIds = reviews.map(review => review.placeId);
  const reviewIds = reviews.map(review => review._id);

  const placeLookup = await db.getDb().collection("places").find({ _id: { $in: placeIds } }).toArray();

  const participateLookup = await db.getDb().collection("participants").find({ reviewId: { $in: reviewIds } }).toArray();

  return reviews.map(reviewDocument => {
    var review = new Review(reviewDocument);
    const matchingPlace = placeLookup.find(place => place._id.toString() === review.placeId.toString());
    if (matchingPlace) {
      review.placename = matchingPlace.placename;
      const matchingparticipate =  participateLookup.find(participant => participant.reviewId.toString() == reviewDocument._id.toString());
      if(matchingparticipate) {
        review.participateId = matchingparticipate._id;
      }
    }
    return review;
  });
}

async function getUserReview(req, res) {
  console.log(req.params.id,"getUserReview",req.query.eventId);
  const user = await User.findById(req.params.id);
  var reviews = await getUserReviewWithPlace(req.params.id,req.query.eventId);
  if(req.query.eventId != 'null'){
  const event = await Event.findById(req.query.eventId);
  if(event && event.eventtype == 'reviewType'){
    message="No review found without photo";
  } else if(event && event.eventtype == 'reviewPhotoType'){
    message="No review found with photo";
  } else{
    message="No review found.";
  }
  var eventId = req.query.eventId;
  user.eventId = eventId;
  var participantData = await db
  .getDb()
  .collection('participants')
  .find({userId: req.params.id,eventId: req.query.eventId})
  .toArray(); 
  } else{
    user.eventId = null;
    var participantData = [];
    var reviews =reviews;
    var message="No review found.";
  }
  res.render('customer/user/includes/user-review-page', { user: user,message:message, reviews: reviews,participantData:participantData });
}

async function getUserEvents1(req, res, userId, eventId) {
  try {
    const user = await User.findById(req.params.id);
    const event = await Event.findById(req.params.eventId);

    if (eventId) {
      const eventData = await db
        .getDb()
        .collection('events')
        .find({ userId: userId, eventId: eventId })
        .toArray();

      if (eventData.length === 0) {
        // Handle no event data found
        res.render('customer/user/includes/user-events-page', {
          user: user,
          event: event,
          eventData: [],
          message: "No Event found."
        });
      } else {
        res.render('customer/user/includes/user-events-page', {
          user: user,
          event: event,
          eventData: eventData,
          message: null
        });
      }
    } else {
      user.eventId = null;
      res.render('customer/user/includes/user-events-page', {
        user: user,
        event: event,
        eventData: [],
        message: "No Event found."
      });
    }
  } catch (err) {
    // Handle any errors that occur during async operations
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
}
async function getUserEvents(req, res) {
  try {
    const user = await User.findById(req.params.id);

    const participants = await db
    .getDb()
    .collection('participants')
    .aggregate([
      {
        $match: { userId: new mongodb.ObjectId(req.params.id) }
      },
      {
        $lookup: {
          from: 'events',
          localField: 'eventId',
          foreignField: '_id',
          as: 'eventDetails'
        }
      }
    ])
    .toArray();
      if (participants.length === 0) {
        // Handle no event data found
        res.render('customer/user/includes/user-events-page', {
          user: user,
          participants: [],
          message: "No Participants found."
        });
      } else {
        res.render('customer/user/includes/user-events-page', {
          user: user,
          participants: participants,
          message: null
        });
      }
    
  } catch (err) {
    // Handle any errors that occur during async operations
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
}


async function getUpdateUser(req, res, next) {
  try{
    const places = await Place.findAll();
    const cities = await City.findAll();
    const user = await User.findById(req.params.id);
    res.render('customer/user/update-profile', {user: user, places:places, cities:cities });
  } catch (error) {
    next(error);
  }
}

async function updateUser(req, res, next) {
  const user = new User({
    ...req.body,
    _id: req.params.id,
    password: '', // Exclude the password update
  });

  if (req.files && req.files.profileimage != undefined) {
    user.replaceProfileImage(req.files.profileimage[0].filename);
  } else if (req.files && req.files.coverimage != undefined) {
    user.replaceCoverImage(req.files.coverimage[0].filename);
  }

  try {
    await user.save();
  } catch (error) {
    next(error);
    return;
  }

  res.redirect(`${req.params.id}`);
}


  

module.exports = {
    getUserDetails: getUserDetails,
    getUserAbout: getUserAbout,
    updateUser: updateUser,
    getUpdateUser:getUpdateUser,
    getUserReview:getUserReview,
    getUserReviewWithPlace:getUserReviewWithPlace,
    getUserEvents:getUserEvents
}
