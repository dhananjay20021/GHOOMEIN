const mongodb = require('mongodb');

const db = require("../data/database");

class Place {
  constructor(placeData) {
    this.placename = placeData.placename;
    this.shortdescription = placeData.shortdescription;
    this.longdescription = placeData.longdescription;
    this.profileimage = placeData.profileimage;
    this.updateProfileImageData();
    this.coverimage = placeData.coverimage;
    this.updateCoverImageData();
    this.cityId = new mongodb.ObjectId(placeData.cityId);
    //rating
    this.rating = parseFloat(placeData.rating) || 0;
    this.isStatus = +placeData.isStatus;
    this.location = placeData.location;
    this.longitude = placeData.longitude || 0;
    this.latitude = placeData.latitude || 0;
    if (placeData._id) {
      this.id = placeData._id.toString();
    }
    // Set createdAt and updatedAt fields
    this.createdAt = placeData.createdAt || new Date();
    this.updatedAt = placeData.updatedAt || new Date();
  }

  //Find By ID function

  static async findById(placeId) {
    let plaId;
    try {
      plaId = new mongodb.ObjectId(placeId);
    } catch (error) {
      error.code = 404;
      throw error;
    }

    const place = await db.getDb().collection("places").findOne({ _id: plaId });

    if (!place) {
      const error = new Error("Could not find place with provided id");
      error.code = 404;
      throw error;
    }
    return new Place(place);
  }

  //Find all attributes function

  static async findAll() {
    const places = await db.getDb().collection("places").find().toArray();

    return places.map(function (placeDocument) {
      return new Place(placeDocument);
    });
  }

      //update Cover Image Data Method

      updateProfileImageData() {
        this.profileimagePath = `https://ghoomein1.s3.ap-south-1.amazonaws.com/general-data/place-data/images/${this.profileimage}`;
        this.profileimageurl = `https://ghoomein1.s3.ap-south-1.amazonaws.com/general-data/place-data/images/${this.profileimage}`;
      }
    //update Cover Image Data Method
  
  
    updateCoverImageData() {
      this.coverimagePath = `https://ghoomein1.s3.ap-south-1.amazonaws.com/general-data/place-data/images/${this.coverimage}`;
      this.coverimageurl = `https://ghoomein1.s3.ap-south-1.amazonaws.com/general-data/place-data/images/${this.coverimage}`;
  }

  static async findPlacewithCityANDState() {
    const places = await db.getDb().collection("places").find().toArray();
    const cityIds = places.map(place => place.cityId);
  
    const cityLookup = await db.getDb().collection("cities").find({ _id: { $in: cityIds } }).toArray();
  
    const stateIds = cityLookup.map(city => city.stateId);
    const stateLookup = await db.getDb().collection("states").find({ _id: { $in: stateIds } }).toArray();
  
    return places.map(placeDocument => {
      const place = new Place(placeDocument);
      const matchingCity = cityLookup.find(city => city._id.toString() === place.cityId.toString());
      if (matchingCity) {
        place.cityname = matchingCity.cityname;
        place.stateId = matchingCity.stateId;
  
        const matchingState = stateLookup.find(state => state._id.toString() === matchingCity.stateId.toString());
        if (matchingState) {
          place.statename = matchingState.statename;
        }
      }
      return place;
    });
  }
  
  async save() {
    await db.getDb().collection("places").createIndex({ location: "2dsphere" });
    // Update updatedAt field
    this.updatedAt = new Date();
    this.location = {
     type: "Point",
     coordinates: [parseFloat(this.longitude),parseFloat(this.latitude)] // Note the order of longitude and latitude
     };
    const placeData = {
      placename: this.placename,
      shortdescription: this.shortdescription,
      longdescription: this.longdescription,
      profileimage: this.profileimage,
      //rating
      rating: parseFloat(this.rating),
      //select City
      cityId: this.cityId,
      coverimage: this.coverimage,
      isStatus: this.isStatus,
      location: this.location,
      //location: this.location,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
    console.log("placeData ",placeData);
    if (this.id) {
      const placeId = new mongodb.ObjectId(this.id);

      if (!this.profileimage){

        delete placeData.profileimage;
      }

      if (!this.coverimage){
        delete placeData.coverimage;
      }
 
      await db
        .getDb()
        .collection("places")
        .updateOne({ _id: placeId }, { $set: placeData });
    } else {
      await db.getDb().collection("places").insertOne(placeData);
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

    static async search(query) {
      // Perform the search query using the 'query' parameter
      const places = await db.getDb().collection("places").find({
        placename: { $regex: query, $options: "i" }, // Case-insensitive search for 'placename' field
      }).toArray();
  
      // Return the search results
      return places;
    }

}

module.exports = Place;
