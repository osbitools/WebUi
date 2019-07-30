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

// Configuration mode.
var CONFIG_MODE = false;

// API version. With BASE_URL it give Ws prefix,
// for example /api/v2
var API_VERSION = 2;

// Default base URL prefix if not defined in WEB_APP.ws_host configuration
//        or external ./base.txt
var DEFAULT_BASE_URL = "api/v" + API_VERSION + "/";

// JSON Content Type
var APP_JSON_UTF8 = "application/json; charset=UTF-8";

// RegEx for ID field
var ID_REGEX = 'a-zA-Z0-9_-';

// ID Filter
var ID_FILTER = {
  regex: "[" + ID_REGEX + "]",
  info: "LL_ID_FILTER_INFO"
};

// ID List Filter
var ID_LIST_FILTER = {
  regex: "[" + ID_REGEX + ",]",
  validation: '^([' + ID_REGEX + ']+){1}(,[' + ID_REGEX + ']+)*$',
  info: "LL_ID_LIST_FILTER_INFO"
};

// Boolean Filter
var BOOL_FILTER = {
  info: "LL_BOOL_TYPE_INFO",
  validation: '^(false|FALSE|true|TRUE|0|1)$',
};

// Integer Filter
var INT_FILTER = {
  regex: '[-\\d]',
  info: "LL_INT_FILTER_INFO",
  validation: '^-?\\d*$',
  class: "num"
};

// Positive Non-Zero Integer Filter
var INT_POS_NZ_FILTER = {
  regex: '[\\d]',
  info: "LL_INT_FILTER_INFO",
  validation: '^[1-9]{1}\\d*$',
  class: "num"
};

// Numeric Filter
var NUM_FILTER = {
  regex: '[-\\d\\.]',
  info: "LL_NUM_FILTER_INFO",
  validation: '^-?\\d*(\\.\\d+)?$',
  class: "num"
};

// Date Filter
var DATE_FILTER = {
  regex: '[\\d-]',
  info: "LL_DATE_FILTER_INFO",
  validation: '^[0|1|2]\\d{3}-[0|1]?\\d-[0|1|2|3]?\\d$',
  class: "date",
  check: function(value) {
    var date = new Date(value);
    return date instanceof Date && !isNaN(date.valueOf());
  }
};

// International Labels Filter
var LL_FILTER = {
  regex: '[a-zA-Z0-9_]',
  info: "LL_ID_FILTER_INFO",
};

var COLOR_REGEX = '#a-fA-F0-9';
var COLOR_VALIDATION = '[' + COLOR_REGEX + ']{6}|[' + COLOR_REGEX + ']{3}';

// HTML Color Filter
var COLOR_FILTER = {
  regex: '[' + COLOR_REGEX + ']',
  info: "LL_COLOR_FILTER_INFO",
  validation: '^#(' + COLOR_VALIDATION + ')$'
};

// HTML Colors Filter
var COLORS_FILTER = {
  regex: "[" + COLOR_REGEX + ",]",
  info: "LL_COLORS_FILTER_INFO",
  validation: '^(#(' + COLOR_VALIDATION + ')){1}(,#(' + COLOR_VALIDATION + '))*$'
};

// List of client error. Reserved id [1..9]
var ERR_LIST = {
  1: "LL_ERROR_WS_NOT_AVAILABLE",
  2: "LL_ERROR_AUTH_FAILED",
  3: "LL_ERROR_LOADING_WEB_APP",
  4: "LL_ERROR_CHECKING_SECURITY",
  5: "LL_ERROR_CHECKING_VERSION",
  6: "LL_ERROR_INCOMPATIBLE_GUI_WS_VERSION",
  7: "LL_ERROR_LOAD_CONFIGURATION",
  8: "LL_ERROR_LOGOUT",
};

// Base subdirectory for RESTful services
//  TODO delete obsoleted.
// var REST_PATH = "/rest2/";

// List of URLs
var URL_LIST = {
  VERSION: "version",
  AUTH: "../auth",
  CONFIG: "cfg",
  LOGOUT: "logout"
};

