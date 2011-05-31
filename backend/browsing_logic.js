var fs     = require('fs');
var path   = require('path');

/*
fs.writeFile('stuff.json', JSON.stringify(foo, null, 2), encoding='utf8', function (err) {
  if (err) throw err;
  console.log('It\'s saved!');
  fs.readFile('stuff.json', 'utf8' , function (err, data) {
    if (err) throw err;
    console.log('reading');
    console.log(data);
  });
});
*/

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
        if (stat && stat.isDirectory() && f !== ".git") { // TODO: why is .git breakign this?
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
var find_json_data = function(dir, callback) {
  var json_results = {};
  walk(dir,
    function(f) {
      return /\.json/.test(f);
    },
    function(results) {
      results.forEach(function(e) {
        console.log("FIND: " + e);
      });
      callback(json_results);
    }
  );
}

//var dir= "/Users/drio/sshfs/ardmore/stornext/snfs0/rogers/drio_scratch/bio.node";
var dir= "/Users/drio/sshfs/ardmore/stornext/snfs0/rogers/drio_scratch/playground/test_pipe";
//var dir= "/tmp/test_pipe";
find_json_data(dir, function(json_results) {
  console.log(json_results);
});

