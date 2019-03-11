/*
 * Open Source Business Intelligence Tools - http://www.osbitools.com/
 * 
 * Copyright 2014-2016 IvaLab Inc. and by respective contributors (see below).
 * 
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 * Date: 2016-03-22
 * 
 * Contributors:
 * 
 */

/**
 * Class to handle color selection input
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
 */

function ColorInput(wwg, name, label, params) {
  AbstractInputType.prototype.init.call(this, wwg, name, label, params);
}

ColorInput.prototype = new AbstractInputType();

ColorInput.prototype.getInputType = function() {
  return "color";
};

ColorInput.prototype.getChangeEvent = function() {
  return "change";
};

ColorInput.prototype.setSeriesDefValue = function(idx) {
  // Remember series index
  this.sidx = idx;
};

ColorInput.prototype.getDefaultValue = function() {
  // Do nothing 
  return !is_empty(this.value.def) ? this.value.def : 
            this.sidx < jOsBiTools.dcolors.length ? 
                      jOsBiTools.dcolors[this.sidx] : "#000000";
};

ColorInput.prototype.setValue = function(value) {
  // Ignore empty string
  if (value != "")
    AbstractInputType.prototype.setValue.call(this, value);
};

// Register input control constructor in global array
jOsBiTools.input_ctrls["color"] = ColorInput;