// Defalut name of security cookie
var DEFAULT_SEC_COOKIE_NAME = "STOKEN";

// Current name of security cookie
var SEC_COOKIE_NAME = DEFAULT_SEC_COOKIE_NAME;

// 1x16 pixels icon with transparent background.
var EMPTY_ICON = '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAE' +
  'AAAAQCAYAAADXnxW3AAAAB3RJTUUH3wcOEjQtnBR35QAAAAlwSFlzAAAewQAAHsEBw2lUUwAAA' +
  'ARnQU1BAACxjwv8YQUAAAATSURBVHjaY/j//z8DEwMQUIcAAO4WAxwO4AXfAAAAAElFTkSuQmC' +
  'C" class="timg" />';
  
/**************** jQuery loading plugin ****************/

function show_loader(id, msg) {
  $("#osbitools ." + id).loading({
    "speed": 400,
    "maxDots": 5,
    "word": msg + " "
  });
}

function hide_loader(id) {
  var el = $("#osbitools ." + id);
  
  el.loading("stop");
  el.hide();
}

function is_loader(id) {
  return $("#osbitools ." + id).is(":visible");
}

/**************** Simple Dialog ****************/

function show_simple_input_dialog(params) {
  $("#osbitools .sd_sel").hide();
  var input = $("#osbitools .sd_input");
  input.show().val(params.value !== undefined ? params.value : "");
  
  // Clear input filter
  input.filter_input();
  
  if (! jOsBiTools.is_empty(params.filter))
    input.filter_input({
    regex: params.filter
  });

  simple_dialog_prepare(params, input);
}

/**
 * Show dialog with selection and 2 buttons Ok/Cancel
 * @param params Array of parameter as
 *        params.data - hash list in format value:text
 *        param.select_title - first (default) entry in selection  
 */
function show_simple_selection_dialog(params) {
  $("#osbitools .sd_input").hide();
  var input = $("#osbitools .sd_sel");
  input.empty().show().append('<option value=""' + ">" + 
        ((params.sel_title === undefined) ? "" : 
                "-- " + params.sel_title) + " --</option>");
  
  for(var key in params.data)
    input.append('<option value="' + key + '"' + 
                                    ">" + key + "</option>");
  
  check_sd_sel();
  simple_dialog_prepare(params, input);
}


/**
 * Show file upload dialog
 * 
 * @param obj Upload processing object. Show include next methods:
 *          onUploadFileSuccess(fname, data); fname - upload file name; 
 *                                data - server result from upload
 *          onUploadFileServerError(data.error);
 *          onUploadFileError(jqXHR, msg, error);
 *          b4UploadFile() - must return true/false
 *          onUploadFileSelected(fname) - must return true/false
 *          getUploadFileUrl(fname) - return upload file url
 * @param params set of optional parameters   
 */
function show_simple_file_dialog(obj, params) {
  var dlg = $("#osbitools .simple_file_dialog");
  $("#osbitools .file_upload").data("obj", obj);
  FDIALOG = dlg.bPopup({
    speed: 450,
    opacity: 0.6,
    escClose: true,
    modalClose: true,
    transition: 'slideDown',
    appendTo: "#osbitools",
    onClose: function () {
      if (params !== undefined && params.onClose !== undefined) {
        var res = dlg.data("res");
        if (res !== undefined) {
          if (!res.error)
            params.onClose.success(res);
          else if (res.error !== undefined)
            params.onClose.error(res.error);
        }
      }
    }
  });
}

/**
 * Check if anything selected in simple dialog selection and enable button OK
 * @param sel Reference on selection dialog
 *  
 */
function check_sd_sel() {
  $("#osbitools .btn_ok").prop("disabled",  jOsBiTools.is_empty($("#osbitools .sd_sel").val()));
}

