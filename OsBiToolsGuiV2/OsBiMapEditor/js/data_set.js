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

/******************************************************************************/
/**                         DataSetExt                                       **/
/******************************************************************************/

function DataSetExt(entity, container, src, group) {
  // Parent group
  this.group = group;
  
  // Parent entity
  this.entity = entity;
  
  // For now only support csv
  this.ex_list = {
    "csv": []
  };
  
  // Get datestamp for dataset extension
  this.dts = new Date().getTime();
  
  // Parent div
  this.container = container;
  
  var fname = src.substr(src.lastIndexOf("/") + 1);
  
  var name = fname.substr(0, fname.length - 4);
  var is_grp = name == "group";
  
  var ftype = uc_first_char(name) + "Data";
  
  // Check if type defined
  if (window[ftype] === undefined) {
    //-- 19
    show_client_err(19);
    return;
  }
  
  // Instantinate DataSetSpec
  this.ds_spec = new window[ftype](this);
  
  this.cused = false;
  
  this.colpp = [
    new DsFilterProc(this, {
    	container: "filter"
    }),
    new ExColumnProc(this, {
      container: "ex-col"
    }),
    new LangMapProc(this, {
      container: "lang"
    }),
    new SortByProc(this, {
    	container: "sort-by"
    })
  ];
  
  if (is_grp)
    this.colpp.push(new ColumnListProc(this, {container: "col-lst"}));
    
  // Remember reference on ExColProc
  this.ex_colp_ref = this.colpp[2]; 
};

DataSetExt.prototype.getType = function() {
  return ds_spec.getType();
};

DataSetExt.prototype.isGroup = function() {
  return this.getType() == "group";
};

DataSetExt.prototype.isChild = function() {
  return this.group !== undefined;
};

DataSetExt.prototype.getColumnList = function() {
  return this.ds_spec.columns;
};

DataSetExt.prototype.getColumnMap = function() {
  return this.ds_spec.map;
};

DataSetExt.prototype.getDataSetSpec = function() {
	return this.ds_spec;
};

DataSetExt.prototype.hasData = function() {
  return this.ds_spec.hasData();
};

DataSetExt.prototype.getType = function() {
  return this.ds_spec.getType();
};

DataSetExt.prototype.show = function() {
  var fgrp = this.group !== undefined;
  
  if (fgrp) {
    this.container
      .removeClass("ds-ext-empty")
      .addClass("ds-ext-assigned")
      .removeClass("dotted-border-ready")
      .addClass("wrapper");
  }
  
  this.ds_ext = this.container;
  this.ds_ext.removeClass("ds-data-empty");
  
  if (!fgrp)
    this.entity.setTitle(this.ds_spec.name + 
                ' ' + t("LL_DATA_SET"));
    
  this.ds_ext.html((fgrp ? '<span class="title wrapper">' + 
    this.ds_spec.name + ' ' + t("LL_DATA_SET") + '</span>' + 
    '<span class="ui-icon ui-icon-close wrapper ds-ext-btn" title="' + 
                    t("LL_CLOSE") + '"></span>' +
    '<span class="ui-icon ui-icon-triangle-1-s ' + 
        'wrapper ds-ext-btn toggle" title="' + 
                    t("LL_MINIMIZE") + '"></span>' : "") +
    '<table class="ds-ext-wrapper">' + 
      '<tr>' + 
        '<td>' +
          '<div class="wrapper-ctrl">' +
            '<div class="ctrl">' +
              '<span>' + 
                  t("LL_GENERAL_DS_CONFIG") + '</span>' +
              '<span class="ctrl-toggle rfloat ui-icon ui-icon-triangle-1-n"' +
                ' onclick="javascript:toggle_wrapper_ctrl(this)"></span>' +
            '</div>' +
            '<table class="ds-ext-cfg">' +
              '<tr>' +
                '<th><label>' + 
                      t("LL_EX_FILTER") + '</label></th>' +
                '<th><label>' + 
                      t("LL_EX_LANGUAGE_COLUMNS") + '</label></th>' +
                '<th><label>' + 
                      t("LL_EX_EXTRA_COLUMNS") + '</label></th>' +
                '<th><label>' + 
                      t("LL_EX_SORT_BY") + '</label></th>' +
                (this.isGroup() ? '<th><label class="not-active">' + 
                      t("LL_EX_ALL_COLUMNS") + '</label></th>' : "") +
              '</tr>' +
              '<tr>' +
                
                // Filter
                '<td class="filter-group">' +
                  '<textarea class="filter"></textarea>' +
                '</td>' +
                
                // Language Maps
                '<td class="lang-group">' +
                  '<table class="sub-ext-cfg">' +
                    '<tbody class="lang-map"></tbody>' +
                    '<tbody class="lang-lst">' +
                      '<tr>' +
                        '<td>' +
                          '<select class="col-list"></select>' +
                        '</td>' +
                        '<td>' +
                          '<button class="add-selected" disabled>' + 
                                      t("LL_ADD") + '</button>' +
                        '</td>' +
                      '</tr>' +
                    '</tbody>' +
                  '</table>' +
                '</td>' +
                
                // Extra Columns
                '<td class="ex-col-group">' +
                  '<table class="sub-ext-cfg">' +
                    '<tbody class="ex-col-map"></tbody>' +
                    '<tbody class="ex-col-lst">' +
                      '<tr>' +
                        '<td class="ex-column-ctrl">' +
                          '<select class="ex-col-sel">' +
                            '<option value="auto_inc">' + 
                              t("LL_EX_COL_AUTO_INC") + '</option>' +
                            '<option value="calc">' + 
                              t("LL_EX_COL_CALC") + '</option>' +
                          '</select>' +
                          '<button class="add-selected" disabled>' + 
                              t("LL_ADD") + '</button>' +
                        '</td>' +
                      '</tr>' +
                    '</tbody>' +
                  '</table>' +
                '</td>' +
                
                // Sort By
                '<td class="sort-by-group">' +
                  '<table class="sub-ext-cfg">' +
                    '<tbody class="sort-by-map"></tbody>' +
                    '<tbody class="sort-by-lst">' +
                      '<tr>' +
                        '<td>' +
                          '<select class="col-list"></select>' +
                          '<button class="add-selected" disabled>' + 
                                t("LL_ADD") + '</button>' +
                        '</td>' +
                      '</tr>' +
                    '</tbody>' +
                  '</table>' +
                '</td>' +
                
                // Column list
                (this.isGroup() ? 
                  '<td class="col-lst-group">' +
                    '<table class="sub-ext-cfg">' +
                      '<tbody class="col-lst-lst">' +
                        '<tr>' +
                          '<td>' +
                            '<select class="col-list not-active"></select>' +
                          '</td>' +
                        '</tr>' +
                      '</tbody>' +
                    '</table>' +
                  '</td>' : "") +
                
              '</tr>' +
            '</table>' +
          '</div>' +
          
          '<div class="wrapper-ctrl ds-spec-wrapper">' +
            '<div class="ctrl">' +
              '<span>' + this.ds_spec.name + ' ' + 
                          t("LL_DS_CONFIG") + '</span>' +
              '<span class="ctrl-toggle rfloat ui-icon ui-icon-triangle-1-n"' +
                ' onclick="javascript:toggle_wrapper_ctrl(this)"></span>' +
            '</div>' +    
            '<div class="ds-spec" dts="' + this.dts + '"></div>' +
          '</div>' +
        '</td>' +
      '</tr>' + 
    '</table>');
  
  this.ds_ext_wrap = $("table.ds-ext-wrapper", this.ds_ext);
  var ds_spec = $("div.ds-spec", this.ds_ext);
  
  if (fgrp) {
    var me = this;
    $("span.ui-icon-close", this.container).on("click", function() {
      if (!window.confirm(t("LL_PLEASE_CONFIRM")))
        return;
        
      me.close();
      me.entity.setSaved();
    });
    
    $("span.toggle", this.container).on("click", function() {
      me.toggle(this);
    });
  }
  
  // Init containers for colpp
  var ds_cfg = $("table.ds-ext-cfg", this.ds_ext);
  for (var i in this.colpp)
    this.colpp[i].initContainer(ds_cfg);
    
  this.ds_spec.show(ds_spec);
};

DataSetExt.prototype.close = function() {
  if (!this.isChild())
    return;
  
  /*
  if (!this.isChild()) {
    // Empty container
    this.ds_ext.html(t("NEW_ENTITY_BODY_MSG"));
      
    this.container
      .removeClass("ds-ext-assigned")
      .removeClass("wrapper")
      .addClass("ds-ext-empty")
      .addClass("dotted-border");
    
    this.ds_ext.addClass("ds-data-empty");
    
    this.container.prop("handled", false);
  } else {
    // Remove from the group
    this.ds_ext.parent().remove();
  }
  
  if (this.isChild())
    this.group.delDataSetExt(this);
  */
 
  // Empty container
  this.ds_ext.remove();
  this.group.delDataSetExt(this);
};

DataSetExt.prototype.toggle = function(btn) {
  var h = $(btn);

  if (h.hasClass("ui-icon-triangle-1-s")) {
    this.ds_ext_wrap.hide();
    
    h.removeClass("ui-icon-triangle-1-s");
    h.addClass("ui-icon-triangle-1-n");
    h.attr("title", ts("LL_MAXIMIZE"));
  } else {
    this.ds_ext_wrap.show();
    
    h.removeClass("ui-icon-triangle-1-n");
    h.addClass("ui-icon-triangle-1-s");
    h.attr("title", ts("LL_MINIMIZE"));
  }
};

DataSetExt.prototype.setDataSetMap = function(ds_map) {
  for (var i in this.colpp)
      this.colpp[i].setDataSetMap(ds_map);
  
  return this.ds_spec.setDataSetMap(ds_map);
};

DataSetExt.prototype.isColListUsed = function() {
  return this.cused;
};

DataSetExt.prototype.onLoadData = function(mdata, tdata) {
  // First load columns
  if (tdata.columns !== undefined)
    this.ds_spec.getColListSuccess(tdata.columns.column, false);
    
  // Load dataset configuration
  if (!this.ds_spec.onLoadData(tdata))
    return false;
  
  // And last load column post processor
  for (var i in this.colpp) {
    var colpp = this.colpp[i];
    var d = mdata[colpp.getXmlTag()];
    
    if (d !== undefined)
      colpp.onLoadData(d);
  }
  
  return true;
};

DataSetExt.prototype.redrawAllColumns = function() {
  for (var i in this.colpp) {
    var colpp = this.colpp[i];
    if (!colpp.acceptDsColumns())
      continue;
    
    colpp.redraw("ds");
  }
  
  if (this.isChild())
    this.group.getDataSetExt().redrawAllColumns();

};

DataSetExt.prototype.setColListUsed = function(enabled) {
  this.cused = enabled;
};

DataSetExt.prototype.getEntity = function() {
  return this.entity;
};

DataSetExt.prototype.getProject = function() {
  return this.entity.getProject();
};

/******************************************************************************/
/**                             DataSetSpec                                  **/
/******************************************************************************/

