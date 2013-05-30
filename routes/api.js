// This module uses a single database connection which is 
// initialized before the app starts serving requests. 
// See `server.js` for details.

var r = require('rethinkdb'),
    debug = require('debug')('rdb'),
    assert = require('assert'),
    self = this;

// #### Database setup

/** 
 * We initialize the database by performing the following operations:
 *
 * -   create the database `RDB_DB` (defaults to `blogger`) using [`dbCreate`](http://www.rethinkdb.com/api/#js:manipulating_databases-db_create)
 * -   create the `blogposts` table using [`tableCreate`](http://www.rethinkdb.com/api/#js:manipulating_tables-table_create)
 *
 * If the table didn't exist than we populate the table with some sample data using a
 * bulk [`insert`](http://www.rethinkdb.com/api/#js:writing_data-insert).
 *
 * You'd typically not find this code in a real-life app, since the database would already exist.
 */
exports.setupDB = function(dbConfig, connection) {
  var blogposts = [
    {
      "title": "Lorem ipsum",
      "text": "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    },
    {
      "title": "Sed egestas",
      "text": "Sed egestas, ante et vulputate volutpat, eros pede semper est, vitae luctus metus libero eu augue. Morbi purus libero, faucibus adipiscing, commodo quis, gravida id, est. Sed lectus."
    }
  ];

  // Create the DB using [`dbCreate`](http://www.rethinkdb.com/api/#js:manipulating_databases-db_create):
  r.dbCreate(dbConfig.db).run(connection, function(err, result) {
    // Create the table using [`tableCreate`](http://www.rethinkdb.com/api/#js:manipulating_tables-table_create):
    r.db(dbConfig.db).tableCreate('blogposts').run(connection, function(err, result) {
      // We insert the sample data iif the table didn't exist:
      if(result && result.created === 1) {
        r.db(dbConfig.db).table('blogposts').insert(blogposts).run(connection, function(err, result) {
          if(result) {
            debug("Inserted %s sample blog posts into table 'blogposts' in db '%s'", result.inserted, dbConfig['db']);
          }
        });
      }
    });
  });
};


// GET

exports.posts = function (req, res) {
  r.table('blogposts').run(self.connection, function(err, cursor) {
    cursor.toArray(function(err, results) {
        if(err) {
            debug("[ERROR] %s:%s\n%s", err.name, err.msg, err.message);
            res.json(false);
        }
        else{
            res.json(results);
        }
    });
  });
};


exports.post = function (req, res) {
  var id = req.params.id;
  debug('singlePost: %s',id);

  r.table('blogposts').get(id).run(self.connection, function(err, result) {
      if(err) {
          debug("[ERROR] findById: %s:%s\n%s", err.name, err.msg, err.message);
          res.json(false);
      }
      else {
          res.json(result);
      }
  })  
};

// POST

exports.addPost = function (req, res) {
  // data.posts.push(req.body);
  var blogpost = req.body;
  r.table('blogposts').insert(blogpost).run(self.connection, function(err, result) {
    if(err) {
        debug("[ERROR] addPost %s:%s\n%s", err.name, err.msg, err.message);
        res.json(500,{error: 'An error occurred when adding the new post (' + err.msg + ')'})
    }
    else {
        if(result && result.inserted === 1) {
            blogpost.id = result.generated_keys[0];
            res.json(blogpost);
        }
        else {
            debug("[ERROR] Failed to create new blog post: %j (%j)", blogpost, result);
            res.json(500, {error: 'An error occurred when adding the new blogpost'});
        }
    }
  });
};

// PUT

exports.editPost = function (req, res) {
  var id = req.params.id, blogpost = req.body;
  blogpost.id = id;
  debug('Updating blogpost: %j', blogpost);

  r.table('blogposts').get(id).update(blogpost).run(self.connection, function(err, result) {
    if(result && result.replaced === 1) {
        res.json(blogpost);
    }
    else if(err) {
        debug("[ERROR] editPost %s:%s\n%s", err.name, err.msg, err.message);
        res.json(500, {error: 'An error occurred when updating the blogpost with id: ' + id});
    }
    else {
        debug("[ERROR] editPost (%s): %j", id, result);
        res.json(500, {error: 'An error occurred when updating the blogpost with id: ' + id});
    }
  });
};

// DELETE

exports.deletePost = function (req, res) {
  var id = req.params.id;
  debug('Deleting blogpost: %s', id);

  r.table('blogposts').get(id).delete().run(self.connection, function(err, result) {
    debug("[ERROR] deletePost %j, %j", err, result);
    if(err) {
        debug("[ERROR] deletePost %s:%s\n%s", err.name, err.msg, err.message);
        res.json(500, {error: 'An error occurred when deleting the blogpost with id:' + id});
    }
    else if (result.deleted === 1) {
        res.json(true);
    }
    else {
        debug("[ERROR] deletePost (%s) :%j", id, result);
        res.json(500, {error: 'An error occurred when deleting the blogpost with id:' + id});
    }
  });
};

