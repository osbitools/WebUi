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

/****************************/
/**        DsExtProc       **/
/****************************/
function DsExtProc(ds_ext, params) {
  if (!ds_ext)
    return;

  this.init(ds_ext, params);
}

DsExtProc.prototype.init = function(ds_ext, params) {
  this.ds_ext = ds_ext;
  this.map = {};
  this.list = [];
  this.assigned = {};
  this.cnt = 0;
  this.tag = params.container;
};

DsExtProc.prototype.initContainer = function(parent) {
  // Top tree for DsExt
  this.parent = $("td." + this.tag + "-group", parent);
  this.mmp = $("tbody." + this.tag + "-map", this.parent);
  this.lst = $("tbody." + this.tag + "-lst", this.parent);

  this.ctrl_btn = $("button", this.parent);
  this.container = this.getContainer();
  
  this.doAfterInitContainer();
};

DsExtProc.prototype.doAfterInitContainer = function() {};

DsExtProc.prototype.getXmlTag = function() {
  return this.tag;
};

DsExtProc.prototype.setDataSetMap = function(ds_map) {
  var value = this.container.val();

  if (!(is_empty(value)))
    ds_map[this.getXmlTag()] = {
      value: value
    };
};

DsExtProc.prototype.setXmlVal = function(tnum) {
  return this.container.val();
};

DsExtProc.prototype.getContainer = function() {
  return;
};

DsExtProc.prototype.acceptDsColumns = function() {
  return false;
};

DsExtProc.prototype.acceptExColumns = function() {
  return false;
};

DsExtProc.prototype.testConfig = function() {
  return true;
};

DsExtProc.prototype.bindCtrlIcons = function(row, column) {
  this.bindBaseCtrlIcons(row, column);
};

DsExtProc.prototype.getColNameFromRowColumn = function(row, column) {
  return (column === undefined) ? row.prop("col_name") : column.name;
};

DsExtProc.prototype.bindBaseCtrlIcons = function(row, column) {
  var me = this;
  
  $("button.save", row).click(function() {
    me.saveMapRow(me.getColNameFromRowColumn(row, column));
  });

  $("button.cancel", row).click(function() {
    me.cancelMapRow(me.getColNameFromRowColumn(row, column));
  });

  $("span.ui-icon-pencil", row).click(function() {
    me.editMapRow(me.getColNameFromRowColumn(row, column));
  });

  $("span.ui-icon-trash", row).click(function() {
    me.delMapRow(me.getColNameFromRowColumn(row, column), true);
  });
};

DsExtProc.prototype.doAfterAddRow = function(column) {
  this.hideCtrlIcons();
};

DsExtProc.prototype.editMapRow = function(val) {
  this.disableContainerCtrl(val); 
  this.enableCtrlButton(false);
};

DsExtProc.prototype.saveMapRow = function(name) {
  // Remember column reference just in case 
  // if column name changes
  var column;
  if (name !== undefined)
    column = this.map[name];
  
  if (this.wrapper !== undefined)
    this.wrapper.removeClass("error");
  
  if (!this.enableContainerCtrl(name))
    return;

  if (column !== undefined && column.row === undefined)
    // Assign new row
    column.row = this.assigned[column.name];
 
  this.enableCtrlButton(true);
  
  // Reset default flag on input control(s) that had been modified
  $("input[default=true],select[default=true],textarea[default=true]", 
    this.parent).not(".default").each(function(){
      $(this).prop("default", false);
    });
    
  this.ds_ext.setColListUsed(true);
  
  this.clearSaved(true);
};

DsExtProc.prototype.showCtrlIcons = function() {
  this.showBaseCtrlIcons();
};

DsExtProc.prototype.showBaseCtrlIcons = function() {
  $(".ui-icon", this.mmp).show();
};

DsExtProc.prototype.hideCtrlIcons = function() {
  $(".ui-icon", this.mmp).hide();
};

DsExtProc.prototype.enableBaseContainerCtrl = function(val) {
  var row = this.assigned[val];

  this.showCtrlIcons();
  $(".ctrl-btns", row).hide();
};

DsExtProc.prototype.disableBaseContainerCtrl = function(val) {
  var row = this.assigned[val];

  // $(".ui-icon", this.mmp).hide();
  this.hideCtrlIcons();
  $(".ctrl-btns", row).show();
};

DsExtProc.prototype.testConfig = function() {
  if (this.wrapper === undefined)
    return true;
    
  var btns = $(".ctrl-btns:visible", this.wrapper);
  if (btns.length > 0) {
    //-- 13
    show_client_error(13);
    this.wrapper.addClass("error");
    
    return false;
  }
  
  return true;
};

DsExtProc.prototype.addMapRow = function(cexist) {
  this.addMapRowEx(cexist);
};

DsExtProc.prototype.addMapRowEx = function(cexist) {
  var name = this.container.val();
  if (is_empty(name))
    return;
    
  this.addMapRowByName(name, cexist);
  return name;
};

DsExtProc.prototype.addMapRowByName = function(name, cexist) {
  var column;
  
  if (cexist)
   column = this.map[name];
  
  this.mr = this.getMapRow(column); 
  if (this.mr === undefined)
    return;
  
  // this.cnt++;
  // this.assigned[val] = row;
  
  // col.opt.remove();
  this.mmp.append(this.mr);
  
  // Set focus
  var finput = this.getFocusField();
  if (finput !== undefined)
    $(finput, this.mr).focus();
  
  // Last
  // this.ds_ext.setColListUsed(true);
  this.doAfterAddMapRow(column);
};

DsExtProc.prototype.getFocusField = function() {};

DsExtProc.prototype.doAfterAddMapRow = function(column) {};


DsExtProc.prototype.delMapRow = function(name, fd) {
  this.delMapRowEx(name, fd);
};

DsExtProc.prototype.delMapRowEx = function(name, fd) {
  var row = this.assigned[name];
  if (row === undefined)
    return false;
  
  row.remove();
  
  this.cnt--;
  
  delete this.map[name].row;
  delete this.assigned[name];
  
  this.enableCtrlButton(true);
  
  return true;
};