function DataSetSpec(ds_ext) {
  if (ds_ext === undefined)
    return;
  
  this.map = {};
  this.columns = [];
  this.ds_ext = ds_ext;
  this.cnt_map = {ds: 0, ex: 0};
  this.focusInput = "select.jtype";
  
  this.fev = true;
  this.allowColAdd = false;
  this.allowColDel = false;
  this.allowColEdit = {
    ds: false,
    ex: false
  };
  
  this.allowColNameChange = false;
  this.allowColJavaTypeChange = false;
  
  this.name = uc_first_char(this.getType());
  
  // Prefix for custom parameters
  this.paramPrefix = "osbi_";
};

DataSetSpec.prototype.changeColJavaTypeSelf = function(name, jtype) {
  var column = this.changeColJavaTypeEx(name, jtype);
  $("span.jtype", column.xrow).html(jtype);
};

DataSetSpec.prototype.allowColumnAdd = function() {
  this.allowColAdd = true;
};

DataSetSpec.prototype.allowAllColumnEdit = function() {
  for (ex_type in this.allowColEdit)
    this.allowColEdit[ex_type] = true;
};

DataSetSpec.prototype.allowColumnEdit = function(ex_type) {
  this.allowColEdit[ex_type] = true;
};

DataSetSpec.prototype.allowColumnDel = function() {
  this.allowColDel = true;
};

DataSetSpec.prototype.allowColumnNameChange = function() {
  this.allowColNameChange = true;
};

DataSetSpec.prototype.allowColumnJavaTypeChange = function() {
  this.allowColJavaTypeChange = true;
};

DataSetSpec.prototype.removeErrorVal = function() {
  this.fev = false;
};

DataSetSpec.prototype.isAllowColumnAdd = function() {
  return this.allowColAdd;
};

DataSetSpec.prototype.isAllowColumnDel = function() {
  return this.allowColDel;
};

DataSetSpec.prototype.isAllowColumnEdit = function(ex_type) {
  return this.allowColEdit[ex_type];
};

DataSetSpec.prototype.isAllowColumnNameChange = function() {
  return this.allowColNameChange;
};

DataSetSpec.prototype.addReqParam = function(param) {};

DataSetSpec.prototype.onChangeReqParam = function(param) {};

DataSetSpec.prototype.onDeleteReqParam = function(param) {};

DataSetSpec.prototype.isAllowColumnJavaTypeChange = function() {
  return this.allowColJavaTypeChange;
};

DataSetSpec.prototype.hasData = function() {
  // By default no data configure for new DataSet
  return false;
};

DataSetSpec.prototype.isChild = function() {
  return this.ds_ext.isChild();
};

DataSetSpec.prototype.hasErrorVal = function() {
  return this.fev;
};

DataSetSpec.prototype.getUrlList = function() {
  return this.ds_ext.entity.getUrlList();
};

DataSetSpec.prototype.getDataTagName = function() {
  return this.getType() + "_data";
};

DataSetSpec.prototype.setDataSetData = function(ds_data) {
  // By default do nothing
};

DataSetSpec.prototype.getConfigPanel = function() {
  return "";
};

DataSetSpec.prototype.getDataPanel = function() {
  return "";
};

DataSetSpec.prototype.setDataSetMap = function(ds_map) {
  var ds_data = {};
  this.setDataSetData(ds_data);
  this.setColumns(ds_data);
  
  ds_map[this.getType() + "_data"] = ds_data;
};

DataSetSpec.prototype.setColumns = function(ds_data) {
  var columns = [];
  
  for (var i in this.columns) {
    var column = this.columns[i];
    
    // Only process ds ex_type
    if (column.ex_type != "ds")
      continue;

    var value = {
      name: column.name,
      java_type: column.java_type

    };
    
    if (this.hasErrorVal() && column.on_error !== undefined)
      value["on_error"] = column.on_error;

    columns.push(value);
  }
 
  if (columns.length > 0)
    ds_data["columns"] = {
      column: columns
    };
};

DataSetSpec.prototype.getColSet = function(btnName) {
  var cnum = this.hasErrorVal() ? 4 : 3;
  return '<table class="col-list"><thead>' + 
    '<tr class="header1">' + 
      '<th colspan="' + cnum + '"><label class="bold">' +
          t("LL_EX_COLUMNS") + '</label></th>' + 
    '</tr>' + 
    '<tr class="header2">' + 
      '<th><span class="ll_column">' + 
        t("LL_EX_NAME") + '</span></th>' + 
      '<th><span class="ll_value">' + 
        t("LL_JAVA_TYPE") + '</span></th>' +
      (this.hasErrorVal() ?
       '<th><span class="ll_value">' + 
        t("LL_RESULT_ON_ERROR") + '</span></th>' : "") + 
      '<th><span class="ll_action">' + 
        t("LL_ACTION") + '</span></th>' + 
    '</tr></thead>' + 
    '<tbody class="col-list ds"></tbody>' + 
    '<tbody class="col-list ex"></tbody>' + 
    '<tbody class="col-list-ctrl"><tr><td colspan="' + cnum + '">' + 
    '<div class="ctrl-btn-wrapper">' + 
      '<button idx="0" class="col-list-ctrl" disabled>' + btnName + '</button>' + 
    '</div></td></tr></tbody>' + 
  '</table>';
};

DataSetSpec.prototype.testConfig = function() {
  var ds_ext = this.getDataSetExt();
  for (var i in ds_ext.colpp) {
    if (ds_ext.colpp[i].acceptDsColumns() &&
          !ds_ext.colpp[i].testConfig())
      return false;
  }
  
  // Check if all column saved
  var res = true;
  $("table.col-list button.save", this.parent).each(function() {
    if ($(this).is(":visible")) {
      $(this).parent().parent().addClass("error");
      res = false;
    }
  });
  
  if (!res) {
    //-- 25
    show_client_error(25);
    return false;
  }
    
  return this.testSpecConfig();
};

DataSetSpec.prototype.testSpecConfig = function() {
  return true;
};

DataSetSpec.prototype.getDataSetExt = function() {
  return this.ds_ext;
};

DataSetSpec.prototype.getColumnValidationByJavaType = function(jtype) {
  var rule = get_jtype_rule(jtype);
  return {validation: rule.validation === undefined ? 
          ((rule.regex === undefined) ? "" : rule.regex) : rule.validation,
    check: rule.check
  };
};

DataSetSpec.prototype.getInputClassByJavaType = function(jtype) {
  var rule = get_jtype_rule(jtype);
  
  return rule.class;
};

DataSetSpec.prototype.getColRow = function(column, idx) {
  // No row configuration for groups
  if (this.getType() == "group")
    return "";
    
  var me = this;
  
  var name = "";
  
  var cval = {
    value : "",
    cname : "type-str"
  };
  
  var fx = true;
  var jtype = "";
  var fc = (column !== undefined);
  var fed = (!fc || this.isAllowColumnEdit(column.ex_type));
  
  if (fc) {
    var name = column.name;
    jtype = column.java_type;
    
    fx = (column.ex_type == "ds");
    var cval = get_err_def_val(jtype);
    if (column.on_error !== undefined)
      cval.value = column.on_error;
  }
  
  var row = $('<tr>' + 
    // Column Name
    '<td class="name">' + ((this.isAllowColumnNameChange() && fx) ? 
        '<input class="name hidden" value="' + name + '" />' : "") + 
        '<span class="name">' + name + '</span></td>' + 
            
    // Java Type
    '<td class="jtype">' + ((this.isAllowColumnJavaTypeChange() && fx) ? 
      '<select class="jtype hidden">' + 
          ((jtype == "") ? '<option value=""></option>' : "") + 
                                 JTYPE_OPTS + '</select>' : "") + 
      '<span class="jtype">' + jtype + '</span></td>' +
        
    // Error Value
    ((this.hasErrorVal()) ? 
    '<td class="err-val">' + 
      '<input type="text" class="' + cval.cname + ' err-val hidden" />' + 
      '<select class="' + cval.cname + 
          ' err-val hidden">' + get_bool_sel(false) + '</select>' + 
      '<span class="err-val">' + cval.value + '</span></td>' : "") + 
      
    // Control Buttons
    '<td class="col-ctrl">' + 
      (fed ? 
        (this.isAllowColumnDel() ? '<span class="ui-icon ui-icon-trash"' + 
            ' title="' + t("LL_DELETE") + '"></span>' : "") + 
        '<span class="ui-icon ui-icon-pencil"' + 
            ' title="' + t("LL_EDIT") + '"></span>' + 
        '<button class="save hidden">' + t("LL_SAVE") + '</button>' + 
        '<button class="cancel hidden">' + t("LL_CANCEL") + '</button>' : 
      "") + '</td></tr>');
  
  if (this.hasErrorVal()) {
    var def_val = get_err_def_val(jtype);
    var err_fields = $("td.err-val", row);
    var err_fd = $("span", err_fields);
    
    var fb = (jtype == JTYPE_BOOL);
    
    var err_field = fb ? $("select", err_fields) : $("input", err_fields);
  
    err_field.val(cval.value);
    var fd = (def_val.value == cval.value);
    err_fields.data("is_default", fd);
    err_fields.data("err_val", cval.value);
    
    if (fd) {
      err_field.addClass("default");
      err_fd.addClass("default");
    }
    
    if (!fb)
      add_filtered_handler($("td.err-val", row), 
                    "default", get_jtype_regex(jtype));
  }
  
  var me = this;
  if (this.isAllowColumnJavaTypeChange() && fx) {
    var sel = $("select.jtype", row);
    sel.data("old_val", jtype);
    
    sel.on("change", function() {
      me.onJavaTypeChanged($(this), row);
    });
  }
  
  if (column !== undefined) 
            column.xrow = row;
  
  if (fed) {
    $('span.ui-icon-pencil', row).click(function() {
      me.editColumn(me.getColumnName(this));
    });
    
    $("button.save", row).click(function() {
      me.saveColumn(me.getColumnName(this));
    });
    
    $("button.cancel", row).click(function() {
      me.cancelColumn(me.getColumnName(this));
    });
  }
  
  if (this.isAllowColumnDel()) {
    $('span.ui-icon-trash', row).click(function() {
      if (!window.confirm(me.getColumnDelWarning()))
        return;
      me.delColumn(me.getColumnName(this));
    });
  }
  
  return row;
};

DataSetSpec.prototype.onJavaTypeChanged = function(sel, row) {
  var jtype = sel.val();
  var old_jtype = sel.data("old_val");
  
  var perr = $("input.err-val", row);
  var serr = $("select.err-val", row);
  
  // Clear previous errors
  perr.removeClass("error");
  serr.removeClass("error");
  var fo = (jtype == old_jtype);
  var val = (!fo) ? get_err_def_val(jtype).value : sel.data("err_val");
  var fd = (!fo) ? true : sel.data("is_default");
    
  if (jtype == JTYPE_BOOL) {
      perr.hide();
      serr.show();
      
      serr.val(val);
  } else {
    perr.show();
    serr.hide();
      
    if (fd) {
      if (!perr.hasClass("default"))
        perr.addClass("default");
    } else {
      perr.removeClass("default");
    }
      
    perr.val(val);
    remove_filtered_handle(row, "default");
    var title = get_jtype_info(jtype);
      
    perr.prop("title", title);
      
    if (fd)
      add_filtered_handler(row, "default", get_jtype_regex(jtype));
  }
};

