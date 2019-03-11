/*
 * Open Source Business Intelligence Tools - http://www.osbitools.com/
 * 
 * Copyright 2014-2016 IvaLab Inc. and by respective contributors (see below).
 * 
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 * Date: 2016-03-30
 * 
 * Contributors:
 * 
 */

/**
 * Class to handle numeric input
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

function NumberInput(wwg, name, label, params) {
  AbstractInputType.prototype.init.call(this, wwg, name, label, params);
}

NumberInput.prototype = new AbstractInputType();

NumberInput.prototype.getInputType = function() {
  return "number";
};

NumberInput.prototype.getChangeEvent = function() {
  return "input";
};

NumberInput.prototype.setValue = function(value) {
  // Ignore empty string
  if (value != "")
    AbstractInputType.prototype.setValue.call(this, value);
};

// Register input control constructor in global array
jOsBiTools.input_ctrls["number"] = NumberInput;
