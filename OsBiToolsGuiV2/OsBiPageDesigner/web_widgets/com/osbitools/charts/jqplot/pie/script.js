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

  wwg.prototype = new osbi.sys_wwg["dual_dim_chart"]();
  
  wwg.prototype.init = function() {
    osbi.sys_wwg["axis_chart"].prototype.init.call(this);
    this.engine = new osbi.chart_engines["jqplot"]();
    
    // Dimensions configuration
    // First dimension has hardcoded variable name "x_axis"
    // Second dimension value name should be same as multi-prop value config
    this.dims = [{label: "LL_TEXT"}, {name: "y_axis"}];
    
    // Optional color set
    this.color_set = "LL_PIE_COLORS";
    
    // Temporarily disable animation
    this.no_animation = true;
  };
  
  wwg.prototype.getWrapperClassName = function() {
    return "pie-chart";
  };

  wwg.prototype.getProps = function(pval) {
    var me = this;
    
    // Call super method
    var props = osbi.sys_wwg[this.sys_name].prototype.getProps.call(this);
    
    // Append column for color set
    props.push(
     
      // Add Y Axis dataset selection
      {
        type: "multi_prop_group",
        name: "y_axis", // Same name as second dimension
        
        params: {
          // Fixed group set
          is_multi: false,
          labels: ["LL_VALUE"],
          
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
    
    // Prepare data array
    this.engine.sdata.push([]);
    for (var i in ds.data)
        this.engine.sdata[0].push([ds.data[i][this.dval.x_axis.idx], 
                                    ds.data[i][this.dval.y_axis.sidx[0]]]);

    $.extend(true, this.engine.opts, {
      seriesDefaults:{
        renderer:$.jqplot.PieRenderer, 
        rendererOptions: {
          padding: 8,
          showDataLabels: this.pval.is_show_point_labels
        }
      }
    });
    
    if (!osbi.is_empty(this.pval.color_set))
      this.engine.opts.seriesDefaults.rendererOptions.
          seriesColors = this.pval.color_set.split(",");
          
    this.engine.display(this);
  };
  
  // Register web widget in global array
  osbi.add_wwg_proto("com.osbitools.charts.jqplot.pie", wwg);
})(jQuery, jOsBiTools);
