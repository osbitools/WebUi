/*
 * Open Source Business Intelligence Tools - http://www.osbitools.com/
 * 
 * Copyright 2014-2016 IvaLab Inc. and by respective contributors (see below).
 * 
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 * Date: 2015-03-24
 * 
 * Contributors:
 * 
 */

"use strict";

// Define global variable for input controls
var INPUT_CTRLS = {};

/**************************************************/
/***********    MANDATORY PARAMETERS    ***********/
/**************************************************/

// WEB_APP parameters
var WEB_APP_CFG = {
  base: "prj",
  security: true,
  version: [2,1,0],
  ws_ver: [2,0],
  loading: "LL_PAGE_DESIGNER_LOADING",
  styles: ["wwg.css"],
  scripts: ["web_page.js", "icon_list.js", "lang_set.js", 
    "input_ctrls/text.js", "input_ctrls/select.js",
    "input_ctrls/icon_list.js", "input_ctrls/edit_select.js", 
    "input_ctrls/check_box.js", "input_ctrls/prop_group.js", 
    "input_ctrls/multi_prop_group.js", "input_ctrls/color.js",
    "input_ctrls/number.js", "input_ctrls/text_area.js"],
  
  phase_loader: new PhaseLoader([[load_components, load_map_list, 
                                check_load_icon_list]]),
  cfg_keys: ["preview_host", "ds_src"],
  err_list: {
    // List of custom error
    // Reserved range 100-149
    100: "LL_ERROR_INVALID_WEB_WIDGET_ICON_PATH",
    101: "LL_ERROR_WEB_WIDGET_NOT_SUPPORTED",
    102: "LL_ERROR_EXPORT",
    103: "LL_ERROR_WEB_WIDGET_INIT_FAILED",
    104: "LL_ERROR_UPLOADING_ICON",
    105: "LL_ERROR_GET_COL_LIST",
    106: "LL_ERROR_WEB_WIDGET",
    107: "LL_ERROR_INVALID_WEB_PAGE_TYPE",
    108: "LL_INVALID_WIDGET_PROPERTY_CONFIG",
    109: "LL_INVALID_WIDGET_PROPERTY_CONFIG",
    110: "LL_ERROR_LOADING_DATA_SET",
    111: "LL_INVALID_WIDGET_PROPERTY_CONFIG",
    112: "LL_ERROR_DATASOURCE_NOT_CONFIGURED",
    113: "LL_ERROR_LOAD_DATASET_MAP_FROM_DS",
    114: "LL_ERROR_LOAD_DATASET_MAP_FROM_DS",
    115: "LL_ERROR_EMPTY_DATASET_MAP_LIST",
    116: "LL_ERROR_EMPTY_DATASET_MAP_LIST",
    117: "LL_ERROR_NEW_USER_REG",
    118: "LL_ERROR_LICENCE_CODE_VALIDATION",
    
    149: "LL_ERROR_INVALID_PROP_VALUE"
  },
  
  prj: {
    // Single Supported extension (subdirectory)
    ext: "icons",
    
    // File extension
    base_ext: "xml",
    
    // Class name of Project Entity
    ftype: "WebPage",
    
    // Name of module
    qname: "PageDesigner",
    
    msg_list: {
      add_component: "LL_DRAG_DROP_COMPONENT_ICON_HERE"
    },
    
    // Is components custom or not (system)
    cust_comp: true,
    
    // List of supported Web Widget types
    wwg_types: ["container", "control", "chart"],
    
    // Callback after project loaded
    after_prj_loaded: load_icon_list,
    
    // Extra entity context menu
    node_ctx_menu: [
      {
        label: "LL_EXPORT_TO_WEB_SITE",
        icon: ROOT_PATH + 'images/export.png',
        action:function() { 
          WEB_APP.base.getCurrentEntity().export("html_site");
        } 
      },
      
      {
        label: ts("LL_EXPORT_TO_JS_EMBEDDED"),
        icon: ROOT_PATH + 'images/export.png',
        action:function() { 
          WEB_APP.base.getCurrentEntity().export("js_embedded");
        } 
      }
    ]
  }
};

