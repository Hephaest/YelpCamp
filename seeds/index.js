if (process.env.NODE_ENV !== 'production') require('dotenv').config();

const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database connected');
});

const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i< 50; i++) {
    const seed = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: '60b49c714b967bb7ec3bc71a',
      location: `${cities[seed].city}, ${cities[seed].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description: `Lorem ipsum dolor, sit amet consectetur adipisicing elit. 
      Minus animi, 
      quo sed exercitationem consectetur ipsum voluptate placeat consequatur voluptatem ipsa? 
      Nesciunt sunt consequuntur aliquid beatae eligendi veniam nam veritatis at?`,
      price,
      geometry: {
        type: 'Point',
        coordinates: [
          cities[seed].longitude,
          cities[seed].latitude,
        ],
      },
    });
    await camp.save();
  }
};

seedDB().then(() => {
  db.close();
});
