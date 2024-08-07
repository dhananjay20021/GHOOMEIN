const db = require('../data/database');
const mongodb = require('mongodb');

class Review {
    constructor(reviewData){
        this.placeId = new mongodb.ObjectId(reviewData.placeId);
        this.userId = new mongodb.ObjectId(reviewData.userId);     
        this.amenities = reviewData.amenities;
        this.photoClickable = reviewData.photoClickable;    
        this.security = reviewData.security ;   
        this.food = reviewData.food;    
        this.cleanliness = reviewData.cleanliness ;   
        this.beauty = reviewData.beauty;    
        this.crowd = reviewData.crowd;    
        this.entryFees = reviewData.entryFees ; 
        this.review = reviewData.review;
        this.photo = reviewData.photo || null; 
        this.updatePhotoData();          
        this.avgRating = parseFloat(reviewData.avgRating) || 0;
        this.isStatus = reviewData.isStatus;
        if (reviewData._id) {
          this.id = reviewData._id.toString();
        }
        // Set createdAt and updatedAt fields
        this.createdAt = reviewData.createdAt || new Date();
        this.updatedAt = reviewData.updatedAt || new Date();
    }
    

    updatePhotoData() {
      this.photoPath = `https://ghoomein1.s3.ap-south-1.amazonaws.com/general-data/review-data/images/$${this.photo}`;
      this.photourl = `https://ghoomein1.s3.ap-south-1.amazonaws.com/general-data/review-data/images/${this.photo}`;
    }
    // updatePhotoData() {
    //   this.photoPath = `review-data/images/${this.photo}`;
    //   this.photourl = `/review/assets/review-data/images/${this.photo}`;
    // }

    async save() {
      // Update updatedAt field
      this.updatedAt = new Date();

        const reviewData = {
          placeId: this.placeId,
          userId: this.userId,
          amenities: this.amenities,
          photoClickable: this.photoClickable, 
          security: this.security,  
          food: this.food,  
          cleanliness: this.cleanliness, 
          beauty: this.beauty, 
          crowd:this.crowd,  
          entryFees: this.entryFees,
          photo: this.photo,
          review: this.review,
          avgRating: parseFloat(this.avgRating),
          isStatus: this.isStatus,
          createdAt: this.createdAt,
          updatedAt: this.updatedAt
        }
        if (this.id) {
          const reviewId = new mongodb.ObjectId(this.id);
    
          if (this.photo == null){
            delete reviewData.photo;
          }
    
          var insertedReviewData = await db
            .getDb()
            .collection("reviews")
            .updateOne({ _id: reviewId }, { $set: reviewData });
        } else {
          var insertedReviewData = await db.getDb().collection("reviews").insertOne(reviewData);
        }
        if(this.placeId){
        //place rating update
        const result = await db.getDb().collection("reviews").aggregate([
          {
            $match: {
              placeId: this.placeId
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
            $group: {
              _id: null, // Use null to group all documents together
              placeDetails:{ $first: "$placeDetails" },
              totalAvgRating: { $sum: "$avgRating" } // Replace "fieldName" with the actual field name
            }
          }
        ]).toArray();
        const { placeDetails, totalAvgRating } = result[0];
        const count = await db.getDb().collection("reviews").countDocuments({ placeId: this.placeId });
        var rating = totalAvgRating/count;
        rating = parseFloat(rating.toFixed(2));
        await db
        .getDb()
        .collection("places")
        .updateOne({ _id: this.placeId }, { $set: {"rating": rating} });
        console.log("placeDetails:", placeDetails);
        //city rating update
        const resultPlace = await db.getDb().collection("places").aggregate([
          {
            $match: {
              cityId: placeDetails[0].cityId
            }
          },
          {
            $lookup: {
              from: 'cities',
              localField: 'cityId',
              foreignField: '_id',
              as: 'cityDetails'
            }
          },
          {
            $group: {
              _id: null, // Use null to group all documents together
              cityDetails:{ $first: "$cityDetails" },
              totalPlaceRating: { $sum: "$rating" } // Replace "fieldName" with the actual field name
            }
          }
        ]).toArray();
        const { cityDetails, totalPlaceRating } = resultPlace[0];
        const countPlace = await db.getDb().collection("places").countDocuments({ 
          cityId: placeDetails[0].cityId });
        var ratingCities = totalPlaceRating/countPlace;
        ratingCities = parseFloat(ratingCities.toFixed(2));
        await db
        .getDb()
        .collection("cities")
        .updateOne({ _id: placeDetails[0].cityId  }, { $set: {"rating": ratingCities} });
        console.log("stateId:", cityDetails);
         //state rating update
         const resultCity = await db.getDb().collection("cities").aggregate([
          {
            $match: {
              stateId: cityDetails[0].stateId
            }
          },
          {
            $group: {
              _id: null, // Use null to group all documents together
              totalCitiesRating: { $sum: "$rating" } // Replace "fieldName" with the actual field name
            }
          }
        ]).toArray();
        const { totalCitiesRating } = resultCity[0];
        console.log("totalCitiesRating",totalCitiesRating);
        const countCities = await db.getDb().collection("cities").countDocuments({ 
          stateId: cityDetails[0].stateId });
        var ratingState = totalCitiesRating/countCities;
        ratingState = parseFloat(ratingState.toFixed(2));
        await db
        .getDb()
        .collection("states")
        .updateOne({ _id: cityDetails[0].stateId  }, { $set: {"rating": ratingState} });
        }
        console.log("insertedReviewData",insertedReviewData);
        return insertedReviewData;
      }
    
      async replacePhoto(newPhotoImage) {
          this.photo = newPhotoImage;
          this.updatePhotoData();
        }

        static async findById(reviewId){
          let revId;
          try{
            revId = new mongodb.ObjectId(reviewId);
          } catch (error) {
              error.code = 404;
              throw error;
          }
  
          const review = await db.getDb().collection('reviews').findOne({_id: revId});
  
          if(!review){
              const error = new Error('Could not find Review with provided id');
              error.code = 404;
              throw error;
          }
          return new Review(review);
      }


        remove() {
          const reviewId = new mongodb.ObjectId(this.id);
          return db.getDb().collection("reviews").deleteOne({ _id: reviewId });
        }

        static async findAll() {
          const reviews = await db.getDb().collection("reviews").find().toArray();
        
            return reviews.map(function (reviewDocument) {
              return new Review(reviewDocument);
            });
          }
 
}

module.exports = Review;