// List of web widget resources
var WWG_RES_LIST = ["script.js", "dep_list.txt", 
                    "lang_set.js", "body.html", "styles.css"];

/**
 * Module constructor
 * 
 * @param {Object} pmgr Pointer on ProjectManager parent object
 */
function OsBiPageDesigner(pmgr) {
  this.pmgr = pmgr;
}
                    
/**
 * Invoked from Phase Loader on_completed callback
 */
OsBiPageDesigner.prototype.init = function() {
  // Enable jqplot plugins
  $.jqplot.config.enablePlugins = true;
  
  // Initiate icon list
  WEB_APP.icon_list = new IconList();
  
  var me = this;
  var ds_sel = $("#osbitools .ds_sel");
  
  if (this.pmgr.config.has_ds) {
    ds_sel.empty();
    
    for (var idx in this.pmgr.config.ds_map)
      ds_sel.append('<option value="' + this.pmgr.config.ds_map[idx] + '">' +
               idx + '</option>');
  }
  
  ds_sel.on("change", function() {
    ds_sel.hide();
    ds_sel.parent().addClass("btn-loading-min");
    
    load_map_list_ex(function() {
        // Remember new selection
        me.pmgr.onDataSetChanged();
        
        // Check for dataset widget property
        var entity = me.pmgr.getCurrentEntity();
        if (entity !== undefined && 
              entity.swwg !== undefined && 
                  entity.swwg.ds !== undefined)
          entity.swwg.ds.reload();
      }, function() {
        // Restore previous selection
        ds_sel.val($.cookie('ds_src'));
      }, function() {
        //-- 115
        show_client_err(115);
        ds_sel.val($.cookie('ds_src'));
      }
    );
  });
  
  this.pmgr.showProjectList();
  
  // TODO Combine both registration window and post-registration window into the same dialog
  
  // Append registration dialog
  this.pmgr.reg_win = $('<div class="reg-win hidden-block wrapper dialog-big"></div>');
  $("#osbitools").append(this.pmgr.reg_win);
  this.addRegWin(this.pmgr.reg_win);
  
  // Append post-registration dialog
  this.pmgr.post_reg = $('<div class="post-reg-win hidden-block wrapper dialog-big"></div>');
  $("#osbitools").append(this.pmgr.post_reg);
  this.addPostRegWin(this.pmgr.post_reg);
  
  var rwin = $(this.pmgr.reg_win);
  $(".btn-cancel", this.pmgr.reg_win).click(function() {
    rwin.bPopup().close();
  });
  
  $(".btn-submit", this.pmgr.reg_win).click(function() {
    rwin.bPopup().close();
    rwin.data("res", true);
  });
  
  this.pmgr.reg_win.data("register", function(data) {
    me.onRegistration(data);
  });
  
  var prwin = $(this.pmgr.post_reg);
  $(".btn-cancel", this.pmgr.post_reg).click(function() {
    prwin.bPopup().close();
  });
  
  $(".btn-submit", this.pmgr.post_reg).click(function() {
    prwin.bPopup().close();
    prwin.data("res", true);
  });
  
  this.pmgr.post_reg.data("post_register", function(data) {
    me.onLicenseCodeValidation(data);
  }); 
};

OsBiPageDesigner.prototype.showPostRegWin = function() {
  var prwin = $(this.pmgr.post_reg);
  prwin.bPopup({
    appendTo: "#osbitools",
    onClose: function() { 
      var res = prwin.data("res");
      if (res) {
        
        // Collect all form parameters and send for registration
        var prdata = {};
        var cnt = 0;
        $(".r-field", prwin).each(function() {
          var el = $(this);
          prdata[el.attr("name")] = el.val();
          cnt++;
        });
        
        if (cnt > 0)
          window.setTimeout(function() {
            prwin.data("post_register")(prdata);
          }, 0);
      }
    }
  });
};

/**
 * Check if preview mode available and Preview button visible
 * 
 * @return {Boolean} True if preview available and False if not 
 */
OsBiPageDesigner.prototype.hasPreview = function() {
  return this.pmgr.config.has_ds &&
    this.pmgr.bs.config.preview_host !== undefined;
};

