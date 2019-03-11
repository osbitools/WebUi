/*
 * Open Source Business Intelligence Tools - http://www.osbitools.com/
 * 
 * Copyright 2014-2016 IvaLab Inc. and by respective contributors (see below).
 *
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 * Date: 2016-03-22
 *
 * Contributors:
 *
 */

"use strict";

(function($, osbi) {

  var wwg = (new Function);

  wwg.prototype = new osbi.sys_wwg["axis_chart"]();

  wwg.prototype.init = function() {
    osbi.sys_wwg[this.sys_name].prototype.init.call(this);
    this.engine = new osbi.chart_engines["jqplot"]();
    
    // Disable legend
    this.no_legend = true;
    
    // Temporarily disable export to android
    this.no_export_android = true;
  };
  
  wwg.prototype.getProps = function() {
    var me = this;
    
    // Call super method
    var props = osbi.sys_wwg[this.sys_name].prototype.getProps.call(this);
    
    props.push(
     
      // Add OHLC table
      {
        type: "multi_prop_group",
        name: "y_axis",
        
        params: {
          // Fixed group set
          is_multi: false,
          labels: ["LL_OHLC_OPEN", "LL_OHLC_HIGH",
                            "LL_OHLC_LOW", "LL_OHLC_CLOSE"],
          
          // Property group to clone in each series
          prop_group: [
            // Mandatory Y-Axes column
            {
              type: "select",
              name: "y_axis",
              label: "LL_DATASET_COLUMN",
              
              params: {
                def_value: "",
                list: [],
                empty_entry: "LL_SELECT",
                del_empty_on_sel: true,
                dlink: "ds_link",
                is_required: true
              }
            }
          ]
        }
      },
      
      // Optional color set
      {
        type: "color",
        name: "candle_color",
        label: "LL_CANDLE_COLOR",
        params: {
          def_value: osbi.dcolors[0]
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
    
    // Check type of x column
    this.engine.sdata = [];
    this.engine = new osbi.chart_engines["jqplot"]();
    
    this.engine.prepOpts(this);

    if (this.engine.opts.highlighter.show) {
      this.engine.opts.highlighter.yvalues = 4;
      this.engine.opts.highlighter.tooltipAxes = 'xy';
      this.engine.opts.highlighter.formatString = 
        '<table class="jqplot-highlighter"> \
          <tr><td>' + osbi.t("LL_DATE") + ':</td><td>%s</td></tr> \
          <tr><td>' + osbi.t("LL_OHLC_OPEN") + ':</td><td>%0.2f</td></tr> \
          <tr><td>' + osbi.t("LL_OHLC_HIGH") + ':</td><td>%0.2f</td></tr> \
          <tr><td>' + osbi.t("LL_OHLC_LOW") + ':</td><td>%0.2f</td></tr> \
          <tr><td>' + osbi.t("LL_OHLC_CLOSE") + 
                                ':</td><td>%0.2f</td></tr></table>';
    };
        
    // Populate dataset
    for (var i = 0; i < ds.data.length; i++) {
      var sdata = [this.dval.fdate ? ds.data[i][this.dval.x_axis.idx] : i];
      
      for (var j in this.dval.y_axis.sidx)
        sdata.push(ds.data[i][this.dval.y_axis.sidx[j]]);
        
      this.engine.sdata.push(sdata);
    }
    
    $.extend(true, this.engine.opts, {
      axes: {
        yaxis: {
            tickOptions:{ prefix: '$' }
        }
      },
      series: [
        {
          color: this.pval.candle_color,
          renderer:$.jqplot.OHLCRenderer, 
          rendererOptions:{
            candleStick:true
          }
        }],
    });
    
    if (!this.dval.fdate) {
      // Prepare tick array & data array for non-date X axis
      var ticks = [];
      for (var i in ds.data)
        ticks.push(ds.data[i][this.dval.x_axis.idx]);
        
      // Add ticks for non-date X axis
      this.engine.opts.axes.xaxis.ticks = ticks;
    }      
              
    this.engine.sdata = [this.engine.sdata];
    this.engine.display(this);
  };

  // Register web widget in global array
  osbi.add_wwg_proto("com.osbitools.charts.jqplot.ohlc", wwg);
})(jQuery, jOsBiTools);
