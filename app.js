var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();
const PORT = process.env.PORT || 3001;

app.get('/scrape', function(req, res) {
  //url = 'http://www.imdb.com/title/tt1229340/';
  url =
    'https://www.acropedia.org/poses/?_sft_position=l-base/';
  request(url, function(error, response, html) {
    if (!error) {
      var $ = cheerio.load(html);

      var title, release;
      var json = {
        title: '',
        pic: ''
      };

      $('.thumbnail').filter(function() {
        var data = $(this);
        pic = data
          .children()
          .first()[0]
          .text();
        title = data
          .children()
          .last()
          .children()
          .text();

        json.title = title;
        json.pic = pic;
      });

      $('.star-box-giga-star').filter(function() {
        var data = $(this);
        rating = data.text();

        json.rating = rating;
      });
    }

    // To write to the system we will use the built in 'fs' library.
    // In this example we will pass 3 parameters to the writeFile function
    // Parameter 1 :  output.json - this is what the created filename will be called
    // Parameter 2 :  JSON.stringify(json, null, 4) - the data to write, here we do an extra step by calling JSON.stringify to make our JSON easier to read
    // Parameter 3 :  callback function - a callback function to let us know the status of our function

    fs.writeFile(
      'output.json',
      JSON.stringify(json, null, 4),
      function(err) {
        console.log(
          'File successfully written! - Check your project directory for the output.json file'
        );
      }
    );

    // Finally, we'll just send out a message to the browser reminding you that this app does not have a UI.
    res.send('Check your console!');
  });
});

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}!`);
});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({ extended: false })
);
app.use(cookieParser());
app.use(
  express.static(path.join(__dirname, 'public'))
);

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error =
    req.app.get('env') === 'development'
      ? err
      : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
