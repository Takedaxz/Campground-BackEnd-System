const express = require('express');
const dotenv = require('dotenv');
const cookieParser=require('cookie-parser');
const connectDB = require('./config/db');

//Load env vars
dotenv.config({path:'./config/config.env'});

//Connect to database
connectDB();

//Route files
const camps = require('./routes/camps');
const auth = require('./routes/auth');
const appointments=require('./routes/appointments');

const app=express();

//Body parser
app.use(express.json());

//Mount routers
app.use('/api/v1/camps',camps);
app.use('/api/v1/auth',auth);
app.use('/api/v1/appointments',appointments);

//Cookie Parser
app.use(cookieParser());

const PORT=process.env.PORT || 5100;
const server=app.listen(PORT,console.log('Server running in ',process.env.NODE_ENV,' mode on port ',PORT));

//Handle Unhandled promise rejections
process.on('unhandledRejection',(err,promise)=>{
    console.log(`Error: ${err.message}`);

//Close server and exit program
    server.close(()=>process.exit(1));
});