function simple_dialog_prepare(params, input) {
  var sdialog = $("#osbitools .simple_dialog");  
  sdialog.data({res: undefined});
  
  $(".sd_label", sdialog).html(params.title);
  
  $(".btn_ok", sdialog).html(params.btnOk);
  $(".btn_ok", sdialog).click(function() {
    params.onOk();
  });
  
  var btnc = $(".btn_cancel", sdialog);
  if (params.btnCancel !== undefined) {
    btnc.html(params.btnCancel);
    btnc.attr("disabled", !params.modalClose);
    btnc.show();
  } else {
    btnc.hide();
  }
  
  btnc.click(function() {
    // Hide dialog
    SDIALOG.close();
    if (typeof params.onCancel == "function")
      params.onCancel();
  });
    
  SDIALOG = sdialog.bPopup({
    speed: 450,
    opacity: 0.6,
    escClose: params.modalClose,
    modalClose: params.modalClose,
    transition: 'slideDown',
    appendTo: "#osbitools",
    onClose: function () {
      $(".btn_ok", sdialog).unbind('click');
      $(".btn_cancel", sdialog).unbind('click');
      
      if (params.onClose !== undefined) {
        var res = sdialog.data("res");
        if (res !== undefined) {
          if (!res.error) {
            if (typeof params.onClose.success == "function")
              params.onClose.success(res);
          } else if (res.error !== undefined) {
            if (typeof params.onClose.cancel == "function")
              params.onClose.error(res.error);
          }
        } else {
          if (typeof params.onClose.cancel == "function")
            params.onClose.cancel();
        }
      }
    }
  },
  
  function() {
      input.focus();
  });
}

/**
 * Close simple dialog and transfer 
 * return parameters res to onClose event from bPopup
 * 
 * @param res Return parameter
 *  
 */
function hide_simple_dialog(res) {
  disable_wait_btns("sd_ctrl");
  $("#osbitools .simple_dialog").data({res: res}).bPopup().close();
}

function enable_wait_btns(id, direction) {
  // Disable everyting
  enable_wait_btns_ex($("#" + id), direction);
}

function enable_wait_btns_ex(container, direction) {
  // Disable everyting
  $("button", container).each(function() { 
    $(this).hide();
  });
  
  container.addClass("btn-loading" + 
        (direction === undefined ? "" : "-" + direction));
}

function enable_wait_btn(id, direction) {
  var el = $("#osbitools ." + id);
  el.hide();
  el.parent().addClass("btn-loading" + 
        (direction === undefined ? "" : "-" + direction));
}

function enable_wait_popup() {
  var el = $("#osbitools .wait-spinner");
  
  // Register popup
  $("#osbitools").data("popup", el);
  
  el.bPopup({
    appendTo: "#osbitools",
    modalClose: false,
    escClose: false,
  });
}

function disable_wait_btns(id, direction) {
  disable_wait_btns_ex($("#osbitools ." + id), direction);
}

function disable_wait_btns_ex(container, direction) {
  container.removeClass("btn-loading"+ 
        (direction === undefined ? "" : "-" + direction));
  
  // Enable everyting
  $("button", container).each(function() { 
    $(this).show();
  });
}

function disable_wait_btn(id, direction) {
  var el = $("#osbitools ." + id);
  el.show();
  el.parent().removeClass("btn-loading" + 
        (direction === undefined ? "" : "-" + direction));
}

function disable_wait_popup() {
  var el = $("#osbitools .wait-spinner");
  el.bPopup().close();
  
  // Unregister popup
  $("#osbitools").removeData("popup");
}

/**************** Success Window ****************/

function show_success_msg(msg) {
  var sw = $("#osbitools .success_window");
  $(".ok_msg", sw).html(msg);
  sw.bPopup({
    appendTo: "#osbitools"
  });
}

/**************** Error Window ****************/

function get_server_error(error) {
  return "ERROR #S-" + error.id + " - " + 
      error.message + "." + (error.info !== undefined ? " " + error.info : "");
}

function show_server_error(error) {
  show_error_win("S-" + error.id, 
      error.message, error.info);
}

function show_client_err(error_id) {
  show_client_error_ex(error_id);
}