/**
 * Get extra context menu for entity
 * 
 * @return {Array} Array with extra context menu for entity 
 */
OsBiPageDesigner.prototype.getEntityContextMenu = function() {
  var app = this.pmgr.getApp();
  return app.has_preview ? app.config.prj.node_ctx_menu : undefined;
};

/**
 * Load map list for current datasource
 * 
 * @param phase_loader Pointer on phase loader
 * 
 */
function load_map_list(phase_loader) {
  var ds_sel = $("#osbitools .ds_sel").val();
  if (ds_sel === undefined) {
    //-- 112
    phase_loader.setCritStepError("load_map_list", get_client_error(112));
    return;
  }
  
  load_map_list_ex(function() {
      phase_loader.setStepCompleted("load_map_list");
    }, function(err, code) {
      phase_loader.setCritStepError("load_map_list", err);
    }, function() {
      //-- 116
      phase_loader.setCritStepError("load_map_list", get_client_error(116));
    }
  );
}

/**
 * Load extra files from list
 * 
 * @param phase_loader Pointer on phase loader
 * 
 */
function load_icon_list(prj) {
  var icon_list = prj.ex_list["icons"];
  
  // Reset icon counter
  WEB_APP.icon_cnt = 0;
  WEB_APP.icon_max_cnt = icon_list.length;
  
  // Check if any icons loaded
  if (WEB_APP.icon_max_cnt == 0)
    return;
  
  // Start async icon load
  for (var i in icon_list) {
    var name = icon_list[i];
    (function(prj, name) {
      get_ajax_ex(make_rel_req_path(WEB_APP.base.getUrlList()["EX_FILE"], 
          "src/" + prj.plist.pmgr.params.ext + "/" + prj.name + "." + name), 0, 
        function(data) {
          WEB_APP.icon_list.addIcon(name, data.base64);
          
          // Increase counter
          WEB_APP.icon_cnt++;
        },
        function() {
          // Increase counter
          WEB_APP.icon_cnt++;
        }
      );
    })(prj, name);
  }
}

/**
 * Check if all icon list loaded
 * 
 * @param phase_loader Pointer on phase loader
 * 
 */
function check_load_icon_list(phase_loader) {
  // Check if all icon list loaded
  if (WEB_APP.icon_cnt == WEB_APP.icon_max_cnt)
    phase_loader.setStepCompleted("load_icon_list");
  else
    window.setTimeout(function() {
      // Call itself with delay
      check_load_icon_list(phase_loader);
    }, 100);
};

function load_map_list_ex(on_success, on_error, on_empty) {
  var ds_url = $("#osbitools .ds_sel").val();

  var req = (WEB_APP.base.config.ds_item.url == "")
    // Internal
    ? make_rel_req_ex("maps")
    // External
    : make_abs_req(WEB_APP.base.config.ds_item.url + "maps");
      
  //-- 113
  get_ajax_ex(req, 113,
    function(data) {
      if (is_empty_array(data)) {
        if (typeof on_empty == "function")
          on_empty();
      } else {
        //-- Map list successfuly loaded --
        
        // Reset cached map_info list
        WEB_APP.map_info = {};
        WEB_APP.ds_url = ds_url;
        WEB_APP.map_list = convert_array_to_list_items(data);
        
        if (typeof on_success == "function")
          on_success();
      }
    }, 
    function(err, code) {
      if (typeof on_error == "function")
        on_error(err, code);
    }
  );
}

function convert_str_to_list_items(str) {
  var res = [];
  var list = str.split(",");
  for (var i in list) {
    var item = list[i];
    res.push(new ListItem(item, item));
  }
    
  return res;
}

function convert_array_to_list_items(list) {
  var res = [];
  if (list == undefined)
    return res;
    
  for (var i in list) {
    var item = list[i];
    res.push(new ListItem(item, item));
  }
    
  return res;
}

/**
 * Load configured widgets
 */
