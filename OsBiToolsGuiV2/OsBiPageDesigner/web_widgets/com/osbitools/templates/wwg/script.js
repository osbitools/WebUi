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
  
  // TODO Find proper class to inherit from
  wwg.prototype = new osbi.sys_wwg["chart"]();
  
  wwg.prototype.init = function() {
    // Call ancestor init
    osbi.sys_wwg[this.sys_name].prototype.init.call(this);
    
    // Temporarily disable export to android
    // This line needs to be removed after given chart implemented 
    // in OsBiTools Android Demo application
    this.no_export_android = true;
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
      
    // TODO Add implementation
  };

  // Register web widget in global array
  /* TODO Same name should be used in public.config
    Name & Description should be added into lang_set.js file
    for example LL_COMPONENT_CLASS_NAME_NAME and LL_COMPONENT_CLASS_NAME_DESCR
  */
  osbi.add_wwg_proto("component.class.name", wwg);
})(jQuery, jOsBiTools);