function show_client_err_ex(error_id, args) {
  var err_lbl = t(ERR_LIST[error_id]);
  for (var key in args)
    err_lbl = err_lbl.replace("[" + key + "]", args[key]);
    
  show_error_win("C-" + error_id, err_lbl, "");
}

function show_client_error(error_id, cfield) {
  show_client_error_ex(error_id, "", cfield);
}

function show_alert_error(error_id, params) {
  var err_msg = ts(ERR_LIST[error_id]);
  
  // Check if substitution required
  if (params !== undefined && params.values !== undefined) {
    for (var idx in params.values) {
      var regex = new RegExp('\\[' + idx + '\\]', 'g');
      err_msg = err_msg.replace(regex, "'" + params.values[idx] + "'");
    }
  }
  
  if (params !== undefined && params.cfield !== undefined)
    params.cfield.addClass("error");
    
  // Last
  alert(err_msg);
}

function show_client_error_substr(error_id, cfield, args) {
  var err_lbl = t(ERR_LIST[error_id]);
  for (var key in args)
    err_lbl = err_lbl.replace("[" + key + "]", args[key]);
  show_error_win("C-" + error_id, err_lbl, "", cfield);
}

function show_client_error_ex(error_id, info, cfield) {
  show_error_win("C-" + error_id, 
    t(ERR_LIST[error_id]), info, cfield);
}

function show_ajax_error(error_id, jqXHR, msg, error, cfield) {
  show_ajax_error_ex(error_id, jOsBiTools.get_ajax_error(jqXHR, msg, error), cfield);
}

function show_ajax_error_ex(error_id, ajax_error, cfield) {
  show_error_win("C-" + error_id, t(ERR_LIST[error_id]), ajax_error, cfield);
}

function show_error_win(id, detail, info, cfield) {
  // Check if any popup registered
  var bpop = $("#osbitools").data("popup");
  if (bpop !== undefined)
    bpop.bPopup().close();
      
  $("#osbitools .err_code").html(id);
  $("#osbitools .err_details").html(detail);
  
  // Hide Info
  $("#osbitools .err_info").hide();
    
  if (! jOsBiTools.is_empty(info)) {
    $("#osbitools .err_info").html(info);
    $("#osbitools .btn_err_toggle").show();
  } else {
    $("#osbitools .btn_err_toggle").hide();
  }
  
  if (cfield !== undefined)
    cfield.addClass("error");
  $("#osbitools .error_window").bPopup({
    appendTo: "#osbitools",
    onClose: function() { 
      if (cfield !== undefined)
        cfield.focus();
    }
  });
}

function toggle_error_details() {
  $("#osbitools .err_info").toggle("slow", function() {
    // Switch icon
    $("#osbitools .btn_err_toggle img.top").toggleClass("hidden");
    $("#osbitools .btn_err_toggle img.bottom").toggleClass("hidden");
  });
}

/**************** Common Utils ****************/

/**
 * Check if input string is undefined or empty
 * 
 * @param {String} str Input string
 * @return {Boolean} True if empty and False otherwise
 */
function is_empty(str) {
  return jOsBiTools.is_empty(str);
}

/**
 * Check if array is empty
 */
function is_empty_array(list) {
  return jOsBiTools.is_empty_array(list);
}
  
/** Return string with first letter capital
 *  for ex. home -> Home
 * 
 * @param msg Input String
 *  
 */
function uc_first_char(msg) {
  return jOsBiTools.uc_first_char(msg);
}

/**
 * Get real boolean value out of string boolean
 * 
 * @param {String} String (or empty) boolean value
 * 
 * @return {Boolean} True if value == "true" and false otherwise
 */
function get_bool_val(value) {
  return jOsBiTools.get_bool_val(value);
}

/**
 * Encode special xml characters
 * 
 * @param {String} str Initial string
 * @return {String} encoded string
 *  
 */
function escape_xml(str) {
  return (str === undefined) ? "" : 
    str.replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
}

