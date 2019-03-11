/*
 * Open Source Business Intelligence Tools - http://www.osbitools.com/
 * 
 * Copyright 2014-2016 IvaLab Inc. and by respective contributors (see below).
 * 
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 * Date: 2016-03-23
 * 
 * Contributors:
 * 
 */

(function($, osbi) {
  
  var wwg = (new Function);
  
  wwg.prototype = new osbi.sys_wwg["container"]();
  
  wwg.prototype.getWrapperClassName = function() {
    return "utility-box";
  };
  
  wwg.prototype.hasHeaderIcon = function() {
    return false;
  };
  
  wwg.prototype.hasHeaderTitle = function() {
    return false;
  };
  
  // Register web widget in global array
  osbi.add_wwg_proto("com.osbitools.containers.utility", wwg);
})(jQuery, jOsBiTools);
