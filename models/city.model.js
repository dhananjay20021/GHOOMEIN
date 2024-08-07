const mongodb = require("mongodb");

const db = require("../data/database");

class City {
  constructor(cityData) {
    this.cityname = cityData.cityname;
    this.shortdescription = cityData.shortdescription;
    this.longdescription = cityData.longdescription;
    this.profileimage = cityData.profileimage;
    //selectState
    this.stateId = new mongodb.ObjectId(cityData.stateId);
    this.updateProfileImageData();
    this.coverimage = cityData.coverimage;
    this.updateCoverImageData();
    this.isStatus = +cityData.isStatus;
    this.location = cityData.location;
    this.rating = parseFloat(cityData.rating) || 0;
    if (cityData._id) {
      this.id = cityData._id.toString();
    }
    // Set createdAt and updatedAt fields
    this.createdAt = cityData.createdAt || new Date();
    this.updatedAt = cityData.updatedAt || new Date();
  }

  //Find By ID function

  static async findById(cityId) {
    let citId;
    try {
      citId = new mongodb.ObjectId(cityId);
    } catch (error) {
      error.code = 404;
      throw error;
    }

    const city = await db.getDb().collection("cities").findOne({ _id: citId });

    if (!city) {
      const error = new Error("Could not find city with provided id");
      error.code = 404;
      throw error;
    }
    return new City(city);
  }

  //Find all attributes function

  static async findAll() {
  const cities = await db.getDb().collection("cities").find().toArray();

    return cities.map(function (cityDocument) {
      return new City(cityDocument);
    });
  }

  static async findCitywithState() {
    const cities = await db.getDb().collection("cities").find().toArray();
    const stateIds = cities.map(city => city.stateId);
    
    const stateLookup = await db.getDb().collection("states").find({ _id: { $in: stateIds } }).toArray();
  
    return cities.map(cityDocument => {
      var city = new City(cityDocument);
      const matchingState = stateLookup.find(state => state._id.toString() === city.stateId.toString());
      if (matchingState) {
        city.statename = matchingState.statename;
      }
      return city;
    });
  }

  //update Cover Image Data Method

  updateProfileImageData() {
    this.profileimagePath = `https://ghoomein1.s3.ap-south-1.amazonaws.com/general-data/city-data/images/${this.profileimage}`;
    this.profileimageurl = `https://ghoomein1.s3.ap-south-1.amazonaws.com/general-data/city-data/images/${this.profileimage}`;
  }
  //update Cover Image Data Method


  updateCoverImageData() {
    this.coverimagePath = `https://ghoomein1.s3.ap-south-1.amazonaws.com/general-data/city-data/images/${this.coverimage}`;
    this.coverimageurl = `https://ghoomein1.s3.ap-south-1.amazonaws.com/general-data/city-data/images/${this.coverimage}`;
}


  async save() {
    // Update updatedAt field
    this.updatedAt = new Date();
    const cityData = {
      cityname: this.cityname,
      shortdescription: this.shortdescription,
      longdescription: this.longdescription,
      profileimage: this.profileimage,
      //select state
      stateId: this.stateId,
      coverimage: this.coverimage,
      rating: parseFloat(this.rating),
      isStatus: this.isStatus,
      location: this.location,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
    if (this.id) {
      const cityId = new mongodb.ObjectId(this.id);

      if (!this.profileimage) {
        delete cityData.profileimage;
      }

      if (!this.coverimage) {
        delete cityData.coverimage;
      }

      await db
        .getDb()
        .collection("cities")
        .updateOne({ _id: cityId }, { $set: cityData });
    } else {
      await db.getDb().collection("cities").insertOne(cityData);
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
    const cityId = new mongodb.ObjectId(this.id);
    return db.getDb().collection("cities").deleteOne({ _id: cityId });
  }

  static async search(query) {
    // Perform the search query using the 'query' parameter
    const cities = await db.getDb().collection("cities").find({
      cityname: { $regex: query, $options: "i" }, // Case-insensitive search for 'cityname' field
    }).toArray();

    // Return the search results
    return cities;
  }

}

module.exports = City;
