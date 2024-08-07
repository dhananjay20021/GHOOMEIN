const State = require('../models/state.model');
const City = require("../models/city.model");
const Place = require("../models/place.model");
const Event = require('../models/event.model');

async function getAllStates(req, res, next){
    try{
        const states = await State.findAll();
        const places = await Place.findAll();
        const cities = await City.findAll();
        res.render('customer/state/all-states', { states: states, cities:cities, places:places});
    } catch(error){
        next(error);
    }
}

async function getStateDetails(req, res, next){
    try{
        const state = await State.findById(req.params.id);
        const places = await Place.findAll();
        const cities = await City.findAll();
        const events = await Event.findAll();
        res.render('customer/state/state-details', {state: state, cities:cities, places:places, events :events})
} catch(error){
    next(error);
}
}

module.exports = {
    getAllStates: getAllStates,
    getStateDetails: getStateDetails
}