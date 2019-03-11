/*
 * Open Source Business Intelligence Tools - http://www.osbitools.com/
 * 
 * Copyright 2014-2016 IvaLab Inc. and by respective contributors (see below).
 * 
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 * Date: 2015-07-17
 * 
 * Contributors:
 * 
 */

"use strict";

/**
 * Class to handle Group of PropGroup of Properties
 * Initial configured group can be cloned with all included properties 
 *                              to generate up to "max" number of subgroups
 * 
 * @param {String} name group name
 * @param {String} label Index for human readable label
 * @param {Object} value Array of values for all included properties.
 * @param {Object} pgrp Single PropGroup that will be used to clone 
 *                                            if extra PropGroup required
 * @param {Object} params Optional parameters as next:
 *    {Function} on_save Save handler (optional)
 *    {String} tooltip (optional) Tooltip to show when 
 *                                mouse over group info (tab)
 * 
 */

function MultiPropGroupInput(wwg, name, label, params) {
  if (wwg === undefined)
    return;
  
  this.init(wwg, name, label, params);  
}

MultiPropGroupInput.prototype = new AbstractInput();

MultiPropGroupInput.prototype.init = function(wwg, name, label, params) {
  AbstractInput.prototype.init.call(this, wwg, name, label, params);
  
  // Detect if group has property with data aware links
  this.dlinks = {};
  for (var lname in wwg.dlinks) {
    this.dlinks[lname] = {
      list: [],
      enabled: false
    };
  }
  
  for (var i in this.params.prop_group) {
    var pdescr = this.params.prop_group[i];
    var params = pdescr.params;
       
    if (params !== undefined && !is_empty(params.dlink)) {
      var dlink = this.dlinks[params.dlink];
      if (!dlink !== undefined) {
        dlink.enabled = true;
        dlink.list.push(pdescr.name);
      }
    }
  }
  
  var me = this;
  this.params.on_save = function(value) {
    me.onSave(value);
  };
  
  // Prop Group order change flag
  this.fpchanged = false;
};

MultiPropGroupInput.prototype.getInputRow = function() {
  var me = this;
  var lbl = t(me.label);
  
  // Check if anything initialized
  if (this.plist === undefined) {
    this.plist = [];

    // Add fixed tabs
    if (this.params.is_multi)
      this.plist.push(this.getPropGroup(0));
    else
      for (var i = 0; i < this.params.labels.length; i++)
        this.plist.push(this.getPropGroup(i));
  }
  
  this.ctrl = $('<tr class="prop-grp-wrapper multi ' + this.name + '">' + 
    '<td class="prop-grp-wrapper multi-prop-grp-wrapper ' + this.name + '">' +
      '<div class="multi-grp-tabs"></div>' +
      '<div class="grp-bodies"></div>' +
    '</td></tr>');
  
  this.tabs = $("div.multi-grp-tabs", this.ctrl);
  this.bodies = $("div.grp-bodies", this.ctrl);
  
  // Add groups
  for (var i in this.plist)
      this.tabs.append(this.addPropGroupTab(Number(i),
        (this.params.is_multi) ? t(this.label) + "&nbsp;" + (Number(i) + 1) : 
                          t(this.params.labels[i]), this.plist[i], false));
  
  if (this.params.is_multi) {  
    // Add Plus button
    var btn = $('<span class="ui-icon ui-icon-plus hidden"' + 
            ' title="' + ts('LL_ADD_NEW_TAB') + '"></span>');
    $(btn).on("click", function() {
      // Add & select new tab
      me.appendPropGroup().enableEdit();
    });
    
    this.tabs.append(btn);
  }
  
  // Set first tab selected
  $("div.multi-grp-tab:first", this.tabs).addClass("selected");
  
  // Hide all bodies except first tab
  $("div.multi-grp-body:first", this.bodies).show();
  
  return this.ctrl;
};

MultiPropGroupInput.prototype.selPropGroup = function(tab) {
  if (tab.hasClass("selected"))
    return;
    
  this.selPropGroupEx(tab);
};

