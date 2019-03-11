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
  loading: "LL_PAGE_LOADING",
  scripts: ["test_file.js", "lang_set.js"],
  
  phase_loader: new PhaseLoader([], {
    on_completed: function() {
      // Do whatever required
    }
  }),
  
  cfg_keys: ["prj_test_name"],
  prj: {
    // LIST OF MANDATORY PARAMETERS START
    
    // Single Supported extension (subdirectory)
    ext: "dat",
    
    // File extension
    base_ext: "txt",
    
    // Class name of Project Entity
    ftype: "TestFile",
    
    // Name of module
    qname: "DemoProject"
    
    // LIST OF MANDATORY PARAMETERS END
  }
};

/**
 * Module constructor
 * 
 * @param {Object} pmgr Pointer on ProjectManager parent object
 */
function OsBiDemoProject(pmgr) {
  this.pmgr = pmgr;
}

/**
 * Invoked from Phase Loader on_completed callback
 */
OsBiDemoProject.prototype.init = function() {
  this.pmgr.showProjectList();
};

/**
 * Check if preview mode available and Preview button visible
 * 
 * @return {Boolean} True if preview available and False if not 
 */
OsBiDemoProject.prototype.hasPreview = function() {
  return true;
};

/**
 * Get extra context menu for entity
 * 
 * @return {Array with context menu} Array with extra context menu for entity 
 */
OsBiDemoProject.prototype.getEntityContextMenu = function() {
  return;
};