DataSetSpec.prototype.onLoadData = function(data) {};
  
DataSetSpec.prototype.getColumnDelWarning = function() {
  return ts("LL_PLEASE_CONFIRM");
};

DataSetSpec.prototype.getColumnName = function(el) {
  var column;
  // span.name for new column is empty
  var cname = $("span.name", $(el).parent().parent()).html();
  if (cname != "")
    column = this.map[cname];
    
  return column;
};

DataSetSpec.prototype.appendColumn = function(column) {
  var fexists = (column.xrow !== undefined);
  
  if (!this.appendColumnEx(column))
    return;
  
  var dse = this.getDataSetExt();
  for (var i in dse.colpp) {
    var colpp = dse.colpp[i];
    if (!colpp.acceptDsColumns())
      continue;
    
    var c = colpp.appendColumn(column);
    if (fexists)
      colpp.showColumn(column);
  }
};

DataSetSpec.prototype.appendColumnEx = function(column) {
  if (column.ex_type == "ds" &&
      this.columns.length > 0 && 
        this.columns[this.columns.length - 1].ex_type != "ds") {
    // Find position of last column with "ds" type
    for (var i = this.columns.length - 2; i >= 0; i--) {
      idx = i;
      if (this.columns[i].ex_type == "ds") {
        idx++;
        this.addColumnAt(column, idx);
        
        // Update parent group
        if (this.isChild())
          this.ds_ext.group.addColumnAt(column, idx, this.ds_ext);
    
        return false;
      }
    }
  }
  
  var fexists = (column.xrow !== undefined);
  if (!fexists)
    column.xrow = this.getColRow(column, this.columns.length);
  
  this.columns.push(column);
  this.addColumnMap(column);
  
  if (!fexists && column.xrow != "")
    this.col_list[column.ex_type].append(column.xrow);
  
  // Update parent group
  if (this.isChild())
    this.ds_ext.group.appendColumn(column, this.ds_ext);
    
  return true;
};

DataSetSpec.prototype.addColumn = function(column) {
  for (var i = this.columns.length - 1; i >= 0; i--)
    if (this.columns[i].ex_type == "ds")
      break;
  
  if (i < 0 || i == this.columns.length - 1) {
    this.appendColumn(column);
  } else {
    this.addColumnAt(column, i);
  }
};

DataSetSpec.prototype.addColumnAt = function(column, idx) {
  var fexists = (column.xrow !== undefined);
  this.addColumnAtEx(column, idx);
  this.addDsExtColumns(column, idx, fexists);
};

DataSetSpec.prototype.addDsExtColumns = function(column, idx, fexists) {
  var ds = this.getDataSetExt();
  for (var i in ds.colpp) {
    var colpp = ds.colpp[i];
    if (!colpp.acceptDsColumns())
      continue;
    
    // Just in case delete column by name b4 add
    colpp.delColumnByName(column.name);
    var col = colpp.addColumnAt(column, idx);
    
    if (fexists)
      colpp.showColumnAt(col, idx);
  }
};

DataSetSpec.prototype.addColumnInfo = function(column, idx) {
  this.columns.splice(idx, 0, column);
  this.addColumnMap(column);
};

DataSetSpec.prototype.addColumnMap = function(column) {
  this.map[column.name] = column;
  this.cnt_map[column.ex_type]++;
};

DataSetSpec.prototype.delColumnMap = function(name) {
  var column = this.map[name];
  delete this.map[name];
  this.cnt_map[column.ex_type]--;
};

DataSetSpec.prototype.addColumnAtEx = function(column, idx) {
  this.addColumnInfo(column, idx);
  column.xrow = this.getColRow(column, this.columns.length);
  if (column.xrow != "")
    $($("tr", this.col_list[column.ex_type])[(parseInt(idx))]).
                                                before(column.xrow);
                                                
  // Update parent group
  if (this.ds_ext.isChild())
    this.ds_ext.group.addColumnAt(column, idx, this.ds_ext);
};

DataSetSpec.prototype.changeColIndex = function(column, idx) {
  // Remove and add again
  var pos = this.delColumnEx(column.name);
  if (pos < idx)
    idx--;
    
  this.addColumnAt(column, idx);
};

DataSetSpec.prototype.changeColJavaType = function(name, jtype) {
  var ds = this.getDataSetExt();
  for (var i in ds.colpp) {
    var colpp = ds.colpp[i];
    if (!colpp.acceptDsColumns())
      continue;
      
    colpp.changeColJavaTypeSelf(name, jtype);
  }
  
  this.changeColJavaTypeEx(name, jtype);
};

DataSetSpec.prototype.changeColJavaTypeEx = function(name, jtype) {
  var column = this.map[name];
  column.java_type = jtype;
  
  return column;
};

DataSetSpec.prototype.changeColJavaTypeSelf = function(name, jtype) {
  this.changeColJavaTypeEx(name, jtype);
};

DataSetSpec.prototype.changeColumnName = function(oldName, newName) {
  var ds = this.getDataSetExt();
  for (var i in ds.colpp) {
    var colpp = ds.colpp[i];
    if (!colpp.acceptDsColumns())
      continue;
      
    colpp.changeColumnName(oldName, newName);
  }
  
  this.changeColumnNameSelf(oldName, newName);
};

DataSetSpec.prototype.changeColumnNameSelf = function(oldName, newName) {
  var column = this.map[oldName];
  this.map[newName] = column;
  this.delColumnMap(column);
  column.name = newName;
  
  $("span.name", column.xrow).html(newName);
};

DataSetSpec.prototype.clearSaved = function() {
  this.ds_ext.entity.clearSaved(true);
};

DataSetSpec.prototype.getColumnIdx = function(name) {
  var idx = -1;
  
  // Find column index
  for (var i in this.columns) {
    if (this.columns[i].name == name) {
      idx = i;
      break;
    }
  }
  
  return idx;
};

/**
 * In addition to delColumnSelf but also delete from parent group
 * 
 * @param name Column name
 * @return index of deleted column
 * 
 */
DataSetSpec.prototype.delColumnEx = function(name) {
  var idx = this.delColumnSelf(name);
  
  this.delColDsExt(name, idx);
  
  if (this.isChild())
    this.ds_ext.group.delColumnEx(name);
    
  return idx;
};

/**
 * Top GUI delete function.
 * Execute doAfterColumnDeleted at the end
 * 
 * @param column Column object 
 */
DataSetSpec.prototype.delColumn = function(column) {
  if (!this.canDeleteColumn(column))
    return;
    
  var idx = this.delColumnEx(column.name);
  this.doAfterColumnDeleted(column, idx);
};

/**
 * Delete column from all col processors
 * 
 * @param name Column Name
 * @param idx Column index in columns array
 *  
 */
DataSetSpec.prototype.delColDsExt = function(name, idx) {
  if (idx >= 0) {
    var ds = this.getDataSetExt();
    for (var i in ds.colpp) {
      var colpp = ds.colpp[i];
      if (!colpp.acceptDsColumns())
        continue;
        
      colpp.delColumnSelf(name, idx);
    }
  }
};

/**
 * Delete column from it's own colum list and map
 * 
 * @param name Column name
 * @return index of deleted column
 * 
 */
DataSetSpec.prototype.delColumnSelf = function(name) {
  var idx = this.getColumnIdx(name);
  
  if (idx >= 0)
    this.delColumnAt(name, idx);
      
  return idx;
};

DataSetSpec.prototype.delColumnAt = function(name, idx) {
  var column = this.map[name];
  this.columns.splice(idx, 1);
  this.delColumnMap(name);
  
  if (column.xrow != "")
    column.xrow.remove();
  
  this.clearSaved();
};

DataSetSpec.prototype.canDeleteColumn = function(column) {
  return true;
};

DataSetSpec.prototype.doAfterColumnDeleted = function(column, idx) {};

DataSetSpec.prototype.editColumn = function(column) {
  this.editColumnEx(column.xrow, column.ex_type);
};

DataSetSpec.prototype.editColumnEx = function(row, ex_type) {
  var pname = $("input.name", row);
  if (this.isAllowColumnNameChange() && pname.length > 0) {
    $('span.name', row).hide();
    pname.show();
  }
  
  var jfield = $('span.jtype', row);
  var jtype = jfield.html();
  if (this.isAllowColumnJavaTypeChange() && ex_type == "ds") {
    jfield.hide();
    var sel = $("select.jtype", row);
    sel.show();
    $('option[value="' + jtype + '"]', sel).
                          attr("selected", "selected");
  }
  
  if (this.hasErrorVal()) {
    var err_fields = $("td.err-val", row);
    $("span.err-val", err_fields).hide();
    var err_field = (jtype == JTYPE_BOOL) ? 
        $("select", err_fields) : $("input", err_fields);
    // pfield.removeClass("error");
    err_field.show();
    var title = get_jtype_info(jtype);
    err_field.prop("title", title);
    
    if (err_fields.data("is_default"))
      add_filtered_handler(row, "default", get_jtype_regex(jtype));
  }
  
  // Put focus on chosen input
  if (!is_empty(this.focusInput))
    $(this.focusInput, row).focus();
    
  $('.ui-icon', row).hide();
  $('button', row).show();
};

DataSetSpec.prototype.bindConfigCtrls = function(ds_ext) {};

DataSetSpec.prototype.cancelColumn = function(column) {
  var row = (column !== undefined) ? column.xrow : this.xrow;
  row.removeClass("error");
  
  var pname = $('input.name', row);
  if (this.isAllowColumnNameChange() && pname.length > 0) {
    var el = $('span.name', row);
    pname.val(el.html());
    pname.hide();
    el.show();
  }
  
  var jfield = $('span.jtype', row);
  var jtype = jfield.html();
  if (this.isAllowColumnJavaTypeChange()) {
    var sel = $('select.jtype', row);
    
    sel.val(jtype);
    sel.hide();
    jfield.show();
  }
  
  if (this.hasErrorVal()) {
    var err_fields = $("td.err-val", row);
    var err_field = (jtype == JTYPE_BOOL) ? $("select", err_fields) : 
                                                $("input", err_fields);
    var err_val = $("span.err-val", err_fields);
    err_field.val(err_val.html());
    err_val.show();
    $(".err-val:not(span)", err_fields).hide();
    
    if (err_fields.data("is_default"))
      err_field.addClass("default");
  }
  
  $('button', row).hide();
  $('.ui-icon', row).show();
  
  if (column === undefined) {
    this.xrow.remove();
    this.setColListCtrlBtn(true);
  } 
};

DataSetSpec.prototype.setColListCtrlBtn = function(enabled) {
  $("button.col-list-ctrl", this.parent).prop("disabled", !enabled);
};

