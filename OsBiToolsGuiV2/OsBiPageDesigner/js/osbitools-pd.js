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

// OsBiTools Page Designer modules
(function(osbi) {
  
  // Custom Input Controls
  osbi.input_ctrls = {};

  /**************************************************/
  /***********          WebWidget         ***********/
  /**************************************************/

  /**
   * Load widget data from json and initialize internal value storage
   */
  osbi.sys_wwg["base"].prototype.loadData = function(data) {
    // Initialize property values array
    var pval = {};
    
    // Process property groups
    if (data.props !== undefined) {
      for (var i in data.props.prop) {
        var p = data.props.prop[i];
        pval[p.name] = p.value;
      }
    }
    
    // Process group of group of properties
    if (data.prop_groups !== undefined) {
      for (var i in data.prop_groups.prop_group) {
        var pg = data.prop_groups.prop_group[i];
        var plist = [];
        
        for (var j in pg.props) {
          var pgrp = {};
          var prop = pg.props[j].prop;
          for (var k in prop) {
            var p = prop[k];
            pgrp[p.name] = p.value;
          }
          
          plist.push(pgrp);
        }
        
        pval[pg.name] = plist;
      }
    }
    
    this.set_pval(pval);
  };

  /**
   * Init properties
   * 
   * @param {Object} page Pointer on web page
   * @param uid Web Widget Unique Id
   * @param pval Property Values
   * @return {Boolean} True if succeed and False if not
   * 
   */ 
  osbi.sys_wwg["base"].prototype.initProps = function(data) {
    this.uid = data.uid;
    
    // Set saved flag
    this.saved = true;
    
    // Load wwg data and init internal value storage
    this.loadData(data);
    
    // Get properties. It's Array because order is important.
    this.props = this.getProps();
    
    // Index property and find DataSet property
    this.prop_map = {};
    
    // Get tabs
    this.tabs = this.getTabs();
    
    // Indexed list of tab properties
    this.tabs_map = {};
    
    // Keep separate property with data aware link
    this.ds_link = new Observer("ds_link");
    this.dlinks = {
      "ll_link": this.wp.getLangLabelSetLink(), 
      "ds_link": this.ds_link
    };
    
    // Index tabs
    for (var i in this.tabs)
      this.tabs_map[this.tabs[i].name] = {props: [], ctrl: false};
    
    for (var i in this.props) {
      // Get property description
      var pdescr = this.props[i];
      
      // Check if property class exists
      var pinput = osbi.input_ctrls[pdescr.type];
      if (pinput === undefined) {
        //-- 108
        show_client_error_ex(108, "'" + pdescr.type + 
                          "' property is not configured.");
        return false;
      }
      
      var pname = pdescr.name;
      
      // Check if property already loaded. Duplication(s) not allowed
      if (this.prop_map[pname] !== undefined) {
        //-- 109
        show_client_error_ex(109, "'" + pname + 
                        "' property already exists.");
        return false;
      }
      
      // Check if property is a group and than check the group & index it
      if (pdescr.params !== undefined && 
                          pdescr.params.prop_group !== undefined) {
        var map = {};
        
        for (var i in pdescr.params.prop_group) {
          var descr = pdescr.params.prop_group[i];
          
          // Check if property class exists
          var input = osbi.input_ctrls[descr.type];
          
          if (input === undefined) {
            //-- 111
            show_client_error_ex(111, "'" + descr.type + "' property is " + 
              "not configured for group property '" + pname + "'");
              
            return false;
          }
          
          map[descr.name] = input;
        }
        
        pdescr.params.prop_map = map;
      }
  
      // Instantiate property
      var prop = new pinput(this, pname, pdescr.label, pdescr.params);
      
      // Check if value needs to be assigned
      var value = this.pval[pname];
      if (value !== undefined)
        prop.setValue(value, true);
        
      // Check if it datasource property or data source binded
      if (pname == "ds") {
        this.ds = prop;
      } else {
        for (var lname in this.dlinks) {
          if (prop.hasDataSetLink(lname))
            this.dlinks[lname].subscribe(prop);
        }
      }  
        
      // Add to indexed map
      this.prop_map[pname] = prop;
      
      // Check if it belong to tab
      if (!is_empty(pdescr.tab)) {
        var tab = this.tabs_map[pdescr.tab];
        
        prop.tab = pdescr.tab;
        tab.props.push(prop);
        
        // Check if it's tab control property
        // Tab control property has name [tab_name]_enabled
        if (prop.name == pdescr.tab + "_enabled")
          tab.ctrl = true;
      }
    }
    
    return true;
  };
  
  /**
   * Load widget from json
   * 
   * @return {Boolean} True if succeed and False if not
   */
  osbi.sys_wwg["base"].prototype.load = function(data) {
    // Initiate properties and fill with values
    if (!(this.initProps(data) && 
      // Call custom handler
      this.onLoad(data)))
        return false;
    
    return true;
  };

  osbi.sys_wwg["base"].prototype.getTabs = function() {
    return [];
  };
  
  osbi.sys_wwg["base"].prototype.getProps = function() {
    var me = this;
    
    return [
      {
        type: "text",
        name: "id",
        label: "LL_ID",
        params: {
          on_save: function(value) {
            me.container.attr("id", value); 
          },
          filter: ID_FILTER,
          is_required: true
        }
      },
      
      // Optional width
      {
        type: "number",
        name: "size_width",
        label: "LL_WIDTH",
        
        params: {
          def_value: "",
          on_save: function(value) {
            // Resize container
            me.setWidth(value);
          },
          suffix: "px"
        }
      },
    
      // Optional height
      {
        type: "number",
        name: "size_height",
        label: "LL_HEIGHT",
        
        params: {
          def_value: "",
          on_save: function(value) {
            // Resize container height
            me.setHeight(value);
          },
          suffix: "px"
        }
      },
      
      // Optional right padding
      {
        type: "number",
        name: "rpad",
        label: "LL_RIGHT_INDENT",
        
        params: {
          def_value: "",
          on_save: function(value) {
            // Resize container height
            me.setPadding("right", value);
          },
          suffix: "em"
        }
      }
    ];
  };
  
  osbi.sys_wwg["base"].prototype.getId = function() {
    return this.pval.id;
  };
  
  osbi.sys_wwg["base"].prototype.getContainer = function() {
    return this.container;
  };
  
  osbi.sys_wwg["base"].prototype.setContainer = function(container) {
    this.container = container;
    this.body_ctx = $("div.body:first", container);
    
    this.setWidth(this.pval.size_width);
    this.setHeight(this.pval.size_height);
    this.setPadding("right", this.pval.rpad);
  };
  
  osbi.sys_wwg["base"].prototype.isContainer = function() {
    return false;
  };
  
  osbi.sys_wwg["base"].prototype.getClassName = function() {
    return "wwg wwg-" + this.nname;
  };
  
  /**
   * Convert web widget type into class name
   */
  osbi.sys_wwg["base"].prototype.getTypeClassName = function() {
    return this.cname;
  };
  
  osbi.sys_wwg["base"].prototype.getPropertyWin = function() {
    var pwin = $('<table><tr>' +
        '<td><table class="wwg-prop-wrapper">' +
            '<tbody class="wwg-prop-wrapper"></tbody></table></td>' +
        '<td class="wwg-group-wrapper"><table class="wwg-group-wrapper">' +
            '<tbody class="wwg-group-wrapper"></tbody></table></td>' +
        '<td class="wwg-custom-prop-wrapper"></td>' +
      '</tr></table>');
    
    var pbody = $("tbody.wwg-prop-wrapper", pwin);
    var pgroups = $("tbody.wwg-group-wrapper", pwin);
    
    for (var i in this.props) {
      var prop = this.prop_map[this.props[i].name];
      if (!is_empty(prop.tab))
        continue;
        
      var row = prop.getInputRow();
      
      // Check if property has group
      if (prop.plist === undefined)
        pbody.append(row);
      else
        pgroups.append(row);
    }
    
    // Process tabs
    for (var i in this.tabs) {
      var tab = this.tabs[i];
      
      // Check if tab disabled
      if (get_bool_val(this["no_" + tab.name]))
        continue;
      
      var row = $('<tr class="prop-grp-wrapper ' + tab.name + '">' + 
        '<td class="prop-grp-wrapper ' + tab.name + '">' +
          '<div class="grp-tab selected">' + t(tab.label) +'</div>' +
          '<div class="grp-bodies">' +
            '<table class="prop-group-wrapper">' +
              '<tbody class="prop-group-wrapper"></tbody>' +
            '</table>' +
          '</div>' +
        '</td></tr>');
      
      var body = $('tbody.prop-group-wrapper', row);
      
      for (var j in this.tabs_map[tab.name].props) {
        var prop = this.tabs_map[tab.name].props[j];
        body.append(prop.getInputRow());
      }
      
      if (this.tabs_map[tab.name].ctrl) {
        (function(wwg, bd, tname){
          var cname = tname + "-enabled";
          
        // Bind enabled checkbox
        function setPropertyEnabled(enabled) {
          if (enabled) {
            $("input,select,textarea", bd).prop("disabled", false);
            $("label", bd).removeClass("ui-state-disabled");
          } else {
            // Disable all input controls except itself
            $("input,select,textarea", bd).prop("disabled", true);
            $("input." + cname, bd).prop("disabled", false);
            
            $("label", bd).addClass("ui-state-disabled");
            $("label.prop-name." + cname, bd).
                                removeClass("ui-state-disabled");
          }
        }

        $("input." + cname, bd).on("click", function() {
          setPropertyEnabled($(this).is(":checked"));
        });
        
        // Set initial state
        setPropertyEnabled(wwg.tabs_map[tname].
                              props[0].getVisibleValue());
        })(this, body, tab.name);
      }
      
      // Check for optional index
      if (!is_empty(tab.idx)) {
        var plist = $("tr.prop-grp-wrapper", pgroups).not("tr.multi");
        
        if (plist.length >= tab.idx)
          $(plist[tab.idx - 1]).before(row);
        else
          pgroups.append(row);
      } else {
        pgroups.append(row);
      }
    }
    
    if (this.ds !== undefined)
      // Initiate dataset columns load
      this.setDataSet(false);
      
    this.onGetPropCustTab($("td.wwg-custom-prop-wrapper", pwin));
    
    return pwin;
  };
  
  osbi.sys_wwg["base"].prototype.onGetPropCustTab = function(body) {};
  
  osbi.sys_wwg["base"].prototype.addContainerToolBar = function(toolbar) {};
  
  osbi.sys_wwg["base"].prototype.editProperty = function() {
    for (var i in this.props)
      this.prop_map[this.props[i].name].enableEdit();
      
    // Call custom callback
    this.onEditProperty();
  };
  
  osbi.sys_wwg["base"].prototype.onEditProperty = function() {};
  
  osbi.sys_wwg["base"].prototype.cancelProperty = function() {
    for (var i in this.props)
      this.prop_map[this.props[i].name].cancelEdit();
    
    // Call custom callback
    this.onCancelProperty();
        
    // Last
    this.setSaved(true);
  };
  
  osbi.sys_wwg["base"].prototype.onCancelProperty = function() {};
  
  osbi.sys_wwg["base"].prototype.getPropTabTitle = function() {
    return t("LL_WEB_WIDGET") + ":" + this.name;
  };
  
  osbi.sys_wwg["base"].prototype.saveProperty = function() {
    // 1. Validation
    for (var i in this.props)
      if (!this.prop_map[this.props[i].name].canSave())
        return false;
      
    // Save properties
    for (var i in this.props) {
      var prop = this.prop_map[this.props[i].name];
      prop.save();
      
      // Update value map
      this.pval[prop.name] = prop.getValue();
    }
    
    // Call custom callback
    this.onSaveProperty();
    
    // Last
    this.setSaved(true);
    
    return true;
  };
  
  osbi.sys_wwg["base"].prototype.onSaveProperty = function() {};
  
  osbi.sys_wwg["base"].prototype.setSaved = function(saved) {
    this.saved = saved;
    WEB_APP.base.setPropSave(!saved);
  };
  
  osbi.sys_wwg["base"].prototype.canClose = function() {
    return this.saved;
  };
  
  osbi.sys_wwg["base"].prototype.getJsonData = function(idx) {
    var pstr = "";
    var gstr = "";
    var tag = "wwg_" + this.nname;
    
    var witem = {
      uid: this.uid,
      idx: idx,
      class_name: this.name,
    };
    
    if (!is_empty(this.engine) && !is_empty(this.engine.name))
      witem["engine"] = this.engine.name;
      
    var plist = [];
    var pgrp = [];
    
    for (var i in this.props) {
      var prop = this.prop_map[this.props[i].name];
      
      // Check if property has group
      if (prop.plist === undefined) {
        // Single list
        var pitem = prop.getJsonData();
        
        if (pitem !== undefined)
          plist.push(pitem);
      } else {
        // Group
        var pgrps = [];
        
        for (var j in prop.plist) {
          var prop_group = prop.plist[j];
          
          var prps = [];
          for (var k in prop_group.props) {    
            // Props list
            var pitem = prop_group.props[k].getJsonData();
  
            if (pitem !== undefined)
              prps.push(pitem);
          }
          
          if (prps.length > 0)
            pgrps.push({
              prop: prps
            });
        }

        if (pgrps.length > 0)
          pgrp.push({
                name: prop.cname,
                props: pgrps
            });
      }
    }
    
    if (pgrp.length > 0)
      witem["prop_groups"] = {
            prop_group: pgrp
      };
      
    if (plist.length > 0)
      witem["props"] = {
        prop: plist
      };
    
    var result = {};
    result[tag] = witem;
      
    return result;
    
    /* TODO Delete obsoleted
    return get_cr() + get_tab_num(tnum) + 
        '<' + tag + 
          ' uid="' + this.uid + '"' +
          ' idx="' + idx + '"' +
          ' class_name="' + this.name + '"' + 
          (!is_empty(this.engine) && !is_empty(this.engine.name) ? 
            ' engine="' + this.engine.name + '"' : "") +
        '>' + 
        
        (pstr != "" ? get_cr() + get_tab_num(tnum + 1) + '<props>' + pstr  + 
                            get_cr() + get_tab_num(tnum + 1)+ "</props>": "") +
        
        (gstr != "" ? get_cr() + get_tab_num(tnum + 1) + 
            '<prop_groups>' + gstr  + get_cr() + get_tab_num(tnum + 1)+ 
              "</prop_groups>" : "") +
                
        this.getSaveXmlBody(tnum + 1) +
        get_cr() + get_tab_num(tnum) + '</' + tag + '>';
     */
  };
  
  /**
   * Get array with properties that can be edited in GUI
   */
  osbi.sys_wwg["base"].prototype.getPropConfig = function() {};
  
  /**
   * Load custom widget data
   * 
   * @param {Object} data JSON data
   * @return {Boolean} True if succeed and False if not
   * 
   */
  osbi.sys_wwg["base"].prototype.onLoad = function(data) {
    return true;
  };
  
  osbi.sys_wwg["base"].prototype.getWebPage = function() {
    return this.wp;
  };
  
  /**
   * Callback on language label set changes
   * 
   */
  osbi.sys_wwg["base"].prototype.onLangLabelSetChange = function(data) {
    this.dlinks["ll_link"].update(data);
  };

  osbi.sys_wwg["base"].prototype.setHeight = function(value) {
    if (value == "")
      this.body_ctx.css("height", "");
    else if (!is_empty(value) && !isNaN(value))
      this.body_ctx.css("height", value);
  };
  
  osbi.sys_wwg["base"].prototype.setWidth = function(value) {
    if (value == "")
      this.body_ctx.css("width", "");
    else if (!is_empty(value) && !isNaN(value))
      this.body_ctx.css("width", value);
  };
  
  osbi.sys_wwg["base"].prototype.setPadding = function(dir, value) {
    var pname = "padding-" + dir;
    
    if (value == "")
      this.body_ctx.css(pname, "");
    else if (!is_empty(value) && !isNaN(value))
      this.body_ctx.css(pname, value + "em");
  };
  
  /**************************************************/
  /***********      DataSetWebWidget      ***********/
  /**************************************************/

  osbi.sys_wwg["data_set"].prototype.reloadInfoWin = function() {
    $("span.ui-icon-close", this.ds.info_win).hide();
    $("div.info-win-ctrl", this.ds.info_win).hide();
    
    $(".info-win-ctx", this.ds.info_win).empty();
    this.ds.info_win.addClass("loading");
  
    this.setDataSet(true);
  };
  
  osbi.sys_wwg["data_set"].prototype.getInfoWin = function() {
    var cname = "col-info-win";
    var tbl = '<table class="' + cname + '"><thead><tr>' + 
      '<th>' + t("LL_COLUMN_NAME") + '</th>' +
      '<th>' + t("LL_COLUMN_TYPE") + '</th>' +
      '<th>' + t("LL_RESULT_ON_ERROR") + '</th>' +
    '</tr></thead><tbody>';
    
    for (var i in this.columns) {
      var column = this.columns[i].getColumn();
      tbl += '<tr>' +
          '<td>' + column.name + '</td>' +
          '<td>' + column.java_type + '</td>' +
          '<td>' + (column.on_error !== undefined 
              ? column.on_error : "") + '</td>' +
        '</tr>';
    }
    
    return $(tbl + '</body></table>');
  };
  
  osbi.sys_wwg["data_set"].prototype.getInfoWinError = function(msg, cname) {
    return $('<div class="non-info ' + cname + '"><span class="non-info ' + 
                          cname + '">' + msg + '</span></div>');
  };
  
  osbi.sys_wwg["data_set"].prototype.disableInfoWin = function() {
    this.ds.info_btn.removeClass("ui-icon-info").addClass("btn-loading-min");
    this.ds.disable();
    
    if (!this.ds.info_btn.is("visible"))
      this.ds.info_btn.show();
    
    // Disable also all linked elements
    this.ds_link.disable();
  };
  
  osbi.sys_wwg["data_set"].prototype.enableInfoWin = function() {
    this.ds.info_btn.removeClass("btn-loading-min").addClass("ui-icon-info");
    this.ds.enable();
    
    if (!this.ds.info_btn.is("visible"))
      this.ds.info_btn.show();
      
    // Disable also all linked elements
    this.ds_link.enable();
  };
  
  osbi.sys_wwg["data_set"].prototype.getMapInfo = 
                          function(info_win, mname, on_success) {
    
    var me = this;
    this.disableInfoWin();
    
    //-- 105
    get_ajax_ex(osbi.get_app_ds_req(mname), -105, 
      function(data) {
        // Cache map info response
        WEB_APP.map_info[mname] = data;
          
        if (is_empty(data) || data.columns.length == 0) {
          me.onGetColumnsEmpty(t("LL_EMPTY_COLUMN_SET"));
        } else {
          me.onGetMapInfoSuccess(data, on_success);
        }
      }, function(msg) {
        me.onGetColumnsError(msg);
      });
  };
  
  osbi.sys_wwg["data_set"].prototype.onGetMapInfoSuccess = 
                                              function(data, on_success) {
    this.onGetColumnsSuccess(data.columns);
    
    if (typeof on_success == "function")
      on_success(this.columns);
  };
  
  osbi.sys_wwg["data_set"].prototype.onGetPropCustTab = function(body) {
    this.rbtn = $('<button class="run-wwg">' + t("LL_RUN_TEST") + '</button>');
    
    var me = this;
    this.rbtn.on("click", function() {
      me.onRunDataSetTest();
    });
    
    body.append(this.rbtn);
  };
  
  osbi.sys_wwg["data_set"].prototype.addContainerToolBar = function(toolbar) {
    var btn = $('<span class="ui-icon ui-icon-play wwg-icon" ' + 
                            'title="' + ts("LL_RUN_TEST") + '"></span>');
    var me = this;
    var frun = false;
    
    btn.on("click", function() {
      me.onRunDataSetTest();
      
      if (!frun) {
        frun = true;
        btn.removeClass("ui-icon-play").addClass("ui-icon-refresh");
        btn.attr("title", ts("LL_RE_TEST"));
      }
    });
    
    toolbar.append(btn);
  };
  
  osbi.sys_wwg["data_set"].prototype.onRunDataSetTest = function() {
    var me = this;
    
    // Check for language parameter. It's either URL parameter or 
    //                            language that different from default
    
    // TODO Check for parameters
    //-- 110
    get_ajax_ex(osbi.get_app_ds_req(this.ds.getValue()), 110, 
      function(data) {
        // Apply data and show web widget
        me.empty();
        me.show(data);
      },
      function(msg, code) {
        if (code == 403)
          // Call bootstrap logout method
          me.wp.getApp().bs.logout();
      });
  };
    
  osbi.sys_wwg["data_set"].prototype.show = function(data) {
    this.body_ctx.append(JSON.stringify(data));
  };
  
  osbi.sys_wwg["data_set"].prototype.onGetColumnsSuccess = function(data) {
    // Convert json into array of Columns
    this.columns = [];
    for (var i in data)
      this.columns.push(new ColumnItem(data[i]));
    
    this.ds.fillInfoWin(this.getInfoWin());  
    this.onGetColumns("info-proc");
  };
  
  osbi.sys_wwg["data_set"].prototype.onGetColumnsError = function(msg) {
    this.ds.fillInfoWin(this.getInfoWinError(msg, "err-info"));  
    this.onGetColumns("err-info");
  };
  
  osbi.sys_wwg["data_set"].prototype.onGetColumnsEmpty = function(msg) {
    this.ds.fillInfoWin(this.getInfoWinError(msg, "warn"));  
    this.onGetColumns();
  };
  
  osbi.sys_wwg["data_set"].prototype.onGetColumns = function(cname) {
    this.enableInfoWin();
    this.ds.info_btn.removeClass("error").removeClass("info-proc");
    
    if (cname !== undefined)
      this.ds.info_btn.addClass(cname);
  };
  
  osbi.sys_wwg["data_set"].prototype.setDataSet = function(freload) {
    // Read new value from input ds
    var dsv = this.ds.getInputValue();
    
    if (is_empty(dsv))
      return;
    
    var me = this;
    function on_ds_change(data) {
        me.onDataSourceChange(data);
    }
    
    // Check if map info already loaded
    if (!freload && WEB_APP.map_info[dsv] !== undefined)
      this.onGetMapInfoSuccess(WEB_APP.map_info[dsv], on_ds_change);
    else
      // Load dataset columns from remote dataset
      this.getMapInfo(this.ds.info_win, dsv, on_ds_change);
  };
  
  /**
   * Callback when data source changed
   * 
   * @param {Object} data Map Info Data
   * 
   */
  osbi.sys_wwg["data_set"].prototype.onDataSourceChange = function(data) {
    this.ds_link.update(data);
  };
  
  osbi.sys_wwg["data_set"].prototype.onEditProperty = function() {
    this.setTestRunBtn(false);
  };
  
  osbi.sys_wwg["data_set"].prototype.onCancelProperty = function() {
    this.setTestRunBtn(true);
  };
  
  osbi.sys_wwg["data_set"].prototype.onSaveProperty = function() {
    this.setTestRunBtn(true);
  };
  
  osbi.sys_wwg["data_set"].prototype.setTestRunBtn = function(enabled) {
    // Hide "Run test" button
    this.rbtn.prop("disabled", !enabled);
  };
  
  osbi.sys_wwg["data_set"].prototype.getProps = function() {
    var me = this;
    
    // Call super method
    var props = osbi.sys_wwg["base"].prototype.getProps.call(this);
    
    props.push(
      // Mandatory DataSource property
      {
        type: "select",
        name: "ds",
        label: "LL_DATASOURCE_MAP_NAME",
          
        params: {
          def_value: "",
          list: function() {
            return WEB_APP.map_list;
          },
          empty_entry: "LL_SELECT",
          del_empty_on_sel: true,
          is_required: true
        }
      }      
    );
    
    return props;
  };

  /**************************************************/
  /***********       ChartWebWidget       ***********/
  /**************************************************/
  
  osbi.sys_wwg["chart"].prototype.getProps = function() {
    var me = this;
    
    // Call super method
    var props = osbi.sys_wwg["data_set"].prototype.getProps.call(this);
    
    props.push(
      
      // Optional title
      {
        type: "select",
        name: "title",
        label: "LL_TITLE",
        
        params: {
          def_value: "",
          list: [],
          empty_entry: "LL_SELECT",
          dlink: "ll_link",
        }
      }
    );
    
    if (!osbi.get_bool_val(this.no_animation))
      // Optional animation flag
      props.push({
        type: "check_box",
        name: "is_animate",
        label: "LL_ANIMATE",
          
        params: {
          def_value: false
        }
    });
    
    return props;
  };
  
  osbi.sys_wwg["chart"].prototype.getClassName = function() {
    return osbi.sys_wwg["base"].prototype.
            getClassName.call(this) + " chart wrapper";
  };
  
  /**************************************************/
  /***********    DualDimChartWebWidget   ***********/
  /**************************************************/
  
  osbi.sys_wwg["dual_dim_chart"].prototype.getTabs = function() {
    var tabs = osbi.sys_wwg["chart"].prototype.getTabs.call(this);
    
    tabs.push(
      {
        idx: 1,
        name: "x_axis",
        label: is_empty(this.dims[0].label) ? "LL_XAXIS" : 
                                                  this.dims[0].label
      },
      
      {
        name: "legend",
        label: "LL_LEGEND"
      }
    );
    
    return tabs;
  };
  
  osbi.sys_wwg["dual_dim_chart"].prototype.getProps = function() {
    var me = this;
    
    // Call super method
    var props = osbi.sys_wwg["chart"].prototype.getProps.call(this);
    
    // x_axis is mandatory
    props.push(
      {
        type: "select",
        name: "x_axis",
        label: "LL_DATASET_COLUMN",
        tab: "x_axis",
        
        params: {
          def_value: "",
          list: [],
          empty_entry: "LL_SELECT",
          del_empty_on_sel: true,
          dlink: "ds_link",
          is_required: true
        }
      },
      
      // Optional "Show Point Labels" checkbox
      {
        type: "check_box",
        name: "is_show_point_labels",
        label: "LL_SHOW_POINT_LABELS",
          
        params: {
          def_value: false          
        }
      }      
    );
    
    // Optional legend
    if (!osbi.get_bool_val(this.no_legend)) {
      props.push(
        {
          type: "check_box",
          name: "legend_enabled",
          label: "LL_ENABLED",
          tab: "legend",
            
          params: {
            def_value: false
          }
        },
        
        {
          type: "select",
          name: "legend_location",
          label: "LL_POSITION",
          tab: "legend" ,
            
          params: {
            def_value: "ne",
            list: [
              new ListItem('ne', osbi.t("LL_LEGEND_NE")),
              new ListItem('n', osbi.t("LL_LEGEND_N")),
              new ListItem('nw', osbi.t("LL_LEGEND_NW")),
              new ListItem('w', osbi.t("LL_LEGEND_W")),
              new ListItem('sw', osbi.t("LL_LEGEND_SW")),
              new ListItem('s', osbi.t("LL_LEGEND_S")),
              new ListItem('se', osbi.t("LL_LEGEND_SE")),
              new ListItem('e', osbi.t("LL_LEGEND_E")),
            ],
          }
        }
      );
    }
    
    if (this.color_set !== undefined) {
      // Optional color set
      props.push({
        type: "text",
        name: "color_set",
        label: this.color_set,
        params: {
          filter: COLORS_FILTER,
        }
      });
    }
 
    return props;
  };
  
  /**************************************************/
  /***********      AxisChartWebWidget    ***********/
  /**************************************************/
  
    osbi.sys_wwg["axis_chart"].prototype.getTabs = function() {
    var tabs = osbi.sys_wwg["dual_dim_chart"].prototype.getTabs.call(this);
    
    tabs.push(
      {
        idx: 2,
        name: "y_axis",
        label: "LL_YAXIS"
      },
      {
        name: "highlighter",
        label: "LL_HIGHLIGHTER"
      }
    );
    
    return tabs;
  };
  
  osbi.sys_wwg["axis_chart"].prototype.getProps = function() {
    var me = this;
    
    // Call super method
    var props = osbi.sys_wwg["dual_dim_chart"].
                          prototype.getProps.call(this);
    
    // Optional X Axis format
    if (!osbi.is_empty(this.dims[0].fmt)) {
      props.push({
        type: "text",
        name: "x_axis_fmt",
        label: this.dims[0].fmt,
        tab: "x_axis"
      });
    }
        
    // Optional X Axis title
    if (!osbi.is_empty(this.dims[0].title)) {
      props.push({
        type: "select",
        name: "x_axis_label",
        label: this.dims[0].title,
        tab: "x_axis",
        
        params: {
          def_value: "",
          list: [],
          empty_entry: "LL_SELECT",
          dlink: "ll_link",
        }
      });
    }
    
    // Optional X Axis label angle
    if (!osbi.is_empty(this.dims[0].angle)) {
      props.push({
        type: "number",
        name: "x_axis_lbl_angle",
        label: this.dims[0].angle,
        tab: "x_axis",
        
        params: {
          def_value: "",
        }
      });
    }
    
    // Optional number of ticks on axis label angle
    props.push({
      type: "number",
      name: "x_axis_ticks_num",
      label: "LL_TICKS_NUMBER",
      tab: "x_axis"
    });
    
    // Optional Y Axis format
    if (!osbi.is_empty(this.dims[1].fmt)) {
      props.push({
        type: "text",
        name: "y_axis_fmt",
        label: this.dims[1].fmt,
        tab: "y_axis"
      });
    }
    
    // Optional X Axis title
    if (!osbi.is_empty(this.dims[1].title)) {
      props.push({
        type: "select",
        name: "y_axis_label",
        label: this.dims[1].title,
        tab: "y_axis",
        
        params: {
          def_value: "",
          list: [],
          empty_entry: "LL_SELECT",
          dlink: "ll_link",
        }
      });
    }
    
    // Optional highlighter
    if (!osbi.get_bool_val(this.no_highlighter)) {
      props.push(
        {
          type: "check_box",
          name: "highlighter_enabled",
          label: "LL_ENABLED",
          tab: "highlighter",
            
          params: {
            def_value: false
          }
        },
        
        {
          type: "text_area",
          name: "highlighter_text",
          label: "LL_TEXT",
          tab: "highlighter" ,            
        }
      );
    }

    return props;
  };
  
  /**************************************************/
  /***********  SeriesAxisChartWebWidget  ***********/
  /**************************************************/
  
  osbi.sys_wwg["series_axis_chart"].prototype.getProps = function() {
    var me = this;
    
    // Call super method
    var props = osbi.sys_wwg["axis_chart"].prototype.getProps.call(this);
    
    props.push(
     
      // Add series table
      {
        type: "multi_prop_group",
        name: "series",
        label: "LL_SERIES",
        
        params: {
          // Can input contain multi groups. This options allow dynamically 
          //  add/remove groups and change their index position
          is_multi: true,
          
          // Property group to clone in each series
          prop_group: [
            // Optional Y-axes legend label
            {
              type: "select",
              name: "label",
              label: "LL_LEGEND_LABEL",
              
              params: {
                def_value: "",
                list: [],
                empty_entry: "LL_SELECT",
                dlink: "ll_link"
              }
            },
            
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
            },

            // Optional series color
            {
              type: "color",
              name: "color",
              label: "LL_COLOR",
              params: {
                def_value: ""
              }
            }
          ]
        }
      }
    );
    
    return props;
  };
  
  /**************************************************/
  /***********     ContainerWebWidget     ***********/
  /**************************************************/
  
  osbi.sys_wwg["container"].prototype.init = function() {
    osbi.sys_wwg["base"].prototype.init.call(this);
    
    // Number of used widgets
    this.wcnt = 0;
    
    // List of web widgets
    this.wwg_list = {};
  };
  
  osbi.sys_wwg["container"].prototype.setContainer = function(container) {
    osbi.sys_wwg["base"].prototype.setContainer.call(this, container);
    
    // Number of containers
    this.cont_cnt = 1;  
    
    // Add default container
    var cbody = $("div.body:first", container);
    
    // Added dashed border by default to body
    cbody.html('<div class="container"' + 
      // ' title="' + t("LL_RIGHT_CLICK_TO_SPLIT_PANEL") + '"' + 
      '></div>');
    
    var container = $(".container", cbody);
    container.addClass("dashed-border");
    
    var me = this;

    // Add drag & drop for widget body
    this.wp.addDragDrop(container, function(src) {
      me.addWebWidget(src, container);
    });
    
    if (this.hasHeaderIcon() && this.pval.header_icon !== undefined)
      this.setHeaderIcon(this.pval.header_icon);
  
    if (this.hasHeaderTitle() && this.pval.header_title !== undefined)
      this.setHeaderTitle(this.pval.header_title);
      
    if (this.data !== undefined && this.data.wwg_list !== undefined)
      this.wp.loadWidgetSet(this.data.wwg_list, container);
  };
  
  osbi.sys_wwg["container"].prototype.addWebWidget = function(src, container) {
    var wwg = this.wp.addWebWidget(src, container);
    
    // Add widget to list
    this.wwg_list[wwg.uid] = wwg;
    
    // Increase total list of included web widgets
    this.wcnt++;
  };
  
  osbi.sys_wwg["container"].prototype.getProps = function() {
    var me = this;
    
    // Call super method
    var props = osbi.sys_wwg["base"].prototype.getProps.call(this);
    
    if (this.hasHeaderTitle()) {
      props.push(
        // Optional header container title
        {
          type: "select",
          name: "header_title",
          label: "LL_HEADER_TITLE",
          
          params: {
            def_value: "",
            list: [],
            empty_entry: "LL_SELECT",
            on_save: function(value) {
              // Replace current title with current lang equivalent
              me.setHeaderTitle(value);
            },
            dlink: "ll_link"
          }
        }
      );
    }
    
    if (this.hasHeaderIcon()) {
      props.push(
        // Optional header container title
        {
          type: "icon_list",
          name: "header_icon",
          label: "LL_HEADER_ICON",
          
          params: {
            def_value: this.def.header.icon,
            list: function() {
              return WEB_APP.icon_list.getItems();
            },
            icons: WEB_APP.icon_list,
            on_save: function(value) {
              // Replace old icon
              me.setHeaderIcon(value);
            }
          }
        }
      );
    }
    
    return props;
  };
  
  osbi.sys_wwg["container"].prototype.hSplit = function(container) {
    container.append(container.html());
    this.cont_cnt++;
  };
  
  /*
  osbi.sys_wwg["container"].prototype.vSplit = function(container) {
    this.cont_cnt++;
  };
  */
 
  osbi.sys_wwg["container"].prototype.setHeaderTitle = function(value) {
    $("span.ttext", this.container).html(t(value));
  };
            
  osbi.sys_wwg["container"].prototype.setHeaderIcon = function(value) {
    var img = $(".title:first .timg:first", this.container).
                    replaceWith(WEB_APP.icon_list.getIconImg(value));
  };
            
  osbi.sys_wwg["container"].prototype.getHeaderIcon = function() {
    return is_empty(this.header.icon) ? 
                  this.def.header.icon : this.header.icon;
  };
  
  osbi.sys_wwg["container"].prototype.getHeaderTitle = function() {
    return is_empty(this.header.title) ? 
                  this.def.header.title : this.header.title;
  };
  
  osbi.sys_wwg["container"].prototype.hasHeader = function() {
    return !is_empty(this.header);
  };
  
  osbi.sys_wwg["container"].prototype.getJsonData = function(idx) {
    // Call super method
    var result = osbi.sys_wwg["base"].prototype.getJsonData.call(this, idx);

    var cnt = 0;
    var me = this;
    var wwg_list = [];
    
    $("div.container:first", this.container).
                children("div.wwg").each(function() {
      // Get uid
      var uid = $(this).attr("uid");
      var wwg = me.wp.wwg_list[uid];
      wwg_list.push(wwg.getJsonData(cnt));
      cnt++;
    });
    
    if (wwg_list.length > 0)
      result["wwg_container"]["wwg_list"] = wwg_list;
    
    return result;
        
    // TODO Delete obsoleted
    /*    
    var res = "";
    var me = this;
    
    // Save childrens
    var idx = 0;
    $("div.container:first", this.container).
                children("div.wwg").each(function() {
      // Get uid
      var uid = $(this).attr("uid");
      var wwg = me.wp.wwg_list[uid];
      // if (wwg !== undefined) {
        res += wwg.getSaveXml(tnum + 1, idx);
        idx++;
      // }
    });
    
    return res != "" ? get_cr() + get_tab_num(tnum) + "<wwg_list>" + res + 
                              get_cr() + get_tab_num(tnum) + "</wwg_list>" : "";
    */
  };
  
  /**
   * Load custom widget data
  */
  osbi.sys_wwg["container"].prototype.onLoad = function(data) {
    this.data = data;
    return true;
  };
 
  osbi.sys_wwg["container"].prototype.onWidgetLoad = function(wwg) {
    this.wcnt++;
    this.wwg_list[wwg.uid] = wwg;
  };
  
  osbi.sys_wwg["container"].prototype.canClose = function() {
    if (!osbi.sys_wwg["base"].prototype.canClose.call(this))
      return false;
    
    for (var uid in this.wwg_list)  
      if (!this.wwg_list[uid].canClose())
        return false;
        
    return true;
  };
  
})(jOsBiTools);
