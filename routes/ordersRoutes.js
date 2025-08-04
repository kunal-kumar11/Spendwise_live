const express=require('express')

const orderController=require('../controller.js/orderController')
const authenticate = require('../authMiddleware')

const router=express.Router()


router.post('/api/orderPremium',orderController.newOrder)

router.post('/api/orderverifyPremium',authenticate,orderController.verifyOrder)


module.exports=router;