DataSetSpec.prototype.saveColumn = function(column) {
  var row = (column !== undefined) ? column.xrow : this.xrow;
  
  // Remember current column state
  this.doBeforeColumnSave(column);
  
  // Phase 1. Validation
  
  // Check if name is not empty
  var cfield = $("input.name", row);;
  var cname = cfield.val();
  if (this.isAllowColumnNameChange()) {
    if (cname == "") {
      //-- 20
      show_client_error(20, cfield);
      return;
    } else if (column !== undefined && cname != column.name && 
                                  this.map[cname] !== undefined || 
        column === undefined && this.map[cname] !== undefined) {
      //-- 21
      show_client_error_substr(21, cfield, {name: cname});
      return;
    } else if (!this.canChangeColumnName(column, cname))
      return;
  }
  
  // Check if Java Type selected and Validate if column change
  var jtype, sel;
  if (this.isAllowColumnJavaTypeChange()) {
    sel = $('select.jtype', row);
    jtype = sel.val();
    
    if (jtype == "") {
      //-- 22
      show_client_error(22, sel);
      return;
    } else if (column !== undefined && 
        column.java_type != jtype && 
          !this.canChangeJavaType(column, jtype)) {
      return;
    }
  } else {
    jtype = $('span.jtype', row).html();
  }
  
  // Check for On Error value not empty
  var err_field, err_val; 
  if (this.hasErrorVal()) {
    var err_field = (jtype == JTYPE_BOOL) ? $("select.err-val", row) : 
                                                $("input.err-val", row);
    var err_val = err_field.val();
    if (is_empty(err_val)) {
      //-- 14
      show_client_error(14, err_field);
      return;
    }
    
    /*
      if (!is_empty(rx)) {
        var ff = typeof test.check == "function";
        pattern = RegExp(rx);
            
        if (!pattern.test(err_val) || 
            ff && !test.check(err_val)) {
     */
    var validation, vfunc;
    var filter = get_jtype_rule(jtype);
    
    if (!is_empty(filter) && !is_empty(filter.validation)) {
      validation = RegExp(filter.validation);
      var ff = typeof filter.check == "function";
      
      if (!validation.test(err_val) || ff && !filter.check(err_val)) {
        //-- 16
        show_client_error_substr(16, err_field, {
          value: err_val,
          jtype: jtype
        });
        return;
      }
    }
  }
  
  // 2. Assignment
  if (this.isAllowColumnNameChange()) {
    cfield.hide();
    var cval = $("span.name", row);
    cval.html(cname);
    cval.show();
    
    if (column !== undefined && cname != column.name)
      this.changeColumnName(column.name, cname);
  }
  
  if (this.isAllowColumnJavaTypeChange() && sel.length > 0) {
    sel.hide();
    jtype = $('option:selected', sel).val();

    var ttype = $('span.jtype', row);
    ttype.html(jtype);
    ttype.show();
    
    sel.data("old_val", jtype);
    
    if (this.hasErrorVal()) {
      sel.data("err_val", err_val);
      sel.data("is_default", err_field.hasClass("default"));
    }
    
    if (column !== undefined && column.java_type != jtype)
      column.java_type = jtype;
  } /* else {
    jtype = $('td.jtype', row).html();
  } */
  
  // Check if On Error result correspond to the javatype
  if (this.hasErrorVal()) {
    var err_fields = $("td.err-val", row);
    var err_fd = $("span", err_fields);
    
    err_fd.html(err_val);
    var fd = err_field.hasClass("default");
    err_fields.data("is_default", fd);
    err_fields.data("err_val", err_val);
    
    if (!fd)
      // Clear parent container if input field changed
      err_fd.removeClass("default");
    
    err_field.hide();
    err_fd.show();
    
    column.on_error = err_val;
  }
  
  $("span.ui-icon", this.parent).show();
 
  $("button", row).hide();
  $('.ui-icon', row).show();      
  row.removeClass("error");
  
  var fnew = (column === undefined);
  if (fnew)
    column = {
      name: cname,
      java_type: jtype,
      on_error: err_val,
      xrow: this.xrow,
      ex_type: "ds",
    };
  
  this.doAfterColumnSaved(column, fnew);
  
  this.clearSaved();
};

DataSetSpec.prototype.canChangeColumnName = function(column, name) { 
  return true; 
};

DataSetSpec.prototype.canChangeJavaType = function(column, jtype) { 
  return true; 
};

DataSetSpec.prototype.doBeforeColumnSave = function(column) {};
  
DataSetSpec.prototype.doAfterColumnSaved = function(column) {};

DataSetSpec.prototype.getColListBtnName = function(ds_data) {	
  return "";
};

DataSetSpec.prototype.getColListErrorInput = function() {
  return;
};

DataSetSpec.prototype.getColListSuccess = function(data, fsave) {
  var btn = $("button.col-list-ctrl", this.parent);
  $(btn).attr("idx", parseInt($(btn).attr("idx")) + 1);
  
  // Index existing column list
  var columns = {};
  for (var i in this.columns)
    columns[this.columns[i].name] = this.columns[i];
  
  for (var i in data) {
    var dcol = new Column(data[i]);
    dcol.ex_type = "ds";
    
    var rcol = (i < this.columns.length) 
      ? this.columns[i] 
      : undefined;
    
    if (rcol === undefined) {
      this.appendColumn(dcol);
    } else {
      if (dcol.name != rcol.name || 
           (dcol.name == rcol.name && 
             rcol.ex_type != "ds")) {
        // Check if column exist somewhere
        var old = columns[dcol.name];
        
        if (old === undefined) {
          // Insert at i position
          this.addColumnAt(dcol, i);
        } else if (old.ex_type != "ds") {
          this.delColumnEx(old.name);
          this.addColumnAt(dcol, i);
          
          delete columns[dcol.name];
        } else {
          delete columns[dcol.name];
          
          if (dcol.java_type != old.java_type)
            this.changeColJavaType(old.name, dcol.java_type);
            
          // Change index of existing column
          this.changeColIndex(old, i);
        }
      } else {
        delete columns[dcol.name];
        if (dcol.java_type != rcol.java_type)
          this.changeColJavaType(rcol.name, dcol.java_type);
      }
    }
  }
  
  // Check what left to delete
  for (var idx in columns) {
    var col = columns[idx];
    
    if (col.ex_type == "ds")
      this.delColumnEx(col.name);
  }
  
  // Redraw all colpp
  this.getDataSetExt().redrawAllColumns();
  
  this.getDataSetExt().setColListUsed(false);
  
  this.doAfterColListSuccess();
  
  if (fsave)
    this.clearSaved();  
};

DataSetSpec.prototype.doAfterColListSuccess = function() {};

DataSetSpec.prototype.getProject = function() {
  return this.ds_ext.getProject();
};

DataSetSpec.prototype.getProjectName = function() {
  return this.getProject().getName() + ".";
};

DataSetSpec.prototype.getColList = function(btn) {
  if (!this.testConfig())
    return;
  
  var idx = $(btn).attr("idx");
  if ((idx > 0 && this.getDataSetExt().isColListUsed() && 
                !window.confirm(ts("LL_EX_RCOL_CONFIRM"))))
    return;
    
  var bw = $("div.ctrl-btn-wrapper", this.parent);
  enable_wait_btns_ex(bw);
    
  var me = this;
  
  //-- 12
  //-- 30
  get_ajax_ex(this.getColListUrl(), this.getColListErrorId(),
    function (data) {
      disable_wait_btns_ex(bw);
      if (data.col_list!= undefined)
        me.getColListSuccess(data.col_list, true);
    },
    function() {
      me.getColListError(bw);
    }
  );  
};

DataSetSpec.prototype.getColListUrl = function() {};

DataSetSpec.prototype.getColListError = function(bw) {
  disable_wait_btns_ex(bw);
  
  this.doAfterColListError();
};


DataSetSpec.prototype.doAfterColListError = function() {};

DataSetSpec.prototype.show = function(container) {
  this.parent = container; 
  this.parent.html(this.getConfigFrame());
  
  this.setColList();  
  // this.bindConfigCtrls(ds_ext);
  this.bindConfigCtrls(container.children(0));
};


DataSetSpec.prototype.getConfigFrame = function() {
  return '<table class="ds-spec-wrapper ' + this.getType() + '-data">' + 
      '<tr>' + 
        '<td class="config-wrapper">' + this.getConfigPanel() + '</td>' + 
        '<td class="col-list-wrapper">' + 
          this.getColSet(this.getColListBtnName()) +
        '</td>' +
        '<td class="ds-wrapper">' + this.getDataPanel() + '</td>' + 
      '</tr>' + 
    '</table>';
};

DataSetSpec.prototype.setColList = function(ds_data) {
  this.columns = [];
  this.col_list = {
    ds: $("tbody.col-list.ds", this.parent),
    ex: $("tbody.col-list.ex", this.parent)
  };
};

/**
 * Check if DataSetSpec has active Ex Column
 *   
 * @param {Column} column
 * @return True/False
 * 
 */
DataSetSpec.prototype.hasActiveExCol = function(name) {  
  return (this.map[name] !== undefined && 
        this.ds_ext.ex_colp_ref.assigned[name] !== undefined);
};

/**
 * @see hasActiveExCol
 */
DataSetSpec.prototype.hasChildExCol = function(name) {  
  return this.hasActiveExCol(name);
};

DataSetSpec.prototype.isColExists = function(column, dse) {
  return this.map[column.name] !== undefined;
};

DataSetSpec.prototype.addReqParam = function(param) {};

DataSetSpec.prototype.updReqParam = function(param) {};

DataSetSpec.prototype.delReqParam = function(param) {};

/******************************************************************************/
/**                             CSV DATA                                     **/
/******************************************************************************/

function CsvData(ds) {
  DataSetSpec.call(this, ds);
  
  // Name of last csv file used
  this.fname;
  
  // List of file parameters
  this.fparams = ["delim", "quote-char", "escape-char"];
  
  this.allowAllColumnEdit();
  this.allowColumnJavaTypeChange();
}

CsvData.prototype = new DataSetSpec();

CsvData.prototype.getType = function() {
  return "csv";
};

CsvData.prototype.getDefValField = function(name) {
  var delim_field = $(".csv_" + name, this.parent);
  return (delim_field.hasClass("default")) ? undefined : delim_field.val();
};

CsvData.prototype.getDefValCheck = function(name) {
  var res;
  var field = $("input." + name, this.parent);
  if (!field.hasClass("default"))
    res = field.is(":checked") ? "true" : "false";
  
  return res;
};

CsvData.prototype.getDefFieldValue = function(name) {
  var value = this.getDefValField(name);
  
  return (value !== undefined) ? jOsBiTools.encode_query_param(value) : "";
};

CsvData.prototype.getDefValFieldParam = function(name) {
  var res;
  var value = this.getDefFieldValue(name);
  
  if (value != "")
    res = {
      key: this.paramPrefix + name,
      value: value
    };
  
  return res;
};

CsvData.prototype.testSpecConfig = function() {
	var field = this.csv_files;
	
	if (!check_input(field, 5))
		return false;
	
	return true;
};

CsvData.prototype.downloadFile = function(btn) {
  var me = this;
  
  var div = $(btn).parent();
  enable_wait_btns_ex(div);
  
  //-- 54 
  get_ajax(this.getProject().getExFileInfoUrl(this.getFileName()), 54, 
    function() {
      me.downloadFileSuccess(div);
      window.location = jOsBiTools.get_download_url(me.getProject().
                                        getExFileUrl(me.getFileName()));
    });
};

CsvData.prototype.downloadFileSuccess = function(div) {
  disable_wait_btns_ex(div);
};

