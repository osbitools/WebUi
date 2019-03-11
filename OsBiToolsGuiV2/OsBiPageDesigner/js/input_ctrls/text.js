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
 * Class to handle text input
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
 *    {String} suffix (optional) Suffix to show after input field
 * 
 */

function TextInput(wwg, name, label, params) {
  AbstractHtmlInput.prototype.init.call(this, wwg, name, label, params);
}

TextInput.prototype = new AbstractHtmlInput();

TextInput.prototype.getInputTagName = function() {
  return "input";
};

TextInput.prototype.getInputElement = function(cname) {
  return '<input type="text" class="' + cname + '"' +
                ' value="' + this.getVisibleValue() + '"' + 
                        this.getTooltip() + ' />';
};

TextInput.prototype.bindInputEvents = function() {
  var me = this;
  
  if (this.params.filter !== undefined) {
    add_filtered_handler_item($("input", this.ctrl), this.params.filter.regex, 
      function(input) {
        // Call default change handler
        me.onChange();
      }
    );
  } else {
    this.ctrl.on("input", function() {
        // Call default change handler
        me.onChange();
    });
  }
};

TextInput.prototype.getParamTooltip = function() {
  var res = AbstractHtmlInput.prototype.getParamTooltip.call(this);
  return res != "" ? res : (this.params.filter !== undefined && 
              this.params.filter.info !== undefined ? 
        this.params.filter.info : "");
};

TextInput.prototype.checkCanSave = function(value) {
  if (this.params.filter !== undefined && 
        !is_empty(this.params.filter.validation)) {
    var regex = new RegExp(this.params.filter.validation);
    if (!regex.test(value)) {
        show_alert_error(149, {cfield: this.tinput, 
          values: {
            label: this.tlabel
        }});
        return false;
    }
  }
  
  return true;
};

TextInput.prototype.doCheckInputValue = function(value) {
  // Check for case
  if (!is_empty(value)) {
    if (this.tinput.css("text-transform") == "uppercase")
      value = value.toUpperCase();
    else if (this.tinput.css("text-transform") == "lowercase")
      value = value.toLowerCase();
      
    return value;
  }
  
  // Return undefined if initially loaded was undefined as well
  //    otherwise return empty
  if (this.loaded !== undefined)
    return value;
  else
    return;
};

// Register input control constructor in global array
jOsBiTools.input_ctrls["text"] = TextInput;
