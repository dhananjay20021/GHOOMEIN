const db = require('../data/database');

class ReviewPage {
    constructor(reviewData){
        this.placeId = new mongodb.ObjectId(reviewData.placeId);
        this.userId = new mongodb.ObjectId(reviewData.userId);       
        this.photo = reviewData.photo;       
        this.avgRating = reviewData.avgRating;
        this.review = reviewData.review;
        this.isStatus = reviewData.isStatus;
        if (reviewData._id) {
          this.id = reviewData._id.toString();
        }
        // Set createdAt and updatedAt fields
        this.createdAt = reviewData.createdAt || new Date();
        this.updatedAt = reviewData.updatedAt || new Date();
    }

    async save() {
      // Update updatedAt field
      this.updatedAt = new Date();
        const reviewData = {
          placeId: this.placeId,
          userId: this.userId,
          photo: this.photo,
          avgRating: this.avgRating,
          review: this.review,
          isStatus: this.isStatus,
          createdAt: this.createdAt,
          updatedAt: this.updatedAt
        }
        if (this.id) {
          const placeId = new mongodb.ObjectId(this.id);
    
          if (!this.photo){
            delete reviewData.profileimage;
          }
    
          await db
            .getDb()
            .collection("review")
            .updateOne({ _id: placeId }, { $set: reviewData });
        } else {
          await db.getDb().collection("places").insertOne(reviewData);
        }
      }
    
      async replaceProfileImage(newProfileImage) {
          this.profileimage = newProfileImage;
          this.updateProfileImageData();
        }
    
        async replaceCoverImage(newCoverImage) {
          this.coverimage = newCoverImage;
          this.updateCoverImageData();
        }
        remove() {
          const placeId = new mongodb.ObjectId(this.id);
          return db.getDb().collection("places").deleteOne({ _id: placeId });
        }
 
}

module.exports = ReviewPage;