DsExtProc.prototype.enableCtrlButton = function(enabled) {
  if (this.ctrl_btn !== undefined)
    this.ctrl_btn.attr("disabled", !enabled);
};

DsExtProc.prototype.setCtrlButton = function() {
  this.enableCtrlButton(this.list.length != 0);
};

DsExtProc.prototype.appendColumn = function(column) {
  return this.appendColumnEx(column);
};

DsExtProc.prototype.appendColumnEx = function(column) {
  var col = new Column(column);
  
  this.list.push(col);
  this.map[column.name] = col;
  
  return col;
};

DsExtProc.prototype.addColumnAt = function(column, idx) {
  return this.addColumnAtEx(column, idx);
};

DsExtProc.prototype.addColumnAtEx = function(column, idx) {
  var col = new Column(column);
  
  this.list.splice(idx, 0, col);
  this.map[column.name] = col;
  
  return col;
};

DsExtProc.prototype.delColumnByName = function(name) {
  var column = this.map[name];
  if (column === undefined)
    return;
    
  var idx = this.list.indexOf(column);
  
  this.delColumnDep(column, idx, true);
};

DsExtProc.prototype.delColumnSelf = function(name, idx) {
  var col = this.map[name];
  
  this.delMapRowEx(name);
  this.delColumnEx(name, idx);
  this.setCtrlButton();

  this.doAfterColumnDeleted(col);
};

DsExtProc.prototype.delColumnByNameIdx = function(name, idx) {
  this.delColumnDep(this.map[name], idx, false);
};

DsExtProc.prototype.delColumnDep = function(column, idx, fd) {
  this.delMapRow(column.name, fd);
  this.delColumnEx(column.name, idx);
  this.doAfterColumnDeleted(column);
};

DsExtProc.prototype.doAfterColumnDeleted = function(column) {};

DsExtProc.prototype.getColumnByName = function(name) {
  var column = this.map[name];
  column.idx = this.list.indexOf(column);
  return column;
};

DsExtProc.prototype.delColumnEx = function(name, idx) {
  this.list.splice(idx, 1);
  delete this.map[name];
};

DsExtProc.prototype.showColumn = function(column) {
  this.container.append(this.map[column.name].opt);
  
  this.setCtrlButton();
  this.checkColCount();
};

DsExtProc.prototype.showColumnAt = function(column, idx) {
  // Visualise recently added column
  if (column.opt !== undefined) {
    if (column.opt !== undefined) {
      var cnt = $(this.getOptType(), this.container).length;
      if (idx == cnt) {
        this.container.append(column.opt);
      } else {
        $(column.opt).insertBefore($(this.getOptType(), this.container)[idx]);
        if (idx == 0)
          column.opt.prop("selected", true);
      }
    }
  };
    
  this.setCtrlButton();
  this.checkColCount();
};

DsExtProc.prototype.changeColIndex = function(column, fpos, tpos) {
  var col = this.map[column.name];

  this.list.splice(fpos, 1);  
  this.list.splice(tpos, 0, col);
};

DsExtProc.prototype.cancelContainerCtrl = function(column) {};

DsExtProc.prototype.cancelMapRow = function(name) {
  if (this.wrapper !== undefined)
    this.wrapper.removeClass("error");
  if (name === undefined) {
    this.mr.remove();
  } else {
    var column = this.map[name];
    
    if (column.row === undefined) {
      this.delMapRow(name, false);
    } else {
      this.cancelContainerCtrl(column);
    }
  }
  
  // Restore default flag on input control(s) that had been modified
  $("input[default=true],select[default=true],textarea[default=true]", 
    this.parent).not(".default").each(function(){
      $(this).addClass("default");
  });
      
  this.enableCtrlButton(true);
};

DsExtProc.prototype.changeColJavaTypeSelf = function(name, jtype) {
  this.changeColJavaType(name, jtype, true);
};
  
DsExtProc.prototype.changeColJavaType = function(name, jtype, self) {
  var column = this.map[name];
  column.java_type = jtype;
  
  this.doAfterChangeColJavaType(column, jtype, self);
};

DsExtProc.prototype.doAfterChangeColJavaType = 
                  function(column, jtype, self) {};

DsExtProc.prototype.changeColumnName = function(old_name, new_name) {
  var col = this.map[old_name];
  col.name = new_name;
  this.map[new_name] = col;
  delete this.map[old_name];
  this.doAfterChangeColumnName(new_name);
  
  var row = this.assigned[old_name];
  if (row !== undefined) {
    this.assigned[new_name] = row;
    delete this.assigned[old_name];
    
    this.changeColumnNameAssigned(new_name);
  }
};

DsExtProc.prototype.doAfterChangeColumnName = function(name) {};

DsExtProc.prototype.changeColumnNameAssigned = function(name) {};

DsExtProc.prototype.checkColCount = function() {};

DsExtProc.prototype.clearSaved = function(can_cancel) {
    this.ds_ext.getEntity().clearSaved(can_cancel);
};

DsExtProc.prototype.onLoadData = function(data) {
  this.container.val(data.value);
};

/*****************************/
/**       DsFilterProc      **/
/*****************************/

function DsFilterProc(ds, params) {
  if (!ds)
    return;

  DsExtProc.call(this, ds, params);
}

DsFilterProc.prototype = new DsExtProc();

DsFilterProc.prototype.getContainer = function() {
  return $("textarea.filter", this.parent);
};

DsFilterProc.prototype.doAfterInitContainer = function() {
  var me = this;
  this.container.on("keypress paste", function() {
    me.clearSaved(true);
  });
};

/*****************************/
/**       LangMapProc       **/
/*****************************/

function LangMapProc(ds, params) {
  if (!params)
    return;

  DsExtProc.call(this, ds, params);
};

LangMapProc.prototype = new DsExtProc();

LangMapProc.prototype.doAfterInitContainer = function() {
  var me = this;
  this.ctrl_btn.on("click", function() {
    me.addMapRow(true);
  });
};

LangMapProc.prototype.getXmlTag = function() {
  return "lang_map";
};

LangMapProc.prototype.onLoadData = function(data) {
  for (var i in data.column)
    this.loadMapRow(data.column[i].name);
};

