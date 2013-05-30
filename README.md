# Based on Angular Express Seed Example App

Based on the [Angular Express Seed](https://github.com/btford/angular-express-seed), this simple app illustrates how to use [AngularJS](http://angularjs.org/) and [Express](http://expressjs.com/) on a [Node.js](http://nodejs.org/) server to make a simple blog.

# Updated to use Express > 3.0 and Swig templating instead of Jade

[Swig](http://paularmstrong.github.io/swig/) is a high performance Node.js template engine but uses {{}} for variables which makes it clash with the use of {{}} in AngularJS. Replaced use of {{}} with [[]] in AngularJS to make it work with Swig.

Swig also requires [Consolidate](https://github.com/visionmedia/consolidate.js/) to make it work with Express.

# Added database integration with RethinkDB

[RethinkDB](http://www.rethinkdb.com) is a NoSQL database similar to MongoDB but with different trade-offs.
