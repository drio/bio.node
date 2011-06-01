$(document).ready(function () {
  //$("#loading_image").hide();

  $("body").append("XXXXXX.");

  $.getJSON("all_json_data",
    {},
    function(data) {
      $("body").append("great stuff <br>");
      $("body").append("<pre>" + data.playground.test_pipe.map_stats.raw_reads + "</pre>");
  });
});

