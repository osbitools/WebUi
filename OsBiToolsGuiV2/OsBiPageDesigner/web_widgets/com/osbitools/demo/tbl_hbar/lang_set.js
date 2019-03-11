/*
 * Open Source Business Intelligence Tools - http://www.osbitools.com/
 * 
 * Copyright 2014-2016 IvaLab Inc. and by respective contributors (see below).
 *
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 * Date: 2015-07-28
 *
 * Contributors:
 *
 */

// Push chart specific lang labels into global array
(function(osbi) {
  osbi.load_ll_set({
    // Label for wwg shown in the component panel
    LL_COM_OSBITOOLS_DEMO_TBL_HBAR_NAME: {
      "en": "Table Bars",
      "fr": "Tableau barres",
      "ru": "Табличные столбики"
    },
    
    // Description for wwg shown in the component panel
    LL_COM_OSBITOOLS_DEMO_TBL_HBAR_DESCR: {
      "en": "Table Horizontal Bars",
      "fr": "Tableau barres horizontales",
      "ru": "Табличные горизонтальные столбики"
    },
    
    // Web Widget properties
    LL_SHOW_BAR_VALUES: {
      "en": "Show bar values",
      "fr": "Afficher les valeurs de bar",
      "ru": "Показывать значения столбиков"
    },
    
    LL_SHOW_SUMMARY_ROW: {
      "en": "Show summary row",
      "fr": "Afficher le résumé rangée",
      "ru": "Показывать строку с суммарным значением"
    }
  });
})(jOsBiTools);