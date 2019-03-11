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
    LL_COM_OSBITOOLS_CHARTS_JQPLOT_LINE_NAME: {
      "en": "Line",
      "fr": "Ligne",
      "ru": "Линия"
    },
  
    LL_COM_OSBITOOLS_CHARTS_JQPLOT_LINE_DESCR: {
      "en": "Line Chart",
      "fr": "Graphique en ligne",
      "ru": "Линейный График"
    },
    
    LL_SMOOTH: {
      "en": "Smooth",
      "fr": "Lisse",
      "ru": "Сглаживание"
    },
    
    LL_ENFORCE_MM: {
      "en": "Enforce Min/Max range",
      "fr": "Appliquer Min/Max Plage",
      "ru": "Обеспечить соблюдение мин/max диапазона"
    }
  });
})(jOsBiTools);