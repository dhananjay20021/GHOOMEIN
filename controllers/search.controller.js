// search.controller.js
const City = require('../models/city.model');
const Place = require('../models/place.model');
const State = require('../models/state.model');

const searchController = async (req, res) => {
    const query = req.query.query;

    try {
        const cityResults = await City.search(query);
        const placeResults = await Place.search(query);
        const stateResults = await State.search(query);

        const results = [
            ...cityResults.map(city => ({ name: city.cityname, type: 'City', _id: city._id })),
            ...placeResults.map(place => ({ name: place.placename, type: 'Place', _id: place._id })),
            ...stateResults.map(state => ({ name: state.statename, type: 'State', _id: state._id }))
        ];

        res.json(results);
    } catch (err) {
        res.status(500).send('Error searching data');
    }
};

module.exports = searchController;
