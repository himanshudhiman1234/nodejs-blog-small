require('dotenv').config();

const express = require('express');
const expressLayout = require("express-ejs-layouts")
const connectDB =  require('./server/config/db')
const cookieParser = require("cookie-parser")
const session = require("express-session")
const MongoStore = require("connect-mongo")
const methodOverride = require('method-override');

const jwt = require('jsonwebtoken')



const app = express();

const PORT = 5000 || process.env.PORT;


connectDB();


app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(cookieParser())
app.use(methodOverride('_method'));

app.use(session({
    secret:'keyboard cat',
    resave:false,
    saveUnitialized:true,
    store:MongoStore.create({
        mongoUrl:process.env.MONGO_URI
    })
}))








app.use(express.static('public'))

//Templating engine
app.use(expressLayout)
app.set('layout','./layouts/main')
app.set('view engine','ejs')


// app.get("/",(req,res)=>{
// res.send("Hello world");
// })

// Ensure your routes are set up correctly
app.use('/', require('./server/routes/main'));  
app.use('/',require('./server/routes/admin'))

app.listen(PORT,()=>{   
    console.log(`App listening on port`)
})