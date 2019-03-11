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
 * Class to handle drop down select input together with direct edit. 
 * When typing letters in input field use it as a filter to reduce select set
 * 
 * @param {String} name Input name
 * @param {String} label Index for human readable label
 * @param {Object} value Object or String that contains 
 *    current and/or default value. If it's String than this is the only value 
 *    for input field. If it object than it contains the pair current/default 
 *    values.
 * @param {Object} list Array with key->values pair.
 *        {Function} function that returns list of key->values
 * @param {Object} params Optional parameters as next:
 *    {Function} on_change Change handler (optional)
 *    {Function} on_save Save handler (optional)
 *    {String} tooltip (optional) Tooltip to show when mouse over input field
 *    {String} suffix (optional) Suffix to show after input field
 *    
 */

function EditSelectInput(wwg, name, label, params) {
  AbstractInput.prototype.init.call(this, wwg, name, label, params);
  
  // Flag for dynamic list
  this.flist = (typeof this.params.list == "function");
  
  // Change flag
  this.fchanged = false;
}

EditSelectInput.prototype = new AbstractInput();

EditSelectInput.prototype.getInputTagName = function() {
  return "input";
};

EditSelectInput.prototype.getInputElement = function(cname) {
  return '' +
    '<table class="' + this.cname + '">' + 
      '<tr>' +
        '<td>' + 
          '<input type="text" class="' + cname + ' edit-select"' +
            ' value="' + this.getVisibleValue() + '"' +
            this.getTooltip() + ' />' +
            '<span class="ui-icon ui-icon-triangle-1-s"></span>' +
        '</td>' +
      '</tr>' +
      '<tr><td><ul class="' + cname + ' hidden">' +
          this.getOptList() + '</ul></td></tr>' +
    '</table>';
};

EditSelectInput.prototype.getOptList = function(cname) {
  var value = this.getVisibleValue();
  var list = this.flist ? this.list() : this.list;
  
  // Flag to indicates that default value is set
  this.fset = false;
  
  this.lidx = "";
  var slist = "";
  
  for (var key in list) {
    this.lidx += key;
    
    var fsel = (key == value);
    if (fsel)
      this.fset = true;
     
    slist += '<li class="' + cname + '-item' + (fsel ? " selected" : "") + 
      '" key="' + key + '">"' + list[key] + '</li>';
  }
  
  return slist;
};

EditSelectInput.prototype.bindInputEvents = function(ctrl) {
  var me = this;
  
  var me = this;
  
  if (this.params.filter !== undefined) {
    add_filtered_handler_item($("input", this.ctrl), this.params.filter.regex, 
      function(input, str) {
        me.filterList(input);
        
        // Process custom handler
        if (typeof me.params.on_change == "function")
          me.params.on_change(input);
      }
    );
  }
  
  $("ul li", this.ctrl).on("click", function() {
      tinput.removeClass("default").removeClass("error");
      
      if (me.del_empty_on_sel && me.sempty !== undefined) {
        // Check if first option is empty and delete it
        var opt = $("option:first", me.tinput);
        // Raise removed flag
        me.fremoved = (opt.html() == me.sempty);
          
        if (me.fremoved)
          opt.remove();
      }
      
      this.onSelChange();
  });
};

EditSelectInput.prototype.doBeforeCancelEdit = function() {
  if (this.fchanged && this.del_empty_on_sel && 
                  this.sempty !== undefined && this.fremoved)
    // Prepend back empty selection
    this.tinput.prepend(this.sempty_opt);
   
  // Drop changed flag 
  this.fchanged = false;
};

EditSelectInput.prototype.doAfterSaved = function() {
  // Drop changed flag 
  this.fchanged = false;
};

// Register input control constructor in global array
jOsBiTools.input_ctrls["edit_select"] = EditSelectInput;
