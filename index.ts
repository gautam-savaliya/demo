import  express  from 'express';
const app = express();
const port = process.env.PORT || 4000;
import db from './models';
import router from './routes'
const cors = require('cors')
import path from "path";

import bodyParser from 'body-parser';
import * as dotenv from 'dotenv'
var socket = require('./socket.service')



dotenv.config({ path: __dirname+'/.env' });

app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
app.use(express.json())
app.use(express.static(path.join(__dirname, "public")));
app.use(cors())

app.use(function (req:any, res:any, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', '*');
    req.header("Content-Type", "application/json");
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    
    // Pass to next layer of middleware
    next();
});






db.sequelize.sync().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    })
})
app.use('/api',router)