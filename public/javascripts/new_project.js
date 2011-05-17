
var libs = {
  number: 0,
  inc: function() { this.number += 1; return this.number - 1; }
}

var log = {
  update : function(msg) {
    $('#np_log').append(msg + "<br>");
  },
  clear : function() {
    $('#np_log').empty();
  }
}

var gather_values = function() {
  var str = "";
  str += "Project name: [" + $("input[name='np_input_pname']").val() + "]<br>";
  str += "Sample  name: [" + $("input[name='np_input_sname']").val() + "]<br>";
  return str;
}

var add_new_input_library = function() {
  var input_t = '<input name="input_lib_XX" size="30">';
  var class_t = "<div id='div_lib_YY' class='spacer'>XX" +  
                "<button name='del_lib_YY'>delete</button></div>";

  var i     = libs.inc();
  var input = input_t.replace(/XX/g, i);
  var s     = class_t.replace(/XX/g, input).replace(/YY/g, i);
  $('#np_libs').append(s);
  $("button[name='del_lib_" + i + "']").click(function () { 
    $('#div_lib_' + i).remove();
    log.clear(); 
    $("input[name*='input_lib_']").each(function() { 
      log.update($(this).attr("value")); 
    });   
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
