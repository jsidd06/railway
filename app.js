require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const ejs = require('ejs');
const app = express();
const mongoose = require('mongoose');
const session = require('express-session')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose');



app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(session({
    secret: 'mysecret',
    resave: false,
    saveUninitialized: true,
    cookie :{
        secure:false
    }
}))

// initialize session
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.DB_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})


const schema = new mongoose.Schema({
    username: String,
    password: String,
    firstName: String,
    lastName: String
})

schema.plugin(passportLocalMongoose)

const contactSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    message: String
})

const Message = mongoose.model("Message", contactSchema)


const User = mongoose.model('User', schema)

//
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser())

app.get('/status', (req, res) => {
    if(req.isAuthenticated()){
        res.render('index');
    }else{
        res.redirect('/')
    }
    
});


app.post('/status', (req, res) => {

    
        const [year, month, day] = req.body.date.split('-')

        const url = "https://indianrailapi.com/api/v2/livetrainstatus/apikey/a3e3bb72fd968a457c2b453055945fa7/trainnumber/" + req.body.train + "/date/" + year + month + day;

        https.get(url, function (response) {
            if (response.statusCode === 200) {
                response.on('data', function (data) {
                    const jsonData = JSON.parse(data)

                    res.render('currentstatus', {
                        currentStatus: jsonData
                    })


                })

            } else if (response.statusCode === 404) {
                console.log(`Your train number is not correct <a href='/'> Please input correct number </a>`);
            } else {
                console.log('there was an error');
            }
        })
    


})

app.get('/', (req, res) => {
    res.render('login')
})
app.get('/register', (req, res) => {
    res.render("register")
})

app.post('/register', (req, res) => {
    User.register({
        username: req.body.username,
        firstName: req.body.firstname,
        lastName: req.body.lastname
    }, req.body.password, function (err, user) {
        if (!err) {
            // res.redirect
            res.redirect('/')
        } else {
            res.send("there was an error registering")
            console.log(err)
        }
    })
})

app.post('/login', (req, res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    })
    req.login(user, function (err) {
        if (!err) {
            passport.authenticate('local')(req, res, () => {
                res.redirect("/status")
            })
        } else {
            console.log(err)
        }
    })
})


app.get('/logout', (req, res) => {
    req.logout()
    res.redirect('/')
})
app.get('/contact', (req, res) => {
    res.render('contact')
})

app.post('/contact', (req, res) => {
    new Message({
        firstName:req.body.firstName,
        lastName:req.body.lastName,
        message:req.body.message
    }).save(function (err){
        if(!err) {
            res.redirect("/status")
        }else{

            console.log(err)
        }
    })
})

app.listen(3000, (req, res) => {
    console.log("server is ready to start")
})