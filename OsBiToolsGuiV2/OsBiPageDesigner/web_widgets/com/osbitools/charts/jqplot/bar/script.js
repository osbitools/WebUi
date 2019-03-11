/*
 * Open Source Business Intelligence Tools - http://www.osbitools.com/
 * 
 * Copyright 2014-2016 IvaLab Inc. and by respective contributors (see below).
 *
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 * Date: 2015-06-15
 *
 * Contributors:
 *
 */

"use strict";

(function($, osbi) {

  var wwg = (new Function);

  wwg.prototype = new osbi.sys_wwg["series_axis_chart"]();

  wwg.prototype.init = function() {
    osbi.sys_wwg[this.sys_name].prototype.init.call(this);
    this.engine = new osbi.chart_engines["jqplot"]();
    
    this.no_highlighter = true;
  };
  
  wwg.prototype.getProps = function() {
    var me = this;
    
    // Call super method
    var props = osbi.sys_wwg[this.sys_name].
                            prototype.getProps.call(this);
    
    props.push(
      // Optional flag for stack series
      {
        type: "check_box",
        name: "is_stack_series",
        label: "LL_STACK_SERIES",
          
        params: {
          def_value: false
        }
      },
      
      // Optional color set
      {
        type: "text",
        name: "series_colors",
        label: "LL_BAR_COLORS",
        params: {
          filter: COLORS_FILTER,
        }
      }
    );
    
    return props;
  };

  /**
   * Visualize chart
   *
   * @param {Object} ds JSON array as 'columns:[], data:[[]]'
   */
  wwg.prototype.show = function(ds) {
    // General validation - check if all data available
    if (!this.canShow(ds))
      return;
    
    this.engine = new osbi.chart_engines["jqplot"]();
    this.engine.prepOpts(this);

    // Extract column name for each Y axis in each series
    for (var i in this.pval.series)
     this.engine.sdata.push([]);
    
    // Prepare tick array & data array
    var ticks = [];
    for (var i in ds.data) {
      ticks.push(ds.data[i][this.dval.x_axis.idx]);
      
      for (var j in this.dval.series.sidx)
        this.engine.sdata[j].push(ds.data[i][this.dval.series.sidx[j]]);
    }

    $.extend(true, this.engine.opts, {
      stackSeries: osbi.get_bool_val(this.pval.is_stack_series),
      seriesDefaults : {
        renderer : $.jqplot.BarRenderer,
        rendererOptions: {
          // Set varyBarColor to tru to use custom colors on the bars.
          varyBarColor: !osbi.is_empty(this.pval.series_colors)
        }
      },
      
      series: this.series,
      
      axes : {
        xaxis : {
          renderer : $.jqplot.CategoryAxisRenderer,
          ticks : ticks
        }
      }
    });
    
    this.engine.display(this);
  };

  // Register web widget in global array
  osbi.add_wwg_proto("com.osbitools.charts.jqplot.bar", wwg);
})(jQuery, jOsBiTools);
