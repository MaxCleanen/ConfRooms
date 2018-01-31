const express = require('express');

const router = express.Router();
const { index, createEvent, editEvent } = require('./controllers');

router.get('/', index);
router.get('/createEvent', createEvent);
router.get('/editEvent', editEvent);

module.exports = router;
