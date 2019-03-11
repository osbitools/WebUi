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
    
    // X axes is mandatory with optional formatting & title
    /*
    this.axes = {
      x: {
        has_fmt: true,
        has_title: true,
        is_required: true
      }
    };
    */
  };
  
  wwg.prototype.getProps = function() {
    var me = this;
    
    // Call super method
    var props = osbi.sys_wwg[this.sys_name].prototype.getProps.call(this);
    
    props.push(
      // Optional smoothing
      {
        type: "check_box",
        name: "is_smooth",
        label: "LL_SMOOTH",
          
        params: {
          def_value: false
        }
      },
      
      // Enforce Min/Max
      {
        type: "check_box",
        name: "x_axis_is_enforce_mm",
        label: "LL_ENFORCE_MM",
        tab: "x_axis",
          
        params: {
          def_value: false
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
    // Check if all data available
    if (!this.canShow(ds))
      return;

    this.engine.prepOpts(this);
    
    var x_idx;
    var x_col = this.pval.x_axis;
    
    if (!osbi.is_empty(x_col)) {
      x_idx = this.col_idx[x_col];
      
      if (this.dval.fdate) {
        // this.engine.opts.axes.xaxis["renderer"] = $.jqplot.DateAxisRenderer;
        
        /*
        this.engine.opts["highlighter"] = {
          // show: true,
          sizeAdjust: 7.5
        };
        */
        
        if (this.engine.opts.highlighter.show)
          /// TODO Check ??
          this.engine.opts.highlighter.sizeAdjust = 7.5;
          
        if (this.pval.x_axis_is_enforce_mm) {
          this.engine.opts.axes.xaxis.pad = 1.0;
          
          // Tried figured out which is min and which is max
          var min = new $.jsDate(ds.data[0][0]).getTime();
          var max = new $.jsDate(ds.data[ds.data.length - 1][0]).getTime();
          
          this.engine.opts.axes.xaxis.min = (min < max) ? min : max;
          this.engine.opts.axes.xaxis.max = (max > min) ? max : min;
        } 
      }
    }
    
    // Extract column name for each Y axis in each series
    for (var i in this.pval.series)     
     this.engine.sdata.push([]);
    
    for (var i in ds.data) {
      for (var j in this.dval.series.sidx) {
        var value = ds.data[i][this.dval.series.sidx[j]];
        this.engine.sdata[j].push((this.dval.fdate ? 
                    [ds.data[i][x_idx], value]: value));
      }
    }
    
    $.extend(true, this.engine.opts, {
      // series: this.series,
      
      axesDefaults: {
        labelRenderer: $.jqplot.CanvasAxisLabelRenderer
      },
      
      seriesDefaults: {
          rendererOptions: {
              smooth: osbi.get_bool_val(this.pval.is_smooth)
          }
      },
    });
    
    this.engine.display(this);
  };
  
  // Register web widget in global array
  osbi.add_wwg_proto("com.osbitools.charts.jqplot.line", wwg);
})(jQuery, jOsBiTools);
