//connection
var express = require('express')
var app = express()
var parser = require('body-parser')
var mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/wanderfully')
var db = mongoose.connection
var cors = require('cors')


app.use(cors())
app.use(parser.json())
app.use(parser.urlencoded({ extended:true }))
// app.use(methodOverride(function(req, res){
//       if (req.body && typeof req.body === 'object' && '_method' in req.body) {
//         // look in urlencoded POST bodies and delete it
//         var method = req.body._method
//         delete req.body._method
//         return method
//       }
// }))

db.once('open', () => {
  console.log("database connected");
})

//schemas
var Schema = mongoose.Schema
var ObjectId = Schema.ObjectId

var UserSchema = new Schema({
  name: String,
  username: String,
  trips: [ {type: Schema.ObjectId, ref: 'Trip'} ],
  searchable: Boolean,
  photos: [ {type: Schema.ObjectId, ref: 'Photo'} ],
  stories: [ {type: Schema.ObjectId, ref: 'Story'} ]
})

var TripSchema = new Schema({
  name: String,
  planned: Boolean,
  travelers: [ {type: Schema.ObjectId, ref: 'User'} ],
  destinations: [{
    destination: {type: Schema.ObjectId, ref: 'Destination'},
    required: Boolean,
    confirmed: Boolean
  }],
  notes: String,
  expenses: String
})

var DestinationSchema = new Schema({
  name: String,
  address: String,
  country: String,
  type: String,
  photos: [ {type: Schema.ObjectId, ref: 'Photo'} ],
  stories: [ {type: Schema.ObjectId, ref: 'Story'} ],
  recommendations: [ {type: Schema.ObjectId, ref: 'Recommendation'} ]
})

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
var Destination = mongoose.model('Destination', DestinationSchema)
var Recommendation = mongoose.model('Recommendation', RecommendationSchema)
var Story = mongoose.model('Story', StorySchema)
var Photo = mongoose.model('Photo', PhotoSchema)

//seeds
// User.remove({}, (err) => {})
// Trip.remove({}, err => {})
// Destination.remove({}, err => {})
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

//api
app.get('/', (req, res) => {
  res.json("hello world")
})

app.get('/users', (req, res, next) => {
  User.find({}).then(function(users){
    res.json(users)
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
//trip create
app.post('/trips', (req, res) => {
  Trip.create(req.body).then(function(trip){
    console.log(trip)
  })
})
//trip update
app.put('/trips/:id', (req, res) => {
  console.log("hitting db");
  console.log(req.body);
  Trip.findOneAndUpdate({_id: req.params.id}, req.body, {new:true}).then(response => {
    console.log(response);
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
  })
})
//photo delete
app.delete('/photos/:id', (req, res) => {
  Photo.findOneAndRemove({_id: req.params.id}).then(function(deleted){
    res.json(deleted)
  })
})

app.listen(4000, function(){
  console.log("app listening at 4000");
})
