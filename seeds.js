
//seeds
var Schema = require('./index.js')
var User = Schema.User
var Trip = Schema.Trip
var Destination = Schema.Destination
var Recommendation = Schema.Recommendation
var Story = Schema.Story
var Photo = Schema.Photo

User.remove({}, (err) => {})
Trip.remove({}, err => {})
Destination.remove({}, err => {})
Recommendation.remove({}, err => {})
Story.remove({}, err => {})
Photo.remove({}, err => {})

var liza = new User({name: 'Liza Floyd', username: 'lizafloyd', searchable: true})
var morocco = new Trip({name: 'Morocco Trip', planned: false})
liza.trips.push(morocco)
morocco.travelers.push(liza)

liza.save((err, liza) => {})
morocco.save((err) => {})
