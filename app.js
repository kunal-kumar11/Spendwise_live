const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
const authRoutes=require('./routes/authRoutes') 
const userDetailsRoutes=require('./routes/userDetailsRoutes')
const ordersRoutes=require('./routes/ordersRoutes')
const mongoose=require('mongoose')
const session = require('express-session');
const checkSession=require('./checkSession.js')

require('dotenv').config();

app.use(cors());

app.use(session({
  secret: 'kunalCodes321',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, 
    maxAge: 1000 * 60 * 60 * 24 
  }
}));


app.use(express.json());

mongoose.connect(process.env.MONGO_URI).then(()=>{
    console.log("✅ MongoDB Connected")

}).catch((err) => console.error("❌ MongoDB connection error:", err))

const port = process.env.PORT || 3000;


app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/login',(req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/expense',checkSession,(req,res)=>{
  res.sendFile(path.join(__dirname,'public','expenseVone.html'))
})

app.get('/reset-password/:token', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'resetPassword.html')); 
});


app.get('/forgotpassword',(req,res)=>{
     res.sendFile(path.join(__dirname, 'public', 'forgotPassword.html')); 
})

app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Session destroy error:', err);
      return res.status(500).send('Logout failed');
    }

    res.clearCookie('connect.sid'); 
    res.sendStatus(200);  
  });
});

app.use('/',authRoutes);

app.use('/',userDetailsRoutes);

app.use('/',ordersRoutes);



app.listen(port, () => {
  console.log(`Server is active at port ${port}`);
});
