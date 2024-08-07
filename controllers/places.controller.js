const Place = require("../models/place.model");
const State = require("../models/state.model");
const City = require("../models/city.model");
const Review = require('../models/review.model');
const Event = require('../models/event.model');
//const axios = require('axios');
const db = require('../data/database');
const mongodb = require('mongodb');
const geolocation = require('geolocation-utils');

async function getAllPlaces(req, res, next) {
  try {
    const states = await State.findAll();
    var cities = await City.findCitywithState();
    const places = await Place.findPlacewithCityANDState();
    console.log(places);
    cities = JSON.stringify(cities);

    // Extract the 'page' query parameter from req.query
    // const page = parseInt(req.query.page) || 1;

    res.render("customer/place/all-places", {
      states: states,
      cities: cities,
      places: places,
      // page: page, // Pass the 'page' variable as a property
      eventId:req.query.eventId
    });
  } catch (error) {
    next(error);
  }
}


/*
async function getCurrentLocation() {
  try {
    const response = await axios.get('http://ip-api.com/json');
    const { lat, lon } = response.data;

    return { latitude: lat, longitude: lon };
  } catch (error) {
    throw new Error('Failed to retrieve current location.');
  }
}

function getCurrentLocation1() {
  return new Promise((resolve, reject) => {
    if (!geolocation.available) {
      reject(new Error('Geolocation is not supported in this environment.'));
    }

    geolocation.getCurrentPosition((err, position) => {
      if (err) {
        reject(err);
      } else {
        resolve(position);
      }
    });
  });
}

async function showPosition() {
  try {
    const position = await getCurrentLocation();
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    console.log("Latitude:", latitude);
    console.log("Longitude:", longitude);
  } catch (err) {
    console.error('Error:', err);
  }
}
*/

// Usage
async function getPlaceDetails(req, res, next) {
  try {
    //const place = await Place.findById(req.params.id);
    // Usage
    const placedata = await db
    .getDb()
    .collection('places')
    .aggregate([
      {
        $match: {
          _id: new mongodb.ObjectId(req.params.id)
        }
      },
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'placeId',
          as: 'reviewDetails'
        }
      }
    ])
    .toArray();
    const place = placedata[0];
    const places = await Place.findAll();
    const cities = await City.findAll();
    const events = await Event.findAll();
    if(req.query.eventId){
     var eventId = req.query.eventId;
    } else{
     var eventId = null;
    }
    res.render("customer/place/place-details", { place: place, cities:cities, places:places, events :events,eventId:eventId});
  } catch (error) {
    next(error);
  }
}
// async function getServerLocation() {
//   try {
//     const response = await axios.get('http://api.ipstack.com/check?access_key=c649e3af9eb919bc6dbc2319204d79d5');
//     const { city, region_name, country_name, latitude, longitude } = response.data;

//     console.log("City: " + city);
//     console.log("Region: " + region_name);
//     console.log("Country: " + country_name);
//     console.log("Latitude: " + latitude);
//     console.log("Longitude: " + longitude);
//   } catch (error) {
//     console.log("Error occurred while retrieving server location: " + error.message);
//   }
// }

async function reviewPlace(req, res, next) {
  try {
    console.log(req,"req");
    const reviewplace = await Place.findById(req.params.id);
    const place = await Place.findById(req.params.id);
    var userId = req.session.uid;

    // Validation for longitude and latitude
    // if (isNaN(req.query.longitude) || isNaN(req.query.latitude)) {
    //   console.log("Invalid longitude or latitude.");
    //   res.json({ message: "Invalid longitude or latitude." });
    //   return;
    // }
    //var test ="["+req.query.longitude+","+req.query.latitude+"]";
    var test = []; 
    test[0] = parseFloat(req.query.longitude); 
    test[1] = parseFloat(req.query.latitude);
    console.log(test[0]); 
    console.log( test[1] );
    // Execute the MongoDB query and store the result in 'result'
    const result = await db.getDb().collection("places").find({
      _id: new mongodb.ObjectId(req.params.id),
      location: {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: test
          },
          $maxDistance: 2000 // Distance in meters
        }
      }
    }).toArray();
   console.log(result,"result");
   console.log(req.query.eventId,"req.query.eventId");

    if (result.length > 0) {
      const places = await Place.findAll();
      const cities = await City.findAll();   
      if(req.query.eventId){
        var eventId = req.query.eventId;
        var eventDetails = await db.getDb().collection("events").findOne({ _id: new mongodb.ObjectId(req.query.eventId) });
        console.log("eventDetails",eventDetails);
      res.render("customer/place/reviewpage", {
         reviewplace: reviewplace,
         place: place,
         userId: userId,
         cities: cities,
        places: places,
        eventDetails: eventDetails,
        eventId: eventId
       }); 
       } else{
        var eventId = null;
        var eventDetails = null
        console.log("eventDetails",eventDetails);
      res.render("customer/place/reviewpage", {
         reviewplace: reviewplace,
         place: place,
         userId: userId,
         cities: cities,
        places: places,
        eventDetails: eventDetails,
        eventId: eventId
       }); 
       }
    } else {
      res.json({ message: 'visitLocation' });
      return;
    }  
  } catch (error) {
    req.query.longitude = req.query.longitude;
    req.query.latitude = req.query.latitude;
    console.log("next");
    next(error);
  }
}



// Update the getUpdateReview function

async function getUpdateReview(req, res, next) {
  try {
    let placeId = req.body.placeId;

    const reviewPlaceData = await db
      .getDb()
      .collection('reviews')
      .aggregate([
        {
          $match: {
            placeId: new mongodb.ObjectId(placeId),
          },
        },
        {
          $lookup: {
            from: 'places',
            localField: 'placeId',
            foreignField: '_id',
            as: 'placeDetails',
          },
        },
      ])
      .toArray();

    const review = await Review.findById(req.params.id);
    const places = await Place.findAll();
    const cities = await City.findAll();
    res.render('customer/place/update-reviewpage', { review: review, reviewPlaceData: reviewPlaceData, cities:cities, places:places });
  } catch (error) {
    next(error);
  }
}



module.exports = {
  getAllPlaces: getAllPlaces,
  getPlaceDetails: getPlaceDetails,
  reviewPlace: reviewPlace,
  getUpdateReview:getUpdateReview
};
