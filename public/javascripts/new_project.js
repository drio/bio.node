var libs = {
  number: 0,
  inc: function() { this.number += 1; return this.number - 1; }
}

var log = {
  update : function(msg) {
    $('#np_log').prepend(new Date() + ">> " + msg + "<br>");
  },
  clear : function() {
    $('#np_log').empty();
  }
}

var create_json_project = function() {
  var prj_name    = $("input[name='np_input_pname']").val();
  var sample_name = $("input[name='np_input_sname']").val();
  var ref_genome  = $("select[name='select_ref']").val();

  log.update("Creating json for recipe.");
  /* We have to get all the bams for all the libraries the user dumped */
  var bams = []; 
  $("input[name*='input_lib_']").each(function() {
    var lib_name = $(this).attr('value');
    log.update("Ajax call to retrieve bams for lib: " +  lib_name);

    /* I have to make a syncronous call, so we process each request one by one */
    $.ajax({
      type: 'GET',
      url: 'bams/' + lib_name,
      dataType: 'json',
      success: function(data) { 
        log.update("got it: " + data.length);
        $.each(data, function(i,value){
          if (value.found) { bams.push(value.path); }
        });
      },
      data: {},
      async: false
    });
  });

  var exec_info = {
    "ref_fasta"   : ref_genome,
    "bams"        : bams,
    "title"       : "bn." + prj_name + "." + sample_name,
    "prj_name"    : prj_name,
    "sample_name" : sample_name,
  };
  
  return exec_info;
}

add_new_input_library = function() {
  var input_t = '<input name="input_lib_XX" size="30">';
  var class_t = "<div id='div_lib_YY' class='spacer'>XX" +  
                  "<div id='counter_YY' style='display:inline;'>[?|?]</div>" + 
                  "<button name='del_lib_YY'>delete</button>" + 
                  "<button name='bams_YY' value='YY'>bams</button>" + 
                "</div>";

  var i     = libs.inc();
  var input = input_t.replace(/XX/g, i);
  var s     = class_t.replace(/XX/g, input).replace(/YY/g, i);
  $('#np_libs').append(s);

  /* Setup callback for when user deletes the library */
  $("button[name='del_lib_" + i + "']").click(function () { 
    var lib_name = $("input[name='input_lib_" + i + "']").attr("value");
    $('#div_lib_' + i).remove();
    $("input[name*='input_lib_']").each(function() { 
      log.update(lib_name); 
    });   
  });

  /* 
   * Setup callback for when user hits bams (query lims to retrieve bams per
   * library 
   */
  $("button[name='bams_" + i + "']").click(function () { 
    var lib_name = $("input[name='input_lib_" + i + "']").attr("value");
    $('#counter_' + i).text = "X";
    log.update("ajax call to /bams " + lib_name);
      $.getJSON("bams/" + lib_name,
        {},
        function(data) {
          var found = not_found = 0;
          $.each(data, function(i,value){
            if (value.found) { found +=1; } 
            else { not_found +=1; } 
          });
          var c_text = "[" + found + "|" + not_found + "]";
          log.update("callback answer for " + lib_name + " " + c_text);
          $('#counter_' + i).empty().text(c_text);
        }
      );
  });
}

// new_project, javascript client side logic
$(document).ready(function () {
  $('#np_log').empty();
  log.update("Ready ...");

  // Ready to run the recipe in the cluster  
  $("button[name='b_np_execute']").click(function () {
    if ($('select[name="select_ref"]').attr('value') === "none" ) {
      log.update("UPS! Please, select a reference genome.");
    }
    else {
      log.update("Time to execute the recipe");
      var json_recipe = create_json_project();
      log.update(JSON.stringify(json_recipe));
      $.ajax({
        type: 'POST',
        url: '/execute_project',
        dataType: 'json',
        success: function(data) { log.update("Job started: " + data.stdout); },
        data: json_recipe,
        async: false
      });
    }
  });

  // Add new library
  $("button[name='b_np_new_lib']").click(function () {
    add_new_input_library(); 
  });
});
