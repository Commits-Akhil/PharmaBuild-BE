const express     = require('express');
const router      = express.Router();
const controller  = require('./controller');
const verifyToken = require('../../AuthHandler/verifyToken');


router.post('/register', controller.register);
router.post('/login',    controller.login);
router.get('/profile',   verifyToken, controller.getProfile);

module.exports = router;