CsvData.prototype.b4UploadFile = function(arr) {
  var me = this;
  
  enable_wait_btns_ex($("div.upload-ctrl", this.parent));
  enable_wait_btns_ex($("div.ctrl-btn-wrapper", this.parent));
  enable_wait_btns("ds_descr_ctrl");

  // Check if method defined
  var form = $("form", this.parent);
  var fname = $("input[name=fname]", form).val();
  
  if (form.prop("state") == "") {
    // Check if csv file exists. Ignore "File Not Found" error
    get_ajax_ex(this.getProject().getExFileInfoUrl(fname), 0, 
      function(data) {
        if (data !== undefined) {
          
          if (!window.confirm(
            ts("LL_CONFIRM_FILE_OVERWRITE").
                          replace("[fname]", fname))) {
            me.onUploadRequestCompleted();
            return;
          }
          
          me.onFormSubmit(form, fname, arr, true);
        } else {
          me.onUploadRequestCompleted();
          show_server_error(); // TODO Add error
        }
      },
      function(message, error) {
        // IF code is object  than check for error id
        if (typeof error == "object") {
          if (error.id == 1)
            // File doesn't exists and it's safe to proceed
            me.onFormSubmit(form, fname, arr, false);                
          else
            // Something went wrong
            show_server_error(error);
        } else {
          //-- 150
          show_ajax_error_ex(150, error);
        }
        
        // For any scenario hide upload components
        me.onUploadRequestCompleted();
      }
    );
    
    return false;
  }
  
  // Call before submit hook
  jOsBiTools.prep_form(form, arr);
  
  return true;
};

CsvData.prototype.onFormSubmit = function(form, fname, arr, fexist) {
  form.prop("state", "submit");
  var req = this.getFileUrl(fname, fexist);
  this.fform.attr2("action", jOsBiTools.get_url(req));
 
  // Call on submit hook
  jOsBiTools.process_form(form, req);
  
  // Submit form
  form.submit();
};

CsvData.prototype.onUploadRequestCompleted = function() {
  $("form", this.parent).prop("state", "");
  
  disable_wait_btns_ex($("div.upload-ctrl", this.parent));
  disable_wait_btns_ex($("div.ctrl-btn-wrapper", this.parent));
  disable_wait_btns("ds_descr_ctrl");
};

CsvData.prototype.onUploadFileSuccess = function(data) {
  var fname = $("input[name=fname]", this.parent).val();
  
  this.onUploadRequestCompleted();
  
  // Update Project ExFile List
  if (!this.ds_ext.getProject().addExFileList(fname, "csv"))
    this.addCsvFile(fname);
    
  // Update file name
  this.csv_files.val(fname);
  this.checkCsvFileSelection();
  
  $("input.csv-file", this.parent).val("");
  $("input.csv-file", this.parent).removeClass("error");
  $("button.upload", this.parent).prop("disabled", true);
  
  // Redirect to the success column processing
  if (data.col_list!= undefined)
        this.getColListSuccess(data.col_list, true);
};

CsvData.prototype.onUploadFileError = function(jqXHR, msg, error) {
  this.onUploadRequestCompleted();
  
  //-- 17
  show_ajax_error(17, jqXHR, msg, error, $("input.csv-file", this.parent));
};

CsvData.prototype.onUploadFileServerError = function(error) {
  this.onUploadRequestCompleted();
  
  show_server_error(error);
};

CsvData.prototype.getColListBtnName = function(ds_data) {
	return t("LL_EX_GET_COLUMN_LIST");
};

CsvData.prototype.doAfterColListSuccess = function() {
  var me = this;
  
  this.csv_files.removeClass("error").addClass("tested");
  $("option", this.csv_files).each(function() {
    $(this).css("background-color", me.csv_fcolor);
  });
  
  $("option:selected", this.csv_files).css("background-color", "").
                              removeClass("error").addClass("tested");
                              
  $("button.col-list-ctrl", this.parent).
          html(t("LL_EX_REFRESH_COLUMN_LIST"));
};

CsvData.prototype.doAfterColListError = function() {
  var me = this;
  
  this.csv_files.removeClass("tested").addClass("error");
  $("option", this.csv_files).each(function() {
    $(this).css("background-color", me.csv_fcolor);
  });
  
  $("option:selected", this.csv_files).css("background-color", "").
                              removeClass("tested").addClass("error");
};

CsvData.prototype.getConfigPanel = function() {   
  return '<table class="csv-data-cfg">' +
	    '<tr>' +
	      '<td class="ralign">' +
	        '<label>' + t("LL_FILE_NAME") + ': </label>' + 
	      '</td>' + 
	      '<td>' +
	        '<table><tr><td>' +
	          '<select class="csv-file-name" />' + 
	          '<span class="mandatory-field">*</span>' +
	        '</td>' +
	        '<td class="ctrl-btn-wrapper">' + 
	          '<div><button type="button" class="download hidden">' + 
	                           t("LL_EX_DOWNLOAD") + '</button></div>' +
	        '</td></tr></table>' +
	      '</td>' + 
	    '</tr>' +
	    '<tr>' + 
	      '<td class="ralign">' +
	        '<label>' + t("LL_EX_COL_NAMES_IN_FIRST_ROW") + 
	                                                    ': </label>' + 
	      '</td>' + 
	      '<td>' +
	        '<input type="checkbox" ' + 
	            'class="col-first-row default" default="true" checked /> ' +
	      '</td>' + 
	    '</tr>' + 
	    '<tr>' + 
	      '<td class="ralign">' +
	        '<label id="ll_delimiter">' + 
	                       t("LL_DELIMITER") + ': </label>' + 
	      '</td>' + 
	      '<td>' +
	        '<input type="text" class="csv_delim short default"' + 
	                ' default="true" value="," size="1" maxlength="1" /> ' +
	      '</td>' + 
	    '</tr>' + 
	    '<tr>' + 
	      '<td class="ralign">' +
	        '<label>' + t("LL_QUOTE_CHAR") + ': </label>' + 
	      '</td>' + 
	      '<td>' +
	        '<input type="text" ' + 
	           ' class="csv_quote_char short default" value="&quot;"' + 
	           ' default="true" size="1" maxlength="1" /> ' + 
	      '</td>' + 
	    '</tr>' + 
	    '<tr>' + 
	      '<td class="ralign">' +
	        '<label>' + t("LL_ESCAPE_CHAR") + ': </label>' + 
	      '</td>' + 
	      '<td>' +
	        '<input type="text" class="csv_escape_char short default"' + 
	           ' default="true" value="\\" size="1" maxlength="1" /> ' +
	      '</td>' + 
	    '</tr>' + 
	    '<tr>' + 
	      '<td class="ralign">' +
	        '<label>' + t("LL_EX_UPLOAD_FILE") + ': </label>' + 
	      '</td>' + 
	      '<td>' +
	        '<form enctype="multipart/form-data" method="post">' + 
  	        '<input type="hidden" name="fname" />' +
  	         '<table>' +
  	           '<tr>' +
  	             '<td>' + 
  	               '<input type="file" name="file" class="csv-file" /></td>' +
  	             '<td class="upload-ctrl-wrapper">' +
  	               '<div class="upload-ctrl">' + 
  	                 '<button type="submit" class="upload" disabled>' + 
  	                     t("LL_EX_UPLOAD") +
  	                 '</button>' +
  	               '</div>' +
  	             '</td>' +
  	           '</tr>' + 
             '</table>' +
           '</fr>' +
	      '</td>' + 
	    '</tr>' + 
	  '</table>';
};

CsvData.prototype.checkCsvFileSelection = function() {
  var chl = this.csv_files.children();
  var el = $(this.csv_files.children()[0]);
  
  if (chl.length > 1) {
    if (el.val() == "")
      el.remove();
      
    $("button.download", this.parent).show();
  } else {
    if (el.val() == "")
      $("button.download", this.parent).hide();
  }
  
  this.setColListCtrlBtn(true);
  
  this.csv_files.removeClass("error").removeClass("tested");
  $("option", this.csv_files).each(function() {
    $(this).removeClass("error").removeClass("tested");
  });
};

CsvData.prototype.addCsvFile = function(fname) {
  this.csv_files.append('<option value="' + fname + '" ' + 
              'style="background-color: ' + this.csv_fcolor + 
                                        '">' + fname + '</option>');
};

CsvData.prototype.bindConfigCtrls = function(ds_ext) {
  var me = this;
  this.csv_files = $("select.csv-file-name", this.parent);
  this.csv_fcolor = "white";
  
  $("button.col-list-ctrl", this.parent).click(function(){
    me.getColList(this);
  });
  
  // Populate csv file list
  this.csv_files.append('<option value="">-- ' + 
                t("LL_SELECT_CSV_FILE") + ' --</option>').
    bind("change", function() {
      me.checkCsvFileSelection();
      me.clearSaved();
    });
  
  var flist = this.ds_ext.getProject().getExFileList("csv");
  for (var i in flist)
    this.addCsvFile(flist[i]);
 
  $("button.download", this.parent).click(function() {
    me.downloadFile(this);  
  });
  
  $("input[type='text']", this.parent).on("keypress", function() {
    me.clearSaved();
    $(this).removeClass("default");
  });
  
  $("input[type='checkbox']", this.parent).on("click", function() {
    me.clearSaved();
    $(this).removeClass("default");
  });
 
  $("input.csv-file", this.parent).on("change", function() {
    var fok = this.files.length > 0;
    $("button.upload", me.parent).prop("disabled", !fok);
    
    if (!fok)
      return;
       
    var fname = this.files[0].name;
    $("input[name=fname]", me.parent).val(fname);
  });
  
  this.fform = $("form", this.parent).prop("state", "")
    .ajaxForm({
      dataType : "json",
      beforeSubmit : function(arr, $form, options) {
        return me.b4UploadFile(arr);
      },
      success: function(data) {
        if (data.error === undefined)
          me.onUploadFileSuccess(data);
        else
          me.onUploadFileServerError(data.error);
      },
      error: function(jqXHR, msg, error) {
        me.onUploadFileError(jqXHR, msg, error);
      }
    });
  
  add_filtered_handler(this.parent, "default");
};

CsvData.prototype.getColListUrl = function() {
  return make_rel_req_ex(this.getUrlList().EX_FILE, "col_list/csv/" +
            this.getProjectName() + this.getFileName(),
                            this.getFileUrlParams(this.getFileName(), false));
};

CsvData.prototype.getFileUrl = function(fname, fexist) {
  return make_rel_req_ex(this.getUrlList().EX_FILE, "csv/" +
    this.getProjectName() + fname, this.getFileUrlParams(fname, fexist));
};

CsvData.prototype.getFileUrlParams = function(fname, fexist) {
  var qparams = {};
  
  for (var i in this.fparams) {
    var key = this.fparams[i].replace("-", "_");
    var qparam = this.getDefValFieldParam(key);
    
    if (qparam !== undefined)
      qparams[qparam.key] = qparam.value;
  }
  
  var cfr = this.getDefValCheckParam("col-first-row");
  if (cfr !== undefined)
    qparams[cfr.key] = cfr.value;
    
  if (fexist)
    qparams["overwrite"] = true;
  
  return qparams;
};

