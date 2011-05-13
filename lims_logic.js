var sys = require("sys"),
   http = require('http');
   path = require('path');
   util = require('util');
   os   = require('os');

/* lims server and url details */
var cfg = {
  root_fs : os.type() === 'Darwin' ? "/Users/drio/sshfs/ardmore" : "",
};

exports.cfg = cfg;

var Option = function(lib_name) {
  this.host = "lims-1.hgsc.bcm.tmc.edu",
  this.port = 80,
  this.path = '/ngenlims/getResultsPathFromLibraryName.jsp?libraryName=' + lib_name,
  this.method = 'GET',
  this.headers = {}
}

/* Logic to deal with output lines that lims dumps at us */
var limsEntry = {
  path        : function(l) { return l.split(";")[0]; },
  lane_number : function(l) { return /-(\d)$/g.exec(l)[1]; },
  bam_path    : function(l) { 
    return this.path(l) + "/s_" + this.lane_number(l) + "_marked.bam"; 
  } 
};

/* Logic to process lims results */
var LimsEntry = function(l) {
  this.lane = l;
  this.path = l.split(";")[0];
  this.lane_number = /-(\d)$/g.exec(l)[1];
  this.bam_path = this.path + "/s_" + this.lane_number + "_marked.bam"; 
}

/**
 * Make a request to LIMS
 * /stornext/snfs5/next-gen/Illumina/Instruments/....
 * 700166/100625_SN166_0126_A201JGABXX/mini_analysis/Lane3;201JGABXX-3
 */
exports.query_lims = function(lib_name, callback) {
  var o = new Option(lib_name);
  request = http.request(o, function(res) {
    var query_results = [];
    var body = "";
    res.setEncoding('utf8');
    res.on('data', function (chunk) { body += chunk });

    res.on('end', function () { 
      // Because the LIMS system does not gives us any clue
      // when there is info for the lib or not
      if (res.headers["content-length"] != '4') {        
          body.trim().split("\n").forEach (function (l){
          var le = new LimsEntry(l);
          query_results.push ({
            lane_number: le.lane_number,
            path       : le.bam_path,
            found      : path.existsSync(cfg.root_fs + le.bam_path)
          });
        });
      }
      callback(JSON.stringify(query_results)); 
    });
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  })

  request.end();
}



