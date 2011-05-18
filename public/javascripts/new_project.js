
var libs = {
  number: 0,
  inc: function() { this.number += 1; return this.number - 1; }
}

var log = {
  update : function(msg) {
    $('#np_log').prepend(">> " + msg + "<br>");
  },
  clear : function() {
    $('#np_log').empty();
  }
}

var gather_values = function() {
  var str = "";
  log.clear();
  str += "Project name: [" + $("input[name='np_input_pname']").val() + "]<br>";
  str += "Sample  name: [" + $("input[name='np_input_sname']").val() + "]<br>";
  $("input[name*='input_lib_']").each(function() {
    str += "- " + $(this).attr("value");
  });

  return str;
}


var add_new_input_library = function() {
  var input_t = '<input name="input_lib_XX" size="30">';
  var class_t = "<div id='div_lib_YY' class='spacer'>XX" +  
                  "<div id='counter_YY' style='display:inline;'>?</div>" + 
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
          log.update("callback answer for " + lib_name + " " + data.length);
          $('#counter_' + i).empty().text(data.length);
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
    log.update(gather_values());
  });

  // Add new library
  $("button[name='b_np_new_lib']").click(function () {
    add_new_input_library(); 
  });

});
