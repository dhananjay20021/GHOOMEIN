const express = require('express');

const participantControllers =  require('../controllers/participant.controller')

const router = express.Router();

router.get('/participant/:id/vote', participantControllers.addVote)

module.exports = router;