CsvData.prototype.getDefValCheckParam = function(fname) {
  var res;
  var cfr = this.getDefValCheck(fname);
  if (cfr !== undefined)
    res = {
      key: this.paramPrefix + fname.replace(/-/g, "_"),
      value: cfr
    };
  
  return res;
};

CsvData.prototype.getColListErrorId = function() {
  return 12;
};

CsvData.prototype.getColListErrorInput = function() {
  return this.csv_files;
};

CsvData.prototype.onLoadData = function(data) {
  // Check if empty line exists
  this.checkCsvFileSelection();
  
  // Set new value
  if (data.file_name !== undefined)
    if ($.inArray(data.file_name, this.ds_ext.
                          getProject().getExFileList("csv")) >= 0)
      this.csv_files.val(data.file_name);
  
  $("input.col-first-row", this.parent).prop("checked", 
        data.col_first_row === undefined ? true : data.col_first_row);
                          
  this.setDefValueTag("delim", data, ",");
  this.setDefValueTag("quote_char", data, "\"");
  this.setDefValueTag("escape_char", data, "\\");
  this.setDefCheckTag("col_first_row", data, true);
  
  return true;
};

CsvData.prototype.setDefValueTag = function(tag, data, def_val) {
  var input = $("input.csv_" + tag, this.parent);
  
  if (data[tag] === undefined) {
    input.val(def_val);
    input.prop("default", true);
  } else {
    input.val(data[tag]);
    input.prop("default", false);
    
    if (data[tag] != def_val)
      input.removeClass("default");
  }
};

CsvData.prototype.setDataSetData = function(ds_data) {
  ds_data["file_name"] = this.getFileName();
  ds_data["delim"] = this.getDefValField("delim");
  ds_data["quote_char"] = this.getDefValField("quote_char");
  ds_data["escape_char"] = this.getDefValField("escape_char");
  
  var cfr = this.getDefValCheck("col-first-row");
  if (cfr !== undefined)
    ds_data["col_first_row"] = cfr;
};

CsvData.prototype.setDefCheckTag = function(tag, data, def_val) {
  var input = $("input." + tag.replace(/_/g, "-"), this.parent);
  
  if (data[tag] === undefined) {
    input.prop("checked", def_val);
    input.prop("default", true);
  } else {
    input.prop("checked", data[tag]);
    input.prop("default", false);
    if (data[tag] != def_val)
      input.removeClass("default");
  }
};

CsvData.prototype.getFileName = function() {
  return this.csv_files.val();
};

CsvData.prototype.hasData = function() {
  return !is_empty(this.getFileName());
};

CsvData.prototype.isAllowColumnDel = function() {
  return true;
};

/******************************************************************************/
/**                             SQL DATA                                     **/
/******************************************************************************/

function SqlData(ds) {
  DataSetSpec.call(this, ds);
  this.allowAllColumnEdit();
}

SqlData.prototype = new DataSetSpec();

SqlData.prototype.getType = function() {
  return "sql";
};

SqlData.prototype.getColListBtnName = function(ds_data) {
  return t("LL_EX_GET_COLUMN_LIST");
};

SqlData.prototype.setDataSetData = function(ds_data) {
  var sql_data = {
   sql_text: this.getSqlText(),
   descr: $("textarea.sql-descr", this.parent).val()
  };
  
  // Collect SQL Parameters
  var params = $("select.params options");
  if (params.length > 0) {
    res += get_tab_num(tnum + 1) + '<sql_params>' + get_cr();
    var sql_params = [];
    
    for (var i = 0; i < params.length; i++)
      sql_params.push({
        param: {
          idx: i
          // TODO Add ,req_param: {name: , java_type: , is_mandatory: }
        }
      });
  
    sql_data["sql_params"] = sql_params;
  }  
  
  ds_data["sql"] = sql_data;
};

SqlData.prototype.testSpecConfig = function() {
  var field = $("textarea.sql-query", this.parent);
  
  //-- 29
  if (!check_input(field, 29))
    return false;
  
  return true;
};

SqlData.prototype.getConfigPanel = function() {
  
  var req_params = "";
  
  $("#rparams_list tr").each(function() {
    var name = $("td.name", this).html();
    req_params += '<option value="' + name + '">' + name + '</option>"';
  });
  
  return'<table class="sql-data-cfg">' + 
  '<tr>' + 
    '<th>' + t("LL_EX_SQL_QUERY") +
      '<span class="mandatory-field">*</span>' +
    '</th>' +
    '<th>' + t("LL_EX_DESCRIPTION") + '</th>' +
    '<th>' + t("LL_EX_PARAMS") + '</th>' +
  '</tr>' + 
  '<tr>' +
    '<td>' +
        '<textarea class="sql-query"></textarea>' + 
    '</td>' +
    '<td>' +
      '<textarea class="sql-descr"></textarea>' +
    '</td>' +
    '<td>' +
      '<table class="sql-params">' +
        '<tbody class="sql-params"></tbody>' +
        '<tbody class="params">' +
          '<tr class="sql-param-ctrl">' +
            '<td><select class="sql-params">' + req_params + '<select></td>' +
            '<td><button class="add-selected add-sql-param"' + 
                    ((is_empty(req_params) ? " disabled" : "")) + '>' + 
                            t("LL_ADD") + '</button></td>' +
          '</tr>' +
        '</tbody>' +
      '</table>' +
    '</td>' +
  '</tr>' +
  '</table>';
};

SqlData.prototype.addSqlParam = function() {
  this.addSqlParamEx({req_param: $("select.sql-params", this.parent).val()});
};

SqlData.prototype.addSqlParamEx = function(param) {
  var name = param.req_param;
  var params = $("select.sql-params", this.parent);
  
  var row = $('<tr name="' + name + '">' + 
      '<td class="sql-param">' + name + '</td>' + 
      '<td class="row-ctrls">' + 
        '<span class="ui-icon ui-icon-trash" title="' + 
                      t("LL_DELETE") + '" ></span>' +
      '</td></tr>');
      
   $("tbody.sql-params", this.parent).append(row);     
   $('option[value="' + name +'"]', params).remove();
   this.setReqParamCtrl();
   
   var me = this;
   $("span.ui-icon-trash", row).on("click", function() {
     me.removeSqlParam(row, name);
   });
};

SqlData.prototype.removeSqlParam = function(row, name) {
  $("select.sql-params", this.parent).
          append('<option value="' + name + 
                          '" selected>' + name + '</option>');
  $("button.add-sql-param", this.parent).prop("disabled", false);
  
  row.remove();
};

SqlData.prototype.addReqParam = function(param) {
  var p = $('<option value="' + param.name + '">' + param.name + '</option>');
  p.data("sql_params", param);
  $("select.sql-params", this.parent).append(p);
  
  this.setReqParamCtrl();
};

SqlData.prototype.updReqParam = function(param) {
  var p = $('select.sql-params option[value="' + 
                        param.name + '"]', this.parent);
  
  if (p.length == 1) {
    p.data("sql_params", param);
    p.val(p.name);
    p.text(p.name);
  } else {
    p = $('tbody.sql-params td.param[name="' + param.name + '"]', this.parent);
    
    if (p.length == 1) {
      p.data("param", param);
      p.attr("name", p.name);
      p.html(p.name);
    }
  }
};

SqlData.prototype.delReqParam = function(pname) {
  // Remove from both lists
  var p = $('select.sql-params option[value="' + pname + '"]', 
                                                  this.parent).remove();
  if (p.length == 0)
    $('tbody.sql-params tr[name="' + pname + '"]', 
                                                this.parent).remove();
                                                
  this.setReqParamCtrl();
};

SqlData.prototype.setReqParamCtrl = function() {
  $("button.add-sql-param", this.parent).prop("disabled", 
                 ($("select.sql-params option", this.parent).length == 0));
};

SqlData.prototype.bindConfigCtrls = function(ds_ext) {
  var me = this;
  
  $("button.col-list-ctrl", this.parent).click(function(){
    me.getColList(this);
  });
  
  $("textarea.sql-query", this.parent).on("keypress paste", function() {
    $("button.col-list-ctrl", this.parent).prop("disabled", false);
    $(this).removeClass("error").removeClass("tested");
    
    if (me.getProject().getPrjMgr().config.has_ds)
      me.setColListCtrlBtn(true);
    me.clearSaved();
  });
  
  $("textarea.sql-descr", this.parent).on("keypress paste", function() {
    me.clearSaved();
  });
  
  $("button.add-sql-param", this.parent).on("click", function() {
    me.addSqlParam();
    me.clearSaved();
  });
};

SqlData.prototype.getColListErrorId = function() {
  return 30;
};

SqlData.prototype.getColListErrorInput = function() {
  return $("textarea.sql-query", this.parent);
};

SqlData.prototype.getColListUrl = function() {
  var sfield = $("textarea.sql-query", this.parent);
  var sval = sfield.val();
  
  if (is_empty(sval))
    show_client_error(58, sfield);
  
  sql = jOsBiTools.encode_query_param(sval
      .replace(/^[\r\n|\n|\t|\s]*/, "")
      .replace(/[\r\n|\n|\t|\s]*$/g, "")
      .replace(/[\r\n|\n|\t]/gm," ")
      .replace(/\s{2,}/g, " "));
      
  // Check if url embedded or external
  if (this.getProject().getPrjMgr().config.ds_item.url == "")
    // Embedded
    return make_rel_req_ex("sql_info","columns", {"sql": sql});
  else
    // External
    return make_abs_req(this.getProject().getPrjMgr().config.ds_item.url +
      "sql_info/columns/?sql=" + sql);
};

SqlData.prototype.getSqlText = function() {
  return $("textarea.sql-query", this.parent).val();
};

SqlData.prototype.onLoadData = function(data) {
  $("textarea.sql-query", this.parent).val(data.sql.sql_text);
  $("textarea.sql-descr", this.parent).val(data.sql.descr);
  
  if (data.sql.sql_params !== undefined) {
    for (var i in data.sql.sql_params.param)
      this.addSqlParamEx(data.sql.sql_params.param[i]);
  }
  
  this.setColListCtrlBtn(this.getProject().getPrjMgr().config.has_ds && 
            data.sql.sql_text != "");
    
  return true;
};

SqlData.prototype.hasData = function() {
  return !is_empty(this.getSqlText());
};

/******************************************************************************/
/**                             STATIC DATA                                  **/
/******************************************************************************/

function StaticData(ds) {
  DataSetSpec.call(this, ds);
  
  this.focusInput = "input.name";
  
  this.removeErrorVal();
  this.allowColumnAdd();
  this.allowColumnDel();
  
  // Allow only edit ds type
  this.allowColumnEdit("ds");
  this.allowColumnNameChange();
  this.allowColumnJavaTypeChange();
}

StaticData.prototype = new DataSetSpec();

StaticData.prototype.getType = function() {
  return "static";
};

