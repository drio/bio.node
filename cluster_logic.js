var fs     = require('fs');
var path   = require('path');
var spawn = require("child_process").spawn;

exports.run_single_cmd = function(data, callback){ 
  single_cmd(data, callback); 
};
exports.merge_dups_snp_calling = function(data, callback){ 
  merge_dups_snp_calling(data, callback); 
};


/*
 * Various config parameters
 */
var cfg = {
  user: "deiros",
  ip: "128.249.42.223",
  ardmore: {
    work_dir : "/stornext/snfs0/rogers/drio_scratch/bio.node",
  },
  cluster : {
    template  : 'echo "CMD" | qsub -N "TITLE" -q QUEUE -d "WD" -l RES -V -o OUT -e ERR',
    queue     : "analysis", 
    resources : "nodes=1:ppn=1,mem=4000mb",
  }
}

/*
 * recipe to merge alignments (bams), mark dups and call snps
 * { 
 *  "ref_fasta" : "/tmp/hsap.fa",
 *  "bams"      : [ "/tmp/bam1", "/tmp/bam2" ]
 * }
 * cluster cmd: recipe_snp_calling.sh -f fasta.fa bam1 bam2 .. bamN
 */
function merge_dups_snp_calling(d, callback) {
  d.cmd = "recipe_snp_calling.sh -f " + d.ref_fasta + " " + d.bams.join(' ');
  single_cmd(d, callback);
}

/*
 * Run a single cmd in cluster
 * data has to have a JSON object with the following methods:
 * prj_name, sample_name, title, 
 * The recipes require other methods
 * Results: Same as run_cmd for the moment
 */
function single_cmd(d, callback) {
  // TODO: sanity checks
  // TODO: don't hardcode /Users ...
  var dir = "/Users/drio/sshfs/ardmore" + cfg.ardmore.work_dir + "/" + d.prj_name + "/" + d.sample_name;
  
  // TODO: npm's mkdir_p failed ... investiage way.. this is just a hack
  // NOTE: most likely it was because of sshfs' mount point was degraded .. try again
  console.log("creating_dir: " + dir); 
  spawn("mkdir", ["-p", dir]).addListener("exit", function(code) {
    if (code !== 0) { 
      console.error("Problems creating dir: " + dir); 
      callback({ ok : false});
    } else {
      d.exec_dir = cfg.ardmore.work_dir + "/" + d.prj_name + "/" + d.sample_name;
      run_cmd(d, function (r) { callback(r) });
    }
  });
}

/**
 * asynchronously spawn a process and call me back with the results.
 *
 * Results:
 * {
 *  ok    : true|false, 
 *  stdout: "stdout of cmd",
 *  stderr: "stderr of cmd",
 * }
 */
function run_cmd(d, callback) {
  var ssh_url= cfg.user + "@" + cfg.ip;

  var c_template  = cfg.cluster.template;
  var cluster_cmd = c_template.replace(/CMD/  , d.cmd)
                              .replace(/QUEUE/, cfg.cluster.queue)
                              .replace(/RES/  , cfg.cluster.resources)
                              .replace(/WD/   , d.exec_dir)
                              .replace(/OUT/  , "out")
                              .replace(/ERR/  , "err")
                              .replace(/TITLE/, "bn." + d.title);
  console.log("cmd: " + cluster_cmd);
  var ssh = spawn("ssh", [ssh_url, cluster_cmd]);
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

