/*
 * Open Source Business Intelligence Tools - http://www.osbitools.com/
 * 
 * Copyright 2014-2016 IvaLab Inc. and by respective contributors (see below).
 *
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 * Date: 2015-07-27
 *
 * Contributors:
 *
 */

"use strict";

(function($) {
  /*******************************************/
  /**          jOsBiTools  Constants        **/
  /*******************************************/

  var version = "2.2",

  // Default locale fo each language
  DEF_LANG_LOCALES = {
    "en" : "US",
    "fr" : "CA",
    "ru" : "RU",
    "es" : "ES",
    'de' : "DE"
  },

  // Default language
  DEFAULT_LANG = "en",

  // Default language locale. Temporarily disabled
  // DEFAULT_LANG_LOCALE = "en-US",

  // Name of language parameter
  LANG_PARAM_NAME = "lang";

  /**************** Debug ****************/

  function Log() {
    this.enabled = false;
  }

  Log.prototype.enable = function() {
    this.enabled = true;
  };

  Log.prototype.has_console = function() {
    // IE only support console from v 9
    return ( typeof console != "undefined");
  };

  Log.prototype.debug = function(msg) {
    if (this.enabled && this.has_console())
      console.log(msg);
  };

  Log.prototype.error = function(msg) {
    if (this.has_console())
      console.error(msg);
  };

  /**************** Trace ****************/

  function Trace() {
    this.enabled = false;
    this.start = new Date().getTime();
    this.events = [];
  }


  Trace.prototype.init = function(event) {
    this.calc_diff(event);
  };

  Trace.prototype.register = function(event) {
    if (this.enabled)
      this.calc_diff(event);
  };

  Trace.prototype.enable = function() {
    this.enabled = true;
  };

  Trace.prototype.calc_diff = function(event) {
    this.events.push({
      event : event,
      time : (new Date().getTime() - this.start) / 1000
    });
  };

  /*******************************************/
  /**         jOsBiTools Prototype          **/
  /*******************************************/

  // Define a local copy
  function jOsBiTools() {
    this.version = version;

    // Loaded lang labels
    this.ll = {};

    // All loaded lang set
    this.lls = [];

    // Debug handler
    this.log = new Log();

    // Trace handler
    this.trace = new Trace();
    
    // Init phase flag. Raised if system variable ROOT_PATH is not defined
    this.init = false;

    /*******************************************/
    /**             Start loading             **/
    /*******************************************/
   
    // Parse Url Parameters
    this.params = {};
    var regex = /[?&]([^=#]+)=([^&#]*)/g,
        url = window.location.href,
        match;

    while ( match = regex.exec(url))
    this.params[match[1]] = decodeURIComponent(match[2]);

    // Set debug flag
    if (this.params["debug"] !== undefined && 
                this.params["debug"].toLowerCase() == "on")
      this.log.enable();

    // Set debug flag
    if (this.params["trace"] !== undefined && 
                this.params["trace"].toLowerCase() == "on")
      this.trace.enable();

    // Set language
    var lname = this.params[LANG_PARAM_NAME];
    this.has_lparam = lname !== undefined;
    if (this.has_lparam) {
      // Check if simple lang or lang-LOCALE
      var dpos = lname.indexOf("-");
      this.lang = (dpos > 0) ? lname.substr(0, dpos) : lname;
      this.locale = (dpos > 0) ? lname : lname + "-" + 
            (DEF_LANG_LOCALES[lname] !== undefined ? 
                    DEF_LANG_LOCALES[lname] : lname.toUpperCase());
    } else {
      // Set default lang
      this.lang = DEFAULT_LANG;

      // Set default locale; Temporarily disabled
      this.locale = this.lang + "-" + DEF_LANG_LOCALES[this.lang];
    }
  
    this.regex = /%%|%(\d+\$)?([-+#0&\' ]*)(\*\d+\$|\*|\d+)?(\.(\*\d+\$|\*|\d+))?([nAscboxXuidfegpEGP])/g;
  
  };

  /*******************************************/
  /**     jOsBiTools Generic Functions      **/
  /*******************************************/

  /**
   * Check if variable is empty
   */
  jOsBiTools.prototype.is_empty = function(msg) {
    return (msg === undefined || msg == "");
  };

  /**
   * Check if array is empty
   */
  jOsBiTools.prototype.is_empty_array = function(list) {
    return (list === undefined || list.length == 0);
  };

  jOsBiTools.prototype.uc_first_char = function(msg) {
    return msg.charAt(0).toUpperCase() + msg.substr(1);
  };
  
  jOsBiTools.prototype.check_browser = function(msg) {
    // 0. Check for supported IE version
    if ($.browser.msie !== undefined && parseInt($.browser.version, 10)) {
      var ver = parseInt($.browser.version, 10);
      return jOsBiTools.t("LL_ERROR_IE_NOT_SUPPORTED").replace("[ver]", ver);
    }
  };

  /**
   * Get real boolean value out of string boolean
   * 
   * @param {String} String (or empty) boolean value
   * 
   * @return {Boolean} True if value == "true" and false otherwise
   */
  jOsBiTools.prototype.get_bool_val = function(value) {
    return (value === true || value === "true");
  };

  /**
   * Convert ajax error variables into string
   * 
   * @param {Object} jqXHR superset of the XMLHTTPRequest object
   * @param {String} msg string describing the type of error that occurred. 
   *    Possible values for the second argument (besides null) are 
   *    "timeout", "error", "abort", and "parsererror".
   * @param {Object} error optional exception object, if one occurred
   * @return String with formatted error message
   */
  jOsBiTools.prototype.get_ajax_error = function(jqXHR, msg, error) {
    msg = msg.toUpperCase();
    if (jqXHR.status !== undefined)
      msg += " " + jqXHR.status;
    
    if (this.log.enabled) {
      if (typeof error == "object") {
        if (error.message !== undefined)
          msg += ". " + error.message;
      } else if (typeof error == "string" && error != jqXHR.status) {
        msg += ". " + ((error.indexOf("ERROR") == 0) ? 
                            error : error.toUpperCase());
      }
    }
      
    return msg;
  };
  
  /**
   * Convert server error into string
   * 
   * @param {data} data Server Error object with next properties:
   *    data.id - Unique Error Id
   *    data.msg Locale error message
   *    data.info Array with detail info about error
   *    
   * @return String with formatted error message
   */
  jOsBiTools.prototype.get_server_error = function(data) {
    var msg = this.t("LL_ERROR_C") + " S-" + data.id;
    
    if (this.log.enabled) {
      if (!this.is_empty(data.msg))
        msg += " - " + data.msg;
      
      if (typeof data.info == "object" && 
            data.info.length > 0 && this.trace.enabled) {
        for (var i in data.info)
          msg += "<br />" + data.info[i];
      }
    }
      
    return msg;
  };
  
  /*******************************************/
  /**     jOsBiTools Language Functions     **/
  /*******************************************/

  jOsBiTools.prototype.is_def_lang = function() {
    return this.lang == DEFAULT_LANG;
  };

  jOsBiTools.prototype.set_def_lang = function() {
    this.set_lang(DEFAULT_LANG);
  };

  jOsBiTools.prototype.set_lang = function(lang) {
    this.lang = lang;
    this.locale = this.lang + "-" + DEF_LANG_LOCALES[this.lang];

    // Recreate translated lang labels array
    for (var i in this.lls)
      this.add_ll_set(this.lls[i]);
  };

  /**
   * Load lang labels set into global array and add individual lang labels
   * 
   * @param ll_set {Object} lang labels set
   * 
   */
  jOsBiTools.prototype.load_ll_set = function(ll_set) {
    this.lls.push(ll_set);
    this.add_ll_set(ll_set);
  };

  
  /**
   * Load add individual lang labels
   * 
   * @param ll_set {Object} lang labels set
   * 
   */
  jOsBiTools.prototype.add_ll_set = function(ll_set) {
    // Filter all lang labels for current locale
    for (var lbl_id in ll_set)
      this.ll[lbl_id] = ll_set[lbl_id][this.lang];
  };

  /**
   * Return translated label. If lbl_id not found in
   *  loaded locale labels array than it returns capital lbl_id with
   *  red font tag attached
   *
   * @param {String} lbl_id Label Id in loaded locale labels array
   * @return {String} Translated label according current LANG
   */
  jOsBiTools.prototype.t = function(lbl_id) {
    return this.get_lang_label_ex(lbl_id, false);
  };

  /**
   * Return translated label. If lbl_id not found in
   *  loaded locale labels array than it returns capital lbl_id
   *
   * @param {String} lbl_id Label Id in LANG_LABELS array
   * @return {String} Translated label according current LANG
   *
   */
  jOsBiTools.prototype.ts = function(lbl_id) {
    return this.get_lang_label_ex(lbl_id, true);
  };

  /**
   * Return translated label.
   *
   * @param {String} lbl_id Label Id in loaded locale labels array
   * @param {Boolean} simple Boolean flag to control format of returned data
   * @return {String} Translated label according current lang
   *    If lbl_id not found in loaded locale labels array and
   *    simple == False than it returns capital lbl_id with
   *    red font tag attached
   *
   *    If lbl_id not found in loaded locale labels array and
   *    simple == True than it returns capital lbl_id
   */
  jOsBiTools.prototype.get_lang_label_ex = function(lbl_id, simple) {
    return (this.is_empty(this.ll[lbl_id])) ? ( simple ? lbl_id : 
        '<font color="red"><b>' + lbl_id + '</b></font>') : this.ll[lbl_id];
  };

  /**
   * Return cookie by name. Short version of $.cookie(name)
   *
   * @param {String} name Cookie name
   * @return {String} Cookie value (if found) or undefined
   */
  jOsBiTools.prototype.read_cookie = function(name) {
    var value;
    
    var cookies = document.cookie.split('; ');
    for (var i = 0; i < cookies.length; i++) {
        var parts = cookies[i].split('=');
        var key = decodeURIComponent(parts.shift());
        
        if (key == name) {
            value = decodeURIComponent(parts.shift());
            break;
        }
    }
    
    return value;
  };
  
  /*******************************************/
  /**  jOsBiTools  Ajax Service Functions   **/
  /*******************************************/
 
  jOsBiTools.prototype.make_rel_req_base = function() {
    return {
      abs: false
    };
  };

  jOsBiTools.prototype.make_abs_req = function(url) {
    return {
      abs: true,
      url: url
    };
  };

  jOsBiTools.prototype.make_abs_req_query = function(url, query_params) {
    if (query_params !== undefined) {
        var qs = "";
        for (var key in query_params)
          qs += "&" + key + "=" + query_params[key];
          
        if (qs.length != "")
          url += "?" + qs.substr(1);
      }
      
    return this.make_abs_req(url);
  };

  jOsBiTools.prototype.make_rel_req = function(api) {
    var res = this.make_rel_req_base();
    res.api_name = api;
    return res;
  };

  jOsBiTools.prototype.make_rel_req_path = function(api, path_param, data) {
    var res = this.make_rel_req(api);
    if (path_param !== undefined)
      res.path_params = path_param.split("/");
    
    if (data != undefined)
      res.data = data;
      
    return res;
  };

  jOsBiTools.prototype.make_rel_req_query = function(api, query_params, data) {
    var res = this.make_rel_req(api);
    res.query_params = query_params;
    
    if (data != undefined)
      res.data = data;
      
    return res;
  };

  jOsBiTools.prototype.make_rel_req_ex = function(api, path_param, query_params, data) {
    var res = this.make_rel_req_path(api, path_param, data);
    res.query_params = query_params;
    return res;
  };

  /*******************************************/
  /**     jOsBiTools  sprintf Functions     **/
  /*******************************************/

  /**
   * JavaScript printf/sprintf functions.
   * 
   * This code has been adapted from the publicly available sprintf methods
   * by Ash Searle. His original header follows:
   *
   *     This code is unrestricted: you are free to use it however you like.
   *     
   *     The functions should work as expected, performing left or right alignment,
   *     truncating strings, outputting numbers with a required precision etc.
   *
   *     For complex cases, these functions follow the Perl implementations of
   *     (s)printf, allowing arguments to be passed out-of-order, and to set the
   *     precision or length of the output based on arguments instead of fixed
   *     numbers.
   *
   *     See http://perldoc.perl.org/functions/sprintf.html for more information.
   *
   *     Implemented:
   *     - zero and space-padding
   *     - right and left-alignment,
   *     - base X prefix (binary, octal and hex)
   *     - positive number prefix
   *     - (minimum) width
   *     - precision / truncation / maximum width
   *     - out of order arguments
   *
   *     Not implemented (yet):
   *     - vector flag
   *     - size (bytes, words, long-words etc.)
   *     
   *     Will not implement:
   *     - %n or %p (no pass-by-reference in JavaScript)
   *
   *     @version 2007.04.27
   *     @author Ash Searle 
   * 
   * You can see the original work and comments on his blog:
   * http://hexmen.com/blog/2007/03/printf-sprintf/
   * http://hexmen.com/js/sprintf.js
   */
   
   /**
    * @Modifications 2009.05.26
    * @author Chris Leonello
    * 
    * Added %p %P specifier
    * Acts like %g or %G but will not add more significant digits to the 
    *                                       output than present in the input.
    * Example:
    * Format: '%.3p', Input: 0.012, Output: 0.012
    * Format: '%.3g', Input: 0.012, Output: 0.0120
    * Format: '%.4p', Input: 12.0, Output: 12.0
    * Format: '%.4g', Input: 12.0, Output: 12.00
    * Format: '%.4p', Input: 4.321e-5, Output: 4.321e-5
    * Format: '%.4g', Input: 4.321e-5, Output: 4.3210e-5
    * 
    * Example:
    * >>> jOsBiTools.sprintf('%.2f, %d', 23.3452, 43.23)
    * "23.35, 43"
    * >>> jOsBiTools.sprintf("no value: %n, decimal with thousands 
    *                                   separator: %'d", 23.3452, 433524)
    * "no value: , decimal with thousands separator: 433,524"
    */
  jOsBiTools.prototype.sprintf = function() {
    // sprintf constants
    var thousandsSeparator = ',';
  
    // Specifies the decimal mark for floating point values. By default a period '.'
    // is used. If you change this value to for example a comma be sure to also
    // change the thousands separator or else this won't work since a simple String
    // replace is used (replacing all periods with the mark specified here).
    var decimalMark = '.';

    function pad(str, len, chr, leftJustify) {
      var padding = (str.length >= len) ? '' : Array(1 + len - 
                                          str.length >>> 0).join(chr);
                                          
      return leftJustify ? str + padding : padding + str;
    }

    function thousand_separate(value) {
      var value_str = new String(value);
      
      for (var i=10; i>0; i--) {
          if (value_str == (value_str = value_str.replace(/^(\d+)(\d{3})/, 
                    "$1"+ thousandsSeparator + "$2"))) break;
      }
      
      return value_str; 
    }

    function justify(value, prefix, leftJustify, minWidth, zeroPad, htmlSpace) {
      var diff = minWidth - value.length;
      
      if (diff > 0) {
          var spchar = ' ';
          if (htmlSpace) { spchar = '&nbsp;'; }
          if (leftJustify || !zeroPad)
            value = pad(value, minWidth, spchar, leftJustify);
          else
            value = value.slice(0, prefix.length) + 
                pad('', diff, '0', true) + value.slice(prefix.length);
      }
      
      return value;
    }

    function formatBaseX(value, base, prefix, leftJustify, 
                          minWidth, precision, zeroPad, htmlSpace) {
      // Note: casts negative numbers to positive ones
      var number = value >>> 0;
      prefix = prefix && number && {'2': '0b', '8': '0', '16': '0x'}[base] || '';
      value = prefix + pad(number.toString(base), precision || 0, '0', false);
      
      return justify(value, prefix, leftJustify, minWidth, zeroPad, htmlSpace);
    }

    function formatString(value, leftJustify, minWidth, 
                                          precision, zeroPad, htmlSpace) {
      if (precision != null)
        value = value.slice(0, precision);
          
      return justify(value, '', leftJustify, minWidth, zeroPad, htmlSpace);
    }

    var a = arguments, i = 0, format = a[i++];

    return format.replace(this.regex, 
          function(substring, valueIndex, flags, minWidth, _, precision, type) {
        if (substring == '%%')
          return '%';

        // parse flags
        var leftJustify = false, positivePrefix = '', zeroPad = false, 
            prefixBaseX = false, htmlSpace = false, thousandSeparation = false;
        for (var j = 0; flags && j < flags.length; j++) {
          switch (flags.charAt(j)) {
            case ' ': positivePrefix = ' '; break;
            case '+': positivePrefix = '+'; break;
            case '-': leftJustify = true; break;
            case '0': zeroPad = true; break;
            case '#': prefixBaseX = true; break;
            case '&': htmlSpace = true; break;
            case '\'': thousandSeparation = true; break;
          }
        }

        // parameters may be null, undefined, empty-string or real valued
        // we want to ignore null, undefined and empty-string values

        if (!minWidth)
            minWidth = 0;
        else if (minWidth == '*')
            minWidth = +a[i++];
        else if (minWidth.charAt(0) == '*')
            minWidth = +a[minWidth.slice(1, -1)];
        else
            minWidth = +minWidth;

        // Note: undocumented perl feature:
        if (minWidth < 0) {
            minWidth = -minWidth;
            leftJustify = true;
        }

        if (!isFinite(minWidth))
          throw new Error('jOsBiTools.sprintf: (minimum-)width must be finite');

        if (!precision)
            precision = 'fFeE'.indexOf(type) > -1 ? 
                            6 : (type == 'd') ? 0 : void(0);
        else if (precision == '*')
            precision = +a[i++];
        else if (precision.charAt(0) == '*')
            precision = +a[precision.slice(1, -1)];
        else
            precision = +precision;

        // grab value using valueIndex if required?
        var value = valueIndex ? a[valueIndex.slice(0, -1)] : a[i++];

        switch (type) {
          case 's': {
            if (value == null)
                return '';
            
            return formatString(String(value), leftJustify, 
                              minWidth, precision, zeroPad, htmlSpace);
          }
          
          case 'c': return formatString(String.fromCharCode(+value), 
                      leftJustify, minWidth, precision, zeroPad, htmlSpace);
          case 'b': return formatBaseX(value, 2, prefixBaseX,
                      leftJustify, minWidth, precision, zeroPad,htmlSpace);
          case 'o': return formatBaseX(value, 8, prefixBaseX,
                      leftJustify, minWidth, precision, zeroPad, htmlSpace);
          case 'x': return formatBaseX(value, 16, prefixBaseX,
                      leftJustify, minWidth, precision, zeroPad, htmlSpace);
          case 'X': return formatBaseX(value, 16, prefixBaseX,leftJustify,
                      minWidth, precision, zeroPad, htmlSpace).toUpperCase();
          case 'u': return formatBaseX(value, 10, prefixBaseX,
                        leftJustify, minWidth, precision, zeroPad, htmlSpace);
                        
          case 'i': {
            var number = parseInt(+value, 10);
            if (isNaN(number))
              return '';
            
            var prefix = number < 0 ? '-' : positivePrefix;
            var number_str = thousandSeparation ? thousand_separate(
                        String(Math.abs(number))): String(Math.abs(number));
            value = prefix + pad(number_str, precision, '0', false);
            //value = prefix + pad(String(Math.abs(number)), precision, '0', false);
            
            return justify(value, prefix, leftJustify, 
                                    minWidth, zeroPad, htmlSpace);
          }
          
          case 'd': {
            var number = Math.round(+value);
            if (isNaN(number))
              return '';
              
            var prefix = number < 0 ? '-' : positivePrefix;
            var number_str = thousandSeparation ? thousand_separate(
                        String(Math.abs(number))): String(Math.abs(number));
            value = prefix + pad(number_str, precision, '0', false);
            return justify(value, prefix, leftJustify,
                                        minWidth, zeroPad, htmlSpace);
          }
          
          case 'e':
          case 'E':
          case 'f':
          case 'F':
          case 'g':
          case 'G': {
            var number = +value;
            if (isNaN(number))
              return '';
                
            var prefix = number < 0 ? '-' : positivePrefix;
            var method = ['toExponential', 'toFixed', 
                      'toPrecision']['efg'.indexOf(type.toLowerCase())];
            var textTransform = ['toString', 'toUpperCase']['eEfFgG'.
                                                          indexOf(type) % 2];
            var number_str = Math.abs(number)[method](precision);
            
            // Apply the decimal mark properly by splitting the number by the
            //   decimalMark, applying thousands separator, and then placing it
            //   back in.
            var parts = number_str.toString().split('.');
            parts[0] = thousandSeparation ? 
                                      thousand_separate(parts[0]) : parts[0];
            number_str = parts.join(decimalMark);
            
            value = prefix + number_str;
            var justified = justify(value, prefix, leftJustify, 
                            minWidth, zeroPad, htmlSpace)[textTransform]();
            
            return justified;
          }
          
          case 'p':
          case 'P': {
            // make sure number is a number
            var number = +value;
            if (isNaN(number))
                return '';
            
            var prefix = number < 0 ? '-' : positivePrefix;
            var parts = String(Number(Math.abs(number)).
                                        toExponential()).split(/e|E/);
            var sd = (parts[0].indexOf('.') != -1) ? 
                          parts[0].length - 1 : String(number).length;
            var zeros = (parts[1] < 0) ? -parts[1] - 1 : 0;
            
            if (Math.abs(number) < 1) {
                if (sd + zeros  <= precision) {
                    value = prefix + Math.abs(number).toPrecision(sd);
                } else {
                    if (sd  <= precision - 1) {
                        value = prefix + Math.abs(number).toExponential(sd-1);
                    } else {
                        value = prefix + Math.abs(number).
                                              toExponential(precision-1);
                    }
                }
            } else {
                var prec = (sd <= precision) ? sd : precision;
                value = prefix + Math.abs(number).toPrecision(prec);
            }
            
            var textTransform = ['toString', 
                            'toUpperCase']['pP'.indexOf(type) % 2];
            
            return justify(value, prefix, leftJustify, minWidth, 
                                  zeroPad, htmlSpace)[textTransform]();
          }
          
          case 'n': return '';
          
          default: return substring;
        }
    });
  };

  window["jOsBiTools"] = new jOsBiTools();
})(jQuery);
