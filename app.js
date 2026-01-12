const express = require('express');
const app = express();

// database 
const db = require('./Config/connection-mongoose');


app.listen(3000, ()=>{
    console.log('server is running');  
});

