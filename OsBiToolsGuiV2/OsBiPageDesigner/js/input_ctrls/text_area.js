/*
 * Open Source Business Intelligence Tools - http://www.osbitools.com/
 * 
 * Copyright 2014-2016 IvaLab Inc. and by respective contributors (see below).
 * 
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 * Date: 2016-05-02
 * 
 * Contributors:
 * 
 */

/**
 * Class to handle text area input
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
 *    {Object} filter Validation filter
 * 
 */

function TextAreaInput(wwg, name, label, params) {
  AbstractHtmlInput.prototype.init.call(this, wwg, name, label, params);
}

TextAreaInput.prototype = new AbstractHtmlInput();

TextAreaInput.prototype.getInputTagName = function() {
  return "textarea";
};

TextAreaInput.prototype.getInputElement = function(cname) {
  return '<textarea class="' + cname + '"' + '>' +
                                  this.getVisibleValue() + '</textarea>';
};

TextAreaInput.prototype.bindInputEvents = function() {
  var me = this;
  
  this.ctrl.on("input", function() {
    // Call default change handler
    me.onChange();
  });
};

// Register input control constructor in global array
jOsBiTools.input_ctrls["text_area"] = TextAreaInput;
