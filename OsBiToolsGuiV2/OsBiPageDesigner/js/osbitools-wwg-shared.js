/*
 * Open Source Business Intelligence Tools - http://www.osbitools.com/
 * 
 * Copyright 2014-2016 IvaLab Inc. and by respective contributors (see below).
 * 
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 * Date: 2015-07-30
 * 
 * Contributors:
 * 
 */

"use strict";

// Shared OsBiTools Web Widget modules
(function($, osbi) {

  // Resource root directory
  osbi.rdir = "";
      
  // Using jqPlot default colors
  osbi.dcolors = [ "#4bb2c5", "#EAA228", "#c5b47f", "#579575", "#839557", 
      "#958c12", "#953579", "#4b5de4", "#d8b83f", "#ff5800", "#0085cc", 
      "#c747a3", "#cddf54", "#FBD178", "#26B4E3", "#bd70c7"];

  // Custom web widget list
  osbi.wwg_list = {};
  
  // System list
  osbi.sys_wwg = {};
  
  // List of chart engines
  osbi.chart_engines = {};
  
  osbi.register_wwg = function(name) {
    this.wwg_list[name] = {};
  };
  
  osbi.add_wwg_proto = function(name, proto) {
    this.wwg_list[name]["proto"] = proto;
  };
  
  osbi.make_wwg = function(name, wp) {
    var wwg = new this.wwg_list[name]["proto"]();

    // Set parent Web Page
    wwg.wp = wp;
    
    // Assign registered name
    wwg.name = name;
    
    // Create class name for future use
    wwg.cname = name.replace(/\./g, "-");
    
    // Call init method for any internal custom initialization task(s)
    wwg.init();
    
    return wwg;
  };

  /**
   * Get Data Set from external resource. Used in html or js_embedded preview.
   * Short copy of _ajax function
   * 
   * @param {String}
   *            url base url of osbiws core web service
   * @param {String}
   *            map name of dataset map
   * @param {Function}
   *            on_success ajax success handler
   * @param {Object}
   *            on_errors set of errors handlers as next: on_empty - function
   *            to process empty data on_data_error - function to process data
   *            error on ajax_error - funtion to process ajax error request
   * @param {Object}
   *            params set of parameter to attach to ajax request
   * 
   */
  osbi.get_ds = function(ds_host, map, on_success, on_errors, params) {
    var req = this.get_ds_req(map, ds_host);
    
    var adata = {
      url : this.get_url(req),
      success : function(data) {
        // Empty result is always error
        if (data == undefined || data == null || data == "") {
          if (on_errors !== undefined
              && typeof on_errors.on_empty == "function")
            on_errors.on_empty();
        } else if (data.error !== undefined) {
          if (on_errors !== undefined
              && typeof on_errors.on_data_error == "function")
            on_errors.on_data_error(data.error);
        } else {
          if (typeof on_success == "function")
            on_success(data);
        }
        
        // Call calback function on wwg load end
        if (typeof params.on_load == "function")
            params.on_load();
      },
      error : function(jqXHR, msg, error) {
        if (on_errors !== undefined
            && typeof on_errors.on_ajax_error == "function")
          on_errors.on_ajax_error(jqXHR, msg, error);
          
        // Call calback function on wwg load end
        if (params.on_load == "function")
            params.on_load();
      }
    };

    var rdata = jOsBiTools.get_data(req, "get");  
    if (!jOsBiTools.is_empty(rdata))
      adata.data = rdata;
    
    // Call B4 AJAX hook
    jOsBiTools.b4_ajax(adata);
        
    $.ajax(adata);
  };
  
  osbi.get_app_ds_req = function(name) {
    return this.get_ds_req(name, WEB_APP.base.config.ds_item.url);
  };

  /**
   * Get DataSet Request object
   * Language parameter is always included.
   * 
   * @param name Map Name
   * @param ds_host URL for DataSet host
   */  
  osbi.get_ds_req = function(name, ds_host) {
    return (ds_host == "")
      // Internal
      ? this.make_rel_req_ex("ds", name, {lang: this.lang})
      // External
      : this.make_abs_req(ds_host + "ds/" + name + "?lang=" + this.lang);
  };
  
  /**************************************************/
  /***********          WebWidget         ***********/
  /**************************************************/
  
  function WebWidget() {
    this.sys_name = "base";
  }
  
  /**
   * Init internal web widget variables
   * 
   */
  WebWidget.prototype.init = function() {};
  
  /**
   * Set property property values
   * 
   * @param {Object} pval Array with property values
   * 
   */
  WebWidget.prototype.set_pval = function(pval) {
    this.pval = pval;
    
    if (this.body_ctx !== undefined) {
      // Set body size
     if (!osbi.is_empty(pval.size_width) && !isNaN(pval.size_width))
       this.body_ctx.css("width", pval.size_width);
       
     if (!osbi.is_empty(pval.size_height) && !isNaN(pval.size_height))
       this.body_ctx.css("height", pval.size_height);
       
     if (!osbi.is_empty(pval.rpad) && !isNaN(pval.rpad))
       this.body_ctx.css("padding-right", pval.rpad + "em");
    }
  };
    
  /**
   * Translate and format error for label id and inject into widget body
   * 
   * @param {String} lbl_id Label Id
   * 
   */
  WebWidget.prototype.error = function(lbl_id, params) {
    var msg = osbi.t(lbl_id);
    
    if (typeof params == "object")
      for (var idx in params)
        msg = msg.replace("[" + idx + "]", params[idx]);
        
    this.show_error(msg);
  };
  
  /**
   * Translate and format error for label id and inject into widget body
   * 
   * @param {String} lbl_id Label Id
   * 
   */
  WebWidget.prototype.show_error = function(msg) {
    this.body_ctx.html('<table class="wwg-error-wrapper"><tr>' +
      '<td><span class="wwg-error">' + msg + '</span></td></tr><table>');
  };
  
  /**
   * Empty web widget body
   * 
   */
  WebWidget.prototype.empty = function() {
    this.body_ctx.empty();
  };
  
  osbi.sys_wwg["base"] = WebWidget;
  
  /**************************************************/
  /***********      DataSetWebWidget      ***********/
  /**************************************************/
  
  function DataSetWebWidget() {
    this.nname = "ds";
    this.sys_name = "data_set";
  }
  
  DataSetWebWidget.prototype = new WebWidget();

  /**
   * Check if all parameters set to show wwg
   */
  DataSetWebWidget.prototype.canShow = function(ds) {
    // Index columns
    this.col_idx = {};

    for (var i in ds.columns)
      this.col_idx[ds.columns[i].name] = i;
      
    return true;
  };
  
  osbi.sys_wwg["data_set"] = DataSetWebWidget;
  
  /**************************************************/
  /***********       ChartWebWidget       ***********/
  /**************************************************/
  
  /**
   * Base class for all dat visualization component, including data grid
   */
  function ChartWebWidget() {
    // Category Name
    this.nname = "chart";
    
    // System group
    this.sys_name = "chart";
  }
  
  ChartWebWidget.prototype = new DataSetWebWidget();
  
  /**
   * Check if all parameters set to show wwg
   */
  ChartWebWidget.prototype.canShow = function(ds) {
    return DataSetWebWidget.prototype.canShow.call(this, ds);
  };
  
  osbi.sys_wwg["chart"] = ChartWebWidget;

  /**************************************************/
  /*******       DualDimChartWebWidget        *******/
  /**************************************************/
  
  /**
   * Base class for 2 dimensional charts
   */
  function DualDimChartWebWidget() {
    this.sys_name = "dual_dim_chart";
    
    // Expecting second dimension in yaxis parameter (multi-prop based variable)
    this.mprop_var = "yaxis";
  }
  
  DualDimChartWebWidget.prototype = new ChartWebWidget();
  
  /**
   * Check if all parameters set to show wwg
   */
  DualDimChartWebWidget.prototype.canShow = function(ds) {
    if (!ChartWebWidget.prototype.canShow.call(this, ds))
      return false;
    
    // Check mandatory first dimension "x_axis"
    
    // Extract column name for x axis
    var column = this.pval.x_axis;
    if (column === undefined) {
      this.error("LL_ERROR_X_AXIS_COLUMN_IS_NOT_SET");
      return false;
    }
    
    // Get column index
    var idx = this.col_idx[column];
    if (idx === undefined) {
      this.error("LL_ERROR_X_AXIS_COLUMN_NO_DATA", {column: column});
      return;
    }
    
    this.dval = {
      x_axis: {
        idx: idx,
        column: column
      }
    };
    
    // If X Axis is set check if column type is date
    var jtype = ds.columns[idx].java_type;
    this.dval.fdate = jtype.indexOf("Date") == jtype.length - 4;
    
    // Check second dimension 
    var sdim = this.dims[1].name;
    
    // Check if second dimension parameter is defined
    if (this.pval[sdim] === undefined) {
      this.error("LL_ERROR_MULTI_PROP_CONFIGURATION_NOT_SET", {name: sdim});
      return false;
    }
    
    this.dval[sdim] = {
      sidx: [],
      slink: []
    };
    
    for (var i in this.pval[sdim]) {
      var sval = this.pval[sdim][i];
      // y_axis is mandatory in series
      var y_col = sval.y_axis;
      
      if (y_col === undefined) {
        this.error("LL_ERROR_SERIES_Y_AXIS_COLUMN_IS_NOT_SET",
                                                {series: (Number(i) + 1)});
        return false;
      }

      var y_idx = this.col_idx[y_col];
      if (y_idx === undefined) {
        this.error("LL_ERROR_SERIES_Y_AXIS_COLUMN_NO_DATA", 
                                    {column: y_col, series: (Number(i) + 1)});
        return false;
      }
      
      this.dval[sdim].sidx.push(y_idx);
      
      this.procDimConfig(sdim, sval);
    }

    return true;
  };
  
  /**
   * Process dimensional configuration
   */
  DualDimChartWebWidget.prototype.procDimConfig = function(sdim, sval) {};
  
  osbi.sys_wwg["dual_dim_chart"] = DualDimChartWebWidget;
  
  /**************************************************/
  /***********     AxisChartWebWidget     ***********/
  /**************************************************/
  
  /**
   * Base class for 2 dimensional charts with both X and Y axis shown
   */
  function AxisChartWebWidget() {
    this.sys_name = "axis_chart";
    
    // Dimensions configuration
    // First dimension has hardcoded variable name "x_axis"
    // Second dimension value name should be same as multi-prop value config
    if (this.dims === undefined)
      this.dims = [{
          fmt: "LL_FORMAT",
          title: "LL_LABEL",
          label: "LL_XAXIS",
          angle: "LL_LABEL_ANGLE"
        },
        {
          name: "y_axis",
          fmt: "LL_FORMAT",
          title: "LL_LABEL"
        }
      ];        
  }
  
  AxisChartWebWidget.prototype = new DualDimChartWebWidget();
  
  AxisChartWebWidget.prototype.canShow = function(ds) {
    return DualDimChartWebWidget.prototype.canShow.call(this, ds);
  };
  
  osbi.sys_wwg["axis_chart"] = AxisChartWebWidget;
  
  /**************************************************/
  /***********  SeriesAxisChartWebWidget  ***********/
  /**************************************************/
  
  function SeriesAxisChartWebWidget() {
    this.sys_name = "series_axis_chart";
    
    // Dimensions configuration
    // First dimension has hardcoded variable name "x_axis"
    // Second dimension value name should be same as multi-prop value config
    this.dims[1].name = "series";
  }
  
  SeriesAxisChartWebWidget.prototype = new AxisChartWebWidget();
  
  /**
   * Process dimensional configuration
   */
  SeriesAxisChartWebWidget.prototype.procDimConfig = function(sdim, sval) {
    var slink = {
      label: osbi.t(sval.label)
    };
    
    if (!osbi.is_empty(sval.color))
      slink["color"] = sval.color;
      
    this.dval[sdim].slink.push(slink);
  };
  
  osbi.sys_wwg["series_axis_chart"] = SeriesAxisChartWebWidget;
  
  /**************************************************/
  /***********     ContainerWebWidget     ***********/
  /**************************************************/
    
  function ContainerWebWidget() {
    // Default values for containers with header and/or title
    
    this.def = {
      "header": {
        "title": "LL_TITLE",
        "icon": "gear.png"
      }
    };
    
    if (this.hasHeaderIcon() || this.hasHeaderTitle())
      this.header = {};
      
    // Category Name
    this.nname = "container";
    
    // System Name
    this.sys_name = "container";
  }
  
  ContainerWebWidget.prototype = new WebWidget();
  
  ContainerWebWidget.prototype.isContainer = function() {
    return true;
  };
  
  ContainerWebWidget.prototype.hasHeaderIcon = function() {
    return true;
  };
  
  ContainerWebWidget.prototype.hasHeaderTitle = function() {
    return true;
  };
  
  ContainerWebWidget.prototype.show = function() {
    if (this.hasHeaderIcon() && this.pval.header_icon !== undefined)
      $(".title:first .timg:first", this.container).
        attr("src", osbi.rdir + "images/" + this.pval.header_icon);
      
    if (this.hasHeaderTitle() && this.pval.header_title !== undefined)
      $("span.ttext", this.container).html(osbi.t(this.pval.header_title));
  };
  
  osbi.sys_wwg["container"] = ContainerWebWidget;

  /**************************************************/
  /***********      ControlWebWidget      ***********/
  /**************************************************/
    
  function ControlWebWidget() {
        // Category Name
    this.nname = "control";
    
    // System Name
    this.sys_name = "control";
  }
  
  ControlWebWidget.prototype = new WebWidget();
  
  osbi.sys_wwg["control"] = ControlWebWidget;

  /**************************************************/
  /***********        jqPlot Engine       ***********/
  /**************************************************/
    
  function jqPlotChartEngine() {
    this.name = "jqplot";
  }
  
  /**
   * Prepare options set skeleton
   */
  jqPlotChartEngine.prototype.prepOpts = function(wwg) {
    this.sdata = [];
    
    this.opts = {
      animate : osbi.get_bool_val(wwg.pval.is_animate),
      
      seriesDefaults : {
        pointLabels : {
          show : osbi.get_bool_val(wwg.pval.is_show_point_labels)
        }
      },
      
      axes: {
          xaxis: {
            tickOptions: {}
          },
          yaxis: {
            tickOptions: {}
          }
      },
      
      highlighter : {
        show : !osbi.get_bool_val(wwg.no_highlighter) &&
                  osbi.get_bool_val(wwg.pval.highlighter_enabled)
      },
      
      // Disable shadow grid and borders but leave grid lines
      grid: {
        drawBorder: false, 
        // drawGridlines: false,
        background: '#ffffff',
        shadow:false
      }
    };
    
    if (this.opts.highlighter.show &&
            !osbi.is_empty(wwg.pval.highlighter_text))
      this.opts.highlighter.formatString = wwg.pval.highlighter_text;
    
    if (wwg.dval.fdate)
        this.opts.axes.xaxis.renderer = $.jqplot.DateAxisRenderer;
        
    var axes = ["x", "y"];
    for (var i in axes) {
      var axis = axes[i];
      var axop = this.opts.axes[axis + "axis"];
      
      // Axis formatting
      if (!osbi.is_empty(wwg.pval[axis + "_axis_fmt"]))
        axop.tickOptions.
                    formatString = wwg.pval[axis + "_axis_fmt"];
       
      // Axis label
      if (!osbi.is_empty(wwg.pval[axis + "_axis_label"])) {
        axop.label = osbi.t(wwg.pval[axis + "_axis_label"]);
        axop.labelRenderer = $.jqplot.CanvasAxisLabelRenderer;
      }
      
      // Axis label angle
      if (!osbi.is_empty(wwg.pval[axis + "_axis_lbl_angle"])) {
        axop.tickRenderer = $.jqplot.CanvasAxisTickRenderer;
        axop.tickOptions.angle = Number(wwg.pval[axis + "_axis_lbl_angle"]);
      }
     
      // Axis number of ticks
      if (!osbi.is_empty(wwg.pval[axis + "_axis_ticks_num"]))
        axop.numberTicks = Number(wwg.pval[axis + "_axis_ticks_num"]);
    }
      
    // Legend
    if (osbi.get_bool_val(wwg.pval.legend_enabled)) {
      this.opts.legend = {
        show: true,
        location: wwg.pval.legend_location, // 'ne',
        rowSpacing: 0,
        placement: 'outsideGrid'
      };
      
      // Draw one line legend for north or south locations
      if (wwg.pval.legend_location == "n" || wwg.pval.legend_location == "s") {
        this.opts.legend.renderer = $.jqplot.EnhancedLegendRenderer;
        this.opts.legend.preDraw = true;
        this.opts.legend.rendererOptions = {
          numberRows: 1
        };
      }
    }
    
    // Series
    if (wwg.dval.series !== undefined && wwg.dval.series.slink.length > 0)
      this.opts.series = wwg.dval.series.slink;
      
    if (!osbi.is_empty(wwg.pval.title))
      this.opts.title = osbi.t(wwg.pval.title);
      
    if (!osbi.is_empty(wwg.pval.series_colors))
      this.opts.seriesColors = wwg.pval.series_colors.split(",");
  };
  
  jqPlotChartEngine.prototype.display = function(wwg) {
    this.plot = wwg.body_ctx.jqplot(this.sdata, this.opts);
  };
  
  osbi.chart_engines["jqplot"] = jqPlotChartEngine;
  
  /**************************************************/
  /********   jQueryDataTablesEngine Engine  ********/
  /**************************************************/
  
  /*
   * Dummy engine. All processing done in script.js
   */  
  function jQueryDataTablesEngine() {
    this.name = "data_tables";
  }  
  
  osbi.chart_engines["data_tables"] = jQueryDataTablesEngine;
  
})(jQuery, jOsBiTools);