LangMapProc.prototype.loadMapRow = function(name) {
  this.addMapRowByName(name, true);
  this.postAddMapRow(name);
};

LangMapProc.prototype.getContainer = function() {
  return $("select.col-list", this.parent);
};

LangMapProc.prototype.acceptDsColumns = function() {
  return true;
};

LangMapProc.prototype.getOpt = function(column) {
  return $('<option value="' + column.name + '" ex_type="' + 
      column.ex_type + '">' + column.name + '</option>');
};

LangMapProc.prototype.getOptType = function() {
  return 'option';
};

LangMapProc.prototype.appendColumn = function(column) {
  var col = this.appendColumnEx(column);
  col.opt = this.getOpt(column, this.list.length);
};

LangMapProc.prototype.addColumnAt = function(column, idx) {
  var col = this.addColumnAtEx(column, idx);
  col.opt = this.getOpt(column, idx);
  
  return col;
};

LangMapProc.prototype.doAfterChangeColumnName = function(name) {
  var opt = this.map[name].opt;
  opt.val(name);
  opt.text(name);
};

LangMapProc.prototype.changeColumnNameAssigned = function(name) {
  $(".col-name", this.assigned[name]).html(name);
};

LangMapProc.prototype.checkColCount = function() {
  if (this.lst === undefined)
    return;
    
  if ($("option", this.container).length == 0)
    this.lst.hide();
  else
    this.lst.show();
};

LangMapProc.prototype.emptyContainer = function(ex_type) {
  $("option[ex_type='" + ex_type + "']",this.container).remove();
};

LangMapProc.prototype.redraw = function(ex_type) {
  this.emptyContainer(ex_type);
  this.redrawContainer(ex_type);
  // this.doAfterRedrawContainer();
  this.setCtrlButton();
  this.checkColCount();
};

LangMapProc.prototype.redrawContainer = function(ex_type) {
	for (var i = this.list.length - 1; i>=0; i--) {
	  var col = this.list[i];
	  
	  // Check if it's in assigned list
	  if (col.ex_type == ex_type && 
	         this.assigned[col.name] === undefined)
	    this.container.prepend(this.getNewContainer(col));
	}
};

LangMapProc.prototype.getNewContainer = function(column) {
  return column.opt;
};

LangMapProc.prototype.getMapRow = function(column) {
  var row = $('<tr><td class="col-name">' + column.name + '</td>' + 
    '<td class="row-ctrls">' + 
    '<span class="ui-icon ui-icon-trash" title="' + 
    t("LL_DELETE") + '">' + '</span></td>' + '</tr>');

  var me = this;
  $(".ui-icon-trash", row).click(function() {
    me.delMapRow(column.name, true);
  });

  return row;
};

LangMapProc.prototype.addMapRow = function(cexist) {
  var name = this.addMapRowEx(cexist);
  this.postAddMapRow(name);
};

LangMapProc.prototype.postAddMapRow = function(name) {    
  this.assigned[name] = this.mr;
  this.map[name].opt.remove();
  
  // Check if something available
  this.checkColCount();
};

LangMapProc.prototype.doAfterColumnDeleted = function(column) {
  column.opt.remove();
};

LangMapProc.prototype.delMapRow = function(val, fd) {
  if (!this.delMapRowEx(val))
    return;
	
	// Find first index where opt can be inserted after
	var sopt;
	for (var i in this.list) {
		var col = this.list[i];
		
		if (col.name == val)
			break;
		else if (this.assigned[col.name] === undefined)
			sopt = col;
	}
	
	var opt = this.map[val].opt;
	if (sopt !== undefined)
		sopt.opt.after(opt);
	else
		this.container.prepend(opt);
	
	opt.prop('selected',true);
	
	this.lst.show();
	if (fd)
	  this.clearSaved(true);
};

LangMapProc.prototype.addOpt = function(column, idx) {
  // If required index more
  // Find first index where opt can be inserted after
  var sopt;
  for (var i in this.list) {
    var col = this.list[i];
    
    if (col.name == val)
      break;
    else if (this.assigned[col.name] === undefined)
      sopt = col;
  }
  
  var opt = this.map[val].opt;
  if (sopt !== undefined)
    sopt.opt.after(opt);
  else
    this.container.prepend(opt);
  
  opt.prop('selected',true);
  
  this.lst.show();
};

LangMapProc.prototype.setDataSetMap = function(ds_map) {
  var columns = [];

  $("td.col-name", this.parent).each(function() {
    columns.push({
      name: $(this).html()
    });
  });
  
  if (columns.length != 0)
    ds_map["lang_map"] = {
      column: columns
    };
};

LangMapProc.prototype.doAfterAddMapRow = function(column) {
  this.ds_ext.setColListUsed(true);
  this.clearSaved(true);
};

/*****************************/
/**       SortByProc        **/
/*****************************/

function SortByProc(ds, params) {
  if (!params)
    return;

  LangMapProc.call(this, ds, params);
}

SortByProc.prototype = new LangMapProc();

SortByProc.prototype.getXmlTag = function() {
  return "sort_by_grp";
};

SortByProc.prototype.doAfterAddMapRow = function(column) {
  $(".ui-icon", this.mmp).hide();
};

SortByProc.prototype.doAfterColumnDeleted = function(column) {
  LangMapProc.prototype.doAfterColumnDeleted.call(this, column);
  this.checkCtrlIcons();
};

SortByProc.prototype.getFocusField = function() {
  return "select.sort-order";
};