function load_components(phase_loader) {
  var me = WEB_APP.base;
  
  // 4 components must be loaded per each widget
  // i.e. script, html, css and icon
  WEB_APP_CFG.comp_cnt = me.ww_len * (WWG_RES_LIST.length + 1);
  
  var comp_list = WEB_APP.base.comp_list;
  
  for (var key in comp_list) {
    var items = comp_list[key];
    
    for (var i in items) {
      // Full or common widget name
      var cname = items[i];
      // Short or surname widget name
      var clst = cname.split(".");
      // var sname = clst[clst.length - 1];
      var sname = cname.replace(/\./g, "_");
      
      // Register new widget b4 start loading components
      jOsBiTools.register_wwg(cname);
      
      // Load web widget resources
      (function(sname, cname) {
        var icon = $("#osbitools .ww_icon_" + sname);
        var path = ROOT_PATH + "web_widgets/" + cname.replace(/\./g, "/") + "/";

        // script.js
        load_script_ex(path + "script.js", function(data) {
          jOsBiTools.wwg_list[cname]["script.js"] = data;
          
          // Last
          check_comp_loader_cnt(phase_loader);
        }, widget_error);
        
        // lang_set.js
        load_script_ex(path + "lang_set.js", function(data) {
          jOsBiTools.wwg_list[cname]["lang_set.js"] = data;
          
          // Last
          check_comp_loader_cnt(phase_loader);
        }, widget_error);
        
        // styles.css
        load_style_ex(path + "styles.css", function(data) {
          jOsBiTools.wwg_list[cname]["styles.css"] = data;
          
          // Last
          check_comp_loader_cnt(phase_loader);
        }, widget_error);
        
        // Load icon                                 
        icon.attr("src", path + clst[clst.length - 1] + 
                                      ".png").load(function() {
          $(this).draggable({
            helper: "clone",
            drag: function(event, ui) {
              me.DST_HANDLED = true;
              me.DST_SRC = this.src;
            },
          });
          
          // Last
          check_comp_loader_cnt(phase_loader);
        });
        
        // dep_list.txt
        _get(path + "dep_list.txt", function(data) {
          jOsBiTools.wwg_list[cname]["dep_list.txt"] = data;
          
          // Last
          check_comp_loader_cnt(phase_loader);
        }, widget_error);
        
        // Load body.html
        _get(path + "body.html", function(data) {
          jOsBiTools.wwg_list[cname]["body.html"] = data;
          
          // Last
          check_comp_loader_cnt(phase_loader);
        }, widget_error);

        function widget_error(err_msg) {
          phase_loader.setCritStepError("load_components", 
            get_client_error(106) + ". " + err_msg);
        }
      })(sname, cname);
    }
  }
}

function check_comp_loader_cnt(phase_loader) {
  WEB_APP_CFG.comp_cnt--;
  if (WEB_APP_CFG.comp_cnt == 0)
    phase_loader.setStepCompleted("load_components");
}

/**************************************************/
/***********        AbstractInput       ***********/
/**************************************************/

/**
 * Abstract Class to handle input
 * 
 */

function AbstractInput() {}
 
/** 
 * Initialize Input Control
 * 
 * @param {Object} wwg Pointer on parent Web Widget
 * @param {String} name Input name. If name == ds than it's DataSource property
 * @param {String} label Index for human readable label
 * 
 * @param {Object} params Optional parameters. Can be differ input from input. 
 *    Shared list is next:
 *    {Object} def_value Object or String that contains 
 *      default value. 
 *    {Function} on_save Save event handler (optional)
 *    {Function} on_change Change event handler (optional)
 *    {Boolean} is_required Required flag. Input elements with such flag will 
 *            have red * (asteric) symbol at the right 
 *    {String} tooltip (optional) Tooltip to show when mouse over input field
 *    {String} ds_link Pointer on property with DataSource information. This 
 *        property displays info icon at the right before required flag
 * 
 *        Abstract methods than must be implemented
 * 
 * setInputError - Mark input as error if it required but empty
 * getInputValue - Get input value for further save
 * 
 */