MultiPropGroupInput.prototype.clonePropGroup = function(idx) {
  var pgrp = new PropGroup(this.wwg, 
          this.params.prop_group, this.params.prop_map);
  
  // Set default value for given tab index
  for (var i in pgrp.props)
    pgrp.props[i].setSeriesDefValue(idx);
    
  return pgrp;
};

MultiPropGroupInput.prototype.selPropGroupEx = function(tab) {
  // Unselect old label (if anything selected)
  $(".selected", this.tabs).removeClass("selected").data("body").hide();
  
  // Select current label
  tab.addClass("selected");
    
  // Show new body
  tab.data("body").show();
};

MultiPropGroupInput.prototype.getPropGroup = function(idx) {
  // Clone props groups
  var pgrp = this.clonePropGroup(idx);
    
  // Check if datasource needs to be load
  for (var lname in this.dlinks) {
    var dlink = this.dlinks[lname];
    if (dlink.enabled)
      for (var j in dlink.list)
        pgrp.pmap[dlink.list[j]].load(dlink.data);
  }
                                            
  return pgrp;
};

/**
 * Append new group tab at the end of all groups.
 * Only works if is_multi = true
 */
MultiPropGroupInput.prototype.appendPropGroup = function() {
  // Define new index position
  var idx = $("div.multi-grp-tab",this.tabs).not(":hidden").length;
  
  var pgrp = this.getPropGroup(idx);
  
  var tab = this.addPropGroupTab(idx, 
                t(this.label) + " " + (idx + 1), pgrp, true);
  $("div.multi-grp-tab:last", this.tabs).after(tab);
  tab.data("pgrp", pgrp);
  
  // Select new tab
  this.selPropGroupEx(tab);
  
  this.checkSinglePropGroup();

  // Set changed flags
  this.setTabChanged();
                                          
  return pgrp;
};

MultiPropGroupInput.prototype.addPropGroupTab = function(idx, label, pgrp, fnew) {
  var me = this;
  var tab = $('<div class="grp-tab multi-grp-tab' + (fnew ? " new" : "") + '">' +
    '<table><tr><td class="label">' + label + '</td>' +
      '<td>' + (this.params.is_multi ? '<span class="ui-icon ui-icon-close' + 
        (!fnew ? " hidden" : "") + '" title="' + ts("LL_DELETE_TAB") +
        '" ></span>' : "") + '</td>' +
    '</tr></table></div>');
  
  tab.data("idx", idx);
  
  $("td.label", tab).on("click", function() {
    me.selPropGroup(tab);
  });
  
  if (this.params.is_multi)
    $("span.ui-icon-close", tab).on("click", function() {
      if (confirm(ts("LL_PLEASE_CONFIRM")))
        me.delPropGroupTab($(this).closest("div.multi-grp-tab"));
    });
  
  var body = $('<div class="multi-grp-body hidden"></div>');
  tab.data("body", body);
  this.bodies.append(body);
  body.append(pgrp.getInputRow());
  
  return tab;
};

MultiPropGroupInput.prototype.delPropGroupTab = function(tab) {
  if (tab.hasClass("selected")) {
    // Auto select next (if not last) or previous (if last)
    var next = tab.next("div.multi-grp-tab").not(":hidden");
    
    if (next.length == 0)
      this.selPropGroupEx(tab.prev());
    else
      this.selPropGroupEx(next);
  }
  
  // Hide Tab
  tab.hide();
  
  this.checkSinglePropGroup();
  
  this.onPropGroupOrderChanged();
};

MultiPropGroupInput.prototype.setValue = function(value) {
  AbstractInput.prototype.setValue.call(this, value);
  
  if (this.plist === undefined) {
    this.plist = [];
    
    // Prepare properties
    for (var i = 0; i < value.length; i++)
      this.plist.push(this.clonePropGroup(i));
  }
  
  // Set value for each included property
  for (var i in this.plist)
    this.plist[i].setValue(value[i]);
};
  
