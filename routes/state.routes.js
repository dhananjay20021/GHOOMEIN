const express = require('express');

const statesControllers =  require('../controllers/states.controller')

const router = express.Router();

router.get('/states', statesControllers.getAllStates)

router.get('/states/:id', statesControllers.getStateDetails)

module.exports = router;