SortByProc.prototype.getMapRow = function(column) {
  var row = $('<tr class="sort-by"><td class="ex-col-wrapper">' + 
    '<table class="wrapper-ctrl"><tbody>' +
      '<tr><td class="center-ctrls" colspan="3">' + 
      '<div class="ui-icon ui-icon-arrow-1-n hidden up" ' + 
          'title="' + t("LL_EX_MOVE_UP") + '"></div></td>' + 
      '</tr>' + 
      '<tr>' + 
        '<td>' + t("LL_COLUMN") + 
        ': ' + '</td>' + 
        '<td><b class="col-name">' + column.name + '</b></td>' + 
        '<td class="row-ctrls">' + 
        '<span class="ui-icon ui-icon-pencil hidden" ' + 
          'title="' + t("LL_EDIT") + 
        '">' + '</span></td>' + 
      '</tr>' + 
      
      '<tr>' + 
        '<td class="no-wrap">' + 
                    t("LL_EX_SORTING_ORDER") + ': ' + '</td>' + 
        '<td><select class="sort-order default" default="true">' + 
        '<option value="asc">' + t("LL_EX_ASCENDING") + '</option>' + 
        '<option value="desc">' + t("LL_EX_DESCENDING") + '</option>' + 
        '</select><b class="sval" value="asc"></b></td>' + 
        '<td class="row-ctrls">' + 
          '<span class="ui-icon ui-icon-trash hidden" ' + 
            'title="' + t("LL_DELETE") + '"></span></td>' + 
      '</tr>' + 
      
      '<tr>' + 
        '<td class="no-wrap">' + t("LL_EX_UNIQUE") + ': ' + '</td>' + 
        '<td><input type="checkbox" class="unique default" default="true" >' + 
        '<b class="unq-str"></b></td>' + 
      '</tr>' + 
      
      '<tr><td colspan="3"><div class="ctrl-btns">' + 
        '<button class="save btn-row">' + t("LL_SAVE") + '</button>' + 
        '<button class="cancel btn-row">' + t("LL_CANCEL") + 
        '</button></div></td>' + 
      '</tr>' + 
      
      '<tr><td colspan="3" class="center-ctrls">' + 
        '<div class="ui-icon ui-icon-arrow-1-s hidden down" title="' + 
          t("LL_EX_MOVE_DOWN") + '"></div></td>' +
      '</tr>' + 
      
    '</tbody></table></td></tr>');

  $("select.sort-order", row).on("change", function() {
    $(this).removeClass("default");
  });
  
  $("input.unique", row).on("click", function() {
    $(this).removeClass("default");
  });
  
  this.wrapper = $("table.wrapper-ctrl", row);
  this.bindCtrlIcons(row, column);
  this.enableCtrlButton(false);

  return row;
};

SortByProc.prototype.cancelContainerCtrl = function(column) {
  this.enableBaseContainerCtrl(column.name);
  var row = this.assigned[column.name].row;
  
  var sval = $("b.sval", row);
  var pfield = $("select.sort-order", row);
  pfield.val(sval.attr("value"));
  
  var bq = $("b.unq-str", row);
  var unq = $("input.unique", row);
  unq.prop("checked", bq.html() == "yes");
  
  unq.hide();
  pfield.hide();

  bq.show();
  sval.show();
};

SortByProc.prototype.moveMapRowUp = function(btn, column) {
  var tbl = $(btn).parent().parent().
                      parent().parent();
  var row = tbl.parent().parent();
  var rows = $("tr.sort-by", row.parent());
  var idx = rows.index(row);
  var prev = rows[idx - 1];
  
  var me = this;
  tbl.css("background-color", "silver");
  tbl.animate({ 
    backgroundColor: "white" 
  }, "slow", function() {
    row.remove();
    
    $(prev).before(row);
    
    me.hideCtrlIcons();
    me.showCtrlIcons();
    
    tbl.css("background-color", "silver");
    tbl.animate({ 
      backgroundColor: "white" 
    }, "slow", function () {
      me.bindCtrlIcons(row, column);
    });
  });
};

SortByProc.prototype.onLoadData = function(data) {
  for (var i in data.sort_by) {
    var scol = data.sort_by[i];
    var name = scol.column;
    this.loadMapRow(name);
    
    // Set values
    var row = this.assigned[name];
    
    $("select", row).val(scol.sequence.toLowerCase());
    $("input.unique", row).
          attr("checked", scol.unique);
    
    this.saveMapRow(name);
  }
};

SortByProc.prototype.moveMapRow = function(btn, column, dir) {
  var tbl = $(btn).parent().parent().parent().parent();
  var row = tbl.parent().parent();
  var rows = $("tr.sort-by", row.parent());
  var idx = rows.index(row);
  var pidx = (dir == "down") ? (idx + 1) : (idx - 1);
  var anchor = $(rows[pidx]);
  
  var me = this;
  tbl.css("background-color", "silver");
  tbl.animate({ 
    backgroundColor: "white" 
  }, "slow", function() {
    row.remove();
    
    if (dir == "down") 
      anchor.after(row);
    else
      anchor.before(row);
      
    me.hideCtrlIcons();
    me.showCtrlIcons();
    
    tbl.css("background-color", "silver");
    tbl.animate({ 
      backgroundColor: "white" 
    }, "slow", function () {
      me.bindCtrlIcons(row, column);
    });
  });
};
    
SortByProc.prototype.disableContainerCtrl = function(val) {
  this.disableBaseContainerCtrl(val);
  
  var row = this.assigned[val];

  $(".ui-icon", this.mmp).hide();
  $(".ctrl-btns", row).show();
  $(".sval", row).hide();
  $("select", row).show();
  $("input.unique", row).show();
  $(".unq-str", row).hide();
};

SortByProc.prototype.enableContainerCtrl = function(val) {
  this.enableBaseContainerCtrl(val);
  
  var row = this.assigned[val];
    
  var sel = $("select", row);
  var sval = $("b.sval", row);
  
  sval.attr("value", sel.val());
  sval.html($("select option:selected", row).text());
  sval.show();
  sel.hide();
  
  var unq = $("input.unique", row);
  unq.hide();
  $("b.unq-str", row).show();
  $("b.unq-str", row).html(unq.is(':checked') ? "yes" : "no");
  
  return true;
};

SortByProc.prototype.showCtrlIcons = function() {
  this.showBaseCtrlIcons();
  this.checkCtrlIcons();
};

SortByProc.prototype.checkCtrlIcons = function() {
  $(".up", this.mmp).first().hide();
  $(".down", this.mmp).last().hide();
};

SortByProc.prototype.bindCtrlIcons = function(row, column) {
  this.bindBaseCtrlIcons(row, column);
  
  var me = this;
  
  $("div.ui-icon-arrow-1-n", row).click(function() {
    me.moveMapRow(this, column, "up");
  });
  
  $("div.ui-icon-arrow-1-s", row).click(function() {
    me.moveMapRow(this, column, "down");
  });
};