AbstractInput.prototype.init = function(wwg, name, label, params) {
  this.wwg = wwg;
  this.name = name;
  this.label = label;
  this.tlabel = t(this.label); // Translated label
  this.cname = name.replace(/_/g, "-");
  this.params = params !== undefined ? params : {};
  
  this.fvo = (this.params.def_value !== undefined);
  if (this.fvo)
    this.value = {def: params.def_value};

  this.is_required = this.params.is_required !== undefined && 
                                            this.params.is_required;
  // this.ds_link = this.params.ds_link !== undefined && this.params.ds_link;
  if (!is_empty(this.params.dlink))
    this.dlink = this.params.dlink;
};

/**
 * Init parameters for selection input
 * 
 * @param {Object} list Initial input array of ListItem objects
 * 
 */
AbstractInput.prototype.init_sel = function(list) {
  // Input array list
  this.lparam = list;
  
  // Flag for dynamic list
  this.flist = (typeof list == "function");
  
  this.del_empty_on_sel = this.params.del_empty_on_sel !== undefined && 
                                              this.params.del_empty_on_sel;
                                              
  this.load(list);                                            
};

/**
 * Set input value
 * 
 * @param {Object} value Input value
 * @param {Boolean} fload Flag fo load from data
 */
AbstractInput.prototype.setValue = function(value, fload) {
  if (this.fvo)
    this.value.current = value;
  else
    this.value = value;
    
  // Remember if load from data
  if (fload)
    this.setLoaded();
};

/**
 * Remember initially loaded or last successfully saved value
 */
AbstractInput.prototype.setLoaded = function() {
  this.loaded = this.value;
};

/**
 * Get <tr> element to insert into properties tab for futhure edit
 * 
 * @return <tr> jquery element 
 */
AbstractInput.prototype.getInputRow = function() {
  var fds = this.name == "ds";
  
  this.ctrl = $('<tr class="' + this.cname + ' input-wrapper">' +
    '<td>' +
      '<table class="wwg-prop-item">' +
        '<tr>' +
          '<th class="' + this.cname + '">' + 
            '<label class="prop-name ' + this.cname + '">' + 
                                      this.tlabel + ': </label>' + 
          '</th>' +
          
          '<td class="' + this.cname + '-in input-wrapper">' + 
            this.onGetInputHtml() + 
          '</td>' +
          
          (fds ?
            '<td class="info-btn"><div class="info-btn-wrapper">' + 
                '<div class="ui-icon ui-icon-info hidden"' +
                  ' title="' + t("LL_CLICK_SEE_COL_SET") + '">' + 
                '</div>' + 
                '<div class="info-win min wrapper">' + 
                   '<span class="ui-icon ui-icon-close entity-btn wrapper"' + 
                          ' title="' + t("LL_CLOSE") + '"></span>' + 
                   '<div class="info-win-ctx"></div>' +
                   '<div class="info-win-ctrl"><button>' + 
                          t("LL_REFRESH") + '</button></div>' +
                '</div></div></td>' : "") +
               
          (this.is_required ? '<td>' +
                  '<span class="required" title="' +
                          t("LL_REQUIRED_FIELD") + '">*</span></td>' : "") +
          '</td>' +
        '</tr>' +
      '</table>' + 
    '</td>' +
  '</tr>');
  
  var me = this;
  if (fds) {
    this.info_btn = $("td.info-btn div.ui-icon-info", this.ctrl);
    this.info_win = $(".info-win", this.ctrl);
    this.info_btn.on("click", function(evt) {
      me.info_win.show();
    });
    
    $(".info-win-ctrl button", this.info_win).on("click", function() {
      me.wwg.reloadInfoWin();
    });
  
    $("td.info-btn div.info-win span.ui-icon-close", 
                          this.ctrl).on("click", function() {
      $(this).parent().hide();
    });
  }
  
  this.bindCtrlEvents();
  return this.ctrl;
};

AbstractInput.prototype.fillInfoWin = function(body) {
  this.info_win.removeClass("loading");
  $(".info-win-ctx", this.info_win).empty().append(body);
  $("span.ui-icon-close", this.info_win).show();
  $("div.info-win-ctrl", this.info_win).show();
};

/**
 * Get value that will be used for calculation. If field has default value than 
 * it will be used to determine the visible value if current value is empty
 */
