const express = require('express');
const router = express.Router();
const authControllers = require('../controller.js/authController');

// Signup route (POST)
router.post('/api/signupdetails', authControllers.signupdetails);

// Login route (POST)
router.post('/api/logindetails', authControllers.logindetails);


router.post('/api/forgotpassword',authControllers.sendEmail)

router.post('/api/reset-password',authControllers.resetPassword)

module.exports = router;
