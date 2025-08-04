const express = require('express');
const router = express.Router();

const authenticate = require('../authMiddleware');
const userControllers=require('../controller.js/userController')

// ✅ Create new user detail (POST) with authentication
router.post('/api/userDetails', authenticate, userControllers.POSTuserDetails);

// ✅ Delete user detail (DELETE) with authentication
router.delete('/api/userDetails/:id', authenticate, userControllers.DELETEuserDetails);

// ✅ Get user details (GET) with authentication
router.get('/api/userDetails', authenticate,userControllers.GETuserDetails );

router.get('/api/usersTotalsum',userControllers.GETNameTotalSum)

router.get('/api/userDetails/download', authenticate,userControllers.GETuserDetailsdownload);

router.put('/api/userDetailsUpdate/:id',authenticate,userControllers.PUTusersDetails)

module.exports = router;
