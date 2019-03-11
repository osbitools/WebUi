/*
 * Open Source Business Intelligence Tools - http://www.osbitools.com/
 * 
 * Copyright 2014-2016 IvaLab Inc. and by respective contributors (see below).
 * 
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 * Date: 2016-02-06
 * 
 * Contributors:
 * 
 */

"use strict";

var LOGIN_BOOT_VERSION = "1.0.0";

$(document).ready(function() {
  
  // 1. Init bootstrap
  var bs = new OsBiToolsLoginBootstrap();
  
  // 2. Show loading message. Always b4 loader
  $("#year").html((new Date()).getFullYear());
  document.title = ts("LL_LOADING");
  show_loader("page_loader", t("LL_LOADING_BOOTSTRAP"));
  
  // 3. Start login bootstrap loader
  bs.start();
});

/**************** Page Loader Singletons ****************/

function OsBiToolsLoginBootstrap() {
  this.version = LOGIN_BOOT_VERSION.split(".");
  
  // Set language
  if (!jOsBiTools.has_lparam) {
    // Activate language selector
    $("#lbl_lang_sel").html(LANG_SET[jOsBiTools.locale].name);
    
    for (var locale in LANG_SET) {
      var ldef = LANG_SET[locale];
      $("#lang_sel").append(
        '<li id="' + locale.replace("-", "_").toLowerCase() + 
                  '" onclick="javascript:set_lang_sel(this)">' + 
          '<a href="#" lang="' + ldef.lang + '" >' + ldef.name + '</a>' + 
          '<img class="flag" src="shared/images/flags/' + 
          locale.toLowerCase().replace("-", "_") + 
              '.png" alt="' + locale + '" />' + 
        '</li>');
    }
    
    $("#lang_sel_wrapper").show();
  }
  
  // Init login widget
  this.initLoginWidget();
  
  // Last
  set_lang_labels();
};

/**
 * load base.txt(optional) with web service path.
 * Default is ws/rest subdirectory
 */
OsBiToolsLoginBootstrap.prototype.start = function() {
  var me = this;
  
  // Set title. Use default App Title Here message
  var title = t(
	 !jOsBiTools.is_empty(WEB_APP_CFG.title) ? 
		WEB_APP_CFG.title : "LL_TOOL_TITLE");

  // If default title not set than do nothing
  if (!jOsBiTools.is_empty(title)) 
    $("#ll_tool_title").html(title);

  document.title = "OsBiTools | " + ts("LL_LOGIN");
  
  // Check if ws_host defined
  // Checking priority is next:
  // 1. WEB_APP.ws_host configuration (hardcoded)
  // 2. "ws_host" cookie name (saved)
  // 3. ./base.txt server side file (dynamic)
  BASE_URL = (WEB_APP_CFG.ws_host !== undefined) ? 
            ROOT_PATH + WEB_APP_CFG.ws_host : $.cookie("ws_host");
  
  if (BASE_URL !== undefined) {
    // Continue with version check
    this.finish();
  } else {   
    // Try load base url from base.txt
    $.ajax({
      url: "base.txt",
      success: function(data) {
        BASE_URL = ROOT_PATH + data.trim();
        
        // Remember last settings
        $.cookie("ws_host", BASE_URL);
        
        me.finish();
      },
      error: function() {
        BASE_URL = ROOT_PATH + DEFAULT_BASE_URL;
        
        // Remember last settings
        $.cookie("ws_host", BASE_URL);
        
        me.finish();
      }
    });
  }
};

OsBiToolsLoginBootstrap.prototype.finish = function() {
  hide_loader("page_loader");
  this.showLoginWidget();
};
        
OsBiToolsLoginBootstrap.prototype.showServiceDown = function(id, msg) {
  hide_loader("page_loader");
  show_client_error_ex(id, msg);
};

OsBiToolsLoginBootstrap.prototype.showLoginWidget = function() {
  $("#login_widget").fadeIn("slow", function() {
    if ($("#usr").val() == "")
      $("#usr").focus();
    else
      $("#pwd").focus();
  });
};

OsBiToolsLoginBootstrap.prototype.login = function() {
  var me = this;
  
  var usr = $("#usr").val();
  var pwd = $("#pwd").val();
  
  if ( jOsBiTools.is_empty(usr)) {
    alert(ts("LL_USER_IS_EMPTY"));
    return;
  }
  
  if ( jOsBiTools.is_empty(pwd)) {
    alert(ts("LL_PASSWORD_IS_EMPTY"));
    return;
  }
  
  if ($("#remember_me").prop("checked")) {
    $.cookie('usr', usr);
    
    // Save language if lang parameter not set
    if (!jOsBiTools.has_lparam)
      $.cookie('lang', jOsBiTools.lang);
  } else {
    // Clear cookies
    $.removeCookie("usr");
    $.removeCookie("lang");
  }
  
  enable_wait_btns("login_ctrls", "right");
  
  post_ajax_data(URL_LIST.AUTH, 2, 
    {
      usr: usr,
      pwd: pwd
    },
    function(data) {
      disable_wait_btns("login_ctrls", "right");
      
      // Remember logged user
      me.user = usr;
      
      if (!$("#remember_me").prop("checked"))
        $("#usr").val("");
      
      // Clear password
      $("#pwd").val("");
      
      $("#login_widget").fadeOut("slow", function() {
        window.location = "./";
      });
    },
    function() {
      disable_wait_btns("login_ctrls", "right");
    }
  );
};

OsBiToolsLoginBootstrap.prototype.initLoginWidget = function() {
  var me = this;
  
  // Restore user name (if any)
  var usr = $.cookie('usr');
  var fusr = ! jOsBiTools.is_empty(usr);
  $("#remember_me").prop("checked", fusr);
  
  if (fusr) {
    $("#usr").val(usr);
    
    if (!jOsBiTools.has_lparam) {
      var lval = $.cookie('locale');
      
      // locale cookie might be missing
      if (lval !== undefined) {
        var locale = LANG_SET[lval];
        $("#lbl_lang_sel").html(locale.name);
      }
    }
  }
  
  // Set default [Enter] action for password
  $("#pwd").keydown(function (event) {
    if (event.keyCode == 13) {
      $("#ll_sign_in").trigger("click");
      return false;
    }
  });
  
  // Set version
  var el = $("#osbi_version");
  
  el.html("v " + WEB_APP_CFG.version.join("."));
  el.prop("title", t("LL_LOADER") + " v " + this.version.join(".") + "\n" +
                      t("LL_WS_VER") + " v " + WEB_APP_CFG.ws_ver.join("."));
                              
  $("#ll_sign_in").on("click", function() {
    me.login();
  });
};

// For compatibility with main.js define fake PhaseLoader
function PhaseLoader() {}

