const State = require("../models/state.model");
const City = require("../models/city.model");
const Place = require("../models/place.model");
const Event = require("../models/event.model");
const Review = require("../models/review.model");
const db = require('../data/database');


// State Controllers

async function getState(req, res, next) {
  try {
    const states = await State.findAll();
    const places = await Place.findAll();
    const cities = await City.findAll();
    res.render("admin/states/all-states", { states: states, places:places, cities:cities });
  } catch (error) {
    next(error);
    return;
  }
}

async function getNewState(req, res) {
  const places = await Place.findAll();
  const cities = await City.findAll();
  res.render("admin/states/new-state", { places:places, cities:cities });
}

async function createNewState(req, res, next) {
  console.log("req.files.",req.files.profileimage[0].filename);
  const state = new State({
    ...req.body,
    profileimage: req.files.profileimage[0].filename,
    coverimage: req.files.coverimage[0].filename,
  });

  try {
    await state.save();
  } catch (error) {
    next(error);
    return;
  }

  res.redirect("/admin/states");
}

async function getUpdateState(req, res, next) {
  try{
    const state = await State.findById(req.params.id);
    const places = await Place.findAll();
    const cities = await City.findAll();
    res.render('admin/states/update-state', {state: state,  places:places, cities:cities });
  } catch (error) {
    next(error);
  }
}

async function updateState(req, res) {
  const state  = new State({
    ...req.body,
    _id: req.params.id
  });

 if(req.files &&  req.files.profileimage != undefined){
  state.replaceProfileImage(req.files.profileimage[0].filename)
 } else if(req.files &&  req.files.coverimage  != undefined){
  state.replaceCoverImage(req.files.coverimage[0].filename)
 }

  try{
    await state.save();
    } catch (error){
      next(error);
      return;
    }
    res.redirect('/admin/states') 
}

async function deleteState(req, res, next){
  let state;
  try{
    state =  await State.findById(req.params.id);
    await state.remove();
    }
    catch (error){
      return next(error);
  }

  res.json({ message: 'Deleted product!'});
}

// City Controllers

async function getCity(req, res, next) {
  try {
    const cities = await City.findAll();
    const places = await Place.findAll();
    res.render("admin/cities/all-cities", { cities : cities, places: places });
  } catch (error) {
    next(error);
    return;
  }
}

async function getNewCity(req, res) {
  //selectState
  const states = await State.findAll();
  const cities = await City.findAll();
  const places = await Place.findAll();
  res.render("admin/cities/new-city",{ states: states, cities : cities, places: places  });
}

async function createNewCity(req, res, next) {
  const city = new City({
    ...req.body,
    profileimage: req.files.profileimage[0].filename,
    coverimage: req.files.coverimage[0].filename,
  });

  try {
    await city.save();
  } catch (error) {
    next(error);
    return;
  }
  res.redirect("/admin/cities");
}

async function getUpdateCity(req, res, next) {
  try{
    const city = await City.findById(req.params.id);
    const cities = await City.findAll();
    const places = await Place.findAll();
    //selectState
    const states = await State.findAll();
    res.render('admin/cities/update-city', {city: city,states:states, cities : cities, places: places });
  } catch (error) {
    next(error);
  }
}

async function updateCity(req, res) {
  const city  = new City({
    ...req.body,
    _id: req.params.id
  });

  if(req.files &&  req.files.profileimage != undefined){
    city.replaceProfileImage(req.files.profileimage[0].filename)
   } else if(req.files &&  req.files.coverimage  != undefined){
    city.replaceCoverImage(req.files.coverimage[0].filename)
   }

  try{
    await city.save();
    } catch (error){
      next(error);
      return;
    }

    res.redirect("/admin/cities");
}

async function deleteCity(req, res, next){
  let city;
  try{
    city =  await City.findById(req.params.id);
    await city.remove();
    }
    catch (error){
      return next(error);
  }

  res.json({ message: 'Deleted product!'});
}

// Place Controllers

async function getPlace(req, res, next) {
  try {
    const places = await Place.findAll();
    const cities = await City.findAll();
    res.render("admin/places/all-places", { places: places, cities : cities});
  } catch (error) {
    next(error);
    return;
  }
}

async function getNewPlace(req, res) {
  const cities = await City.findAll();
  const places = await Place.findAll();
  res.render("admin/places/new-place", {cities:cities, places: places});
}

async function createNewPlace(req, res, next) {
  try {
  const place = new Place({
    ...req.body,
    profileimage: req.files.profileimage[0].filename,
    coverimage: req.files.coverimage[0].filename,
  });

    await place.save();
  } catch (error) {
    next(error);
    return;
  }

  res.redirect("/admin/places");
}

async function getUpdatePlace(req, res, next) {
  try{
    const place = await Place.findById(req.params.id);
    //selectState
    const cities = await City.findAll();
    const places = await Place.findAll();
    res.render('admin/places/update-place', {place: place, cities: cities,places: places});
  } catch (error) {
    next(error);
  }
}

