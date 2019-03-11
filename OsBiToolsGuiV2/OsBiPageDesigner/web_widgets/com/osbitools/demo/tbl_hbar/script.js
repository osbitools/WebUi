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
    osbi.sys_wwg[this.sys_name].prototype.init.call(this);
    
    // Disable legend & animation for now
    this.no_legend = true;
    
    this.dims = [{label: "LL_TEXT"}, {name: "y_axis"}];
  };
  
  /**
   * Provide set of web widget properties that available 
   * for change in Page Designer
   */
  wwg.prototype.getProps = function() {
    var me = this;
    
    // Call super method
    var props = osbi.sys_wwg[this.sys_name].prototype.getProps.call(this);
    
    props.push(
      {
        type: "check_box",
        name: "is_show_summary",
        label: "LL_SHOW_SUMMARY_ROW",
          
        params: {
          def_value: false 
        }
      },
      
      // Optional Y-Axes formatting
      {
        type: "text",
        name: "y_axis_fmt",
        label: "LL_VALUE_FORMAT"
      },
      
      // Optional Y-axis title
      {
        type: "select",
        name: "x_axis_title",
        label: "LL_VALUE_LABEL",
        
        params: {
          def_value: "",
          list: [],
          empty_entry: "LL_SELECT",
          dlink: "ll_link",
        }
      },
      
      // Add Y Axis dataset selection
      {
        type: "multi_prop_group",
        name: "y_axis",
        
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
   * Empty web widget body
   * 
   */
  wwg.prototype.empty = function() {
    $("tbody.tbl-hbars", this.body_ctx).empty();
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
   
    // Show bar values flag
    var fbval = this.pval.is_show_point_labels === undefined || 
                             osbi.get_bool_val(this.pval.is_show_point_labels);
                                    
    var tbars = $("tbody.tbl-hbars", this.body_ctx);
    var fanim = osbi.get_bool_val(this.pval.is_animate);
      
    var rows = "";
    
    // Get all data first to find max value. MAx value will be used 
    // later to calculate percentage of bar filled
    var mval = 0, sum = 0;
    for (var i in ds.data) {
      // Only using first series configuration
      var value = ds.data[i][this.dval.y_axis.sidx[0]];
      mval = Math.max(mval, value);
      if (this.pval.is_show_summary)
        sum += value;
    }
    
    // Y-Axis formatting flag
    var yfmt = !osbi.is_empty(this.pval.y_axis_fmt);
    
    // Array of cell width used for animation
    var wlst = [];
    
    for (var i = 0; i < ds.data.length; i++) {
      var value = ds.data[i][this.dval.y_axis.sidx[0]];
      var pval;
      if (typeof value == "number")
        pval = (value/mval * 100).toFixed(2);
      
      wlst[i] = pval;
      
      // Get color from default set
      var bcolor = (i < osbi.dcolors.length) ? osbi.dcolors[i] : "#000000";
      rows += '<tr class="' + (i%2 == 0 ? "even" : "odd") + '">' +
        '<th>' + ds.data[i][this.dval.x_axis.idx] + '</th>' +
        
        '<td class="hbar">' + (pval !== undefined ? 
            '<div class="hbar-wrapper"><table class="hbar-wrapper"><tr>' +
              '<td class="color-hbar" style="width: ' + (fanim ? 1 : pval) + 
                '%; background-color:' + bcolor + 
                  '"' + (!fbval ? ' title="' + pval + '"' : '') + '>' + 
                    '</td><td style="width: ' + (100 - pval) + 
                      '%"></tr></table></div>' : "") + 
        '</td>' +
          
        // Only using first series configuration
        (fbval ? '<td class="hbar-value"><div' + 
          (fanim ? ' class="hidden"' : "") + '>' + 
            (yfmt ? osbi.sprintf(this.pval.y_axis_fmt, value) : value) +
              '</div></td>' : "") +
        
      '</tr>';
    }
    
    if (osbi.get_bool_val(this.pval.is_show_summary))
      rows += '<tr class="summary">' +
        '<td class="ll-summary" colspan="' + (fbval ? 2 : 1) + '">' +
          osbi.t("LL_SUMMARY") + 
            (!osbi.is_empty(this.pval.x_axis_title) ? 
              "&nbsp;" + osbi.t(this.pval.x_axis_title) : "") +
        '</td>' +
        '<td class="value"><div' + (fanim ? ' class="hidden"' : "") + '>' + 
          (yfmt ? osbi.sprintf(this.pval.y_axis_fmt, sum) : sum) +
            '</div></td>' +
      '</tr>';
      
    tbars.html(rows);
    
    if (fanim) {
      $("td.color-hbar", tbars).each(function(idx) {
        $(this).animate({width: wlst[idx] + "%"}, "slow");
      });
      
      $("tr.summary td.value>div,td.hbar-value>div", tbars).toggle("slow");
    }
  };
  
  // Register web widget in global array
  osbi.add_wwg_proto("com.osbitools.demo.tbl_hbar", wwg);
})(jQuery, jOsBiTools);
