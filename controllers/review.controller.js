const Review = require('../models/review.model');
const City = require('../models/city.model');
const Place = require('../models/place.model');
const Participant = require('../models/participant.model');
const db = require('../data/database');
const mongodb = require('mongodb');

async function getAllReview(req, res, next) {
  try {
    const reviews = await db
    .getDb()
    .collection('reviews')
    .aggregate([
      {
        $match: {
          placeId: new mongodb.ObjectId(req.query.placeId)
        }
      },
      {
        $lookup: {
          from: 'places',
          localField: 'placeId',
          foreignField: '_id',
          as: 'placeDetails'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userDetails'
        }
      }
    ])
    .toArray();

    console.log("reviews", reviews[0].placeDetails[0]);
    const cities = await City.findAll();
    const places = await Place.findAll();
    res.render("customer/place/all-reviews", { reviews: reviews,cities:cities,place:reviews[0].placeDetails[0],places:places });
  } catch (error) {
    next(error);
  }
}

async function createNewReview(req, res, next) {
    try {
      if(req.file &&  req.file.photo !=  "null") {
      var review = new Review({
        ...req.body,
        photo: req.file.filename
      });
     } else{
      var review = new Review({
        ...req.body,
      });}
     
      const reviewData = await review.save();
      console.log("req.query.eeventId ",req.query.eeventId);
      if(req.query.eeventId){
      const participants = await db.getDb().collection("participants").findOne({ reviewId: reviewData.insertedId });
      var reviewDetails = await db.getDb().collection("reviews").findOne({ _id: reviewData.insertedId });
      var eventDetails = await db.getDb().collection("events").findOne({ _id: new mongodb.ObjectId(req.query.eeventId) });
      if(participants == null){
      const participant = new Participant({
        userId : reviewDetails.userId,
        photo: reviewDetails.photo,
        placeId: reviewDetails.placeId,
        eventId: req.query.eeventId,
        avgRating: reviewDetails.avgRating,
        review: reviewDetails.review,
        reviewId : reviewDetails._id,
      });
      if (!reviewDetails.photo || eventDetails.eventtype == "reviewType"){
        delete participant.photo;
      } 
      await participant.save();
    } 
      res.redirect(`/events/${req.query.eeventId}`);
    }  else{
    res.redirect(`/user/${req.body.userId}#myreviews`);
    }
    } catch (error) {
      next(error);
      return;
    }
  }

  async function updateReview(req, res, next) {
    const review  = new Review({
      ...req.body,
      _id: req.params.id
    });
    
  
   if(req.file){
    review.replacePhoto(req.file.filename)
   } 

    try{
      await review.save();
      } catch (error){
        next(error);
        return;
      }
      res.redirect(`/user/${req.body.userId}#myreviews`) 
  }

async function deleteReview(req, res, next){
  let review;
  try{
    review =  await Review.findById(req.params.id);
    await review.remove();
    //return {message:"OK"};
    res.json({ message: 'Deleted Review!'});
    }
    catch (error){
      return next(error);
  }

  //res.json({ message: 'Deleted Review!'});
}

module.exports = {
    getAllReview:getAllReview,
    createNewReview:createNewReview,
    updateReview:updateReview,
    deleteReview:deleteReview
}