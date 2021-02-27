require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const ejs = require('ejs');
const app = express();
const mongoose = require('mongoose');
const md5 = require('md5');


app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));
app.set('view engine', 'ejs');

mongoose.connect(process.env.DB_STRING,{
    useNewUrlParser : true,
    useUnifiedTopology : true
})


const schema = new mongoose.Schema({
    username: String,
    password: String,
    firstName: String,
    lastName: String
})

const User = mongoose.model('User', schema) 

app.get('/status', (req, res) =>{
    res.render('index');
});


app.post('/status', (req, res) =>{
    
    const [year, month, day] = req.body.date.split('-')

    const url = "https://indianrailapi.com/api/v2/livetrainstatus/apikey/a3e3bb72fd968a457c2b453055945fa7/trainnumber/"+req.body.train+"/date/"+year+month+day;

    https.get(url, function(response){
        if(response.statusCode === 200){
            response.on('data', function(data){
                const jsonData = JSON.parse(data)

                 res.render('currentstatus', {currentStatus : jsonData})
                
                
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
     
    const userData = {
        firstName: req.body.firstname,
        lastName: req.body.lastname,
        username: req.body.username,
        password: md5(req.body.password)
    }

    const user = new User(userData)
    user.save(function(err){
        if(!err){
            res.redirect('/')
        }else{
            res.send("there was an error please try again")
        }
    })
})

app.post('/login', (req, res) => {
    User.findOne({username: req.body.username}, (err, user) => {
        if(!err){
            if(user){
                // user found
                if(user.password === md5(req.body.password)){
                    //valid credentials found
                    // now log in the user
                    res.redirect('/status')
                }else{
                    // credentials not valid
                    res.send("password is invalid")
                }
                
            }else{
                // user not found
                res.send("user is not found")
            }
        }else{
            console.log(err)
        }
    })
})



app.get('/contact', function(req, res){
    res.render('contact')
})

app.listen(3000, (req, res) =>{
    console.log("server is ready to start");
});
