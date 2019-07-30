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
      "ru": "Свечка",
      "es": "Vela",
      "de": "Kerze"
    },

    LL_COM_OSBITOOLS_CHARTS_JQPLOT_OHLC_DESCR: {
      "en": "CandleStick Chart",
      "fr": "Sandlstikk Hart",
      "ru": "Свечной график",
      "es": "Gráfico de velas",
      "de": "CandleStick-Diagramm"
    },
    
    LL_CANDLE_COLOR: {
      "en": "Candle Color",
      "fr": "Couleur Chandle",
      "ru": "Цвет Свечки",
      "es": "Color de la vela",
      "de": "Kerzenfarbe"
    },
    
    LL_ERROR_OHLC_CONFIGURATION_NOT_SET: {
      "en": "Configuration for ohlc series is not set",
      "fr": "Configuration pour la série est pas réglé",
      "ru": "Конфигурации для рядов не определены",
      "es": "La configuración para la serie ohlc no está establecida.",
      "de": "Die Konfiguration für die Ohlc-Serie ist nicht festgelegt"
    },
  
    LL_ERROR_OHLC_Y_AXIS_COLUMN_IS_NOT_SET: {
      "en": "Column for Y Axis in ohlc series [series] is not set",
      "fr": "Colonne pour l'axe Y est pas ohlc réglé",
      "ru": "Колонка для Абсциссы Y для ohlc ряда #[series] не определена",
      "es": "La columna para el eje Y en la serie ohlc [serie] no está configurada",
      "de": "Spalte für Y-Achse in Ohlc-Serie [Serie] ist nicht gesetzt"
    },
  
    LL_ERROR_OHLC_Y_AXIS_COLUMN_NO_DATA: {
      "en": "Y Axis column [column] in ohlc series has no data",
      "fr": "Y Axe colonne [colonne] n'a pas de données",
      "ru": "Колонка [column] для Абсциссы Y в ohlc ряду не имеет данных",
      "es": "La columna del eje Y [column] en la serie ohlc no tiene datos",
      "de": "Die Spalte [column] der Y-Achse in der Ohlc-Reihe enthält keine Daten"
    }
  });
})(jOsBiTools);