MultiPropGroupInput.prototype.setInputValue = function(value) {
  // Set value for each included property
  for (var i in this.plist)
    this.plist[i].setInputValue(value[i]);
};

MultiPropGroupInput.prototype.enableEdit = function() {
  // Enable edit for each included property
  for (var i in this.plist)
    this.plist[i].enableEdit();
  
  // Show add buttons
  $(".ui-icon-plus", this.tabs).show();
  
  // Conditionally show close button
  this.checkSinglePropGroup();

  // Enable sorting for selected tab
  var me = this;
  this.tabs.sortable({
    update: function(event, ui) {
      me.onPropGroupOrderChanged();
    },
    cancel: 'div.multi-grp-tab:not(".selected")'
  });
};

MultiPropGroupInput.prototype.checkSinglePropGroup = function() {
  // Conditionally show close button
  if ($("div.multi-grp-tab", this.tabs).not(":hidden").length == 1)
    $(".ui-icon-close", this.tabs).hide();
  else
    $(".ui-icon-close", this.tabs).show();
};

MultiPropGroupInput.prototype.onPropGroupOrderChanged = function() {
  // Reindex tab label
  var cnt = 0;
  var me = this;
  $("div.multi-grp-tab", this.tabs).not(":hidden").each(function() {
    $("td.label", this).html(me.getPropGroupLabelText(++cnt));
  });

  this.setTabChanged();
};

MultiPropGroupInput.prototype.setTabChanged = function() {
  // Raise order change flag
  this.fpchanged = true;
  
  // Enable save
  this.wwg.setSaved(false);
};

MultiPropGroupInput.prototype.getPropGroupLabelText = function(cnt) {
  return t(this.label) + "&nbsp;" + cnt;
};

MultiPropGroupInput.prototype.reIndexPropGroups = function() {
  var cnt = 0;
  var me = this;

  // Assemble list with new order
  var plist = [];
  $("div.multi-grp-tab", this.tabs).each(function() {
    var el = $(this);
    var idx = el.data("idx");
    plist.push(me.plist[idx]);
    el.data("idx", cnt);
    $("td.label", el).html(me.getPropGroupLabelText(++cnt));
  });
  
  // Replace current prop group list
  this.plist = plist;
  
  // Set changed flags
  this.setTabChanged();
  
  // Enable save
  this.wwg.setSaved(false);
};

MultiPropGroupInput.prototype.disableEdit = function() {
  // Disable edit for each included property
  for (var i in this.plist)
    this.plist[i].disableEdit();
    
  // Show close buttons
  $(".ui-icon", this.tabs).hide();
    
  // Disable sorting for selected tab
  this.tabs.removeClass("ui-sortable").sortable();
};

MultiPropGroupInput.prototype.doBeforeCancelEdit = function() {
  // Disable edit for each included property
  for (var i in this.plist)
    this.plist[i].doBeforeCancelEdit();
    
  if (this.fpchanged) {
    $("div.multi-grp-tab", this.tabs).show();
    
    // Remove newly created tabs
    $("div.multi-grp-tab.new", this.tabs).remove();
    
    // Restore original order of tabs
    var list = $("div.multi-grp-tab", this.tabs);
    var len = list.length;
    
    if (len > 1) {
      var cnt = 0;
      for (var i = 0; i < len - 2; i++) {
        var me = $(list[i]);
        var idx = me.data("idx");
        
        if (idx != cnt) {
          // Swap positions
          var tmp = $($("div.multi-grp-tab", this.tabs)[idx]);
          
          if (idx == 0) {
            var next = me.next();
            $("td.label", me).html(this.getPropGroupLabelText(i + 1));
            tmp.after(me);
            next.before(tmp);
          } else {
            var prev = me.prev();
            tmp.after(me);
            prev.after(tmp);
          }
        }
        
        cnt++;
      }
    }
    
    this.fpchanged = false;
  }
};

MultiPropGroupInput.prototype.getInputValue = function() {
  // Combine input value from each included property
  var res = [];
  for (var i in this.plist)
    res.push(this.plist[i].getInputValue());
    
  return res;
};

