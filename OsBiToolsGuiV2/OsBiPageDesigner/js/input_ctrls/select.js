/*
 * Open Source Business Intelligence Tools - http://www.osbitools.com/
 * 
 * Copyright 2014-2016 IvaLab Inc. and by respective contributors (see below).
 * 
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 * Date: 2015-06-16
 * 
 * Contributors:
 * 
 */

/**
 * Class to handle drop down select input
 * 
 * @param {String} name Input name
 * @param {String} label Index for human readable label
 * @param {Object} value Object or String that contains 
 *    current and/or default value. If it's String than this is the only value 
 *    for input field. If it object than it contains the pair current/default 
 *    values.
 * @param {Object} list Array with key->object (key->string) pair.
 *        {Function} function that returns list of key->object or key->string
 *          If value is object than it should have getKey/getValue method
 * @param {Object} params Optional parameters as next:
 *    {Function} on_change Change handler (optional)
 *    {Function} on_save Save handler (optional)
 *    {String} tooltip (optional) Tooltip to show when mouse over input field
 *    {String} suffix (optional) Suffix to show after input field
 *    {String} empty_entry (optional) Label for entry with empty key that will
 *              be inserted in front of selection list. If del_empty_on_sel is 
 *              false or not defined than empty string always added.
 *    {Object} del_empty_on_sel Delete empty entry when something selected. 
 *      Works together with empty_entry.
 * 
 */

"user strict";

function SelectInput(wwg, name, label, params) {
  AbstractHtmlInput.prototype.init.call(this, wwg, name, label, params);
  
  this.list = params.list;
  AbstractHtmlInput.prototype.init_sel.call(this, this.list);
}

SelectInput.prototype = new AbstractHtmlInput();

SelectInput.prototype.getInputTagName = function() {
  return "select";
};

SelectInput.prototype.getInputElement = function(cname) {
  if (this.params.empty_entry !== undefined) {
    this.sempty = '-- ' + ts(this.params.empty_entry) + ' --';
    this.sempty_item = '<option value="">' + this.sempty + '</option>';
  }
  
  // var opts = this.getOptList();
  var opts = this.getListItems();
  this.clidx = this.lidx;
  
  return '<select class="' + cname + '"' + 
                      this.getTooltip() + '>' + opts + "</select>";
};  

SelectInput.prototype.getListItem = function(obj, fsel) {
  return '<option value="' + obj.getKey() + '"' + 
      (fsel ? " selected" : "") + ">" + obj.getValue() + '</option>';
};

SelectInput.prototype.getEmptyItem = function(obj, fsel) {
  return this.sempty_item;
};

SelectInput.prototype.bindInputEvents = function(ctrl) {
  var me = this;
  
  this.tinput.on("change", function() {
    me.onSelChange();
  });
};

SelectInput.prototype.doBeforeCancelEdit = function() {
  if (this.fchanged && this.del_empty_on_sel && 
                  this.sempty !== undefined && this.fremoved)
    // Prepend back empty selection
    this.tinput.prepend(this.sempty_item);
   
  // Drop changed flag 
  this.fchanged = false;
};

SelectInput.prototype.doAfterSaved = function() {
  // Drop changed flag 
  this.fchanged = false;
};

SelectInput.prototype.emptyItems = function() {
  this.tinput.empty();
};

SelectInput.prototype.getListInputCtrl = function() {
  return this.tinput;
};

SelectInput.prototype.setInputError = function(value) {
  this.tinput.addClass("error");
};

SelectInput.prototype.setInputValue = function(value) {
  AbstractHtmlInput.prototype.setInputValue.call(this, 
    !is_empty(value) && this.lmap[value] !== undefined ? value : "");
};

SelectInput.prototype.getFirstItem = function(value) {
  return $("option:first", this.tinput);
};

SelectInput.prototype.getDisplayValue = function() {
  // Check if visible value defined than map for display value
  var lval = this.getVisibleValue();
  var dval = (is_empty(lval) ? lval : this.lmap[lval]);
  return (is_empty(dval) ? lval : dval);
};

// Register input control constructor in global array
jOsBiTools.input_ctrls["select"] = SelectInput;