/**
 * UnEncode special xml characters
 * 
 * @param {String} str Initial string
 * @return {String} unencoded string
 *  
 */
function unescape_xml(str) {
  return (str === undefined) ? "" : 
    str.replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"');
}

/**
 * Add input handler for all text input with given selector
 * 
 * @param {Object} wrapper parent element
 * @param {String} selector wrapper jquery class selector for input elements
 * @param regex {String} Input regex (optional).
 * @param {Function} on_change OnChange callback (optional)
 * 
 */
function add_filtered_handler(wrapper, selector, regex, on_change) {
  $("input."  + selector + "[type=text]", wrapper).each(function() {
    add_filtered_handler_item($(this), regex);
  });
}

/**
 * Add input handler for single element
 * 
 * @item input elements
 * @regex Input regex (optional).
 * 
 */
function add_filtered_handler_item(input, regex, on_change) {
  // Check if default value required
  var fdef = input.hasClass("default");
  
  input.on("focus", function() {
      if (fdef && $(this).hasClass("default")) {
        // Remember default value
        $(this).data("old_val", $(this).val());
        $(this).val("");
        $(this).removeClass("default");
      }
    })
    .on("focusout", function() {
      if (fdef && jOsBiTools.is_empty($(this).val())) {
        // Remember default value
        $(this).val($(this).data("old_val"));
        $(this).addClass("default");
      }
    });
    
  if (! jOsBiTools.is_empty(regex))
    input.filter_input({
      regex: regex,
      onChange: function(el) {
        clear_error(el);
        
        if (typeof on_change == "function")
          on_change(el);
      }
    });
}

function remove_filtered_handle(wrapper, selector) {
  $("."  + selector, wrapper).each(function() {
    remove_filtered_handle_item($(this));
  });
}

function remove_filtered_handle_item(input) {
  input.unbind("focus").unbind("focusout").unbind("keypress").unbind("paste");
}

/*
 * Check if input field not null
 * @param selector jQuery selector
 * @param error Error Object
 * @result True if non-empty and False otherwise
 */
function check_input(field, error_id) {
  var result = ! jOsBiTools.is_empty(field.val());
  if (!result)
    show_client_error(error_id, field);
  
  return result;
}

function clear_error(field) {
  field.removeClass("error");
}

function clear_error_ex(field) {
  clear_error(field);
  clear_saved();
}

function convert_str_to_hash(str) {
  var res = {};
  var list = str.split(",");
  for (var i in list)
    res[list[i]] = list[i];
    
  return res;
}

function get_client_error(err_id) {
  return t("LL_ERROR_C") + " #C-" + err_id + " " + t(ERR_LIST[err_id]);
}

/**************** Ajax Wrappers ****************/

/**
 * Send generic GET Ajax Request
 * @param url Get URL
 * @param error_id Error Id on error
 * #on_success Handle for success 
 */
function get_ajax(req, error_id, on_success) {
  ajax_req_base(req, "get", error_id, on_success);
}

function get_ajax_ex(req, error_id, on_success, after_error) {
  ajax_req_base(req, "get", error_id, on_success, after_error);
}

/**
 * Get HTTP request using exact URL
 * Used if extra parameters needs to be added to get request header
 * 
 * @param {String} url Absolute url  
 */
function get_ajax_sso(url, error_id, on_success, after_error) {
  // Check if url is absolute
  var ex_data;
  if (url.substr(0, 4) == "http") {
    // Attach security header to ajax request for CDSSO authentication
    ex_data = {headers: {"STOKEN": $.cookie(SEC_COOKIE_NAME)}};
  }

  get_ajax_abs(url, error_id, on_success, after_error, ex_data);
}

/**
 * Get HTTP request using exact URL
 * 
 * @param url Absolute url  
 */
function get_ajax_abs(url, error_id, on_success, after_error, ex_data) {
  _ajax(make_abs_req(url), "get", error_id, on_success, after_error, ex_data);
}

