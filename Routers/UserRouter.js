const express = require('express');
const router = express.Router();

const {RegisterUser} = require('../Controllers/AuthController');

router.post('/register', RegisterUser);


module.exports = router;
