const express = require('express');

const citiesControllers =  require('../controllers/cities.controller')

const router = express.Router();

router.get('/cities', citiesControllers.getAllCities);

router.get('/cities/:id', citiesControllers.getCityDetails);

module.exports = router;