const express = require('express');
const app = express();
const dotenv = require('dotenv').config();
const cookieParser = require('cookie-parser');

// database 
const db = require('./Config/connection-mongoose');


// router 
const UserRouter = require('./Routers/UserRouter');

app.use(express.json());                    
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/user', UserRouter);


app.listen(3000, ()=>{
    console.log('server is running');  
});

