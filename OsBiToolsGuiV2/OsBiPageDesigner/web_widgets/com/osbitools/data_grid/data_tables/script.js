/*
 * Open Source Business Intelligence Tools - http://www.osbitools.com/
 * 
 * Copyright 2014-2016 IvaLab Inc. and by respective contributors (see below).
 * 
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 * Date: 2016-02-19
 * 
 * Contributors:
 * 
 */

"use strict";

(function($, osbi) {
  var wwg = (new Function);
  
  wwg.prototype = new osbi.sys_wwg["chart"]();

  wwg.prototype.init = function() {
    // Call ancestor init
    osbi.sys_wwg[this.sys_name].prototype.init.call(this);
    this.engine = new osbi.chart_engines["data_tables"]();
    
    // Temporarily disable export to android
    this.no_export_android = true;
  };

  wwg.prototype.getProps = function() {
    var me = this;
    
    // Call super method
    var props = osbi.sys_wwg[this.sys_name].
                            prototype.getProps.call(this);
    
    props.push(
      // Optional "Show Point Labels" checkbox
      {
        type: "check_box",
        name: "is_length_change",
        label: "LL_SHOW_ROW_LENGTH",
          
        params: {
          def_value: false          
        }
      },
      
      // Optional "Rows per Page" input
      {
        type: "number",
        name: "page_length",
        label: "LL_ROWS_PER_PAGE",
          
        params: {
          def_value: 10          
        }
      },
      
      // Optional list of excluded columns
      // TODO Add interface for drag & drop
      {
        type: "text",
        name: "excl_columns",
        label: "LL_EXCLUDE_COLUMNS",
        params: {
          filter: ID_LIST_FILTER,
        }
      }
    );
    
    return props;
  };
      
  /**
   * Visualize data table
   *
   * @param {Object} ds JSON array as 'columns:[], data:[[]]'
   */
  wwg.prototype.show = function(ds) {
    this.engine = new osbi.chart_engines["data_tables"]();
    
    // Split data from columns
    var columns = [];
    
    // Check if any column(s) needs to be excluded
    var lexcl;
    var lidx = [];
    var fexcl = !osbi.is_empty(this.pval.excl_columns);
    if (fexcl)
      lexcl = this.pval.excl_columns.split(",");
      
    // Translate columns
    for (var i in ds.columns) {
      var col_name = ds.columns[i].name.toUpperCase();
      if (!(fexcl && $.inArray(col_name, lexcl) >= 0))
        columns.push({title: osbi.t("LX_" + col_name)});
      else
        lidx.push(i);
    }
    
    // Prepare 2 dimensional array for view
    var sdata = [];
    if (fexcl) {
      // Filter data as well
      for (var i in ds.data) {
        var data = [];
        for (var j in ds.columns)
          if ($.inArray(j, lidx) == -1)
            data.push(ds.data[i][j]);
        sdata.push(data);
      }
    } else {
      sdata = ds.data;
    }
    
    // Check if title required
    var title = this.pval.title;
    if (!osbi.is_empty(title))
      this.body_ctx.append('<div class="title">' + osbi.t(title) + '</div>');
      
    // Show table
    var dt = $(document.createElement("table")).addClass("display");
    
    this.body_ctx.append(dt);
    
    var opts = {
      data: sdata,
      columns: columns,
      lengthChange: osbi.get_bool_val(this.pval.is_length_change)
    };
    
    if (!osbi.is_empty(this.pval.page_length))
      opts.pageLength = this.pval.page_length;
    
    dt.DataTable(opts);
  };

  // Register web widget in global array
  osbi.add_wwg_proto("com.osbitools.data_grid.data_tables", wwg);
})(jQuery, jOsBiTools);