AbstractInput.prototype.getVisibleValue = function() {
  return this.fvo ? (this.value.current !== undefined ? 
          this.value.current : this.getDefaultValue()) : 
              (this.value !== undefined ? this.value : "");
};

/**
 * Get value that will be displayed to customer.
 */
AbstractInput.prototype.getDisplayValue = function() {
  return this.getVisibleValue();
};

/**
 * Check default value. Some input (like color) should properly format default value 
 */
AbstractInput.prototype.getDefaultValue = function() {
  // Do nothing 
  return this.value.def;
};

/**
 * Get xml
 * 
 * @param {Number} tnum Number of tabs to indent for non-minified formatting
 */
AbstractInput.prototype.getJsonData = function() {
  var value = this.getValue();
  
  return (value !== undefined) ? {
      name: this.name,
      value: value
    } : undefined;
};

/**
 * Check if field using default value
 */
AbstractInput.prototype.isDefValue = function() {
  return this.fvo && this.value.current === undefined;
};

/**
 * Check if field has default value and it's non-empty
 */
AbstractInput.prototype.hasDefValue = function() {
  return this.fvo && !is_empty(this.value.def);
};

/**
 * Check if tooltip parameter defined.
 * 
 * @return Tooltip field if it visible or empty "" instead
 */
AbstractInput.prototype.getParamTooltip = function() {
  return this.params.tooltip !== undefined ? this.params.tooltip : "";
};

/**
 * Make tooltip attribute or empty
 * 
 * @return tooltip attribute for input field.
 */
AbstractInput.prototype.getTooltip = function() {
  var res = this.getParamTooltip();
  return res == "" ? res : ' title="' + t(res) + '"';
};

/**
 * Get input value that will be saved for calclulation
 */
AbstractInput.prototype.getValue = function() {
  return this.fvo ? this.value.current : this.value;
};

AbstractInput.prototype.getValueAsString = function(value) {
  return this.convertValueToString(this.getValue());
};

AbstractInput.prototype.convertValueToString = function(value) {
  return value !== undefined ? value : "";
};

/**
 * Check input element and decide if it fill correctly and can be saved.
 * 
 * @return True if input value correct and can be saved or False otherwise
 */
AbstractInput.prototype.canSave = function() {
  var fempty = this.is_required && (is_empty(this.getInputValue()));
  if (fempty) {
    this.setInputError();
    alert(t("LL_FIELD_IS_REQUIRED").replace("[name]", 
                                "'" + t(this.label) + "'"));
  }
  
  return !fempty;
};

AbstractInput.prototype.save = function() {
  var value = this.getSavedValue();
  this.disableEdit();
  
  // Last
  if (value !== undefined && typeof this.params.on_save == "function")
    this.params.on_save(value);
    
  this.doAfterSaved();
};

AbstractInput.prototype.doAfterSaved = function() {};

AbstractInput.prototype.cancelEdit = function() {
  this.doBeforeCancelEdit();
  this.disableEdit();
  this.setInputValue(this.getVisibleValue());
};


AbstractInput.prototype.hasDataSetLink = function(lname) {
  // return this.ds_link;
  return this.dlink == lname;
};

AbstractInput.prototype.doBeforeCancelEdit = function() {};

AbstractInput.prototype.setInputValue = function() {};

/***********  AbstractInput - Select  ***********/

/**
 * load initial input set
 */
AbstractInput.prototype.load = function(list) {
  // Initiate input array of elements
  this.list = this.flist ? this.lparam() : list;
  
  // Index list
  this.lmap = {};
  for (var i in this.list) {
    var litem = this.list[i];
    this.lmap[litem.getKey()] = litem.getValue();
  }
};

/**
 * addListItem
 */
AbstractInput.prototype.addListItem = function(item) {
  this.lmap[item.getKey()] = item.getValue();
};

/**
 * This method should be embedded into each component "onchange" handler
 */
AbstractInput.prototype.onChange = function(value) {
  if (this.name == "ds")
    // Propagate DataSet change 
    this.wwg.setDataSet();
    
  // Call custom change handler
  if (typeof this.params.on_change == "function")
    this.params.on_change(value);
    
  this.wwg.setSaved(false);
};

