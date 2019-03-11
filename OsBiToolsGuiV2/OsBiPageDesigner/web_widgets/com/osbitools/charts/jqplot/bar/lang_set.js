/*
* Copyright 2014 - 2016 IvaLab Inc. and contributors below
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
    LL_COM_OSBITOOLS_CHARTS_JQPLOT_BAR_NAME: {
      "en" : "Bar",
      "fr" : "Bande",
      "ru" : "Столб"
    },

    LL_COM_OSBITOOLS_CHARTS_JQPLOT_BAR_DESCR: {
      "en" : "Bar Chart",
      "fr" : "Diagramme à Bandes",
      "ru" : "Столбчатые диаграмма"
    },
    
    LL_BAR_COLORS: {
      "en": "Bar Colors",
      "fr": "Couleurs de la Barre",
      "ru": "Цвет Столбцов"
    },
    
    LL_EXCLUDE_COLUMNS: {
      "en": "Columns list to exclude",
      "fr": "Colonnes liste à exclure",
      "ru": "Список Столбцов для исключения"
    }
  });
})(jOsBiTools);
