/*
* Copyright 2014 - 2016 IvaLab Inc. and contributors below
*
* Released under the MIT license
* http://opensource.org/licenses/MIT
*
* Date: 2016-03-22
*
* Contributors:
*
*/

// Push chart specific lang labels into global array
(function(osbi) {
  osbi.load_ll_set({
    LL_COM_OSBITOOLS_CHARTS_JQPLOT_OHLC_NAME: {
      "en": "Candle",
      "fr": "Chandle",
      "ru": "Свечка"
    },

    LL_COM_OSBITOOLS_CHARTS_JQPLOT_OHLC_DESCR: {
      "en": "CandleStick Chart",
      "fr": "Sandlstikk Hart",
      "ru": "Свечной график"
    },
    
    LL_CANDLE_COLOR: {
      "en": "Candle Color",
      "fr": "Couleur Chandle",
      "ru": "Цвет Свечки"
    },
    
    LL_ERROR_OHLC_CONFIGURATION_NOT_SET: {
      "en": "Configuration for ohlc series is not set",
      "fr": "Configuration pour la série est pas réglé",
      "ru": "Конфигурации для рядов не определены"
    },
  
    LL_ERROR_OHLC_Y_AXIS_COLUMN_IS_NOT_SET: {
      "en": "Column for Y Axis in ohlc series [series] is not set",
      "fr": "Colonne pour l'axe Y est pas ohlc réglé",
      "ru": "Колонка для Абсциссы Y для ohlc ряда #[series] не определена"
    },
  
    LL_ERROR_OHLC_Y_AXIS_COLUMN_NO_DATA: {
      "en": "Y Axis column [column] in ohlc series has no data",
      "fr": "Y Axe colonne [colonne] n'a pas de données",
      "ru": "Колонка [column] для Абсциссы Y в ohlc ряду не имеет данных"
    }
  });
})(jOsBiTools);
