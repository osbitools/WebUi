/*
 * Open Source Business Intelligence Tools - http://www.osbitools.com/
 * 
 * Copyright 2014-2016 IvaLab Inc. and by respective contributors (see below).
 * 
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 * Date: 2014-10-02
 * 
 * Contributors:
 * 
 */

function DsFile() {
  // Supported File Subtypes
  this.ds_ext_set = ["group", "static", "csv", "sql"];
  
  // Version of generated DataSet Maps
  this.ds_map_version = [1,0];
}

DsFile.prototype = new Entity();

/** 
 * Load ds_map metadata into GUI
 */
DsFile.prototype.onLoadData = function() {
  var ds_data;
  var ds_type;

  var ds_map = this.data.entity;
  
  // Apply xml escape because previous escape characters
  //      are removed during xml->json transformations
  this.page_props.descr.value = ds_map.descr;
  
  // Find ds map type
  for (var i in this.ds_ext_set) {
    var dst = this.ds_ext_set[i];
    var dsd = ds_map[dst + "_data"];
    if (dsd !== undefined) {
      ds_data = dsd;
      ds_type = dst;
      break;
    }
  }
  
  if (ds_data === undefined) {
    //-- 46
    show_client_error_ex(46, ts("LL_ERROR_INVALID_DATA"));
    this.onLoadError();
    return false;
  }

  // Load request parameters b4 dataset load
  // BUG dynamic request parameter load is not supported
  if (ds_map.req_params !== undefined)
    for (var i in ds_map.req_params.param)
      this.addReqParamRecord(ds_map.req_params.param[i]);
  
  this.onBodyInit(ds_type + ".png");
  return this.ds_ext.onLoadData(ds_map, ds_data);
};

DsFile.prototype.onSaveValidation = function() {
  return this.ds_ext.ds_spec.testConfig();
};

DsFile.prototype.getSaveData = function() {
  // Check if some Extra Columns not saved
  var ex_col_box;
  var ex_col_cnt = 0;
  $("#ex_column_list button.save-ex-col:visible").each(function() {
    ex_col_cnt++;
    ex_col_box = $(this);
  });
  
  if (ex_col_cnt != 0) {
    //-- 40
    show_client_error(40, ex_col_box);
    return;
  }
  
  // DataSet Map for save
  var  ds_map = {
    ver_max: this.ds_map_version[0],
    ver_min: this.ds_map_version[1],
  };
  
  if (this.page_props.descr.value !== undefined)
  // Description already double quoted
    ds_map["descr"] = this.page_props.descr.value;
    
  // Get DsExt xml
  for (var i in this.ds_ext.colpp)
      this.ds_ext.colpp[i].setDataSetMap(ds_map);
  
  // Set Request Parameters (if any)
  this.setReqParam(ds_map);
 
  // DataSetSpec
  this.ds_ext.ds_spec.setDataSetMap(ds_map);
  
  return ds_map;
};

DsFile.prototype.doAfterAddReqParamRecord = function(param) {
  var ds_ext = this.ds_ext;
  if (ds_ext !== undefined && ds_ext.hasData())
    // Populate changes over the tree
    ds_ext.getDataSetSpec().addReqParam(param);
       
  if (ds_ext !== undefined && ds_ext.hasData())
    this.clearSaved();
};

DsFile.prototype.onBodyInit = function(src) {
  this.ds_ext = new DataSetExt(this, this.body_ctx, src);
  this.ds_ext.show();

  // Can't be saved until dataset configuration changed.
  return false;
};

DsFile.prototype.doAfterDelReqParamRecord = function(name) {
  var ds_ext = this.ds_ext;
  if (ds_ext !== undefined && ds_ext.hasData()) {
    // Populate changes over the tree
    
    ds_ext.getDataSetSpec().delReqParam(name);
    this.clearSaved();
  }
};

DsFile.prototype.getPreviewApiName = function() {
  return "ds";
};

DsFile.prototype.onPreview = function(ds_src, qparams, name, params, wparams) {
  var req;
  
  // Check if url embedded or external
  if (ds_src == "")
    // Embedded
    req = make_rel_req_ex(this.getPreviewApiName(), this.dname, qparams);
  else {
    // External
    req = make_abs_req_query(ds_src + this.getPreviewApiName() +
                                        "/" + this.dname, qparams);
  }
    
  // Get current window coordinates & size
  window.open(jOsBiTools.get_redirect_url(req), name + " preview",
      wparams + ',menubar=no,location=yes,resizable=yes,' + 
                          'scrollbars=yes,status=yes', false);
};
