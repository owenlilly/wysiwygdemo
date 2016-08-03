require('app-module-path').addPath(`${__dirname}/`);

const express    = require('express'),
      engine     = require('ejs-mate'),
	  ejs        = require('ejs'),
	  app        = express(),
	  bodyParser = require('body-parser'),
      session    = require('express-session'),
      RxMongo    = require('rxmongo'),
	  homeController = require('src/controllers/home/HomeController'),
	  accountController = require('src/controllers/account/AccountController'),
	  articleController = require('src/controllers/home/ArticleController');

const mongoUrl = 'mongodb://localhost/findit';

// setup view engine
app.set('views', `${__dirname}/src/views`);
app.set('view engine', 'html');
app.engine('html', engine);

// setup middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(`${__dirname}/src/public`));
app.use(session({
  secret: '9D59516154098C8BFFCABDFB261646BC210F37F77D4A3D8C23654FC480DDCD88',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// controllers
app.use('/', homeController);
app.use('/account', accountController);
app.use('/u', articleController);

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
        .subscribe(db => {
                            app.listen(port, function(){
                                console.log(`running on port ${port}`)
                            });
                    });