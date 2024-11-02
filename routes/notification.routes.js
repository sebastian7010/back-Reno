const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

router.post('/send', notificationController.sendConfirmation);

module.exports = router;