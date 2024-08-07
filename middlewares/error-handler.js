const Place = require("../models/place.model");
const City = require('../models/city.model');

async function handleErrors(error, req, res, next) {
    const places = await Place.findAll();
    const cities = await City.findAll();
    console.log(error);

    if(error.code === 404){
     return res.status(404).render('shared/404', {cities: cities, places:places});
    }
    res.status(500).render('shared/500',{cities: cities, places:places});
}

module.exports = handleErrors;