function get_ajax_phase(phase_loader, req, error_id, on_success, step_name) {
  ajax_req_base(req, "get", error_id,
    function(data) {
      // Always Last
      if (!on_success(data))
        phase_loader.setStepError(step_name);
      else
        phase_loader.setStepCompleted(step_name);
    },
    function(msg) {
      // Always Last
      phase_loader.setStepError(step_name, msg);
    }
  );
}

function post_ajax_ex(req, error_id, on_success, after_error) {
  ajax_req_base(req, "post", error_id, on_success, after_error);
}

function post_ajax_data(req, error_id, on_success, after_error, ctype) {
  ajax_req_base(req, "post", error_id, on_success, after_error, ctype);
}

function post_ajax(req, error_id, on_success) {
  ajax_req_base(req, "post", error_id, on_success);
}

function put_ajax(req, error_id, on_success) {
  ajax_req_base(req, "put", error_id, on_success);
}

function put_ajax_ex(req, error_id, on_success, after_error) {
  ajax_req_base(req, "put", error_id, on_success, after_error);
}

function put_ajax_data(req, error_id, on_success, after_error, ctype) {
  ajax_req_base(req, "put", error_id, on_success, after_error, ctype);
}

function delete_ajax_ex(req, error_id, on_success, after_error) {
  ajax_req_base(req, "delete", error_id, on_success, after_error);
}

function delete_ajax(req, error_id, on_success) {
  ajax_req_base(req, "delete", error_id, on_success);
}

/**
 * Generic ajax request function
 * To supress show standard error window submit error_id = 0
 * For custom error processing define after_error handler
 * 
 * @req Request Object
 * @http_method HTTP Method
 * @error_id Custom Error Id
 * @on_success Function to execute on success
 * @after_error Function to execute after standard error handler
 * @ctype Boolean flag for contentType parameter
 */
function ajax_req_base(req, http_method, error_id, on_success, 
                                                    after_error, ctype) {
  _ajax(req, http_method, error_id, on_success, 
        after_error, ctype !== undefined ? {contentType: ctype} : ctype);
}

/**
 * Generic ajax request function
 * To supress show standard error window submit error_id = 0
 * For custom error processing define after_error handler
 * 
 * @param {String} url Absolute Request URL
 * @param on_success {Function} Function to execute on success
 * @param on_error {Function} Function to execute after standard error handler
 * 
 */
function get_ajax_simple(req, on_success, on_error) {
  get_ajax_ex(req, 0, on_success, on_error);
}

/**
 * After error chec,
 * 
 * @param ferr {Function} after error callback function
 * @param msg {String} error message
 * @param error {String} either http status code for cases when http call failed
 *    or error structure for server side errors
 */
function ajax_err_check(ferr, msg, error) {
  if (typeof ferr == "function")
    ferr(msg, error);
}

/**
 * Dynamically load external style by adding script element
 * 
 * @param {String} src script url
 * @param {Function} on_load callback on load
 * @param {Function} on_error callback on load 
 */
function load_script(src, on_load, on_error) {
  var script = document.createElement("script");
  script.onload = on_load;
  if (typeof on_error == "function")
    script.onerror = on_error;
  script.src = ROOT_PATH + src;
  document.getElementsByTagName("head")[0].appendChild(script);
}


/**
 * Dynamically load external script by evaluating source
 * 
 * @param {String} url style url
 * @param {Function} on_load  callback on load 
 * @param {Function} on_error callback on load 
 */
function load_script_ex(url, on_success, on_error) {
  _get(url, function(data) {
      try {
        eval(data);
      } catch (e) {
        jOsBiTools.log.error(e.message);
        return;
      }
      
      if (typeof on_success == "function")
        on_success(data);
    }, function(msg) {
      jOsBiTools.log.error(msg);
      
      if (typeof on_error == "function")
        on_error(data);
    }
  );
}

/**
 * Dynamically load external style by adding link element
 * 
 * @param {String} src style url
 * @param {Function} on_load  callback on load 
 */
