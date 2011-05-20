#!/bin/bash
#
set -e

ref="/stornext/snfs0/rogers/drio_scratch/playground/1kg/human_g1k_v37.fasta"
b_path="/stornext/snfs0/rogers/drio_scratch/playground/test_pipe"
bam1="$b_path/bam1"
bam2="$b_path/bam2"

if [ -t 0 ] # true(1) if opened and refers to a terminal
then
  cat <<EOF
{
  "ref_fasta"   : "$ref",
  "bams"        : [ "$bam1", "$bam2" ],
  "title"       : "node.test",
  "prj_name"    : "prj_test",
  "sample_name" : "sample_test"
}
EOF
else
  cat - | curl -v \
  -H "Content-Type: application/json" \
  -X POST \
  -d "@-" \
  http://localhost:3000/execute_project
  echo ""
fi
