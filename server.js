require('app-module-path').addPath(`${__dirname}/`);

const express    = require('express'),
	  app        = express(),
	  bodyParser = require('body-parser'),
      session    = require('express-session'),
      RxMongo    = require('rxmongo').RxMongo,
	  homeController = require('src/controllers/HomeController'),
	  accountController = require('src/controllers/AccountController'),
	  contentController = require('src/controllers/ContentController'),
      profileController = require('src/controllers/ProfileController'),
      contentApiController = require('src/webapi/ContentApiController'), 
      MongoDBStore = require('connect-mongodb-session')(session);

const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost/findit';

const store = new MongoDBStore({ 
    uri: mongoUrl,
    collection: 'Sessions'
});

// setup view engine
app.set('views', `${__dirname}/src/views`);
app.set('view engine', 'pug');

// setup middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(`${__dirname}/src/public`));
app.use(session({
    secret: '9D59516154098C8BFFCABDFB261646BC210F37F77D4A3D8C23654FC480DDCD88',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week 
    },
    store: store
}));

// controllers
app.use('/account', accountController);
app.use('/profile', profileController);
app.use('/', homeController);
app.use('/', contentController);

// APIs
app.use('/api', contentApiController);

// error handler
app.use((err, req, res, next) => {
    console.log(err);
    if (res.headersSent) {
        return next(err);
    }
});

// start!
const port = process.env.PORT || 3000;
RxMongo.connect(mongoUrl)
       .subscribe(db => app.listen(port,
                  () => console.log(`running on port ${port}`)),
                  error => console.log(error));