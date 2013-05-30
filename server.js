
/**
 * Module dependencies.
 */

var express = require('express'),
  routes = require('./routes'),
  api = require('./routes/api'),
  cons = require('consolidate'),
  swig = require('swig'),
  rdb = require('rethinkdb');

var app = module.exports = express();

// Configuration

// NOTE: Swig requires some extra setup
// This helps it know where to look for includes and parent templates
swig.init({
    root: __dirname + '/views',
    allowErrors: true // allows errors to be thrown and caught by express instead of suppressed by Swig
});

// RethinkDB configuration

var dbConfig = {
  host : process.env.RDB_HOST || 'localhost',
  port : parseInt(process.env.RDB_PORT) || 28015,
  db   : process.env.RDB_DB || 'blogger',
}; 

// Express configuration

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
rdb.connect({host: dbConfig.host, port: dbConfig.port}, function(err, connection) {
  if(err) {
    console.log("ERROR: %s:%s", err.name, err.msg);
    process.exit(1);
  }
  else {
    // set up the database
    api.setupDB(dbConfig, connection);
    // set up the default database for the connection
    connection.use(dbConfig['db']);
    // set up the module global connection
    api.connection = connection;
    // start serving requests    
    app.listen(3000, function(){
      console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
    });
  }
});