async function updatePlace(req, res) { 
  const place  = new Place({
    ...req.body,
    _id: req.params.id
  });

  if(req.files &&  req.files.profileimage != undefined){
    place.replaceProfileImage(req.files.profileimage[0].filename)
   } else if(req.files &&  req.files.coverimage  != undefined){
    place.replaceCoverImage(req.files.coverimage[0].filename)
   }

  try{
    await place.save();
    } catch (error){
      next(error);
      return;
    }

    res.redirect("/admin/places");
}

async function deletePlace(req, res, next){
  let place;
  try{
    place =  await Place.findById(req.params.id);
    await place.remove();
    }
    catch (error){
      return next(error);
  }

  res.json({ message: 'Deleted product!'});
}

// Review Controllers

async function getReveiew(req, res, next) {
  try {
    const reviews = await Review.findAll();
    const cities = await City.findAll();
    const places = await Place.findAll();
    res.render("admin/reviews/all-reviews", { reviews: reviews,cities: cities,places: places });
  } catch (error) {
    next(error);
    return;
  }
}

async function getNewReview(req, res, next) {
  const cities = await City.findAll();
  const places = await Place.findAll();
  res.render("admin/reviews/new-review", { cities: cities,places: places });
}

async function createNewReview(req, res, next) {
  const review = new Review({
    ...req.body,
  });

  try {
    await review.save();
  } catch (error) {
    next(error);
    return;
  }

  res.redirect("/admin/reviews");
}

async function getUpdateReview(req, res, next) {
  try{
    const review = await Review.findById(req.params.id);
    const cities = await City.findAll();
    const places = await Place.findAll();
    res.render('admin/reviews/update-review', {review: review,cities: cities,places: places });
  } catch (error) {
    next(error);
  }
}

async function updateReview(req, res) {
  const review  = new Review({
    ...req.body,
    _id: req.params.id
  });

  try{
    await review.save();
    } catch (error){
      next(error);
      return;
    }

    res.redirect('/admin/reviews')
}

async function deleteReview(req, res, next){
  let review;
  try{
    review =  await Review.findById(req.params.id);
    await review.remove();
    }
    catch (error){
      return next(error);
  }

  res.json({ message: 'Deleted product!'});
}

// Event Controllers

async function getEvents(req, res, next) {
  try {
    const events = await Event.findAll();
    const cities = await City.findAll();
    const places = await Place.findAll();
    res.render("admin/events/all-events", {events: events,cities: cities,places: places  });
  } catch (error) {
    next(error);
    return;
  }
}

async function getNewEvents(req, res) {
  const cities = await City.findAll();
  const places = await Place.findAll();
  res.render("admin/events/new-event", {cities: cities,places: places} );
}



async function createNewEvent(req, res, next) {
  const event = new Event({
    ...req.body,
    profileimage: req.files.profileimage[0].filename,
    coverimage: req.files.coverimage[0].filename,
  });

  try {
    await event.save();
  } catch (error) {
    next(error);
    return;
  }

  res.redirect("/admin/events");
}

async function getUpdateEvent(req, res, next) {
  try{
    const event = await Event.findById(req.params.id);
    const cities = await City.findAll();
    const places = await Place.findAll();
    res.render('admin/events/update-event', {event: event, cities: cities,places: places});
  } catch (error) {
    next(error);
  }
}

async function updateEvent(req, res) {
  const event  = new Event({
    ...req.body,
    _id: req.params.id
  });

  if(req.files &&  req.files.profileimage != undefined){
    event.replaceProfileImage(req.files.profileimage[0].filename)
   } else if(req.files &&  req.files.coverimage  != undefined){
    event.replaceCoverImage(req.files.coverimage[0].filename)
   }


  try{
    await event.save();
    } catch (error){
      next(error);
      return;
    }

    res.redirect("/admin/events");
}

async function deleteEvent(req, res, next){
  let event;
  try{
    event =  await Event.findById(req.params.id);
    await event.remove();
    }
    catch (error){
      return next(error);
  }

  res.json({ message: 'Deleted product!'});
}


// exports to other Files

module.exports = {
  getState: getState,
  getNewState: getNewState,
  createNewState: createNewState,
  getUpdateState: getUpdateState,
  updateState: updateState,
  deleteState: deleteState,

  getCity: getCity,
  getNewCity: getNewCity,
  createNewCity: createNewCity,
  getUpdateCity: getUpdateCity,
  updateCity: updateCity,
  deleteCity: deleteCity,

  getPlace: getPlace,
  getNewPlace: getNewPlace,
  createNewPlace: createNewPlace,
  getUpdatePlace: getUpdatePlace,
  updatePlace: updatePlace,
  deletePlace: deletePlace,

  getReveiew: getReveiew,
  getNewReview: getNewReview,
  createNewReview: createNewReview,
  getUpdateReview: getUpdateReview,
  updateReview: updateReview,
  deleteReview: deleteReview,

  getEvents: getEvents,
  getNewEvents: getNewEvents,
  createNewEvent: createNewEvent,
  getUpdateEvent: getUpdateEvent,
  updateEvent: updateEvent,
  deleteEvent: deleteEvent,

};
