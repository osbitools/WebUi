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

/**************** Language Selection Dialog ****************/

// Supported languages
// Each language should have supported flag in images/flags folder
var LANG_SET = {
  "en-US": {
    "name": "English",
    "lang": "en"
  },
  "fr-CA": {
    "name": "Français",
    "lang": "fr"
  },
  "ru-RU": {
    "name": "Русский",
    "lang": "ru"
  },
  "es-ES": {
    "name": "Español",
    "lang": "es"
  },
  "de-DE": {
    "name": "Deutsche",
    "lang": "de"
  }
};

// Add title for each available language for editor
var LANG_SET_TITLES = {
  "en": {
    "en": "English",
    "fr": "Anglais",
    "ru": "Английский",
    "es": "Inglés",
    "de": "Englisch"
  },
  
  "fr": {
    "en": "French",
    "fr": "Français",
    "ru": "Французкий",
    "es": "Francés",
    "de": "Französisch"
  },
  
  "ru": {
    "en": "Russian",
    "fr": "Russe",
    "ru": "Русский",
    "es": "Ruso",
    "de": "Russisch"
  },
  
  "es": {
    "en": "Spanish",
    "fr": "Espanol",
    "ru": "Испанский",
    "es": "Español",
    "de": "Spanisch"
  },
  
  "de": {
    "en": "German",
    "fr": "Allemand",
    "ru": "Немецкий",
    "es": "Alemán",
    "de": "Deutsche"
  }
};

function toggle_lang_sel() {
  $("#lang_sel").toggle();
}

function set_lang_sel(li) {
  var lang = $("a", li);
  $("#lang_sel").hide();
  
  set_lang(lang.attr("lang"), 
                  $("img", li).attr("alt"));
}

function set_lang(lang) {
  jOsBiTools.set_lang(lang, locale);
  $("#lbl_lang_sel").html(LANG_SET[locale].name);
  
  // Re-Create Lang Labels hash
  set_lang_labels();
}

function set_def_lang() {
  jOsBiTools.set_def_lang();
  $("#lbl_lang_sel").html(LANG_SET[jOsBiTools.locale].name);
  
  // Re-Create Lang Labels hash
  set_lang_labels();
}

/**************** GUI Language Set ****************/

function set_lang_labels() {
  // Filter all lang labels for current locale
  for (var lbl_id in jOsBiTools.ll)
    set_lang_el(lbl_id);
}

/**
 * Set DOM elements with same id to translated label
 * 
 * @param {String} lbl_id Label Id in LANG_LABELS array
 */
function set_lang_el(lbl_id) {
  $("#osbitools ." + lbl_id.toLowerCase()).html(t(lbl_id));
}

/**************** Language Decoding ****************/

function t(lbl_id) {
  return jOsBiTools.t(lbl_id);
}

function ts(lbl_id) {
  return jOsBiTools.ts(lbl_id);
}
