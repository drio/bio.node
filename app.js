fs = require('fs');
var express = require('express');
var app = module.exports = express.createServer();

/* Load lims logic module */
var path = require('path');
require.paths.unshift(path.join(__dirname, '.'));
var lims_logic = require("lims_logic");
var cluster_logic = require("cluster_logic");

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

/*
 * Index route
 */
app.get('/', function(req, res){
  res.render('index', { title: 'index', js_file: false});
});

/*
 * Tool to display and verify the bams associated with a library
 */
app.get('/verify_lib', function(req, res) {
  res.render('verify_lib', { title: 'verify_lib', js_file: 'verify_lib' });
});

/* 
 * Returns a JSON result after pulling the bams associated 
 *
 */
app.get('/bams/:name', function(req, res, next){
  var name = req.params.name;

  console.log("/bams request: " + req.params.name);
  lims_logic.query_lims(name, function(lims_results) {
    res.send(lims_results);
  });
});

/* 
 * GUI to create a new project and ultimately run it in the cluster
 */
app.get('/new_project', function(req, res, next){
  console.log("/new_prj request");
  res.render('new_project', { title: 'new project', js_file: 'new_project' });
});

/* 
 * Execute a recipe in the cluster using the data (json req)
 * To simulate a POST JSON request:
 * curl -v -H "Content-Type: application/json" \ 
 * -X POST -d '{"cmd" : "sleep 10; ls -lach /tmp"}' \
 * http://localhost:3000/execute_project && echo ""
 */
app.post('/execute_project', function(req, res, next){
  //console.log(require("util").inspect(req));

  cluster_logic.merge_dups_snp_calling(
    { 
      "ref_fasta"   : "/stornext/snfs0/rogers/drio_scratch/playground/1kg/human_g1k_v37.fasta",
      "bams"        : [ 
                        "/stornext/snfs0/rogers/drio_scratch/playground/test_pipe/bam1", 
                        "/stornext/snfs0/rogers/drio_scratch/playground/test_pipe/bam2", 
                      ],
      "title"       : "node.test",
      "prj_name"    : "ptest",
      "sample_name" : "stest",
    }, 
    function(c_res) { 
      res.send({"cmd": "TEST", "c_res": c_res.ok}); 
      if (!c_res.ok) {
        console.log("ERROR [execute_project] / stderr : " + c_res.stderr);
      }
    }
  );
});

/**
 * MAIN
 *
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
