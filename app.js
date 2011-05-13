fs = require('fs');
var express = require('express');
var app = module.exports = express.createServer();

/* Load lims logic module */
var path = require('path');
require.paths.unshift(path.join(__dirname, '.'));
var lims_logic = require("lims_logic");

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

  console.log("/bams request: " + req.params.name);
  lims_logic.query_lims(name, function(lims_results) {
    res.send(lims_results);
  });
});

/**
 * Make sure, if working in mac, that the ardmore path
 * is mounted
 */
var ardmore_mount_point = lims_logic.cfg.root_fs;
if (os.type() === 'Darwin' && fs.readdirSync(ardmore_mount_point).length < 5) {
  console.log("Are you sure " + ardmore_mount_point + " is mounted?");
}
else {
  if (os.type() === 'Darwin') {
    console.log("Cool! ardmore mount point available: " + ardmore_mount_point);
  } else {
    console.log("Uhh! It seems nodejs is running in ardmore.")
  }
  // Only listen on $ node app.js
  if (!module.parent) {
    app.listen(3000);
    console.log("Express server listening on port %d", app.address().port);
  }
}
