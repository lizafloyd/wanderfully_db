//connection
var express = require('express')
var app = express()
var parser = require('body-parser')
var mongoose = require('mongoose')
mongoose.Promise = global.Promise
mongoose.connect('mongodb://heroku_0kxl4wn8:7coqi4i0r2ciqa9beho4pc2kg1@ds119728.mlab.com:19728/heroku_0kxl4wn8')
var db = mongoose.connection
var cors = require('cors')
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy
var crypto = require('crypto')
var jwtoken = require('jsonwebtoken')
var jwt = require('express-jwt')
var auth = jwt({
  secret: 'littletomato',
  userProperty: 'payload'
})


app.use(cors())
app.use(parser.json())
app.use(parser.urlencoded({ extended:true }))
// app.use(express.sessions({secret: 'littletomato'}))
app.use(passport.initialize())
app.use(passport.session())
// app.use(methodOverride(function(req, res){
//       if (req.body && typeof req.body === 'object' && '_method' in req.body) {
//         // look in urlencoded POST bodies and delete it
//         var method = req.body._method
//         delete req.body._method
//         return method
//       }
// }))

passport.use(new LocalStrategy({
  usernameField: 'email'
},
  function(username, password, done) {
    User.findOne({ email: username }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

db.once('open', () => {
  console.log("database connected");
})

//schemas
var Schema = mongoose.Schema
var ObjectId = Schema.ObjectId

var UserSchema = new Schema({
  name: String,
  email: {
    type: String,
    unique: true,
    required: true
  },
  hash: String,
  salt: String,
  trips: [ {type: Schema.ObjectId, ref: 'Trip'} ],
  searchable: Boolean,
  photos: [ {type: Schema.ObjectId, ref: 'Photo'} ],
  stories: [ {type: Schema.ObjectId, ref: 'Story'} ]
})

UserSchema.methods.setPassword = function(password){
  this.salt = crypto.randomBytes(16).toString('hex')
  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex')
}

UserSchema.methods.validPassword = function(password){
  var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex')
  return this.hash === hash
}

UserSchema.methods.generateJwt = function(){
  var expiry = new Date()
  expiry.setDate(expiry.getDate() + 7)

  return jwtoken.sign({
    _id: this._id,
    email: this.email,
    name: this.name,
    exp: parseInt(expiry.getTime() / 1000),
  }, 'littletomato')
}

var TripSchema = new Schema({
  name: String,
  planned: Boolean,
  travelers: [ {type: Schema.ObjectId, ref: 'User'} ],
  // destinations: [{
  //   destination: {type: Schema.ObjectId, ref: 'Destination'},
  //   required: Boolean,
  //   confirmed: Boolean
  // }],
  notes: String,
  // expenses: String,
  country: Array,
  // type: String,
  photos: [ {type: Schema.ObjectId, ref: 'Photo'} ],
  stories: [ {type: Schema.ObjectId, ref: 'Story'} ],
  recommendations: [ {type: Schema.ObjectId, ref: 'Recommendation'} ]
})

// var DestinationSchema = new Schema({
//   name: String,
//   address: String,
//   country: String,
//   type: String,
//   photos: [ {type: Schema.ObjectId, ref: 'Photo'} ],
//   stories: [ {type: Schema.ObjectId, ref: 'Story'} ],
//   recommendations: [ {type: Schema.ObjectId, ref: 'Recommendation'} ]
// })

var RecommendationSchema = new Schema({
  user: {type: Schema.ObjectId, ref: 'User'},
  destination: {type: Schema.ObjectId, ref: 'Destination'},
  text: String,
  country: String
})

var StorySchema = new Schema({
  user: {type: Schema.ObjectId, ref: 'User'},
  destination: {type: Schema.ObjectId, ref: 'Destination'},
  text: String,
  country: String
})

var PhotoSchema = new Schema({
  user: {type: Schema.ObjectId, ref: 'User'},
  destination: {type: Schema.ObjectId, ref: 'Destination'},
  photo: String,
  country: String
})

var User = mongoose.model('User', UserSchema)
var Trip = mongoose.model('Trip', TripSchema)
// var Destination = mongoose.model('Destination', DestinationSchema)
var Recommendation = mongoose.model('Recommendation', RecommendationSchema)
var Story = mongoose.model('Story', StorySchema)
var Photo = mongoose.model('Photo', PhotoSchema)

//seeds
// User.remove({}, (err) => {})
// Trip.remove({}, err => {})
// Recommendation.remove({}, err => {})
// Story.remove({}, err => {})
// Photo.remove({}, err => {})
//
// var liza = new User({name: 'Liza Floyd', username: 'lizafloyd', searchable: true})
// var morocco = new Trip({name: 'Morocco Trip', planned: false})
// liza.trips.push(morocco)
// morocco.travelers.push(liza)
//
// liza.save((err, liza) => {})
// morocco.save((err) => {})
//
// var levillage = new Recommendation({text: 'Loved Le Village Hostel in Montmartre'})
// levillage.save((err) => {})
// var samplestory = new Story({text: 'Sample story'})
// samplestory.save((err) => {})

//authentication
app.post('/register', (req, res) => {
  var user = new User()

  user.name = req.body.name
  user.email = req.body.email

  user.setPassword(req.body.password)

  user.save(function(err){
    var token;
    token = user.generateJwt()
    res.status(200)
    res.json({
      'token': token
    })
  })
})

app.post('/login', (req, res) => {
  passport.authenticate('local', (err, user, info) => {
    var token

    if (err) {
      res.status(404).json(err)
      return
    }
    if (user) {
      token = user.generateJwt()
      res.status(200)
      res.json({
        'token': token
      })
    } else {
      res.status(401).json(info)
    }
  }) (req, res)
})

//api
app.get('/', (req, res) => {
  res.json("hello world")
})

app.get('/users/id/:id', (req, res, next) => {
  User.findOne({_id: req.params.id}).then(user => {
    res.json(user)
  })
})

app.get('/users/:email', (req, res, next) => {
  User.findOne({email: req.params.email}).then(user => {
    res.json(user)
  })
})

app.get('/users', (req, res, next) => {
  User.find({}).then(function(users){
    res.json(users)
  })
})
//users custom gets  - dreams --not working
app.get('/custom/dreams/:userid', (req, res, next) => {
  Trip.find({travelers: req.params.userid}).then(trips => {
    let dreams = []
    trips.forEach((trip) => {
      if(trip.planned == false){
        dreams.push(trip)
      }
    })
    res.json(dreams)
  })
})
//users custom gets  - plans
app.get('/custom/plans/:userid', (req, res, next) => {
  Trip.find({travelers: req.params.userid}).then(trips => {
    let plans = []
    trips.forEach((trip) => {
      if(trip.planned == true){
        plans.push(trip)
      }
    })
    res.json(plans)
  })
})
//for recommendations page, which needs both
app.get('/custom/trips/:userid', (req, res, next) => {
  Trip.find({travelers: req.params.userid}).then(trips => {
    res.json(trips)
  })
})

app.put('/addRec/:tripid/:recid', (req, res, next) => {
  Trip.findOne({_id:req.params.tripid}).then((trip) => {
    Recommendation.findOne({_id:req.params.recid}).then((rec) => {
      trip.recommendations.push(rec)
      console.log(trip);
      trip.save().then((newTrip) => {
        console.log(newTrip);
        res.json(newTrip)
      })
    })
  })
})

app.put('/addStory/:tripid/:storyid', (req, res, next) => {
  Trip.findOne({_id:req.params.tripid}).then((trip) => {
    Story.findOne({_id:req.params.storyid}).then((story) => {
      trip.stories.push(story)
      console.log(trip);
      trip.save().then((newTrip) => {
        console.log(newTrip);
        res.json(newTrip)
      })
    })
  })
})

app.put('/addPhoto/:tripid/:photoid', (req, res, next) => {
  Trip.findOne({_id:req.params.tripid}).then((trip) => {
    Photo.findOne({_id:req.params.photoid}).then((photo) => {
      trip.photos.push(photo)
      console.log(trip);
      trip.save().then((newTrip) => {
        console.log(newTrip);
        res.json(newTrip)
      })
    })
  })
})

app.post('/custom/dreams/:userid', (req, res, next) => {
  Trip.create(req.body).then(function(trip){
    User.findOne({_id:req.params.userid}).then((user) => {
      trip.travelers.push(user)
      trip.planned = false
      trip.save().then((newTrip) => {
        console.log("dream created");
        console.log(newTrip);
        res.json(trip)
      })
    })
  })
})
app.post('/custom/plans/:userid', (req, res, next) => {
  Trip.create(req.body).then(function(trip){
    console.log(trip);
    User.findOne({_id:req.params.userid}).then((user) => {
      trip.travelers.push(user)
      trip.planned = true
      trip.save().then((newTrip) => {
        console.log("plan created");
        console.log(newTrip);
        res.json(trip)
      })
    })
  })
})
//trip create -- for deletion
app.post('/trips', (req, res) => {
  console.log(req.body);
  Trip.create(req.body).then(function(trip){
    console.log(trip)
    res.json(trip)
  })
})
//data custom gets
app.get('/country/recommendations/:country', (req, res, next) => {
  Recommendation.find({country: req.params.country}).then(function(custom){
    res.json(custom)
  })
})

app.get('/country/stories/:country', (req, res, next) => {
  Story.find({country: req.params.country}).then(function(custom){
    res.json(custom)
  })
})

app.get('/country/photos/:country', (req, res, next) => {
  Photo.find({country: req.params.country}).then(function(custom){
    res.json(custom)
  })
})
//trip index
app.get('/trips', (req, res, next) => {
  Trip.find({}).then(trips => {
    res.json(trips)
  })
})
//trip show
app.get('/trips/:id', (req, res, next) => {
  console.log(req.params.id);
  Trip.findOne({_id: req.params.id}).then(trip => {
    res.json(trip)
  })
})

//trip update
app.put('/trips/:id', (req, res) => {
  console.log(req.body);
  Trip.findOneAndUpdate({_id: req.params.id}, req.body, {new:true}).then(response => {
    console.log(response);
    res.json(response)
  })
})
//trip delete
app.delete('/trips/:id', (req, res) => {
  Trip.findOneAndRemove({_id: req.params.id}).then(function(deleted){
    res.json(deleted)
  })
})

//recommendation index
app.get('/recommendations', (req, res, next) => {
  Recommendation.find({}).then(function(recs){
    res.json(recs)
  })
})
//recommendation create
app.post('/recommendations', (req, res, next) => {
  Recommendation.create(req.body).then(function(rec){
    console.log(rec)
    res.json(rec)
  })
})
//recommendation show
app.get('/recommendations/:id', (req, res, next) => {
  console.log(req.params.id);
  Recommendation.findOne({_id: req.params.id}).then(rec => {
    res.json(rec)
  })
})
//recommendation update
app.put('/recommendations/:id', (req, res) => {
  console.log("hitting db");
  console.log(req.body);
  Recommendation.findOneAndUpdate({_id: req.params.id}, req.body, {new:true}).then(response => {
    console.log(response);
    res.json(response)
  })
})
//recommendation delete
app.delete('/recommendations/:id', (req, res) => {
  Recommendation.findOneAndRemove({_id: req.params.id}).then(function(deleted){
    res.json(deleted)
  })
})

//story index
app.get('/stories', (req, res, next) => {
  Story.find({}).then(function(stories){
    res.json(stories)
  })
})
//story create
app.post('/stories', (req, res, next) => {
  Story.create(req.body).then(function(story){
    console.log(story)
    res.json(story)
  })
})
//story show
app.get('/stories/:id', (req, res, next) => {
  console.log(req.params.id);
  Story.findOne({_id: req.params.id}).then(rec => {
    res.json(rec)
  })
})
//story update
app.put('/stories/:id', (req, res) => {
  console.log("hitting db");
  console.log(req.body);
  Story.findOneAndUpdate({_id: req.params.id}, req.body, {new:true}).then(response => {
    console.log(response);
    res.json(response)
  })
})
//story delete
app.delete('/stories/:id', (req, res) => {
  Story.findOneAndRemove({_id: req.params.id}).then(function(deleted){
    res.json(deleted)
  })
})

//photo index
app.get('/photos', (req, res, next) => {
  Photo.find({}).then(function(photos){
    res.json(photos)
  })
})
//photo create
app.post('/photos', (req, res, next) => {
  console.log(req.body);
  Photo.create(req.body).then(function(photo){
    console.log(photo.photo);
    res.json(photo)
  })
})
//photo show
app.get('/photos/:id', (req, res, next) => {
  console.log(req.params.id);
  Photo.findOne({_id: req.params.id}).then(rec => {
    res.json(rec)
  })
})
//photo update
app.put('/photos/:id', (req, res) => {
  console.log("hitting db");
  console.log(req.body);
  Photo.findOneAndUpdate({_id: req.params.id}, req.body, {new:true}).then(response => {
    console.log(response);
    res.json(response)
  })
})
//photo delete
app.delete('/photos/:id', (req, res) => {
  Photo.findOneAndRemove({_id: req.params.id}).then(function(deleted){
    res.json(deleted)
  })
})

app.listen(process.env.PORT || 4000, function(){
  console.log("app listening at 4000");
})
