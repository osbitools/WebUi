/*
 * Open Source Business Intelligence Tools - http://www.osbitools.com/
 * 
 * Copyright 2014-2016 IvaLab Inc. and by respective contributors (see below).
 * 
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 * Date: 2015-07-15
 * 
 * Contributors:
 * 
 */

/**
 * Class to handle Group of Properties
 * 
 * @param {Object} pgrp Group of properties needs to be added inside.
 * 
 */

function PropGroup(wwg, pgrp, pmap) {
  // Initiate properties
  this.props = [];
  this.pmap = {};
  
  for (var i in pgrp) {
    var descr = pgrp[i];
    var prop = new pmap[descr.name](wwg, descr.name, descr.label, descr.params);
                                  
    this.pmap[descr.name] = prop;
    this.props.push(prop);
  }
}

PropGroup.prototype.getInputRow = function() {
  this.ctrl = $('<table class="prop-group-wrapper">' + 
    '<tbody class="prop-group-wrapper"></tbody></table>');
    
  // Combine list of rows from each property
  var value = this.getValue();
  
  for (var i in this.props) {
    var prop = this.props[i];
    
    // Check if initial value needs to be set
    if (value !== undefined) {
      var pval = value[prop.name];
      
      if (pval !== undefined)
        prop.setValue(pval);
    }
    
    this.ctrl.append(prop.getInputRow());
  }
  
  return this.ctrl;
};

PropGroup.prototype.setInputValue = function(value) {
  // Set value for each included property
  for (var i in this.props)
    this.props[i].setInputValue(value[this.props[i].name]);
};

PropGroup.prototype.getValue = function(value) {
  return this.value;
};

PropGroup.prototype.setValue = function(value) {
  this.value = value;
  
  if (value !== undefined)
    // Set value for each included property
    for (var i in this.props)
      this.props[i].setValue(value[this.props[i].name]);
};

PropGroup.prototype.enableEdit = function() {
  // Enable edit for each included property
  for (var i in this.props)
    this.props[i].enableEdit();
};

PropGroup.prototype.disableEdit = function() {
  // Disable edit for each included property
  for (var i in this.props)
    this.props[i].disableEdit();
};

PropGroup.prototype.doBeforeCancelEdit = function() {
  // Disable edit for each included property
  for (var i in this.props)
    this.props[i].doBeforeCancelEdit();
};

PropGroup.prototype.getInputValue = function() {
  // Combine input value from each included property
  var res = {};
  
  for (var i in this.props) {
    var prop = this.props[i];
    res[prop.name] = prop.getInputValue();
  }
  
  return res;
};

PropGroup.prototype.getVisibleValue = function() {
  // Combine input value from each included property
  var res = {};
  
  for (var i in this.props) {
    var prop = this.props[i];
    res[prop.name] = prop.getVisibleValue();
  }
  
  return res;
};

/**
 * Get xml
 * 
 * @param {Number} tnum Number of tabs to indent for non-minified formatting
 */
PropGroup.prototype.getJsonData = function() {
  var result = [];
    
  for (var i in  this.props) {
    var pdata = this.props[i].getJsonData();
    
    if (pdata != undefined)
      result.push(pdata);
  }
          
  return result;
};

PropGroup.prototype.canSave = function() {
  for (var i in this.props)
    if (!this.props[i].canSave())
      return false;
  
  return true;
};

PropGroup.prototype.getSavedValue = function() {
  this.value = {};
  
  // for each included property
  for (var i in this.props) {
    var prop = this.props[i];
    this.value[prop.name] = prop.getSavedValue();
  }
  
  return this.value;
};

/**
 * Call on_save handler for each property
 * 
 * @param {Object} value Saved value
 */
PropGroup.prototype.onSave = function(value) {
  // Run for each included property
  for (var i in this.props) {
    if (this.props[i].params !== undefined) {
      var on_save = this.props[i].params.on_save;
      
      if (typeof on_save == "function")
        on_save(value);
    }
  }
};

PropGroup.prototype.getProps = function() {
  return this.props;
};
