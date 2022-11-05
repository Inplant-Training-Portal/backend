// dotenv config
require('dotenv').config();

// import required modules
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

// import KEYFILEPATH
const KEYFILEPATH = require('./inplant-training-portal-fa5bda6a1aaf.json');

// add scopes to access google account
const scopes = ['https://www.googleapis.com/auth/drive'];

const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: scopes,
});

// configure drive version and give auth
const drive = google.drive({version: 'v3', auth});

// create express app
const app = express();

// port number
const port = 9000;

// use cors middleware
app.use(cors());

// use body-parser middleware
app.use(bodyParser.json());

// connect to mongodb
mongoose.connect("mongodb+srv://sample:sample@inplant-training.ohnrlch.mongodb.net/?retryWrites=true&w=majority", { useNewUrlParser: true });
const connection = mongoose.connection;

connection.once('open', function() {
    console.log('MongoDB database connection established successfully!');
    }
);

// import routes
const adminRoutes = require('./routes/admin');
const studentRoutes = require('./routes/student');
const teacherRoutes = require('./routes/teacher');
// const orgRoutes = require('./routes/org');

// use routes
app.use('/student', studentRoutes);
app.use('/teacher', teacherRoutes);
app.use('/admin', adminRoutes);
// app.use('/org', orgRoutes);


// test route
app.get('/', (req, res) => {
    res.send("testing");
});

// start server
app.listen(port, function() {
    console.log('Server is running on port: ' + port);
});