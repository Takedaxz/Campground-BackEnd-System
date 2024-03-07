//Imports the Express.js framework
const express = require('express');
//Imports the dotenv module
const dotenv = require('dotenv');
//Imports the cookie-parser middleware
const cookieParser=require('cookie-parser');
//Imports a function
const connectDB = require('./config/db');

//Addtional
const mongoSanitize=require('express-mongo-sanitize');
const helmet = require('helmet');
const {xss} = require('express-xss-sanitizer');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');

//Read environment variables
dotenv.config({path:'./config/config.env'});

//Connect to database
connectDB();

//Route files
const campgrounds = require('./routes/campgrounds');
const auth = require('./routes/auth');
const bookings = require('./routes/bookings');
const limiter = rateLimit({
    windowMs: 10*60*1000, //10 mins
    max: 500
});


//Creates an instance of the Express application
const app=express();

//Adds middleware to parse incoming request bodies with JSON payloads
app.use(express.json());

app.use(mongoSanitize());
app.use(helmet());
app.use(xss());
app.use(limiter);
app.use(hpp());
app.use(cors());

//Adds the cookie-parser middleware to parse cookies attached to incoming requests
app.use(cookieParser());


//Mount routers
app.use('/api/v1/campgrounds',campgrounds);
app.use('/api/v1/auth',auth);
app.use('/api/v1/bookings',bookings);

//Sets the port for the Express server. It either uses the value of the PORT environment variable or defaults to port 5100
const PORT=process.env.PORT || 5100;
//Starts the Express server, listening on the specified port
const server=app.listen(PORT,console.log('Server running in ',process.env.NODE_ENV,' mode on port ',PORT));

//Handle Unhandled promise rejections
process.on('unhandledRejection',(err,promise)=>{
    console.log(`Error: ${err.message}`);

//Close server and exit program
    server.close(()=>process.exit(1));
});

