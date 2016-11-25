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
  text: String
})

var StorySchema = new Schema({
  user: {type: Schema.ObjectId, ref: 'User'},
  destination: {type: Schema.ObjectId, ref: 'Destination'},
  text: String
})

var PhotoSchema = new Schema({
  user: {type: Schema.ObjectId, ref: 'User'},
  destination: {type: Schema.ObjectId, ref: 'Destination'},
  photo: String
})

var User = mongoose.model('User', UserSchema)
var Trip = mongoose.model('Trip', TripSchema)
var Destination = mongoose.model('Destination', DestinationSchema)
var Recommendation = mongoose.model('Recommendation', RecommendationSchema)
var Story = mongoose.model('Story', StorySchema)
var Photo = mongoose.model('Photo', PhotoSchema)

//api
app.get('/', (req, res) => {
  res.json("hello world")
})

app.get('/users', (req, res, next) => {
  User.find({}).then(function(users){
    res.json(users)
  })
})

app.get('/trips', (req, res, next) => {
  Trip.find({}).then(trips => {
    res.json(trips)
  })
})

app.post('/trips/:id/delete', (req, res) => {
  Trip.findOneAndRemove({_id: req.params.id}).then(function(deleted){
    res.json(deleted)
  })
})

app.post('/trips', (req, res) => {
  Trip.create(req.body).then(function(trip){
    console.log(trip)
  })
})

app.listen(4000, function(){
  console.log("app listening at 4000");
})
