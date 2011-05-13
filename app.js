var express = require('express');
var app = module.exports = express.createServer();

/* Load lims logic module */
var path = require('path');
require.paths.unshift(path.join(__dirname, '.'));
var lims_logic = require("lims_logic");

// Simulate database of libraries ... this is going to go away
var libraries = { "lib1": [ "/lib1/bam1", "/lib1/bam2"],
                  "lib2": [ "/lib2/bam1", "/lib2/bam2"] };

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes
app.get('/', function(req, res){
  res.render('index', { title: 'lib.finder: index' });
});

// /bams/for/lib1 -> { "name": "lib1", "bams": [ "/lib1/bam1", "/lib1/bam2"] },
app.get('/bams/:name', function(req, res, next){
  var name = req.params.name;
 
  lims_logic.query_lims(name, function(lims_results) {
    res.send(lims_results);
  });
});

// Only listen on $ node app.js
if (!module.parent) {
  app.listen(3000);
  console.log("Express server listening on port %d", app.address().port);
}
