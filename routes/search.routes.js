// search.routes.js
const express = require('express');
const searchController = require('../controllers/search.controller');
const checkAuthController = require('../middlewares/check-auth');
const router = express.Router();

router.get('/search',checkAuthController, searchController);

module.exports = router;