function load_style(src, on_load) {
  var fileref = document.createElement("link");
  fileref.setAttribute("rel", "stylesheet");
  fileref.setAttribute("type", "text/css");
  fileref.setAttribute("href", ROOT_PATH + src);
  fileref.onload = on_load;
  document.getElementsByTagName("head")[0].appendChild(fileref);
}

/**
 * Dynamically load external style by adding style element
 * 
 * @param {String} url style url
 * @param {Function} on_load  callback on load 
 * @param {Function} on_error callback on load 
 */
function load_style_ex(url, on_success, on_error) {
  _get(url, function(data) {
    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = data;
    document.getElementsByTagName('head')[0].appendChild(style);
    
    if (typeof on_success == "function")
      on_success(data);
  }, function(msg) {
    jOsBiTools.log.error(msg);
    
    if (typeof on_error == "function")
      on_error(data);
  });
}

/**
 * Show or Hide control element by button click 
 */
function toggle_wrapper_ctrl(btn) {
  // Find second child
  $($(btn).parent().parent().children()[1]).toggle();
  toggle_wrapper_btn(btn);
};

/**
 * Swap minimize/maximize icon by button click 
 */
function toggle_wrapper_btn(btn) {
  var btn = $(btn);
  if (btn.hasClass("ui-icon-triangle-1-s")) {
    btn.removeClass("ui-icon-triangle-1-s");
    btn.addClass("ui-icon-triangle-1-n");
    btn.attr("title",ts("LL_MINIMIZE"));
  } else {
    btn.removeClass("ui-icon-triangle-1-n");
    btn.addClass("ui-icon-triangle-1-s");
    btn.attr("title",ts("LL_MAXIMIZE"));
  }
};

/**
 * Get file name (without extension) from url.
 * @param {Object} url
 */
function get_file_name_from_url(url) {
  var fname = url.substr(url.lastIndexOf("/") + 1);
  if ( jOsBiTools.is_empty(fname))
    return "";
    
  var dpos = fname.lastIndexOf(".");
  if (dpos == -1)
    return "";
    
  return fname.substr(0, dpos);
}

/*****************  Minified *****************/
function get_cr() {
  return (get_bool_val(WEB_APP.bs.config.minified)) ? "" : "\n";
}

function get_crt() {
  return (get_bool_val(WEB_APP.bs.config.minified)) ? "" : "\n\t";
}

function get_crtt() {
  return (get_bool_val(WEB_APP.bs.config.minified)) ? "" : "\n\t\t";
}

function get_crttt() {
  return (get_bool_val(WEB_APP.bs.config.minified)) ? "" : "\n\t\t\t";
}

function get_tab() {
  return (get_bool_val(WEB_APP.bs.config.minified)) ? "" : "\t";
}

function get_tab_num(num) {
  var res = "";
  for (var i = 0; i < num; i++)
    res += get_tab();
  return res;
}

/*****************  Observer *****************/

/**
 * Data Aware list that implements publiser/subscriber pattern
 * @param {Object} name
 */
function Observer(name, data) {
  this.pname = name;
  this.data = data;
  this.prop_list = {};
};

Observer.prototype.subscribe = function(item) {
  this.prop_list[item.name] = item;
  
  if (this.data !== undefined)
    // Load initial data into newly subscribed item
    item.load(this.data, this.pname);
};

Observer.prototype.unsubscribe = function(name) {
  delete this.prop_list[name];
};

Observer.prototype.update = function(data) {
  this.data = data;
  for (var name in this.prop_list)
    this.prop_list[name].reload(this.data, this.pname);
};

Observer.prototype.disable = function() {
  for (var name in this.prop_list)
    this.prop_list[name].disable(this.pname);
};

Observer.prototype.enable = function() {
  for (var name in this.prop_list)
    this.prop_list[name].enable(this.pname);
};

/*****************  List Item *****************/

function AbstractListItem() {}

AbstractListItem.prototype.init = function(key, value) {
  this.key = key;
  this.value = value;
};

AbstractListItem.prototype.getKey = function() {
  return this.key;
};