/**
 * Reload data on input list changed
 */
AbstractInput.prototype.reload = function(list) {
  this.load(list);
  
  this.emptyItems();
  this.getListInputCtrl().append(this.getListItems());
  
  // Change flag
  this.fchanged = false;
};

AbstractInput.prototype.getListItems = function() {
  var value = this.getValue();
  
  // Flag to indicates that default value is set
  this.fset = false;
  
  var slist = "";
  
  // Check if first empty record required
  if (this.params.empty_entry !== undefined && 
      (!get_bool_val(this.params.del_empty_on_sel) ||
       (is_empty(value) || this.lmap[value] === undefined)))
    // this.sempty = '-- ' + ts(this.params.empty_entry) + ' --';
    // this.sempty_item = this.getEmptyItem();
    // slist += this.sempty_item;
    slist += this.getEmptyItem();
  
  for (var i in this.list) {
    var litem = this.list[i];
    var key = litem.getKey();
    
    var fsel = (key == value);
    this.fset = this.fset || fsel;
      
    slist += this.getListItem(litem, fsel);
  }
  
  return slist;
};

AbstractInput.prototype.onSelChange = function() {
  this.tinput.removeClass("default").removeClass("error");
      
  if (this.del_empty_on_sel && this.sempty !== undefined) {
    var fitem = this.getFirstItem();
    // Check if first option is empty and raise removed flag
    this.fremoved = (fitem.html() == this.sempty);
      
    if (this.fremoved)
      fitem.remove();
  }
  
  // Check for dataset aware input
  this.onChange();
  
  // Last
  this.fchanged = true;
};

/**
 * Set default value for new element that dynamically added to series
 * 
 * @param {Integer} idx Series index
 */
AbstractInput.prototype.setSeriesDefValue = function(idx) {
  // Do nothing
};

/**************************************************/
/***********      AbstractHtmlInput     ***********/
/**************************************************/

/**
 * Abstract Class to handle text input field from html text or select elements
 * 
 * @param {String} name Input name
 * @param {String} label Index for human readable label
 * @param {Object} value Object or String that contains 
 *    current and/or default value. If it's String than this is the only value 
 *    for input field. If it object than it contains the pair current/default 
 *    values.
 * @param {Object} params Optional parameters. Can be differ input from input. 
 *    Shared list is next:
 *    {Function} on_save Save event handler (optional)
 *    {Function} on_change Change event handler (optional)
 *    {Function} on_validation Validation before save (optional)
 *    {String} tooltip (optional) Tooltip to show when mouse over input field
 * 
 * 
 */

function AbstractHtmlInput() {}

AbstractHtmlInput.prototype = new AbstractInput();

AbstractHtmlInput.prototype.onGetInputHtml = function() {
  var cdef = this.isDefValue() ? ' default' : '';
  var value = this.getVisibleValue();
  
  return '<span class="' + this.cname + ' saved' + cdef + '">' + 
    this.getDisplayValue() + '</span>' + 
      this.getInputElement(this.cname + ' hidden' + cdef) +
        ((this.params.suffix !== undefined) ? '<span class="suffix' + 
          cdef + (is_empty(value) ? " hidden" : "") + '">' + 
            this.params.suffix + '</span>' : "");
};

AbstractHtmlInput.prototype.bindCtrlEvents = function() {
  this.tinput = $(this.getInputTagName(), this.ctrl);
  this.bindInputEvents();
};

AbstractHtmlInput.prototype.bindInputEvents = function() {};

AbstractHtmlInput.prototype.enableEdit = function() {
  $("span.saved", this.ctrl).hide();
  this.tinput.show();
  
  if (this.params.suffix !== undefined)
     $("span.suffix", this.ctrl).show();
};

AbstractHtmlInput.prototype.disableEdit = function() {
  this.tinput.hide();
  $("span.saved", this.ctrl).show();
};

AbstractHtmlInput.prototype.disable = function() {
  this.setState(false);
};

AbstractHtmlInput.prototype.enable = function() {
  this.setState(true);
};

