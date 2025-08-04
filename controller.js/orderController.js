const razorpay = require('../config/razorpay.instance');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');  // ✅ Add this!
const User = require('../model/User');
require('dotenv').config();

const newOrder = async (req, res) => {
    
    const { amount } = req.body;

    if (amount < 50000) {
        return res.status(400).json({
            error: 'The minimum amount is ₹500'
        });
    }

    try {
        const order = await razorpay.orders.create({
            amount: amount,
            currency: 'INR',
            receipt: "receipt#1"
        });

        return res.json({
            id: order.id,
            currency: order.currency,
            amount: order.amount
        });

    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        return res.status(500).send("Something went wrong while creating the order");
    }
};

const verifyOrder = async (req, res) => {
  const { paymentId, orderId, signature } = req.body;
  const id = req.user.userId; // From auth middleware, typically req.user

  const verifying = orderId + '|' + paymentId;

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_SECRET)
    .update(verifying.toString())
    .digest('hex');

  if (expectedSignature === signature) {
    try {
      // Update user premium status in MongoDB
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { premiumUser: true },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      console.log('User updated to premium:', updatedUser);

      // Generate new JWT token with updated premiumUser = true
      const token = jwt.sign(
        {
          userId: updatedUser._id,
          username: updatedUser.username,
          email: updatedUser.email,
          premiumUser: updatedUser.premiumUser,
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      return res.status(200).json({
        message: 'Payment verified successfully',
        token,
      });
    } catch (error) {
      console.error('Database error while updating premium user:', error);
      return res.status(500).send('Internal Server Error');
    }
  } else {
    console.warn('Payment verification failed: Invalid signature');
    return res.status(400).json({ message: 'Invalid signature. Payment verification failed' });
  }
};

module.exports = {
    newOrder,
    verifyOrder
};