SortByProc.prototype.setDataSetMap = function(ds_map) {
  var sort_by_list = [];

  var idx = 0;
  $("table.wrapper-ctrl", this.parent).each(function() {
    sort_by_list.push({
      idx: idx,
      column: $(".col-name", this).html(),
      sequence: $(".sort-order", this).val().toUpperCase(),
      unique: $(".unique", this).is(':checked') ? "true" : "false"       
    });
    
    idx++;
  });

  if (sort_by_list.length > 0)
    ds_map["sort_by_grp"] = {
      sort_by: sort_by_list
    };
};

SortByProc.prototype.acceptExColumns = function() {
  return true;
};

/*******************************/
/**        ExColumnProc       **/
/*******************************/

function ExColumnProc(ds, params) {
  if (!params)
    return;

  DsExtProc.call(this, ds, params);
}

ExColumnProc.prototype = new DsExtProc();

ExColumnProc.prototype.doAfterInitContainer = function() {
  this.container = $("select.ex-col-sel", this.parent);
  this.container.on("change", function() {
    $(this).removeClass("error");
  });

  var me = this;
  this.ctrl_btn.on("click", function() {
    me.addMapRow(false);
  });
};

ExColumnProc.prototype.getXmlTag = function() {
  return "ex_columns";
};

ExColumnProc.prototype.acceptDsColumns = function() {
  return true;
};

ExColumnProc.prototype.cancelContainerCtrl = function(column) {
  var row = column.row;
  var ex_type = row.attr("ex_type");
  var pname = $("input.col-name", row);
  
  pname.hide();
  pname.val(column.name);
  $("span.col-name-val", row).show();
  
  if (ex_type == "auto_inc") {
    var as_val = $("span.auto-start-from-val", row);
    var inc_val = $("span.auto-inc-by-val", row);
    var as_field = $("input.auto-start-from", row);
    var inc_field = $(".auto-inc-by", row);
    
    as_field.hide();
    as_field.val(as_val.html());
    
    inc_field.hide();
    inc_field.val(inc_val.html());
    
    as_val.show();
    inc_val.show();
  } else if (ex_type == "calc") {
    var err_info = $("span.error-val", row);
    var err_stop = $("input.stop-on-error", row);
    var calc_exp = $("textarea.calc-exp", row);
    var calc_exp_val = $("div.calc-exp-val", row);
    var calc_type = $("select.calc-type", row);
    var calc_type_val = $("span.calc-type-val", row);
    var jtype = calc_type_val.html();
    var err_val = (jtype == JTYPE_BOOL) ? 
        $("select.error-val", row) : $("input.error-val", row);
    var fd = calc_type.data("is_default");
    
    calc_exp.hide();
    calc_exp.val(calc_exp_val.html());
    calc_exp_val.show();
    
    calc_type.hide();
    calc_type.val(calc_type_val.html());
    calc_type_val.show();
    
    $(".error-val", row).hide();
    if (fd) {
      if (!err_val.hasClass("default"))
        err_val.addClass("default");
    } else {
      if (err_val.hasClass("default"))
        err_val.removeClass("default");
    }
      
    err_val.val(err_info.html());
    err_info.show();
    
    err_stop.prop("checked", err_stop.prop("old_val"));
    err_stop.prop("disabled", true);
  }

  this.enableBaseContainerCtrl(column.name);
  this.enableCtrlButton(true);
};

ExColumnProc.prototype.redraw = function() {
  this.setCtrlButton();
};

ExColumnProc.prototype.delMapRow = function(val, fd) {
  if (val === undefined) {
    this.mr.remove();
    this.enableCtrlButton(true);
    
    return;
  }
  
  if (!fd)
    return;
  
  // Get column for future use
  var column = this.getColumnByName(val);
  
  // Delete column from same DataSet Ext  
  for (var i in this.ds_ext.colpp) {
    var colpp = this.ds_ext.colpp[i];
    if (!colpp.acceptDsColumns())
      continue;
    
    if (colpp == this) {
      colpp.delMapRowEx(val);
      colpp.delColumnEx(column.name, column.idx);
    } else {
      colpp.delColumnByName(val);
    }
  }
  
  // Delete column from it's own DataSetExt
  this.ds_ext.ds_spec.delColumnSelf(column.name);
  
  // Check for group
  if (this.ds_ext.isChild())
    this.ds_ext.group.delExCol(column, this.ds_ext);
};
 
ExColumnProc.prototype.doAfterChangeColJavaType = 
                                  function(column, jtype, self) {
  if (self)
    return;
    
  for (var i in this.ds_ext.colpp) {
    var colpp = this.ds_ext.colpp[i];
    if (!colpp.acceptDsColumns())
      continue;
    
    if (colpp != this)
      colpp.changeColJavaType(column.name, jtype);
  }
  
  this.ds_ext.ds_spec.changeColJavaTypeSelf(column.name, jtype);
};

ExColumnProc.prototype.getFocusField = function() {
  return "input.col-name";
};

