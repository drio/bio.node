/* Plotting logic */
var plotting = {
  /* the different plots */
  distribution : function(l, d, e) {
    var r_data = _.reject(d, function(a){ return a[1] < 100000 });
    var data = [ 
      {
        label  : l,
        data   : r_data,
      }
    ];

    var options = {
      grid: { show: true },
      points: { show: true, fill: false },
      lines: { show: false }
      //yaxis  : { min:0, max:5000000},
      //xaxis  : { min:0, max:1000}
      //hooks: { processDatapoints: [ drd_test ] }
      //clickable: true,
      //hoverable: true
    };

    $.plot(e, data, options); 
  },

  stats : function(l, d, e) { 
    var html = '<table id="hor-minimalist-a" summary="bio.node table">';
    html += '<thead> <tr> <th scope="col">key</th> <th scope="col">value</th> </tr> </thead>';
    html += '<tbody>';

    e.empty();  
    _.each(d, function(val, prop){ 
      html += "<tr><td>" + prop + "</td><td>" + val + "</td><tr>";
    });
    html += "</tbody></table>";
    e.append(html);
  },

  /* 
   * Define here the aliases for the main methods 
   * plot name, data (array of arrays), dom element where to plot
   */
  run : function(p, data, plot_here) {
    this.stats_snps    = this.stats;
    this.stats_mapping = this.stats;

    this.dist_mapq     = this.distribution;
    this.dist_isize    = this.distribution;
    this.dist_coverage = this.distribution;

    if (this.hasOwnProperty(p)) this[p](p, data, plot_here);  
    else {
      plot_here.empty(); 
      plot_here.append(">> Sorry, I cannot plot (" + p + ")");
    }
  }
}

/*
 * Main
 */
$(document).ready(function () {
  $("#plots_area").append("Loading data ...");

  /* Load a ol-list with the properties of the object we pass */
  var load_in_list = function(json_data, element) {
    element.empty();
    for(var prop in json_data) {
      if(json_data.hasOwnProperty(prop))
        element.append("<li class='ui-widget-content'>" + prop + "</li>");
    }
  }

  var all_json_data = {};
  var what_select = {
    prj   : null,
   sample: null
  };
  //$("#loading_image").hide();
 
  // load selectable from jquery-ui
	$(function() {
		$("#sel_project").selectable();
		$("#sel_sample").selectable();
		$("#sel_plot").selectable();
    //$("#sel_project").append("<li class='ui-widget-content'>PRJ 1</li>");
	});

  /* Get all the json data, and load the projects */
  $.getJSON("all_json_data",
    {},
    function(data) {
      load_in_list(data, $("#sel_project"));
      all_json_data = data;
      $("#plots_area").empty();
      //$("body").append("<pre>" + data.playground.test_pipe.map_stats.raw_reads + "</pre>");
  });

  /* When clicking on project, load all the samples */
  $("#sel_project").bind("selectableselected", function(event, ui) {
    var selected_project = $('.ui-selected', this).text();
    what_select.prj = selected_project;
    load_in_list(all_json_data[selected_project], $("#sel_sample"));
  });

  /* When clicking on project, load all the samples */
  $("#sel_sample").bind("selectableselected", function(event, ui) {
    var selected_sample = $('.ui-selected', this).text();
    what_select.sample = selected_sample;
    load_in_list(all_json_data[what_select.prj][selected_sample], $("#sel_plot"));
  });

  /* When clicking on plot, display it */
  $("#sel_plot").bind("selectableselected", function(event, ui) {
    var selected_plot = $('.ui-selected', this).text();
    var json_data = all_json_data[what_select.prj][what_select.sample][selected_plot];
    plotting.run(selected_plot, json_data, $("#plots_area"));
    /*
    $("#plots_area").empty();
    $("#plots_area").append(">> " + selected_plot + "<br>"); 
    $("#plots_area").append(JSON.stringify(json_data));
    */
  });


  /*
  var data = [[1, 1], [2, 2], [3, 3], [4, 1], [10, 20], [100, 1]];
  var r_data = _.reject( data, function(a){ return a[0] > 5 || a[1] > 5 });
  var f = [
    {
      label: "scatter plot",
      data: r_data
    }
    ,
    {
      label: "bars plot",
      data: [[0, 3], [4, 8], [1, 3], [5, 2], [2, 2], [7, 2], [8, 5], [9, 13]],
      bars: { show: true }
    },
  ];

  var options = {
    grid: { show: true },
    points: { show: true, fill: false },
    lines: { show: false },
    //yaxis  : { min:0, max:5},
    //xaxis  : { min:0, max:5}
    //hooks: { processDatapoints: [ drd_test ] }
    //clickable: true,
    //hoverable: true
  };

  $.plot($("#plots_area"), f, options);
  */  
});
