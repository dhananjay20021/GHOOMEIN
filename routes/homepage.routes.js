const Event = require('../models/event.model');
const City = require('../models/city.model');
const Review = require('../models/review.model');
const Place = require("../models/place.model");

const db = require('../data/database');
const mongodb = require('mongodb');

const express = require('express');

const router = express.Router();

router.get('/homepage', async function(req, res){
    const events = await Event.findAll();
    const cities = await City.findAll();
    const reviews = await db
    .getDb()
    .collection('reviews')
    .aggregate([
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
    const places = await Place.findAll();
    res.render('customer/homepage/home-page', { events: events, cities: cities, reviews:reviews, places:places });
});

router.get('/verificationmessage', async function(req, res){
    const places = await Place.findAll();
    const cities = await City.findAll();
    res.render('customer/auth/verificationmessage', { cities: cities, places:places});
});

router.get('/forgetpassowrdverification', async function(req, res){
  const places = await Place.findAll();
  const cities = await City.findAll();
  res.render('customer/auth/forgetpassowrdverification', { cities: cities, places:places});
});



router.get('/aboutus', async function(req, res){
    const places = await Place.findAll();
    const cities = await City.findAll();
    res.render('customer/generalpages/about-us', { cities: cities, places:places});
});

router.get('/terms&conditions', async function(req, res){
    const places = await Place.findAll();
    const cities = await City.findAll();
    res.render('customer/generalpages/termsandconditions', { cities: cities, places:places});
});

router.get('/privacypolicy', async function(req, res){
    const places = await Place.findAll();
    const cities = await City.findAll();
    res.render('customer/generalpages/privacypolicy', {  cities: cities, places:places});
});

router.get('/cookiespolicy', async function(req, res){
    const places = await Place.findAll();
    const cities = await City.findAll();
    res.render('customer/generalpages/cookiespolicy', { cities: cities, places:places});
});


router.get('/ourteam', async function(req, res){
    const places = await Place.findAll();
    const cities = await City.findAll();
    res.render('customer/generalpages/ourteam', { cities: cities, places:places});
});

router.get('/contactUs', async function(req, res){
    const places = await Place.findAll();
    const cities = await City.findAll();
    res.render('customer/generalpages/contactUs', { cities: cities, places:places});
});

router.get('/ads.txt', async function(req, res){
  const places = await Place.findAll();
  const cities = await City.findAll();
  res.render('customer/generalpages/ads', { cities: cities, places:places});
});

module.exports = router;