ExColumnProc.prototype.getMapRow = function(column) {
  var row;
  var ex_type = this.container.val();
  
  var icon_btn_del = '<td class="row-ctrls">' +
        '<span class="ui-icon ui-icon-trash hidden" title="' + 
          t("LL_DELETE") + '"></span></td>';
  var icon_btn_edit = '<td class="row-ctrls">' + 
        '<span class="ui-icon ui-icon-pencil hidden" title="' + 
          t("LL_EDIT") + '"></span></td>';
  var ctrl_btns = '<tr><td colspan="2"><div class="ctrl-btns">' + 
      '<button class="save btn-row">' + 
        t("LL_SAVE") + '</button>' + 
      '<button class="cancel btn-row">' + 
        t("LL_CANCEL") + '</button>' + 
    '</div></td></tr>';
      
  if (ex_type == "auto_inc") {
    row = $('<tr><td class="ex-col-wrapper auto-inc">' +
      '<table class="wrapper-ctrl">' + 
      '<tr>' +
        '<td><span>' + t("LL_COLUMN_NAME") + ': </span>' + 
        '<span class="col-name-val saved"></span>' +
        '<input type="text" class="col-name" />' + 
        '</td>' + icon_btn_edit + 
      '<tr>' + 
        '<td><span>' + t("LL_START_FROM") + ': </span>' +
          '<span class="auto-start-from-val saved"></span>' +
          '<input type="text" class="auto-start-from default" ' + 
                                          'default="true" value="0" />' +
          '<span class="pl5">' + t("LL_INC_BY") + ': </span>' +
        '<span class="auto-inc-by-val saved"></span>' +
        '<input type="text" class="auto-inc-by default" ' + 
                                        'default="true" value="1" />' + 
        '</td>' + icon_btn_del +
      '</tr>' + 
      ctrl_btns +
      '</table>' +
      '</td></tr>');
      
    add_filtered_handler(row, "default", INT_FILTER.regex);
    
  } else if (ex_type == "calc") {
    row = $('<tr><td class="ex-col-wrapper calc">' +
      
      '<table class="wrapper-ctrl">' +
        '<tr>' +
          '<td><span>' + t("LL_COLUMN_NAME") + ': </span>' + 
            '<span class="col-name-val saved hidden"></span>' +
            '<input type="text" class="col-name" />' + 
          '</td>' + 
          '<td>' + icon_btn_edit +
        '<tr>' + 
          '<td colspan="2" class="nowrap"><span>' + 
              t("LL_JAVA_TYPE") + ': </span>' + 
              '<span class="calc-type-val saved hidden"></span>' +
              '<select class="calc-type"><option></option>' + 
                                          JTYPE_OPTS + '</select>' + 
          '</td>' + icon_btn_del + 
        '</tr>' +
        
        '<tr>' + 
          '<td colspan="2"><span>' + t("LL_EX_EXPRESSION") + 
            ': </span></td>' + 
        '</tr>' +
        
        '<tr>' + 
          '<td colspan="2">' +
            '<div class="calc-exp-val saved hidden"></div>' +
            '<textarea class="calc-exp"></textarea>' +
          '</td>' + 
        '</tr>' +
        
        '<tr>' + 
          '<td colspan="2">' + 
            t("LL_EX_STOP_ON_CALC_ERROR") +
            '<input type="checkbox" class="stop-on-error default" ' + 
              'default="true" checked />' +
          '</td>' + 
        '</tr>' +
        
        '<tr>' +
          '<td colspan="2"><div class="err-val-wrapper">' + 
            t("LL_EX_VALUE_ON_CALC_ERROR") +
            ': <span class="error-val saved hidden"></span>' +
            '<input type="text" class="error-val default hidden"' + 
                                                ' default="true" />' +
            '<select type="text" class="error-val default hidden">' + 
                                    get_bool_sel(false) + '</select>' +
          '</div></td>' + 
        '</tr>' +
        ctrl_btns +
      '</table>' +
      '</td></tr>');
    
    var calc_exp = $(".calc-exp", row); 
    calc_exp.on("keypress past", function() {
      clear_error(calc_exp);
    });
    
    /*
    $(".calc-type", row).each(function() {
      $(this).append('<option></option>' + JTYPE_OPTS);
    });
    */
    var me = this;
    var perr = $("input.error-val", row);
    var serr = $("select.error-val", row);
    $("select.calc-type", row).on("change", function() {
      me.onCalcTypeChange($(this), row);
    });
    
    perr.on("keypress", function() {
      $(this).removeClass("default");
    });
    
    $("input.stop-on-error", row).on("click", function() {
      $(this).removeClass("default");
    });
  } else {
    //-- 15
    show_client_error(15, this.container);
    return;
  }
  
  $("input.col-name", row).filter_input({
      regex: ID_FILTER.regex,
      onChange: clear_error
  });
    
  row.attr("ex_type", ex_type);
  this.wrapper = $("table.wrapper-ctrl", row);
  this.bindCtrlIcons(row, column);
  this.enableCtrlButton(false);
  
  return row;
};

ExColumnProc.prototype.onCalcTypeChange = function(sel, row) {
  sel.removeClass("error");
  
  // Replace value for error-val 
  var jtype = sel.val();
  var old_jtype = sel.data("old_val");
  
  var perr = $("input.error-val", row);
  var serr = $("select.error-val", row);
  
  var ewr = $('div.err-val-wrapper', row);
  if (is_empty(jtype)) {
    ewr.hide();
  } else {
    ewr.show();
    
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
      
      if (!is_empty(jtype)) {
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

      } else {
        perr.val("");
      }
    }
  }
};

ExColumnProc.prototype.onLoadData = function(data) {
  // Process auto increment columns
  if (data.auto_inc !== undefined) {
    for (var i in data.auto_inc.column) {
      var col = data.auto_inc.column[i];
      var name = col.name;
      
      this.addMapRowByName("auto_inc", false);
      
      // Set values
      $("input.col-name", this.mr).val(name);
      
      if (col.start_from != 0) {
        $("input.auto-start-from", this.mr).val(col.start_from);
        $("input.auto-start-from", this.mr).removeClass("default");
      }

      if (col.inc_by != 1) {  
        $("input.auto-inc-by", this.mr).val(col.inc_by);
        $("input.auto-inc-by", this.mr).removeClass("default");
      }
        
      this.saveMapRow();
    }
  }
  
  // Process calc columns
  if (data.calc !== undefined) {
    // Set calc selection
    this.container.val("calc");
    
    for (var i in data.calc.column) {
      var col = data.calc.column[i];
      var name = col.name;
      
      this.addMapRowByName("calc", false);
      
      // Set values
      $("input.col-name", this.mr).val(name);
      $("select.calc-type", this.mr).val(col.java_type);
      $("textarea.calc-exp", this.mr).val(col.value);
      
      if (!col.stop_on_error) {
        $("input.stop-on-error", this.mr).prop("checked", false);
        $("input.stop-on-error", this.mr).removeClass("default");
      }
      
      // Get default value
      if (col.error_value !== undefined) {
        $("input.error-val", this.mr).val(col.error_value);
        $("input.error-val", this.mr).removeClass("default");
      }
        
      this.saveMapRow();
    }
    
    // Set default selection
    this.container.val("auto_inc");
  }
};

