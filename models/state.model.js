const mongodb = require('mongodb');

const db = require('../data/database');

class State {
    constructor (stateData){
        this.statename = stateData.statename;
        this.shortdescription = stateData.shortdescription;
        this.longdescription = stateData.longdescription;
        this.profileimage = stateData.profileimage;
        this.updateProfileImageData();
        this.coverimage = stateData.coverimage;
        this.updateCoverImageData();
        this.isStatus = +stateData.isStatus;
        this.location = stateData.location;
        this.rating = parseFloat(stateData.rating) || 0;
        if (stateData._id){
            this.id =   stateData._id.toString();
        }
        // Set createdAt and updatedAt fields
        this.createdAt = stateData.createdAt || new Date();
        this.updatedAt = stateData.updatedAt || new Date();
    }


    //Find By ID function

    static async findById(stateId){
        let statId;
        try{
         statId = new mongodb.ObjectId(stateId);
        } catch (error) {
            error.code = 404;
            throw error;
        }

        const state = await db.getDb().collection('states').findOne({_id: statId});

        if(!state){
            const error = new Error('Could not find state with provided id');
            error.code = 404;
            throw error;
        }
        return new State(state);
    }


    //Find all attributes function

    static async findAll() {
       const states = await db.getDb().collection('states').find().toArray();

       return states.map(function(stateDocument){
            return new State(stateDocument);
       });
    }

    //update Cover Image Data Method

    updateProfileImageData() {
      this.profileimagePath = `https://ghoomein1.s3.ap-south-1.amazonaws.com/general-data/state-data/images/${this.profileimage}`;
      this.profileimageurl = `https://ghoomein1.s3.ap-south-1.amazonaws.com/general-data/state-data/images/${this.profileimage}`;
    }

    
    //update Cover Image Data Method

    updateCoverImageData() {
        this.coverimagePath = `https://ghoomein1.s3.ap-south-1.amazonaws.com/general-data/state-data/images/${this.coverimage}`;
        this.coverimageurl = `https://ghoomein1.s3.ap-south-1.amazonaws.com/general-data/state-data/images/${this.coverimage}`;
    }


    //save & UPDATE data in DB function

    async save() {
      // Update updatedAt field
      this.updatedAt = new Date();
  
      const stateData = {
        statename: this.statename,
        shortdescription: this.shortdescription,
        longdescription: this.longdescription,
        profileimage: this.profileimage,
        coverimage: this.coverimage,
        isStatus: this.isStatus,
        location: this.location,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        rating: parseFloat(this.rating),
      };
  
      console.log(stateData);
   
        if (this.id) {
            const stateId = new mongodb.ObjectId(this.id);

            if (!this.profileimage){
                delete stateData.profileimage;
              }

              if (!this.coverimage){
                delete stateData.coverimage;
              }

            await db
              .getDb().collection("states").updateOne({ _id: stateId }, { $set: stateData });
          } else {
            await db.getDb().collection("states").insertOne(stateData);
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
            const stateId = new mongodb.ObjectId(this.id);
            return db.getDb().collection("states").deleteOne({ _id: stateId });
          }

          static async search(query) {
            // Perform the search query using the 'query' parameter
            const states = await db.getDb().collection("states").find({
              statename: { $regex: query, $options: "i" }, // Case-insensitive search for 'statename' field
            }).toArray();
        
            // Return the search results
            return states;
          }

            // Add a static method to perform search by state name

}

module.exports = State;