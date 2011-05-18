
exports.run_cmd = function(cmd, callback){
  run_cmd(cmd, callback);
};

var cfg = {
  user: "deiros",
  ip: "128.249.42.223",
}

function run_cmd(cmd, callback) {
  var ssh_url= cfg.user + "@" + cfg.ip;
  var ssh = require("child_process").spawn("ssh", [ssh_url, cmd]);
  var r = { ok: true };
  var stdout = "";
  var stderr = "";
  
  ssh.stdout.addListener("data", function(data) { stdout += data; });
  ssh.stderr.addListener("data", function(data) { stderr += data; r.cmd_ok = false; });

  ssh.addListener("exit", function(code) {
    if (code !== 0) { r.ok = false; }
    r.stdout = stdout; r.stderr = stderr;
    callback(r);
  });
}