ExColumnProc.prototype.setDataSetMap = function(ds_map) {
  
  // Auto Incremeted Fields
  var aic_col_list = [];
  
  $("tbody.ex-col-map tr[ex_type='auto_inc']", this.parent).each(function() {
    aic_col_list.push({
      name: $('span.col-name-val', this).html(),
      start_from: $('span.auto-start-from-val', this).html(),
      inc_by: $('span.auto-inc-by-val', this).html()
    });
  });
  
  var auto_inc;
  if (aic_col_list.length > 0)
    auto_inc = {
      column: aic_col_list
    };
  
  // Calculated Field
  var calc_list = [];
  $("tbody.ex-col-map tr[ex_type='calc']", this.parent).each(function() {
    calc_list.push({
      name: $('span.col-name-val', this).html(),
      java_type: $('span.calc-type-val', this).html(),
      stop_on_error: $('input.stop-on-error', this).is(":checked"),
      error_value: $('span.error-val', this).html(),
      value: $('div.calc-exp-val', this).html()
    });
  });

  var calc;
  if (calc_list.length > 0)
    calc = {
      column: calc_list
    };
  
  if (auto_inc !== undefined || calc !== undefined) {
    res = {};
    
    if (auto_inc !== undefined)
      res["auto_inc"] = auto_inc;
      
    if (calc !== undefined)
      res["calc"] = calc;
      
    ds_map["ex_columns"] = res;
  }
};

ExColumnProc.prototype.enableContainerCtrl = function(val) {
  var ex_type = this.mr.attr("ex_type");
  var pfield = $("input.col-name", this.mr);
  val = pfield.val();
  
  // Get Column Type
  var jtype;
  var sctype = $("select.calc-type", this.mr);
  if (ex_type == "auto_inc") {
    jtype = "java.lang.Integer";
  } else if (ex_type == "calc") {
    jtype = sctype.val();
  } else {
    jtype = "java.lang.String";
  }
  
  // Phase 1- Validation
  
  // Standard column check for all ExColumnProc 
  if (is_empty(val)) {
    //-- 38
    show_client_error(38, pfield);
    
    return false;
  }
  
  // Extra check for calculated field
  if (ex_type == "calc") {
    var tval = sctype.val();
    if (is_empty(tval)) {
      //-- 10
      show_client_error(10, sctype);
      
      return false;
    }
    
    var cfval = $("textarea.calc-exp", this.mr);
    var cval = cfval.val();
    
    if (is_empty(cval)) {
      //-- 42
      show_client_error(42, cfval);
      
      return false;
    }
    
    // Check if error_val correspont jtype
    var perr = $("input.error-val", this.mr);
    if (perr.is(":visible")) {
        
      var err_val = perr.val();
      if (is_empty(err_val)) {
        //-- 31
        show_client_error(31, perr);
        return false;
      }
      
      // Validate if error value of corresponded java type
      var test = get_jtype_rule(jtype);
      
      var pattern;
      var rx = !is_empty(test.validation) ? test.validation : 
                          (!is_empty(test.regex) ? test.regex : "");
                          
      if (!is_empty(rx)) {
        var ff = typeof test.check == "function";
        pattern = RegExp(rx);
            
        if (!pattern.test(err_val) || 
            ff && !test.check(err_val)) {
          //-- 32
          show_client_error_substr(32, perr, {
            value: err_val,
            jtype: jtype
          });
          
          return false;
        }
      }
    }
  }

  var column;
  var old_val = $("span.col-name-val", this.mr).html();
  
  // New column flag or file name changed
  var fn = old_val == "" || val != old_val;
  
  if (fn) {
    // Check if column unique in current DataSetExt
    if (this.map[val] !== undefined) {
      //-- 11
      show_client_error_substr(11, pfield, {col_name: val});
    
      return false;
    }
    
    // Check if one of the parent have same Active Ex Col
    if (this.ds_ext.isChild() &&
          this.ds_ext.group.isGroupExColExists(val)) {
      //-- 34
      show_client_error_substr(34, pfield, {col_name: val});
    
      return false;
    }
  }
  
  // Phase 2- Assignment
  if (fn) {
   
    this.mr.prop("col_name", val);
    this.assigned[val] = this.mr;
    
    if (old_val != "" && val != old_val) {
      // Change existing ExCol Name
      column = this.map[old_val];
      
      // Change column name for group
      for (var i in this.ds_ext.colpp) {
        var colpp = this.ds_ext.colpp[i];
        if (!colpp.acceptDsColumns())
          continue;
        
        colpp.changeColumnName(old_val, val);
      }
      
      this.ds_ext.ds_spec.changeColumnNameSelf(old_val, val);
    } else {
      // Add new column for all interested DataSet Ext
      var ncol = {
        name: val, 
        java_type: jtype, 
        ex_type: "ex"
      };
      
      for (var i in this.ds_ext.colpp) {
        var colpp = this.ds_ext.colpp[i];
        if (!colpp.acceptDsColumns())
          continue;
        
        colpp.appendColumn(ncol);
        colpp.showColumn(ncol);
      }
      
      this.ds_ext.ds_spec.appendColumnEx(ncol);
      
      // Assign new row
      column = this.map[val];
      column.row = this.mr;
    }
  } else {
    column = this.map[val];
  }
  
  if (jtype != column.java_type)
    this.changeColJavaType(val, jtype);
  
  this.enableBaseContainerCtrl(val);
  
  pfield.hide();
  
  var pval = $("span.col-name-val", this.mr);
  pval.html(val);
  pval.show();
  
  if (ex_type == "auto_inc") {
    var from = $("input.auto-start-from", this.mr);
    var from_val = $(".auto-start-from-val", this.mr);
    
    var inc_by = $("input.auto-inc-by", this.mr);
    var inc_by_val = $(".auto-inc-by-val", this.mr);
    
    from.hide();
    inc_by.hide();
    
    from_val.show();
    from_val.html(from.val());
    inc_by_val.show();
    inc_by_val.html(inc_by.val());
  } else if (ex_type == "calc") {
    var err_info = $("span.error-val", this.mr);
    var err_stop = $("input.stop-on-error", this.mr);
    var calc_exp = $("textarea.calc-exp", this.mr);
    var calc_exp_val = $("div.calc-exp-val", this.mr);
    var calc_type = $("select.calc-type", this.mr);
    var calc_type_val = $("span.calc-type-val", this.mr);
    
    var err_val = (calc_type.val() == JTYPE_BOOL 
      ? $("select.error-val", this.mr) 
      : $("input.error-val", this.mr));
    
    calc_exp.hide();
    calc_exp_val.html(calc_exp.val());
    calc_exp_val.show();
    
    calc_type.hide();
    calc_type.data("old_val", jtype);
    calc_type.data("is_default", err_val.hasClass("default"));
    calc_type.data("err_val", err_val.val());
    
    calc_type_val.html(jtype);
    calc_type_val.show();
    
    calc_exp.hide();
    calc_exp_val.html(calc_exp.val());
    calc_exp_val.show();
    
    err_val.hide();
    err_info.html(err_val.val());
    err_info.show();
    
    err_stop.prop("old_val", err_stop.prop("checked"));
    err_stop.prop("disabled", true);
  }
  
  // Reset default flag
  $("input[default='true']").each(function() {
    if (!$(this).hasClass("default"))
      $(this).attr("default", false);
  });
  
  this.enableCtrlButton(true);
  
  return true;
};

