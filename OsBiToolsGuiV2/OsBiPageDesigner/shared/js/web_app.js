/*
 * Open Source Business Intelligence Tools - http://www.osbitools.com/
 * 
 * Copyright 2014-2016 IvaLab Inc. and by respective contributors (see below).
 * 
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 * Date: 2015-03-24
 * 
 * Contributors:
 * 
 */

"use strict";

/**
 * Web Application module
 * Consist of 2 global parts:
 * 
 * init - load all dependencies. Return control back to onReady handler
 * start - start phase loader 
 * 
 * Both methods load base (if found) first
 */
function WebApp() {}

WebApp.prototype.init = function (bs, callback, base) {
  var me = this;
  
  // Pointer on bootstrap
  this.bs = bs;
  this.onReady = callback;
  
  this.config = this.initConfig();
  
  // Attach to main ERR_LIST
  if (this.config.err_list !== undefined)
    ERR_LIST = $.extend(ERR_LIST, this.config.err_list);
  
  if (this.config.version !== undefined)
    this.setVersion(base);
    
  // Check if base defined
  var base = this.config.base;
  
  if (base !== undefined) {
    // Load module
    load_script("modules/" + base + "/js/main.js", 
      function() {
        // Call module main to initiate module
        me.base = window[base + "_main"]();
        
        // Set parent application
        me.base.app = me;
        
        // Set possible parameters
        me.base.setParams(me.config[base]);
        
        me.base.init(bs, function() {
          me.load();
        }, base);
      }
    );
  } else {
    // Start resource load
    this.load();
  }
};

/**
 * Load web app resources
 */
WebApp.prototype.load = function() {
  var me = this;
  
  // Number of resources to load
  this.rcnt = 0;
  
  // Start loading additional modules (if any)
  var fscripts = (this.config.scripts !== undefined && 
                            this.config.scripts.length > 0);
  if (fscripts)
    this.rcnt += this.config.scripts.length;
  
  var fstyles = (this.config.styles !== undefined && 
                              this.config.styles.length > 0);
  if (fstyles)
    this.rcnt += this.config.styles.length;
  
  if (this.rcnt > 0) {  
    if (fscripts) {
      for (var i in this.config.scripts) {
        load_script(this.getResourcePrefix() + 
          "/js/" + this.config.scripts[i], function() {
            me.rcnt--;
        });
      }
    }
    
    if (fstyles) {
      for (var i in this.config.styles) {
        load_style(this.getResourcePrefix() + "/css/" + this.config.styles[i],
          function() {
            me.rcnt--;
        });
      }
    }
    
    // Start checking procedure
    window.setTimeout(function() {
      me.check();
    }, 50);
  } else {
    this.ready();
  }
};

/**
 * Check if all resource loaded
 */
WebApp.prototype.check = function () {
  var me = this;
  if (this.rcnt > 0)
    window.setTimeout(function() {
      me.check();
    }, 50);
  else
    this.ready();
};

WebApp.prototype.ready = function() {
  // call resource loaded callback
  this.onResourceLoaded();
  
  // Return back to caller
  this.onReady();
};

WebApp.prototype.onResourceLoaded = function () {};

/**
 * Start phase loader. Called from bootstraper or from parent web app
 */
WebApp.prototype.start = function(fcomp) {
  var me = this;
  
  if (typeof fcomp != "function")
    fcomp = this.config.phase_loader.on_completed;
    
  // Overwrite on _completed handler
  this.config.phase_loader.on_completed = function() {
    if (typeof fcomp == "function")
      fcomp();
    jOsBiTools.trace.register("Page load completed.");
  };
    
  if (this.base !== undefined) {
    this.base.start(function() {
      me.startPhaseLoader();
    });
  } else {
    this.startPhaseLoader();
  }
};

WebApp.prototype.startPhaseLoader = function() {
  var me = this;
  
  // First call on Congiuration Loaded callback
  this.onConfigLoaded();
  
  var lmsg = this.config.loading;
  if (lmsg !== undefined)
    show_loader("page_loader", t(lmsg));
  
  if (this.config.phase_loader != undefined) {
    // Assign on_load event if none
    if (this.config.phase_loader.on_load === undefined)
      this.config.phase_loader.on_load = function() {
        me.onShow();
      };
    this.config.phase_loader.start();
  } else {
    this.onShow();
  }
};

WebApp.prototype.onConfigLoaded = function () {};

/**
 * Show web app context
 */
WebApp.prototype.onShow = function() {
  this.getContext().removeClass("hidden");
};

/**
 * Get subdirectory where JavaScript resources located
 * Subdirectory is relative to web app root path
 */
WebApp.prototype.getResourcePrefix = function() {
  return ".";
};

WebApp.prototype.getContext = function() {
  return $("#osbitools .webapp_ctx");
};

WebApp.prototype.stop = function() {
  if (this.base !== undefined)
    this.base.stop();
    
  if (typeof this.config.on_logout == "function")
        this.config.on_logout();
        
  this.config.phase_loader.reset();
};

WebApp.prototype.getVersion = function() {
  return this.version;
};

WebApp.prototype.getWsVersion = function() {
  return this.ws_ver;
};

WebApp.prototype.setBaseVersion = function(base) {
  var el = $("#osbi_version");
  this.version = this.config.version;
  el.prop("title", el.prop("title") + "\nBase " + base + 
                              " v " + this.version.join("."));
};

WebApp.prototype.setMainVersion = function(version, ws_ver) {
  this.ws_ver = this.config.ws_ver;
  this.version = this.config.version;
  var el = $("#osbi_version");
  
  el.html("v " + this.version.join("."));
  el.prop("title", t("LL_LOADER") + " v " + this.bs.version.join(".") + "\n" +
                      t("LL_WS_VER") + " v " + this.ws_ver.join("."));
};

WebApp.prototype.setVersion = function(base) {
  if (base === undefined)
    this.setMainVersion();
  else
    this.setBaseVersion(base);
};

WebApp.prototype.initConfig = function() {
  return WEB_APP_CFG;
};

WebApp.prototype.getConfig = function() {
  return this.config;
};

WebApp.prototype.setParams = function(params) {
  this.params = params !== undefined ? params : {};
};

WebApp.prototype.getCfgKeys = function() {
  var keys = this.config.cfg_keys === undefined ? [] : 
                                    this.config.cfg_keys;
  if (this.base !== undefined)
    keys = keys.concat(this.base.getCfgKeys());
    
  return keys; 
};
