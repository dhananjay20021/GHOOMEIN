const City = require('../models/city.model');
const Place = require("../models/place.model");
const Event = require('../models/event.model');


async function getAllCities(req, res, next){
    try{
        const cities = await City.findAll();
        const places = await Place.findAll();
        res.render('customer/city/all-cities', { cities: cities, places:places});
    } catch(error){
        next(error);
    }
}

async function getCityDetails(req, res, next){
    try{
        const city = await City.findById(req.params.id);
        const cities = await City.findAll();
        const places = await Place.findAll();
        const events = await Event.findAll();
     res.render('customer/city/city-details', {city : city,  cities: cities, places:places, events :events})
} catch(error){
    next(error);
}
}

module.exports = {
    getAllCities: getAllCities,
    getCityDetails:getCityDetails
}