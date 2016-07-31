require('app-module-path').addPath(`${__dirname}/`);

const express    = require('express'),
      engine     = require('ejs-locals'),
	  ejs        = require('ejs'),
	  app        = express(),
	  bodyParser = require('body-parser'),
	  homeController = require('src/controllers/home/HomeController');

// setup view engine
app.set('views', `${__dirname}/src/views`);
app.set('view engine', 'html');
app.engine('html', ejs.renderFile);

// setup middlewares
app.use(bodyParser.json());
app.use(express.static(`${__dirname}/src/public`));

// controllers
app.use('/', homeController);

// error handler
app.use((err, req, res, next) => {
    console.log(err);
    if (res.headersSent) {
        return next(err);
    }
});

// start!
const port = process.env.PORT || 3000;
app.listen(port, function(){
    console.log(`running on port ${port}`)
})