AbstractListItem.prototype.getValue = function() {
  return this.value;
};

function ListItem(key, value) {
  this.init(key, value);
}

ListItem.prototype = new AbstractListItem();

/*****************  AJAX Service Functions *****************/

/**
 * Generic ajax request function
 * To supress show standard error window submit error_id = 0
 * For custom error processing define after_error handler
 * 
 * @request Absolute or Relative Request URL
 *    {
 *      absolute: boolean
 *      
 *      // Absolute url has only 1 parameter where full url included
 *      url: string
 * 
 *      // Relative URL has next section:
 *      api_name: string
 *      path_params: array
 *      query_params: array
 *    }
 * @http_method HTTP Method
 * @error_id Custom Error Id 
 * @on_success Function to execute on success call
 * @after_error Function to execute after standard error handler
 * @param {Object} ex_data Extra data to append
 */
function _ajax(req, http_method, error_id, on_success, after_error, ex_data) {
  
  var adata = {
      url: jOsBiTools.get_url(req),
      method: http_method,
      success: function(data) {
        if (data == null && error_id > 0) {
          var err_msg = t("LL_EMPTY_RESULT");
          show_client_error_ex(error_id, err_msg);
          ajax_err_check(after_error, err_msg);
        } else if (data.error !== undefined) {
          if (error_id > 0)
            show_server_error(data.error);
            
          ajax_err_check(after_error, get_server_error(data.error), data.error);
        } else {
          on_success(data);
        }
      },
      error: function (jqXHR, msg, error) {
        var ajax_error = jOsBiTools.get_ajax_error(jqXHR, msg, error);
          
        if (error_id > 0)
          show_ajax_error_ex(error_id, ajax_error);
          
        // For negative error include error id into callback message
        var err_msg = (error_id >= 0) ? ajax_error : 
          t("LL_ERROR_C") + " #C-" + (-error_id) + "<br />" + 
            t(ERR_LIST[-error_id])  + "<br />" + ajax_error;
            
        ajax_err_check(after_error, err_msg, jqXHR.status);
      }
  };
  
  if (ex_data !== undefined) {
    for (var key in ex_data) {
      var value = ex_data[key];
      
      if (key == "contentType")
        value = jOsBiTools.check_ctype(value);
      if (value !== undefined)
        adata[key] = value;
    }
  }
    
  var rdata = jOsBiTools.get_data(req, http_method);  
  if (!jOsBiTools.is_empty(rdata))
    adata.data = rdata;
  
  // Call B4 AJAX hook
  jOsBiTools.b4_ajax(adata);
      
  $.ajax(adata);
}

/**
 * Dynamically load external script by evaluating source
 * 
 * @param {String} url style url
 * @param {Function} on_load  callback on load 
 * @param {Function} on_error callback on load 
 */
function _get(url, on_success, on_error) {
  $.ajax({
    url: url,
    method: "GET",
    success: on_success, 
    error: function (jqXHR, msg, error) {
      var ajax_error = jOsBiTools.get_ajax_error(jqXHR, msg, error);
      jOsBiTools.log.error(ajax_error);
      
      if (typeof on_error == "function")
        on_error(ajax_error);
    }
  });
}

function make_rel_req_base() {
  return jOsBiTools.make_rel_req_base();
}

function make_abs_req(url) {
  return jOsBiTools.make_abs_req(url);
}

function make_abs_req_query(url, query_params) {
  return jOsBiTools.make_abs_req_query(url, query_params);
}

function make_rel_req(api) {
  return jOsBiTools.make_rel_req(api);
}

function make_rel_req_path(api, path_param, data) {
  return jOsBiTools.make_rel_req_path(api, path_param, data);
}

function make_rel_req_query(api, query_params, data) {
  return jOsBiTools.make_rel_req_query(api, query_params, data);
}

function make_rel_req_ex(api, path_param, query_params, data) {
  return jOsBiTools.make_rel_req_ex(api, path_param, query_params, data);
}
