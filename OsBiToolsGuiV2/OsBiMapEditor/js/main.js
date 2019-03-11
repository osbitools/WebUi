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

/**************************************************/
/***********    MANDATORY PARAMETERS    ***********/
/**************************************************/

// WEB_APP parameters
var WEB_APP_CFG = {
  base: "prj",
  security: true,
  version: [1,0,0],
  ws_ver: [2,0],
  title: "LL_TOOL_TITLE",
  loading: "LL_PAGE_LOADING",
  scripts: ["lang_set.js", "ds_file.js", "data_set.js", "ds_ext_proc.js"],
  
  cfg_keys: ["ds_src"],
  err_list: {
    // 100 to 150 entries reserved to Map Editor
    150: "LL_ERROR_CSV_FILE_UPLOAD"
  },
  prj: {
    // Single Supported extension (subdirectory)
    ext: "csv",
    
    // File extension
    base_ext: "xml",
    
    // Class name of Project Entity
    ftype: "DsFile",
    
    // Name of module
    qname: "MapEditor"
  }
};

/**
 * Module constructor
 * 
 * @param {Object} pmgr Pointer on ProjectManager parent object
 */
function OsBiMapEditor(pmgr) {
  this.pmgr = pmgr;
}
                    
/**
 * Invoked from Phase Loader on_completed callback
 */
OsBiMapEditor.prototype.init = function() {
  var ds_val = "";
  var ds_sel = $("#osbitools .ds_sel");
  var parent = ds_sel.parent();
  
  if (this.pmgr.config.has_ds)
    // Take the selected ds_src item id
    ds_val = this.pmgr.config.ds_item.id;
  
  // Replace ds_sel with static text input
  ds_sel.remove();
  parent.append('<input class="ds_sel" value="' + 
                                              ds_val  + '" disabled' + "/>");
                                              
  this.pmgr.showProjectList();
};

/**
 * Check if preview mode available and Preview button visible
 * 
 * @return {Boolean} True if preview available and False if not 
 */
OsBiMapEditor.prototype.hasPreview = function() {
  return this.pmgr.config.has_ds;
};