MultiPropGroupInput.prototype.getVisibleValue = function() {
  // Combine input value from each included property
  var res = [];
  for (var i in this.plist)
    res.push(this.plist[i].getVisibleValue());
    
  return res;
};

/**
 * Get xml
 * 
 * @param {Number} tnum Number of tabs to indent for non-minified formatting
 */
MultiPropGroupInput.prototype.getXml = function(tnum) {
  var res = "";
    
  for (var i in this.plist)
    res += this.plist[i].getXml(tnum + 1);  
          
  return res != "" ? get_cr() + get_tab_num(tnum) + '<prop_group name=\"' + 
    this.name + '\">' + res + get_cr() + 
      get_tab_num(tnum) + "</prop_group>" : "";
};

MultiPropGroupInput.prototype.canSave = function() {
  for (var i in this.plist) {
    if (!this.plist[i].canSave()) {
      this.selPropGroup($($("div.multi-grp-tab", this.tabs)[i]));
      return false;
    }
  }
  
  return true;
};

MultiPropGroupInput.prototype.getSavedValue = function() {
  this.value = [];
  
  if (this.fpchanged) {
    // Recreate prop group list
    var plist = [];
    
    var me = this;
    $("div.multi-grp-tab", this.tabs).not(":hidden").each(function() {
      var tab = $(this);
      plist.push(tab.hasClass("new") ? tab.data("pgrp") : 
                                me.plist[tab.data("idx")]);
    });

    // Remove new class(es)
    $("div.multi-grp-tab", this.tabs).removeClass("new");

    // Replace current prop group list
    this.plist = plist;
  }
  
  // for each included property
  for (var i in this.plist)
    this.value.push(this.plist[i].getSavedValue());
  
  return this.value;
};

/**
 * Call on_save handler for each property
 * 
 * @param {Object} value Saved value
 */
MultiPropGroupInput.prototype.onSave = function(value) {
  // Run for each included property
  for (var i in this.plist)
    this.plist[i].onSave(value);
};

MultiPropGroupInput.prototype.getPropsList = function() {
  return this.plist;
};

/**
 * Load initial input set for dataset aware input(s)
 */
MultiPropGroupInput.prototype.reload = function(list, lname) {
  if (this.dlinks[lname] === undefined)
    return;

  // Remember current dataset list to use when another group added
  this.dlinks[lname].data = list;

  for (var i in this.plist)
    for (var j in this.dlinks[lname].list)
      this.plist[i].pmap[this.dlinks[lname].list[j]].reload(list);
};

/**
 * Load initial input set for dataset aware input(s)
 */
MultiPropGroupInput.prototype.load = function(list, lname) {
  if (this.dlinks[lname] === undefined)
    return;
    
  // Remember loaded list  
  this.dlinks[lname].data = list;
  
  for (var i in this.plist)
    this.setPropListLinks(this.plist[i], lname, list);
};

/**
 * Fill
 */
MultiPropGroupInput.prototype.setPropListLinks = function(plist, lname, list) {
  for (var j in this.dlinks[lname].list)
      plist.pmap[this.dlinks[lname].list[j]].load(list);
};

/**
 * Enable dataset aware input(s)
 */
MultiPropGroupInput.prototype.enable = function(lname) {
  if (this.dlinks[lname] === undefined)
    return;
      
  for (var i in this.plist)
    for (var j in this.dlinks[lname].list)
      this.plist[i].pmap[this.dlinks[lname].list[j]].enable();
};

/**
 * Disable dataset aware input(s)
 */
MultiPropGroupInput.prototype.disable = function(lname) {
  if (this.dlinks[lname] === undefined)
    return;
  
  for (var i in this.plist)
    for (var j in this.dlinks[lname].list)
      this.plist[i].pmap[this.dlinks[lname].list[j]].disable();
};

MultiPropGroupInput.prototype.hasDataSetLink = function(lname) {
  return this.dlinks[lname].enabled;
};

// Register input control constructor in global array
jOsBiTools.input_ctrls["multi_prop_group"] = MultiPropGroupInput;