AbstractHtmlInput.prototype.setState = function(enabled) {
  this.tinput.prop("disabled", !enabled);
};

AbstractHtmlInput.prototype.canSave = function() {
  var res = AbstractInput.prototype.canSave.call(this);
  
  if (!res)
    return false;
    
  var value = this.getInputValue();
  
  // Check if empty and not required than further validation is not required
  if (is_empty(value) && !this.is_required)
    return true;
    
  if (typeof this.params.on_validation == "function") {
    return  this.params.on_validation(value);                   
  } else {
    return this.checkCanSave(value);
  }
};

AbstractHtmlInput.prototype.checkCanSave = function(value) {
  return true;
};  

AbstractHtmlInput.prototype.getRealInputValue = function() {
  return this.tinput.val();
};

AbstractHtmlInput.prototype.getInputValue = function() {
  var value = this.getRealInputValue();
  return this.doCheckInputValue(value);
};

AbstractHtmlInput.prototype.doCheckInputValue = function(value) {
  return value;
};

AbstractHtmlInput.prototype.setInputValue = function(value) {
  this.tinput.val(value);
};

AbstractHtmlInput.prototype.getSavedValue = function() {
  var value;
  var saved = $("span.saved", this.ctrl);
  
  // Quick check for default value.
  // If still default than return undefined
  if (this.tinput.hasClass("default")) {
    if (this.fvo) {
      // Clear current field
      delete this.value.current;
      value = this.value.def;
    }
    
    saved.addClass("default");
  } else {
    value = this.getInputValue();
    this.setValue(value);
    
    saved.removeClass("default");
  }
  
  var vs = this.convertValueToString(this.getDisplayValue());
  saved.html(vs);
  
  if (this.params.suffix !== undefined) {
    if (is_empty(vs))
      $("span.suffix", this.ctrl).hide();
    else
      $("span.suffix", this.ctrl).show();
  }
  
  return value;
};

AbstractHtmlInput.prototype.setInputError = function(value) {
  this.tinput.addClass("error");
};

/**************************************************/
/***********      AbstractHtmlInput     ***********/
/**************************************************/

/**
 * Class to handle Abstract input type html element like color or number
 * Any inherited classed need overwrite next method
 *    getInputType - type of input element
 *    getChangeEvent - event which suppose to reset default flag and 
 *                                  trigger web widget "allow save" state
 * 
 * @param {String} name Input name
 * @param {String} label Index for human readable label
 * @param {Object} value Object or String that contains 
 *    current and/or default value. If it's String than this is the only value 
 *    for input field. If it object than it contains the pair current/default 
 *    values.
 * @param {Object} params Optional parameters as next:
 *    {Function} on_change Change handler (optional)
 *    {Function} on_save Save handler (optional)
 *    {String} tooltip (optional) Tooltip to show when mouse over input field 
 */

function AbstractInputType() {}

AbstractInputType.prototype = new AbstractHtmlInput();


AbstractInputType.prototype.getInputTagName = function() {
  return "input";
};

AbstractInputType.prototype.getInputElement = function(cname) {
  return '<input type="' + this.getInputType() + '" class="' + cname + '"' +
                ' value="' + this.getVisibleValue() + '"' + 
                                    this.getTooltip() + ' />';
};

AbstractInputType.prototype.bindInputEvents = function() {
  var me = this;
  
  this.ctrl.on(this.getChangeEvent(), function() {
    // Remove default class
    me.tinput.removeClass("default");
    
    // Call default change handler
    me.onChange();
  });
};

function ImageListItem(key, base64, ext, cname) {
  this.key = key;
  this.base64 = base64;
  this.init(key, '<img src="data:image/' + ext + ';base64,' + base64 + '"' + 
                        (cname !== undefined ? ' class="timg"' : "") + ' />');
}

ImageListItem.prototype = new AbstractListItem();

function ColumnItem(column) {
  this.column = column;
};

ColumnItem.prototype.getKey = function() {
  return this.column.name;
};

ColumnItem.prototype.getValue = function() {
  return this.column.name + " <" + this.column.jtype + ">";
};

ColumnItem.prototype.getColumn = function() {
  return this.column;
};
