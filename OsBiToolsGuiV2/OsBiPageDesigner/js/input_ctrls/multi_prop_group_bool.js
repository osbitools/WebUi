/*
 * Open Source Business Intelligence Tools - http://www.osbitools.com/
 * 
 * Copyright 2014-2016 IvaLab Inc. and by respective contributors (see below).
 * 
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 * Date: 2016-04-28
 * 
 * Contributors:
 * 
 */

"use strict";

/**
 * Class to handle Group of PropGroup of Properties 
 *                                    with default "Enabled" flag
 * When "Enabled" flag changes it automatically enable/disable PropGroup 
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

function MultiPropGroupBoolInput(wwg, name, label, params) {
  // Add pre-defined enabled flag
  params.prop_group.unshift({
      type: "check_box",
      name: "enabled",
      label: "LL_ENABLED",
        
      params: {
        def_value: false
      }
  });    

  params.prop_map["enabled"] = jOsBiTools.input_ctrls["check_box"];
  
  // Call super method
  this.init(wwg, name, label, params);
}

MultiPropGroupBoolInput.prototype = new MultiPropGroupInput();

MultiPropGroupBoolInput.prototype.getInputRow = function() {
  var ctrl = MultiPropGroupInput.prototype.getInputRow.call(this);
  
  // Bind enabled checkbox
  var me = this;
  $("input.enabled", ctrl).on("click", function() {
    me.setPropertyEnabled($(this).is(":checked"));
  });
  
  // Set initial state
  this.setPropertyEnabled(this.plist[0].props[0].getVisibleValue());
  
  return ctrl;
};

MultiPropGroupBoolInput.prototype.setPropertyEnabled = function(enabled) {
  if (enabled) {
    $("input,select", this.bodies).prop("disabled", false);
    $("label", this.bodies).removeClass("ui-state-disabled");
  } else {
    // Disable all input controls except itself
    $("input,select", this.bodies).prop("disabled", true);
    $("input.enabled", this.bodies).prop("disabled", false);
    
    $("label", this.bodies).addClass("ui-state-disabled");
    $("label.prop-name.enabled", this.bodies).removeClass("ui-state-disabled");
  }
};

// Register input control constructor in global array
jOsBiTools.input_ctrls["multi_prop_group_bool"] = MultiPropGroupBoolInput;
