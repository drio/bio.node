#!/usr/bin/env node

var path = require('path');
var sys = require("sys");
var _ = require("underscore");

function run_in_cluster(cmd, callback) {
  var ssh_url="deiros@128.249.42.223";
  var ssh = require("child_process").spawn("ssh", [ssh_url, cmd]);
  var r = { cmd_ok : true, ssh_ok : true};
  var stdout = "";
  var stderr = "";
  
  ssh.stdout.addListener("data", function(data) { stdout += data; });
  ssh.stderr.addListener("data", function(data) { stderr += data; r.cmd_ok = false; });

  ssh.addListener("exit", function(code) {
    if (code !== 0)   { r.ssh_ok = false ; }
    r.stdout = stdout; r.stderr = stderr;
    callback(r);
  });
}

var    sys = require("sys"),
  cmd = process.ARGV[2];

if (!cmd)
  return sys.puts("Usage: " + __filename.replace(__dirname + "/", "") + " cmd");

run_in_cluster(cmd, function(results) {
  if (results.ssh_ok && results.cmd_ok) {
    sys.puts("All good");
    sys.puts(results.stdout);
  }
  else {
    if (!results.ssh_ok) {
      sys.puts("problems with ssh");
    } 
    if (!results.cmd_ok) {
      sys.puts("problems executing cmd");
      sys.puts(results.stderr);
    }
  }
});
