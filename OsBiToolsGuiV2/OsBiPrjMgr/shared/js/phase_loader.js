/*
 * Open Source Business Intelligence Tools - http://www.osbitools.com/
 * 
 * Copyright 2014-2016 IvaLab Inc. and by respective contributors (see below).
 * 
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 * Date: 2014-10-02
 * 
 * Contributors:
 * 
 */

"use strict";

function PhaseLoader(phases, params) {
  // Array with all phases
  this.phases = phases;
  
  // Simple array with critical phases i.e.
  // Interrupt required on first error
  if (params !== undefined && params.critical !== undefined)
    this.critical = params.critical;
  
  // What to do upon last phase loaded
  if (params !== undefined) {
    if (params.on_load !== undefined)
    this.on_load = params.on_load;
  
    // What to do upon completion (after last phase loaded)
    if (params.on_completed !== undefined)
      this.on_completed = params.on_completed;
  } 
  
  // Number of steps on current phase
  this.psteps;
  
  // Check time, msec
  this.pcheck = 100;
  
  this.reset();
}

/**
 * PHASE 4
 * Load custom configuration 
 */
PhaseLoader.prototype.start = function() {
  jOsBiTools.trace.register("Phase Loader started.");
  
  if (this.phases === undefined || 
    this.phases.length == 0 ||
    this.phases[0].length == 0 ||
    this.phases[0] === undefined)
      this.complete();
  else  
      this.process();
};
  
PhaseLoader.prototype.process = function() {
  this.psteps = this.phases[this.pnum].length;
  
  if (this.psteps == 0)
    return;
  
  // Reset phase counter
  this.pcnt = 0;
  
  // Start watchdog
  this.setTimeout();
    
  // Call all phase functions
  for (var idx in this.phases[this.pnum])
    this.phases[this.pnum][idx](this);

};

PhaseLoader.prototype.setTimeout = function() {
  var me = this;
  
  setTimeout(function () {
    me.check();
  }, me.pcheck);
};

PhaseLoader.prototype.check = function() {
  // Check if current phase is critical
  var fcrit = ($.inArray(this.pnum, this.critical) >= 0);
  
  // Error check for critical phase
  if (this.err_list.length > 0 && fcrit) {
    var dmsg = "Critical error executing phase #" + this.pnum;

    // Error page load
    //-- 3
    show_client_error_ex(3, dmsg);
    hide_loader("page_loader");
    
    // Stop execution
    return; 
  } else if (this.pcnt < this.psteps) {
    // Keep watching
    this.setTimeout();
  } else if (this.psteps == this.pcnt) {
    this.pnum++;
    
    jOsBiTools.trace.register("Phase #" + this.pnum + " completed.");
    
    // Check for errors
    if (this.err_list.length > 0) {
      jOsBiTools.log.error(this.err_list.length + 
                " error(s) during executing phase #" + this.pnum);
      
      // Check if interruption required
      if (this.pcrit > 0) {
        // Error page load
        var dmsg = "";
        var delim = "<br />";
        for (var i in this.err_list)
          dmsg += delim + this.err_list[i];
          
        show_client_error_ex(3, dmsg.substr(delim.length));
        hide_loader("page_loader");
        
        // Stop execution
        return; 
      }
      
      // Reset error counter
      this.err_list = [];
    }
    
    // Check if it's the last phase
    if (this.pnum < this.phases.length) {     
      // Process next phase       
      this.process();
    } else if (this.pnum == this.phases.length) {
      this.complete();
    }
  }
};

PhaseLoader.prototype.complete = function() {
  hide_loader("page_loader");
  if (typeof this.on_load == "function")
        this.on_load();
    
  jOsBiTools.trace.register("Phase Loader completed.");
      
  if (typeof this.on_completed == "function")
        this.on_completed();
};

PhaseLoader.prototype.setStepCompleted = function(step) {
  this.pcnt++;
};

PhaseLoader.prototype.setStepError = function(step, msg) {
  jOsBiTools.log.error("Error during Phase " + this.pnum + "/" + 
                    this.pcnt + " (" + step + ") load" + 
                        ((msg !== undefined) ? ": " + msg : "."));
  this.err_list.push(msg);
  
  // Auto-complete current step
  this.setStepCompleted(step);
};

PhaseLoader.prototype.setCritStepError = function(step, msg) {
  this.setStepError(step, msg);
  this.pcrit++;
};

PhaseLoader.prototype.reset = function() {
  // Current phase number
  this.pnum = 0;

  // Phase Step counter
  this.pcnt = 0;

  // Reset number of crit errors
  this.pcrit = 0;
  
  // Error list. Length also used as an error counter.
  this.err_list = [];
};
