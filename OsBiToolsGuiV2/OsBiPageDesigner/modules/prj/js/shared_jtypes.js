/*
 * Open Source Business Intelligence Tools - http://www.osbitools.com/
 * 
 * Copyright 2014-2016 IvaLab Inc. and by respective contributors (see below).
 * 
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 * Date: 2015-04-02
 * 
 * Contributors:
 * 
 */

// Supported Java Types
JTYPES = "java.lang.Boolean,java.lang.Byte,com.osbitools.util.Date," + 
    "java.lang.Double,java.lang.Float,java.lang.Long," + 
                            "java.lang.Integer,java.lang.String"; 

// List (made out of JTYPES) of supported Java Types
JTYPE_OPTS = "";
JAVA_TYPES = {};

// Boolean Java Type
var JTYPE_BOOL = "java.lang.Boolean";

// String Java Type
var JTYPE_STR = "java.lang.String";

// Index Java Types
function index_jtypes() {
  var jtypes = JTYPES.split(",");
  for (var i in jtypes) {
    jtype = jtypes[i];
    var s = jtype.substr(jtype.lastIndexOf(".") + 1);
    JAVA_TYPES[s] = jtype;
      
    JTYPE_OPTS += '<option value="' + jtype + '">' + s + '</option>';
  }
}

index_jtypes();
    
/**
 * Get default error value for Java Type
 * @param {Object} jtype
 */
function get_err_def_val(jtype) {
  var res;
  
  if (jtype == "com.osbitools.util.Date" || 
        jtype == "java.util.Date") {
    res = {
      value : "1970-01-01",
      cname : "type-date"
    };
  } else if (jtype == "java.lang.Boolean") {
    res = {
      value : "false",
      cname : "type-bool"
    };
  } else if (jtype == "java.lang.Byte" || 
      jtype == "java.lang.Double" || 
      jtype == "java.lang.Float" || 
      jtype == "java.lang.Long" || 
      jtype == "java.lang.Integer") {
    res = {
      value : "0",
      cname : "type-num"
    };
  } else {
    res = {
      value : "ERROR !!!",
      cname : "type-str"
    };
  };
  
  return res;
};

/**
 * Return boolean options (Yes/No) for select tag
 * @param {Object} has_empty Is empty option required
 */
function get_bool_sel(has_empty) {
  return ((has_empty) ? '<option value=""></option>' : '') + 
      '<option value="true">' + t("LL_EX_YES") + '</option>' +
      '<option value="false">' + t("LL_EX_NO") + '</option>';
};

function get_jtype_rule(jtype) {
  if (jtype == "com.osbitools.util.Date")
    return DATE_FILTER;
  else if (jtype == "java.lang.Integer" || 
      jtype == "java.lang.Long" || 
      jtype == "java.lang.Byte")
    return INT_FILTER;
  else if (jtype == "java.lang.Double" || jtype == "java.lang.Float") 
    return NUM_FILTER;
  else return "";
};

function get_jtype_regex(jtype) {
  var filter = get_jtype_rule(jtype);
  return (! jOsBiTools.is_empty(filter) && !( jOsBiTools.is_empty(filter.regex))) ? filter.regex : "";
};

function get_jtype_info(jtype) {
  var filter = get_jtype_rule(jtype);
  return (! jOsBiTools.is_empty(filter) && !( jOsBiTools.is_empty(filter.info))) ? 
                                        t(filter.info) : "";
}

function is_handled(el) {
  var handled = $(el).prop("handled");
  return (handled !== undefined && handled);
};