StaticData.prototype.addNewColumn = function() {
  this.xrow = this.getColRow();
  
  // Look for a last "ds" element
  var idx = -1;
  for (var i = this.columns.length - 1; i >= 0; i--) {
    if (this.columns[i].ex_type == "ds") {
      idx = i;
      break;
    }
  }
  
  this.xrow.attr("idx", ++idx);
  if (idx == 0 || idx == this.columns.length)
    this.col_list["ds"].append(this.xrow);
  else
    this.xrow.insertAfter(this.columns[i].xrow);
    
  this.editColumnEx(this.xrow, "ds");
  
  var pfield = $("input.name", this.xrow);
  pfield.prop("title", ts(ID_FILTER.info));
  pfield.filter_input({
    regex: ID_FILTER.regex,
    onChange: clear_error      
  });
  
  this.setColListCtrlBtn(false);
};

StaticData.prototype.bindConfigCtrls = function(ds_ext) {
  var me = this;
  this.ds_set = $("table.static-ds-data", this.parent);
  this.ds_ctrl = $("button.ds-ctrl", this.ds_set);
  this.ds_data = $("tbody.data", this.parent);
  
  $("button.col-list-ctrl", this.parent).click(function(){
    me.addNewColumn();
  }).attr("disabled", false);
  
  this.ds_ctrl.click(function() {
    me.addDataRow();
  });
};

StaticData.prototype.addDataRow = function() {
  var row = "";
  for (var i in this.columns) {
    column = this.columns[i];
    
    // Only process columns with "ds" ex_type
    if (column.ex_type == "ds")
      row += this.getCellRow(this.columns[i]);
  }
  
  drow = $('<tr>' + row + '<td class="row-ctrl">' +
    '<span class="ui-icon ui-icon-trash" title="' + 
          t("LL_DELETE") + '"></span>' + 
    '<span class="ui-icon ui-icon-pencil" title="' + 
          t("LL_EDIT") + '"></span>' + 
    '<button class="save hidden">' + 
        t("LL_SAVE") + '</button>' + 
    '<button class="cancel hidden">' + 
        t("LL_CANCEL") + '</button>' + 
    '</td>' + 
  '</tr>');
    
  this.ds_data.append(drow);
  this.editDataRow(drow[0]);
  
  var me = this;
  $("button.save", drow).click(function() {
    me.saveDataRow(this.parentNode.parentNode);
  });
  
  $("button.cancel", drow).click(function() {
    me.cancelDataRow(this.parentNode.parentNode);
  });

  $("span.ui-icon-pencil", drow).click(function() {
    me.editDataRow(this.parentNode.parentNode);
  });
  
  $("span.ui-icon-trash", drow).click(function() {
    me.deleteDataRow(this.parentNode.parentNode);
  });
  
  var idx = 0;
  var me = this;
  $("td.value", drow).each(function() {
    me.bindCellCtrl(me.columns[idx], this);   
    idx++;
  });
  
  this.ds_ctrl.parent().parent().removeClass("error");
  
  return drow;
};

StaticData.prototype.bindCellCtrl = function(column, cell) {
  var pfield = $("input", cell);
  if (pfield.length == 1) {
    
    var rule = get_jtype_rule(column.java_type);
    if (!is_empty(rule.info))
      pfield.prop("title", ts(rule.info));
    
    if (!is_empty(rule.regex)) {  
      pfield.filter_input({
        regex: rule.regex,
        onChange: clear_error
      });
    } else {
     pfield.on("keypress", function() {
       $(this).removeClass("error");
     });
    }
  } else {
    var pfield = $("select", cell);
    if (pfield.length == 1) {
      pfield.on("change", function() {
       $(this).removeClass("error");
     });
   }
  }
};

StaticData.prototype.editDataRow = function(row) {
  this.disableDataRowCtrls(row);
};

StaticData.prototype.saveDataRow = function(row) {
  var cells = $("td.value", row);
  
  // 1. Validate type of each column
  for (var i = 0; i < cells.length; i++) {
    var cell = cells[i];
    var column = this.columns[i];
    var pfield = $("input", cell);
    if (pfield.length == 1) {
      var value = pfield.val();
      
      var test = this.getColumnValidationByJavaType(column.java_type);
    
      var pattern;
      var f = !is_empty(test.validation);
      var ff = typeof test.check == "function";
      
      if (f)
        pattern = RegExp(test.validation);
        
      if (f && !pattern.test(value) & !ff || 
          ff && !test.check(value)) {
        //-- 23
        show_client_error_substr(23, pfield, {
          value: value,
          jtype: column.java_type
        });
        
        return;
      }
    } else {
      pfield = $("select", cell);
      if (pfield.length == 1) {
        value = pfield.val();
        
        // Just check if non-empty
        if (is_empty(value)) {
          //-- 24
          show_client_error(24, pfield);
          
          return;
        }
      } else {
        return;
      }
    }
    
    // 2. Remember new value
    $("span", cell).html(value);
  }
  
  // Reset is_new flag
  $(row).prop("changed", true);
    
  this.enableDataRowCtrls(row);
  $(row).removeClass("error");
  
  this.clearSaved();
};

StaticData.prototype.cancelDataRow = function(row) {
  if (!$(row).prop("changed")) {
    $(row).remove();
  } else {
    var cells = $("td.value", row);
    for (var i = 0; i < cells.length; i++) {
      var cell = cells[i];
      var column = this.columns[i];
      var value = $("span", cell).html();
      
      // Revert old value
      var pfield = $("input", cell);
      if (pfield.length == 0)
        pfield = $("select", cell);
        
      if (pfield.length != 0)  
        pfield.val(value);
    }
  }
    
  this.enableDataRowCtrls(row);
};

StaticData.prototype.enableDataRowCtrls = function(row) {
  $("span", row).show();
  $("input,select", row).hide();
  $("button", row).hide();
};

StaticData.prototype.disableDataRowCtrls = function(row) {
  $("span", row).hide();
  $("input,select", row).show();
  $("button", row).show();
};

StaticData.prototype.deleteDataRow = function(row) {
  row.remove();
  this.clearSaved();
};

StaticData.prototype.getCellInput = function(column) {
  var input;
  
  if (column.java_type == JTYPE_BOOL) {
    // Simple Selection for boolean type 
    input = '<select class="value hidden">' + get_bool_sel(true) + '</select>';
  } else {    
    var cname = this.getInputClassByJavaType(column.java_type);
    var ctext = !is_empty(cname) ? " " + cname : "";
    
    input = '<input type="text" class="value hidden' + ctext + '" />';
  }
    
  return input + '<span></span>';
};

StaticData.prototype.getCellRow = function(column) {
  return '<td class="value">' + this.getCellInput(column) + '</td>';
};

StaticData.prototype.testSpecConfig = function() {
  var res = true;
  
  // Check if data not empty
  if ($("tr", this.ds_data).length == 0) {
    this.ds_ctrl.parent().parent().addClass("error");
    
    //-- 26
    show_client_error(26);
    
    return;
  }
  
  var res = true;
  // Check if any visible data save button
  $("button.save", this.ds_data).each(function() {
    if ($(this).is(":visible")) {
      $(this).parent().parent().addClass("error");
      res = false;
    }
  });
  
  if (!res)
    //-- 27
    show_client_error(27);
    
  return res;
};

StaticData.prototype.getColListBtnName = function(ds_data) {
  return t("LL_EX_ADD_COLUMN");
};

StaticData.prototype.doAfterColListSuccess = function() {
  for (var i in this.columns) {
    var column = this.columns[i];
    column.xrow.attr("idx", i);
    
    this.doAfterColumnSaved(column, true);
  }
};

StaticData.prototype.getDataPanel = function() {
  return '<div class="static-ds-header">' + 
    t("LL_DATA_SET") + '</div>' + 
    '<table class="static-ds-data hidden"><thead><tr></tr></thead>' + 
      '<tbody class="data"></tbody><tbody class="ds-ctrl-wrapper">' + 
      '<tr><td><button class="ds-ctrl hidden">' + 
        t("LL_EX_ADD_RECORD") + '</button></td></tr></tbody></table>';
};

StaticData.prototype.setDataSetData = function(ds_data) {
  var me = this;
  var rows = [];
  
  $("tr", this.ds_data).each(function() {
    var idx = 0;
    var cells = [];
    
    $("td.value", this).each(function() {
      cells.push({
        name: me.columns[idx].name,
        value: $("span", this).html()
      });
      
      idx++;
    });
    
    if (cells.length > 0)
      rows.push({
        cell: cells
      });
  });
  
  if (rows.length > 0)
    ds_data["static_rows"] = {
      row: rows
    };
};

StaticData.prototype.doAfterColumnDeleted = function(column, idx) {
  // Check if no column(s) left than empty ds data table
  if (this.cnt_map["ds"] == 0) {
    $("thead tr", this.ds_set).empty();
    $("tbody.data", this.ds_set).empty();
    this.ds_set.hide();
  } else {
    // Delete column header
    $($("thead tr th.column-name", this.ds_set)[idx]).remove();
    
    // Delete column from each record in DataSet
    var me = this;
    $("tr", this.ds_data).each(function() {
      $($("td.value", this)[idx]).remove();
    });
  }
};

StaticData.prototype.doBeforeColumnSave = function(column) {
  // Remember Java Type for old column
  this.name_changed = false;
  this.jtype_changed = false;
  this.old_jtype = column !== undefined ? column.java_type : column;
  this.old_name = column !== undefined ? column.name : column;
};

StaticData.prototype.doAfterColumnSaved = function(column, fnew) {
  if (fnew) {
    var fxr = (this.xrow !== undefined);
    var xrow = fxr ? this.xrow : column.xrow;
    var idx = Number(xrow.attr("idx"));
    
    if (fxr) {
      this.addColumnInfo(column, idx);
      this.addDsExtColumns(column, idx, true);
    }
    
    // Add new record to the DataSet
    var thead = $("thead tr", this.ds_set);
    
    if (idx == 0) {
      this.ds_set.show();
      thead.append('<th class="column-name">' + column.name + "</th>");
      thead.append('<th class="action">' + t("LL_ACTION") + '</th>');
      
      this.ds_ctrl.show();
    } else {
      $('<th class="column-name">' + column.name + "</th>").
                                      insertBefore("th.action", thead);
      
      // Add empty column for each row
      var me = this;
      $("tr", this.ds_data).each(function() {
        var cell = $(me.getCellRow(column)).
                  insertBefore($("td.row-ctrl", this));
        me.bindCellCtrl(column, cell);
        
        // Activate edit mode for row
        me.disableDataRowCtrls(this);
      });
    }
    
    this.ds_ctrl.parent().attr("colspan", this.columns.length + 1);
    this.setColListCtrlBtn(true);
  } else if (this.jtype_changed && this.old_jtype !== column.java_type) {
    var idx = this.getColumnIdx(name);
    
    if (idx >= 0) {
      // Replace cell input
      var me = this;
      $("tr", this.ds_data).each(function() {
        $($("td.value", this)[idx]).html(me.getCellInput(column));
        
        // Activate edit mode for row
        me.disableDataRowCtrls(this);
      });
    }
  } else if (this.name_changed && this.old_name !== column.name) {
    var idx = this.getColumnIdx(name);
    
    if (idx >= 0)
      // Rename column header
      $($("th.column-name", this.ds_set)[idx]).html(column.name);
  }
};

StaticData.prototype.getColumnDelWarning = function() {
  return ts("LL_EX_DATA_LOSS_WARNING");
};

