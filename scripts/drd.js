#!/usr/bin/env node

var path = require('path');
var sys = require("sys");

require.paths.unshift(path.join(__dirname, '..'));

var lims_logic = require("lims_logic");

lims_logic.query_lims("IWG_PANU.L1_000pA", function(r) {
  console.log(":) " + r);
});
