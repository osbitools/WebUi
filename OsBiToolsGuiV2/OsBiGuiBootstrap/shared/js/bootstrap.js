/*
 * Open Source Business Intelligence Tools - http://www.osbitools.com/
 * 
 * Copyright 2014-2016 IvaLab Inc. and by respective contributors (see below).
 * 
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 * Date: 2015-03-13
 * 
 * Contributors:
 * 
 */

"use strict";

// OsBiToolsWebBootstrap version
var BOOT_VERSION = "1.0.0";

// Web App handler
var WEB_APP;

$(document).ready(function() {
  // 0. Check for browser compatibility
  var msg = jOsBiTools.check_browser();
  if (msg !== undefined) {
    $("#osbitools").html('<font color="red"><b>' + msg +  '</b></font>');
    return;
  }
  
  // Prevent load any logic if Portlet in edit mode
  if (CONFIG_MODE)
    return;

  // Show init message if system variables not defined
  if (window["ROOT_PATH"] === undefined) {
    // UI had been installed but currently in init phase
    jOsBiTools.init = true;
    return;
  }
  
  // 1. Start load trace. Always first
  jOsBiTools.trace.init("Page Ready");
  
  // 1. Init bootstrap
  var bs = new OsBiToolsWebBootstrap();
  
  // 2. Show loading message. Always b4 loader
  document.title = "OsBiTools | " + ts("LL_LOADING");
  show_loader("page_loader", t("LL_LOADING_BOOTSTRAP"));
  
  // 3. Start bootstrap loader
  bs.start();
});

/**************** Page Loader Singletons ****************/

function OsBiToolsWebBootstrap() {
  this.version = BOOT_VERSION.split(".");
  
  // Inject service widgets
  $("#osbitools").html('' +
    '<div class="page_loader"></div>' +
    
    // WebApp Context
    '<div class="webapp_ctx hidden"></div>' +
    
    // Error Window
    '<div class="error_window ui-state-error ui-corner-all hidden">' +
    '  <button class="b-close">X</button>' +

    '  <div class="dialog-header ui-state-error-text">' +
    '    <span class="ll_error_c"></span> #<span class="err_code"></span>' +
    '  </div>' +
    '  <div class="dialog-sub-header" style="white-space: nowrap;">' +
    '    <span class="err_details"></span>' +
    '    <span class="btn_err_toggle" onclick="toggle_error_details()">' +
    '      <img class="bottom hidden" src="' + ROOT_PATH + 
                                    'shared/images/icon_up.png" />' +
    '      <img class="top" src="' + ROOT_PATH + 
                                  'shared/images/icon_down.png" />' +
    '    </span>' +
    '  </div>' +
    '  <span class="err_info dialog-text hidden"></span>' +
    '</div>' +

    // Success Window
    '<div class="success_window ui-corner-all hidden">' +
    '  <button class="b-close">X</button>' +

    '  <div class="dialog-header"><span class="ok_msg"></span></div>' +
    '</div>' +

    '<footer><span class="copyright">&copy; Ivalab 2014-' + (new Date()).getFullYear() + 
                        '</span><span class="osbi_version"></span></footer>'
  );
  
  
  // Last
  set_lang_labels();
};

OsBiToolsWebBootstrap.prototype.start = function() {
  var me = this;
  WEB_APP = new WebApp();
  WEB_APP.init(this, function() {
    me.load();
  });
};

/**
 * STEP 0 - load base.txt(optional) with web service path.
 * Default is ws/rest subdirectory
 */
OsBiToolsWebBootstrap.prototype.load = function() {
  var me = this;
  
  // Set title. Use default App Title Here message
  var title = t(
	 !jOsBiTools.is_empty(WEB_APP_CFG.title) ? 
		WEB_APP_CFG.title : "LL_TOOL_TITLE");

  // If default title not set than do nothing
  if (!jOsBiTools.is_empty(title)) {
    $("#osbitools .ll_tool_title").html(title);
    document.title = title;
  }

  // Check if ws_host defined
  // Checking priority is next:
  // 1. WEB_APP.ws_host configuration (hardcoded)
  // 2. "ws_host" cookie name (saved)
  // 3. ./base.txt server side file (dynamic)
  BASE_URL = (BASE_URL !== undefined 
    ? BASE_URL 
    : (WEB_APP_CFG.ws_host !== undefined) 
        ? ROOT_PATH + WEB_APP_CFG.ws_host 
        : $.cookie("ws_host"));
  
  if (BASE_URL !== undefined) {
    // Continue with version check
    this.checkVersion();
  } else {   
    // Try load base url from base.txt
    get_ajax_simple(make_abs_req("base.txt"),
      function(data) {
        BASE_URL = ROOT_PATH + data.trim();
        me.checkVersion();
      },
      function() {
        BASE_URL = ROOT_PATH + DEFAULT_BASE_URL;
        
        // If base.txt doesn't exists than 
      	// save default setting in cookie in order to stop
      	// producint 404 error on each page load
        $.cookie("ws_host", BASE_URL);

        me.checkVersion();
      }
    );
  }
};

/**
 * Step 1 - Check Version
 * Load WS version and compare with current 
 */
OsBiToolsWebBootstrap.prototype.checkVersion = function() {
  var me = this;
  
  get_ajax_simple(make_rel_req(URL_LIST.VERSION),
    function(data) {
      if ( jOsBiTools.is_empty(data)) {
        hide_loader("page_loader");
        show_client_error_ex(5, "Version is empty");
        return;
      }
      
      // Strip possible double quotes
      // Check major and minor versions. Stop if major versions doesn't match or
      //   major versions match but server minor lower than web app minor
      var ver = data.replace(/^"(.+(?="$))"$/, '$1').split(".");
      var wapp = WEB_APP.getWsVersion();
      if (ver[0] != wapp[0] || 
            ver[0] == wapp[0] && ver[1] < wapp[1]) {
        hide_loader("page_loader");
        show_client_error_substr(6, undefined, 
                    {xxx: data, yyy: wapp.join(".")});
        return;
      }
      
      // Go to Phase 2
      me.loadConfig();
    },
    
    function (err_msg, status) {
      // Special handling for 401
      if (status == 401) {
        // Redirect to login page
        window.location = LOGIN_URL;
      } else {
        me.showServiceDown(1, (status == 404) ? 
                            t("LL_SERVICE_DOWN") : err_msg);
      }
    }
  );
};

OsBiToolsWebBootstrap.prototype.showServiceDown = function(id, msg) {
  hide_loader("page_loader");
  show_client_error_ex(id, msg);
};

/**
 * Step 2
 * Load configuration (if keywords configured)
 */
OsBiToolsWebBootstrap.prototype.loadConfig = function() {
  var me = this;
  var cfg_keys = WEB_APP.getCfgKeys();
  
  // TODO Make security cookie request conditional based on context 
  // cfg_keys.push("scookie_name");
  
  if (is_empty_array(cfg_keys))
    // Skip configuration phase
    WEB_APP.start();
  else
    //-- 7 
    get_ajax(make_rel_req_query(URL_LIST.CONFIG, {
        lst: cfg_keys.join(",")
      }), 7,
      function(data) {
        me.config = data;
        
        if (data !== undefined && ! is_empty(data.scookie_name))
          SEC_COOKIE_NAME = data.scookie_name;
          
        WEB_APP.start();
      }
    );
};

OsBiToolsWebBootstrap.prototype.logout = function() {
  var me = this;
  
  // Send sync logout signal.
  //-- 8
  get_ajax(make_rel_req(URL_LIST.LOGOUT), 8,
    function() {
      window.location = LOGIN_URL;
    }
  );
};