ExColumnProc.prototype.disableContainerCtrl = function(val) {
  var ex_type = this.mr.attr("ex_type");
  this.disableBaseContainerCtrl(val);
  
  var row = this.assigned[val];
  this.mr = row;
  
  var column = this.map[val];
  
  $("span.col-name-val", row).hide();
  $("input.col-name", row).show();
  
  if (ex_type == "auto_inc") {
    $("span.auto-start-from-val", row).hide();
    $("span.auto-inc-by-val", row).hide();
    $("input.auto-start-from", row).show();
    $("input.auto-inc-by", row).show();
  } else if (ex_type == "calc") {
    var jtype = $("span.calc-type-val", row).html();
    
    // $(".ex-col-ctrl", row).show();
    $("div.calc-exp-val", row).hide();
    $("span.calc-type-val", row).hide();
    $("textarea.calc-exp", row).show();
    $("select.calc-type", row).show();
    $("span.error-val", row).hide();
    
    if (jtype == JTYPE_BOOL)
      $("select.error-val", row).show();
    else
      $("input.error-val", row).show();
    
    $("input.stop-on-error", row).prop("disabled", false);
  }

  this.enableCtrlButton(true);
};

function Column(column) {
  this.name = column.name;
  this.java_type = column.java_type;
  this.ex_type = column.ex_type;
  this.on_error = column.on_error;
  if (column.row !== undefined)
    this.row = column.row;
}

/*****************************/
/**       ColumnListProc     **/
/*****************************/

function ColumnListProc(ds, params) {
  if (!params)
    return;

  LangMapProc.call(this, ds, params);
};

ColumnListProc.prototype = new DsExtProc();

ColumnListProc.prototype.doAfterInitContainer = function() {};

ColumnListProc.prototype.setDataSetMap = function(ds_map) {
  // Nothing to save
};

ColumnListProc.prototype.getContainer = function() {
  return $("select.col-list", this.parent);
};

ColumnListProc.prototype.acceptDsColumns = function() {
  return true;
};

ColumnListProc.prototype.getOpt = function(column) {
  return $('<option value="' + column.name + '" ex_type="' + 
      column.ex_type + '">' + column.name + '</option>');
};

ColumnListProc.prototype.getOptType = function() {
  return 'option';
};

ColumnListProc.prototype.appendColumn = function(column) {
  var col = DsExtProc.prototype.appendColumn.call(this, column);
  col.opt = this.getOpt(column, this.list.length);
};

ColumnListProc.prototype.addColumnAt = function(column, idx) {
  var col = DsExtProc.prototype.addColumnAtEx.call(this, column, idx);
  col.opt = this.getOpt(column, idx);
  
  return col;
};

ColumnListProc.prototype.doAfterChangeColumnName = function(name) {
  var opt = this.map[name].opt;
  opt.val(name);
  opt.text(name);
};

ColumnListProc.prototype.changeColumnNameAssigned = function(name) {
  $(".col-name", this.assigned[name]).html(name);
};

ColumnListProc.prototype.checkColCount = function() {};

ColumnListProc.prototype.emptyContainer = function(ex_type) {
  $("option[ex_type='" + ex_type + "']",this.container).remove();
};

ColumnListProc.prototype.redraw = function(ex_type) {
  this.emptyContainer(ex_type);
  this.redrawContainer(ex_type);
  this.setCtrlButton();
  this.checkColCount();
};

ColumnListProc.prototype.redrawContainer = function(ex_type) {
  for (var i = this.list.length - 1; i>=0; i--) {
    var col = this.list[i];
    
    // Check if it's in assigned list
    if (col.ex_type == ex_type && 
           this.assigned[col.name] === undefined)
      this.container.prepend(this.getNewContainer(col));
  }
};

ColumnListProc.prototype.getNewContainer = function(column) {
  return column.opt;
};

ColumnListProc.prototype.getMapRow = function(column) {};

ColumnListProc.prototype.delMapRow = function(val, fd) {};

ColumnListProc.prototype.addMapRow = function() {};

ColumnListProc.prototype.doAfterAddMapRow = function(column) {};

ColumnListProc.prototype.doAfterColumnDeleted = function(column) {
  column.opt.remove();
};

ColumnListProc.prototype.addOpt = function(column, idx) {
  // If required index more
  // Find first index where opt can be inserted after
  var sopt;
  for (var i in this.list) {
    var col = this.list[i];
    
    if (col.name == val)
      break;
    else if (this.assigned[col.name] === undefined)
      sopt = col;
  }
  
  var opt = this.map[val].opt;
  if (sopt !== undefined)
    sopt.opt.after(opt);
  else
    this.container.prepend(opt);
  
  opt.prop('selected',true);
  
  this.lst.show();
};

ColumnListProc.prototype.onLoadData = function(data) {
  // Nothing to load
  return;
};
