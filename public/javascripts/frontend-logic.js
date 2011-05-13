$(document).ready(function () {
  $("#loading_image").hide();

  /*
  $("#hidr").click(function () {
    $("#loading_image").hide();
  });

  $("#showr").click(function () {
    $("#loading_image").show();
  });
  */

  $(document).keypress(function(e) {
    switch(e.keyCode) { 
      case 13: // enter
        $('#loading_image').show();
        var lib = $("input").val();
        $.getJSON("bams/" + lib,
        {},
        function(data) {
          $("#results").empty();
          if (data.length !== 0) {
            $.each(data, function(i,value){
              $("#results").append(value.path + "<br>");
            });
          } else {
            $("#results").append("No data. <br>");
          } 
          $('#loading_image').hide();
        });
      break;
    }
   });
});
