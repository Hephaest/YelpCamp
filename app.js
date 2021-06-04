if (process.env.NODE_ENV !== 'production') require('dotenv').config();

const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const helmet = require('helmet');

// Defend noSQL injection
const mongoSanitize = require('express-mongo-sanitize');

const ExpressError = require('./utils/ExpressError');
const {failureRedirect} = require('./utils/redirectHandlers');
const User = require('./models/user');
const Campground = require('./models/campground');

const userRouter = require('./routes/users');
const campgroundRouter = require('./routes/campgrounds');
const reviewRouter = require('./routes/reviews');

const MongoStore = require('connect-mongo');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
const sessionSecret = process.env.SESSION_SECRET || 'flai3heal!GNES!jang';

const INTERVAL = 7 * 24 * 60 * 60 * 1000;

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database connected');
});

const app = express();

app.engine('ejs', ejsMate);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Parse request body else the value is empty in POST
app.use(express.urlencoded({extended: true}));
// Used for HTTP PATCH and PUT
app.use(methodOverride('_method'));
// Serve static Assets
app.use(express.static(path.join(__dirname, 'public')));
// To remove data, use:
app.use(mongoSanitize({replaceWith: '_'}));

// Construct Session
const sessionConfig = {
  // To confuse hacker where is session id
  name: '_blur',
  secret: sessionSecret,
  saveUninitialized: true,
  resave: false,
  store: MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
      secret: sessionSecret,
    },
  }),
  cookie: {
    // Cannot access cookies by Javascript
    httpOnly: true,
    // Only for https
    // secure: true,
    expire: Date.now() + INTERVAL,
    maxAge: INTERVAL,
  },
};

app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
  'https://api.tiles.mapbox.com/',
  'https://api.mapbox.com/',
  'https://kit.fontawesome.com/',
  'https://cdnjs.cloudflare.com/',
  'https://cdn.jsdelivr.net',
  'https://code.iconify.design/',
  'https://api.iconify.design/',
];

const styleSrcUrls = [
  'https://cdn.jsdelivr.net',
  'https://kit-free.fontawesome.com/',
  'https://api.mapbox.com/',
  'https://api.tiles.mapbox.com/',
  'https://fonts.googleapis.com/',
  'https://use.fontawesome.com/',
];

const connectSrcUrls = [
  'https://api.mapbox.com/',
  'https://api.iconify.design/',
  'https://a.tiles.mapbox.com/',
  'https://b.tiles.mapbox.com/',
  'https://events.mapbox.com/',
];

const fontSrcUrls = [];

app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: [],
        connectSrc: ['\'self\'', ...connectSrcUrls],
        scriptSrc: ['\'unsafe-inline\'', '\'self\'', ...scriptSrcUrls],
        styleSrc: ['\'self\'', '\'unsafe-inline\'', ...styleSrcUrls],
        workerSrc: ['\'self\'', 'blob:'],
        objectSrc: [],
        imgSrc: [
          '\'self\'',
          'blob:',
          'data:',
          'https://res.cloudinary.com/hephaest-image-database/',
        ],
        fontSrc: ['\'self\'', ...fontSrcUrls],
      },
    }),
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// Split routers
app.use('/', userRouter);
app.use('/campgrounds', campgroundRouter);
app.use('/campgrounds/:id/reviews', reviewRouter);


app.get('/', async (req, res) => {
  const limitNum = 5;
  const campgrounds = await Campground
      .find()
      .sort({'rating': -1})
      .populate('images', 'url')
      .limit(limitNum);
  res.render('home', {campgrounds, limitNum});
});

app.all('*', (req, res, next) => {
  next(new ExpressError('Opps! Something went wrong', 404));
});

app.use((err, req, res, next) => {
  console.log(err);
  if (!err.message) err.message = 'Something went wrong';
  return failureRedirect(req, res, err.message, '/campgrounds');
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Serving on port ${ port }`);
});
