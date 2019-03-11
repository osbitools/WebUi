/*
 * Open Source Business Intelligence Tools - http://www.osbitools.com/
 * 
 * Copyright 2014-2016 IvaLab Inc. and by respective contributors (see below).
 * 
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 * Date: 2015-06-11
 * 
 * Contributors:
 * 
 */

/**
 * Class to handle boolean input (True/False) using HTML Checkbox
 * 
 * @param {String} name Input name
 * @param {String} label Index for human readable label
 * @param {Object} value Object or String that contains 
 *    current and/or default value. If it's String than this is the only value 
 *    for input field. If it object than it contains the pair current/default 
 *    values.
 * @param {Object} params Optional parameters as next:
 *    {Function} on_change Change handler (optional)
 *    {Function} on_save Save handler (optional)
 *    {String} tooltip (optional) Tooltip to show when mouse over input field
 * 
 */

function CheckBoxInput(wwg, name, label, params) {
  AbstractHtmlInput.prototype.init.call(this, wwg, name, label, params);
}

CheckBoxInput.prototype = new AbstractHtmlInput();

CheckBoxInput.prototype.getInputTagName = function() {
  return "input";
};

CheckBoxInput.prototype.getInputElement = function(cname) {
  return '<input type="checkbox" class="' + cname + '"' +
    (this.getValue() ? " checked" : "") + this.getTooltip() + ' />';
};

CheckBoxInput.prototype.bindInputEvents = function() {
  var me = this;
  
  $("input", this.ctrl).on("click", function(evt) {
    me.tinput.removeClass("default");
    
    // Call default change handler
    me.onChange();
  });
};

CheckBoxInput.prototype.getRealInputValue = function() {
  return this.tinput.is(":checked");
};

CheckBoxInput.prototype.setValue = function(value) {
  var value = get_bool_val(value);
  AbstractHtmlInput.prototype.setValue.call(this, value);
};

CheckBoxInput.prototype.setInputValue = function(value) {
  this.tinput.prop("checked", value);
};

CheckBoxInput.prototype.convertValueToString = function(value) {
  return value ? "true" : "false";
};

// Register input control constructor in global array
jOsBiTools.input_ctrls["check_box"] = CheckBoxInput;
