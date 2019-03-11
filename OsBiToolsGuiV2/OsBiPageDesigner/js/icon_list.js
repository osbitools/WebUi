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


// Default icon. Added if gear.png icon not 
//                present in [icons] folder of web services
var GEAR_ICON = 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAGXRFWHRTb2Z0' +
  'd2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAASZQTFRFAAAAAQEBAwMDBAQEERERFhYWHh4eOT' +
  'k5R0dHSkpKTExMUVFRUlJS////AAAAAAAAAAAAAAAAAAAAAAAAAAAAUFBQPz8/HR0dBwcHAAAA' +
  'AAAAAAAAVFRUUFBQS0tLODg4JSUlERERCQkJBQUFVFRUUVFRTExMR0dHOTk5MjIyKysrYWFhJC' +
  'QkMzM2U1NTFhYWMDAyEBAQCwsLLS0uBwcHMjIzdnZ2JycpLCwsQkJFsrK8pqaltLS0oaGgk5OU' +
  'lJSbsbG6u7u7vb3Dv7++wsLMxMTExsbMxsbQxsbTx8fGysrUy8vKy8vYzMzLz8/U0NDP0dHQ0t' +
  'LS09PW09Pi1NTT19fn2dnk3Nzc3t7d4ODg4uLh5OTk5eXk5ubl6Oj36urq9fX1+vr67Z+2FwAA' +
  'AEB0Uk5TAAAAAAAAAAAAAAAAAAACBAwWFxgaGxwgIistMzk6Oz9FSUpfZ2lrbXN2eXp8fX6Cgo' +
  'WHh4mMkJGVpM/X29zf4HjDk0QAAADgSURBVBgZVcE/T4NAHAbg93d3cFi5VlpKxKGJSTcn1yZ+' +
  '/9HduEiixohADikH3B8Hpz4PKVwSsEQUsgSmpRCC4NLTLnPq6fDp9tEIxoC8PBVkHRWnMge4dP' +
  'lDe79sgj12Zd1xLl0Y82lHUIa/1IZzuV87Wr83bb/57q+SUWB1PMfOPOPRpfHqtREg4y25AEfW' +
  'GwKX0XyO4+WmSJPh53cYSU3ZIbN5AlOLtmqlQLjdTuLrGkM0b+cGDEHrtNfe6z7VOkDAVjR93C' +
  'lPb0tXOZBiXDIkGVqDMFlPihhx/PPehz9KgW0gNT+UwAAAAABJRU5ErkJggg==';

function IconList() {
  // Icon object array
  this.list = [];
  
  // Indexed map
  this.map = {};
  
  // Add static pre-defined icons
  this.addIcon("gear.png", GEAR_ICON); 
  
  // List of permitted extensions
  this.exts = "png,jpeg,gif";
  this.extl = this.exts.split(",");
}

/**
 * Set pointer on visual list
 */
IconList.prototype.setIconListCtrl = function(ctrl) {
  this.ilist = ctrl;
};

IconList.prototype.getIconImg = function(name) {
  var res = this.map[name];
  return (res !== undefined) ? res.getValue() : EMPTY_ICON;
};

IconList.prototype.getList = function() {
  return this.list;
};

IconList.prototype.addIcon = function(name, base64) {
  // Extract file extension
  var ext = name.substr(name.lastIndexOf(".") + 1);
  
  var item = new ImageListItem(name, base64, ext, "timg"); 
  
  this.list.push(item);
  this.map[name] = item;
  
  return item;
};

IconList.prototype.getItems = function() {
  return this.list;
};

/*******************************************************/
/**            FILE UPLOAD CALLBACKS                  **/
/*******************************************************/

IconList.prototype.onUploadFileSuccess = function(fname, data) {
  // Add new icon into map & list
  var icon = this.addIcon(fname, data.base64);
    
  // Apppend icon at the end of list and call
  this.ilist.appendListItem(icon);
};

IconList.prototype.onUploadFileError = function(jqXHR, msg, error) {
  //-- 104
  show_ajax_error(104, jqXHR, msg, error);
};

IconList.prototype.onUploadFileServerError = function(error) {
  show_server_error(error);
};

/**
 * Validate file name for image extension.
 * 
 * @name {String} Input file name
 * @return {String} file name  
 *          or undefined if file name is wrong
 * 
 */ 
IconList.prototype.onUploadFileSelected = function(name) {
  
  var ext_err = ts("LL_FILE_WITH_EXT_REQUIRED").
                                            replace("[ext]", this.exts);
                                            
  
  var pos = name.lastIndexOf(".");
  if (pos == -1) {
    alert(ext_err);
    return;
  }
  
  if ($.inArray(name.substr(pos + 1), this.extl) == -1) {
    alert(ext_err);
    return;
  }  
  
  if (this.map[name] !== undefined) {
    alert(ts("LL_ICON_NAME_EXISTS").
                replace("[icon_name]", name));
    return;
  }
   
  return name;
};

IconList.prototype.getUploadFileUrl = function(fname) {
  return BASE_URL + WEB_APP.base.URL_LIST.EX_FILE + 
      WEB_APP.base.plist.getProject().getName() + "." + fname + "&dname=icons";
};

IconList.prototype.b4UploadFile = function(fname) {
  return true;
};
