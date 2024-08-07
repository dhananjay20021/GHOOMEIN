const express = require('express');
const Place = require("../models/place.model");
const City = require('../models/city.model');

const router = express.Router();

router.get('/', function(req, res){
    res.redirect('/homepage');
});

router.get('/401', async function(req, res){
    const places = await Place.findAll();
    const cities = await City.findAll();
    res.status(401).render('shared/401', {cities: cities, places:places});
});

router.get('/403', async function(req, res){
    const places = await Place.findAll();
    const cities = await City.findAll();
    res.status(403).render('shared/403', {cities: cities, places:places});
});

module.exports = router;