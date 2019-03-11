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

/**************************************************/
/***********     WEB_APP PARAMETERS     ***********/
/**************************************************/

// WEB_APP_CFG parameters
var WEB_APP_CFG = {
  // Application version. This version(if set) will be 
  //  compared with server-side versioin
  version: [2,0,0],
  
  // Supported version of Web Service. If Web Service has lower major + minor 
  // version or higher major version than 
  ws_ver: [API_VERSION,0],
  
  // Loading message (optional)
  loading: "LL_PAGE_LOADING",
  
  // List of JavaScript resources to load. 
  // main.js is loaded first by default
  scripts: ["demo.js", "lang_set.js"],
  
  // On Logout handler
  on_logout: show_bye,
  
  // Phase loader handler
  phase_loader: new PhaseLoader([[load_demo_msg]], {
    critical: [0],
    on_completed: show_demo_msg,
  }),
};

/**************************************************/
/***********      WEB APP METHODS       ***********/
/**************************************************/

function show_bye() {
  $("h2.demo", WEB_APP.getContext()).html(t("LL_BYE_BYE"));
}

// Demo Message

function show_demo_msg() {
  var me = this;
  var dts = $.format(new Date("2015-03-13"), "F", jOsBiTools.locale);
  var label = dts + " - " + t(DEMO_MSG.label);
  
  WEB_APP.getContext().html('<span class="demo dialog-sub-header">' + label + 
    '&nbsp;&nbsp;&nbsp;<button class="ll_error"' + 
      ' onclick="show_demo_error()">' + 
      t("LL_ERROR_C") + '</button>' + 
    '</span>');
  
  $("#osbitools .ll_logout").on("click", function() {
    WEB_APP.bs.logout();
  });
      
  show_success_msg(label);
}

function load_demo_msg(phase_loader) {
  get_ajax_phase(phase_loader, make_abs_req("../demo.msg"), 0, 
    function(data) {
      return load_demo_msg_success(data);
    }, "load_demo_msg");
}

function load_demo_msg_success(msg) {
  DEMO_MSG = eval("(" + msg + ")");
  
  return DEMO_MSG !== undefined;
}
