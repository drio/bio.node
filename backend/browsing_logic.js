var fs     = require('fs');
var path   = require('path');

/*
 * Asyncronously and recursively traverses a directory and 
 * returns an array with all the files that pass the filter
 */
var walk = function (dir, filter, done) {
  var results = [], i = 0;

  fs.readdir(dir, function(err, list) {
    if (err || !list) return done(results);
    list.forEach(function(f) {
      fs.stat(dir + '/' + f, function(err, stat) {
        if (stat && stat.isDirectory() && f !== ".git") { // TODO: why is .git breaking this?
          walk(dir + '/' + f, filter,
            function(r) {
              results = results.concat(r);
              if (++i === list.length) {
                done(results);
              }
            });
        } else {
          if (filter(f)) results.push(dir + '/' + f);
          if (++i === list.length) {
            done(results);
          }
        }
      });
    });
  });
};

/* 
 * Given a path returns a JSON object with all the json files
 * data found recusively there.
 * It is expected that the directory follows this logic:
 * PROJECT_1/
 *   SAMPLE_1/
 *      file.json
 *      file2.json
 *   SAMPLE_2/
 *      file.json
 *      file2.json
 *    
 */
var find_json_files = exports.find_json_files = function(dir, callback) {
  var json_results = {};
  walk(dir,
    function(f) {
      return /\.json/.test(f);
    },
    function(results) {
      //results.forEach(function(e) { console.log("FIND: " + e); });
      callback(results);
    }
  );
}

/*
 * Iterate over all the json files, load their contents and 
 * set the all_json object with the data.
 * all_json is a representation of all the data available for 
 * all the projects. I'd look like:
 {
    'PRJ1' : {
      'SAMPLE_1' : {
        'PLOT_1' {
          "raw_reads"  : 9023,
          "raw_single" : 1467
        }
      }
    }
  }
*/
var files_to_json = exports.files_to_json = function(json_files, callback) {
  var all_json = {};
  var n_files = json_files.length;

  if (n_files > 0) {

    json_files.forEach(function(js_file) {
      var a      = js_file.split('/');  
      var prj    = a[a.length - 3];
      var sample = a[a.length - 2];
      var plot   = a[a.length - 1].replace('.json', '');

      //console.log(">> " + prj + " " + sample + " " + plot );
      fs.readFile(js_file, function (err, data) {
        n_files = n_files - 1;
        if (err) {
          //throw err;
          console.error("I cannot read file (We'll skip): " + js_file);
          console.error("  + " + err);
        } else {
          all_json[prj] = all_json[prj] || {};
          all_json[prj][sample] = all_json[prj][sample] || {};
          all_json[prj][sample][plot] = all_json[prj][sample][plot] || {};
          try {
            all_json[prj][sample][plot] = JSON.parse(data);
          } catch(e) {
            console.error("Skipping JSON file (parsing issues): " + js_file);
            //throw err;
          }
          //n_files = n_files - 1;
          if (n_files === 0) { callback(all_json); }
        }
      });
    });
  } else {
    console.log(">> ERROR: # of json files to process: " + n_files); 
    callback({}); 
  }
}

/* For testing standalone 
 //var dir= "/Users/drio/sshfs/ardmore/stornext/snfs0/rogers/drio_scratch/bio.node";
  var dir= "/Users/drio/sshfs/ardmore/stornext/snfs0/rogers/drio_scratch/playground/test_pipe";
  //var dir = "/Users/drio/sshfs/ardmore/stornext/snfs0/rogers/drio_scratch/bio.node";
  //var dir= "/tmp/test_pipe";

  find_json_files(dir, function(json_files) {
    files_to_json(json_files, function(all_json) {
      console.log("---------------");
      console.log(JSON.stringify(all_json, null, 2));
    });
});
*/


