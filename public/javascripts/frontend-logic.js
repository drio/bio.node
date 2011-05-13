$(document).ready(function () {
  $("#loading_image").hide();

  $('input').click(function() {
    $(this).val("");
    $("#amount").empty();
    $("#results").empty();
  });

  $(document).keypress(function(e) {
    switch(e.keyCode) { 
      case 13: // enter
        $('#loading_image').show();
        var lib = $("input").val();
        $.getJSON("bams/" + lib,
        {},
        function(data) {
          $("#results").empty();
          $("#amount").empty();
          var bp = 0; // bad bam paths (not found in filesystem)
          if (data.length !== 0) {
            $.each(data, function(i,value){
              if (value.found) {
                $("#results").append(value.path + "<br>");
              } else {
                bp++;
                $("#results").append("!" + value.path + "<br>");
              }
            });
          } else {
            $("#results").append("No data. <br>");
          } 
          $("#amount").append("[" + data.length + "|" + bp + "]");
          $('#loading_image').hide();
        });
      break;
    }
   });
});
