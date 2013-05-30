
/**
 * Module dependencies.
 */

var express = require('express'),
  routes = require('./routes'),
  api = require('./routes/api'),
  cons = require('consolidate'),
  swig = require('swig');

var app = module.exports = express();

// Configuration

// NOTE: Swig requires some extra setup
// This helps it know where to look for includes and parent templates
swig.init({
    root: __dirname + '/views',
    allowErrors: true // allows errors to be thrown and caught by express instead of suppressed by Swig
});

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.engine('html', cons.swig);
  app.set('view engine', 'html');
  app.set('view options', {
    layout: false
  });
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/public'));
  app.use(app.router);
});



app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);
// app.get('/addPost', routes.addPost);
app.get('/partials/:name', routes.partials);

// JSON API

app.get('/api/posts', api.posts);

app.get('/api/post/:id', api.post);
app.post('/api/post', api.addPost);
app.put('/api/post/:id', api.editPost);
app.delete('/api/post/:id', api.deletePost);

// redirect all others to the index (HTML5 history)
app.get('*', routes.index);

// Start server

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