StaticData.prototype.canChangeJavaType = function(column, jtype) {
  if (this.old_jtype === undefined)
    return true;
    
  this.jtype_changed = true;
  return window.confirm(ts("LL_EX_DATA_LOSS_WARNING"));
};

StaticData.prototype.canChangeColumnName = function(column, name) {
  this.name_changed = true;
  return true;
};

StaticData.prototype.onLoadData = function(data) {
  // Load dataset (if any)  
  if (data.static_rows !== undefined) {
    for (var i in data.static_rows.row) {
      var cells = data.static_rows.row[i].cell;
      var drow = this.addDataRow();
      
      var idx = 0;
      $("td.value", drow).each(function() {
        $(".value", this).val(cells[idx].value);
        idx++;
      });
      
      this.saveDataRow(drow);
    }
  }
  
  return true;
};

/******************************************************************************/
/**                            GROUP                                         **/
/******************************************************************************/

function GroupData(ds) {
  DataSetSpec.call(this, ds);
  
  this.col_set = {};
  
  // List of all DataSetExt included into this group
  this.dse_list = [];
  
  // Columns from each DataSetExt that used by this group.
  // Indexed map for columns below
  this.dse_map = {};
}

GroupData.prototype = new DataSetSpec();

GroupData.prototype.getType = function() {
  return "group";
};

GroupData.prototype.getConfigFrame = function() {
  return '<div class="ds-ext dotted-border ds-ext-empty">' +
      '<div class="ds-data ds-data-empty">' + 
          t("NEW_ENTITY_BODY_MSG") + '</div></div>';
};

GroupData.prototype.bindConfigCtrls = function(parent) {
  var me = this;
  // var pr = $(parent);
  // var ds_ext = pr.hasClass("root-ds") ? $(".ds-ext", parent) : parent;
  
  parent.prop("handled", false);
  
  parent.droppable({
    drop: function(event, ui) {
      if (!WEB_APP.base.DST_HANDLED || is_handled(this))
        return false;
      $(this).prop("handled", true);
      me.addDataSetExt($(event.target), WEB_APP.base.DST_SRC);
    },
    over: function(event, ui) {
      if (WEB_APP.base.DST_HANDLED && !is_handled(this)) {
        $(this).removeClass("dotted-border");
        $(this).addClass("dotted-border-ready");
      }
    },
    out: function() {
      if (WEB_APP.base.DST_HANDLED && !is_handled(this)) {
        $(this).addClass("dotted-border");
        $(this).removeClass("dotted-border-ready");
      }
    }
  });
};

GroupData.prototype.isHandled = function(el) {
  var handled = $(el).prop("handled");
  return (handled !== undefined && handled);
};

GroupData.prototype.setDataSetData = function(ds_data) {
  var ds_list = [];
  
  for (var i in this.dse_list) {
    var ds_ext = this.dse_list[i];
    var dst = ds_ext.getType() + "_ds";
    
    var dst_data = {};
    var dst_map = {
      idx: i
    };
    ds_ext.setDataSetMap(dst_map);
    dst_data[dst] = dst_map;
    ds_list.push(dst_data);
  }
  
  if (ds_list.length > 0)
    ds_data["ds_list"] = ds_list;
};

GroupData.prototype.hasData = function() {
  for (var i in this.dse_list) {
    var ds_ext = this.dse_list[i];
    
    if (ds_ext.getType() != "group" || ds_ext.hasData())
      return true;
  }
  
  return false;
};

GroupData.prototype.addDataSetExt = function(container, src) {
  var dse = new DataSetExt(this.ds_ext.getEntity(), container, src, this);
  this.dse_list.push(dse);
  
  dse.show();
  this.dse_map[dse.dts] = this.initDseMap();
  
  if (dse.hasData())
    this.clearSaved();
    
  // Append new empty ds_ext container
  var new_dse = $(this.getConfigFrame());
  
  this.parent.append(new_dse);
  this.bindConfigCtrls(new_dse);
  
  return dse;
};

GroupData.prototype.delDataSetExt = function(dse) {
  
  // Remove ds_ext from array
  var l = 0;
  var ds_ext;
  var idx = -1;
  
  for (var i in this.dse_list) {
    ds_ext = this.dse_list[i];
    
    if (ds_ext.dts == dse.dts) {
      idx = i;
      break;
    }
    
    l += this.dse_map[ds_ext.dts].columns.length;
  }
  
  if (idx >= 0) {
    // Remove all columns linked to dse
    /*
    for (var i in this.dse_map[ds_ext.dts].columns)
      this.delColumnEx(this.dse_map[ds_ext.dts].columns[i].name); 
    */
    delete this.dse_map[ds_ext.dts];
    this.dse_list.splice(idx, 1);
    
    this.recreateColumns();
  }
};

GroupData.prototype.recreateColumns = function() {
  while (this.columns.length > 0)
    this.delColumnEx(this.columns[0].name);
    
  for (var i in this.dse_list) {
    var ds_ext = this.dse_list[i];
    this.dse_map[ds_ext.dts] = this.initDseMap();
    this.addDseColumns(ds_ext);
    
    this.getDataSetExt().redrawAllColumns();
  }
};

GroupData.prototype.addDseColumns = function(dse) {
  var columns = dse.getDataSetSpec().columns;
  for (var j in columns)
      this.appendColumn(columns[j], dse);
};

GroupData.prototype.initDseMap = function() {
  return {columns: [], map: {}};
};

GroupData.prototype.testSpecConfig = function() {
 
  if (this.dse_list.length == 0) {
    //-- 33
    show_client_error(33, $(".ds-data-empty", this.parent));
    return false;
  }
  
  for (var i in this.dse_list) {
    var dse = this.dse_list[i];
    
    if (dse.getType() == "group" && !dse.getDataSetSpec().testSpecConfig())
        return false;
  }

  return true;
};

GroupData.prototype.appendColumn = function(column, dse) {
  if (dse === undefined)
    // Loading from file
    return;
    
  if (this.isColExists(column, dse))
    return;
  
  // Calculate index where to insert column in main column list
  var idx = 0;
  var ds_ext;
  for (var i in this.dse_list) {
    ds_ext = this.dse_list[i];

    idx += this.dse_map[ds_ext.dts].columns.length;
    
    if (ds_ext.dts == dse.dts)
      break;
  }
  
  this.addDseColumn(column, ds_ext, idx);
  
  // if (this.isChild())
    // this.ds_ext.group.appendColumn(column, this.ds_ext);
};

GroupData.prototype.addColumnAt = function(column, idx, dse) {
  if (this.isColExists(column, dse))
    return;
  
  // Calculate index where to insert column in main column list
  var l = 0;
  var ds_ext;
  var li = idx;
  
  for (var i in this.dse_list) {
    ds_ext = this.dse_list[i];

    if (ds_ext.dts == dse.dts)
      break;

    l += this.dse_map[ds_ext.dts].columns.length;    
  }
  
  // Look inside given dse  
  if (i > 0) {
    li = 0;
    for (var j in dse.colums) {
      var lcol = dse.columns[j];
      if (this.dse_map[ds_ext.dts].map[column.name] === undefined)
        continue;
        
      li++;
      if (lcol.name == column.name) {
        idx = l + li;
        break;
      }
    }
  }
  
  this.addDseColumn(column, ds_ext, idx, li);
};

GroupData.prototype.addDseColumn = function(column, dse, idx, lidx) {    
  var col = new Column(column);
  col.xrow = "";

  var dsm = this.dse_map[dse.dts];
  dsm.map[col.name] = col;
  
  if (idx == this.columns.length) {
    dsm.columns.push(col);
    DataSetSpec.prototype.appendColumn.call(this, col);
  } else {
    if (lidx == dsm.columns.length)
      dsm.columns.push(col);
    else
      dsm.columns.splice(lidx, 0, col);
    DataSetSpec.prototype.addColumnAt.call(this, col, idx);
  }
};

/**
 * Check if Group has Active Ex Column 
 * 
 * @param {Column} column Column to check
 * @return True if has and False if not
 */
GroupData.prototype.isGroupExColExists = function (name) {
  if (this.hasActiveExCol(name)) {
    return true;
  } else if (this.isChild()) {
    return this.ds_ext.group.isGroupExColExists(name);
  } else {
    return false;
  }
};

/**
 * Check if Group have at least one child DataSet Ext with active Ex Column
 *   
 * @param {DataSetExt} dse
 * @param {Column} column
 */
GroupData.prototype.hasChildExCol = function(name, dse) {  
  for (var i in this.dse_list) {
    var ds_ext = this.dse_list[i];
    if (ds_ext.dts == dse.dts)
      continue;
    
    if (ds_ext.ds_spec.hasChildExCol(name))
      return true;  
  }

  if (dse.ds_spec.hasChildExCol(name, this.dse_ext))
    return true;
  
  return false;
};

/**
 * Delete ExCol from group if none of child have same Ex Col  
 * @param {Object} name Column Name
 * @param {Object} dse Reference on DataSetExt
 */
GroupData.prototype.delExCol = function(column, dse) {
  if (!this.hasChildExCol(column.name, dse)) {
    this.delColumnSelf(column.name);
    
    // Delete DataSetExt column from dse map
    this.delDseCol(column, dse);
    
    if (this.isChild())
      this.dse_ext.group.delExCol();
  }
};

GroupData.prototype.delDseCol = function(column, dse) {
  var dsm = this.dse_map[dse.dst];
  delete dsm.map[column.name];
  for (var i in dsm.columns) {
    if (dsm.columns[i].name == column.name) {
      dsm.columns.splice(i, 1);
      break;
    }
  }
};

GroupData.prototype.addReqParam = function(param) {
  for (var i in this.dse_list)
    this.dse_list[i].getDataSetSpec().addReqParam(param);
};

GroupData.prototype.updReqParam = function(param) {
  for (var i in this.dse_list)
    this.dse_list[i].getDataSetSpec().updReqParam(param);
};

GroupData.prototype.delReqParam = function(pname) {
  for (var i in this.dse_list)
    this.dse_list[i].getDataSetSpec().delReqParam(pname);
};

GroupData.prototype.onLoadData = function(data) {
  // Rearrange ds_ext
  var dsl = [];
  for (var ii in data.ds_list) {
    var dse_list = data.ds_list[ii];    
    for (var dst in dse_list) {
      var dse = dse_list[dst];
      dsl.splice(dse.idx, 0, {
        ds_type: dst,
        ds_ext: dse
      });
    }
  }
  
  var res = true;
  // Load DataSetExt one by one from list

  for (var i in dsl) {
    // DataSet Map Object
    var dso = dsl[i];
    
    // DataSet Map Type 
    var dst = dso.ds_type;
    
    // DataSet Map Type Name
    var dstn = dst.substr(0, dst.length - 3);
    
    // DataSet Map Spec name
    var sn = dstn + "_data";
    
    // Attach to last container
    var container = $(this.parent.children().last());
    
    container.removeClass("dotted-border");
    container.prop("handled", true);     
    res &= this.addDataSetExt(container, 
       dstn + ".png").onLoadData(dso.ds_ext, dso.ds_ext[sn]);
    
  }
  return res;
};
