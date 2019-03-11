/*

  Author - Rudolf Naprstek
  Website - http://www.thimbleopensource.com/tutorials-snippets/jquery-plugin-filter-text-input
  Version - 1.5.3
  Release - 12th February 2014

  Thanks to Niko Halink from ARGH!media for bugfix!
 
  Remy Blom: Added a callback function when the filter surpresses a keypress in order to give user feedback

  Don Myers: Added extension for using predefined filter masks

  Richard Eddy: Added extension for using negative number
  
  Igor Peonte: Added onEmpty and onEnter events

*/

(function($){  
  
    $.fn.extend({   

        filter_input: function(options) {

          var defaults = {  
              regex:".",
              live: false,
              events: 'keypress paste'
          };  
                
          var options =  $.extend(defaults, options);  
          var fchange = $.isFunction(options.onChange);
          var ftext = $.isFunction(options.onText);
          var fempty = $.isFunction(options.onEmpty);
          
          // Check if all input field selected
          function is_all_selected(input) {
            var fsel = false;
            
            // Check if any selection and if yes if all input selected
            if (typeof input.selectionStart == "number")
              fsel = input.selectionStart == 0 && 
                                    input.selectionEnd == input.value.length;
                                    
            return fsel;
          }
          
          // Check if some input field selected
          function is_some_selected(input) {
            var fsel = false;
            
            // Check if any selection and if yes if all input selected
            if (typeof input.selectionStart == "number")
              fsel = input.selectionStart != input.selectionEnd;
                                    
            return fsel;
          }
          
          function check_input_changes(event) {
            var input = (event.input) ? event.input : this;
            var value = input.value;
                                        
            if (event.type=='keydown') {

              var key = event.charCode ? event.charCode : 
                            (event.keyCode ? event.keyCode : 0);

              // 8 = backspace,  46 = delete
              if (key == 8 || key == 46) {
                
                // Empty check first. If true than do not call change check
                if (fempty) {
                  if (is_all_selected(input)) {
                    options.onEmpty($(input));
                    return;
                  } else if (value.length == 1 && 
                    (typeof input.selectionStart == "number") &&
                      // For length == 1 check caret positon
                      // Fof backspace should be 1 for del should b 0
                      (key == 8 && input.selectionStart == 1 ||
                          key == 46 && input.selectionStart == 0)) {
                    options.onEmpty($(input));
                    return;
                  }
                }

                // Check if any changes
                if (fchange) {
                  if (is_some_selected(input))
                    options.onChange($(input));
                  else if (value.length > 0 && 
                    (typeof input.selectionStart == "number") &&
                      // For length == 1 check caret positon
                      // Fof backspace should != 0 for del should be != length
                      (key == 8 && input.selectionStart > 0 ||
                          key == 46 && input.selectionEnd < input.value.length))
                    options.onChange($(input));
                }
              }
            } else if (event.type=='cut') {
              // Empty check first. If true than do not call change check  
              if (fempty && is_all_selected(input)) {
                options.onEmpty($(input));
                return;
              }
              
              if (is_some_selected(input)) {
                // Invoke onChange event as well
                if (fchange)
                  options.onChange($(input));
              }
            }
          }
          
          function on_text(event) {
            
          }
          
          function filter_input_function(event) {

            var input = (event.input) ? event.input : $(this);
            if (event.ctrlKey || event.altKey) return;
            
            if (event.type=='keypress') {

              var key = event.charCode ? event.charCode : 
                            event.keyCode ? event.keyCode : 0;

              // 13 = enter
              if (key == 13) {
                if ($.isFunction(options.onEnter))
                  options.onEnter();
                  
                return false;
              }
              var string = String.fromCharCode(key);
              var text = input.val() + string;
              var regex = new RegExp(options.regex);
            } else if (event.type=='paste') {
              input.data('value_before_paste', event.target.value);
              setTimeout(function(){
                filter_input_function({type:'after_paste', input:input});
              }, 1);
              return true;
            } else if (event.type=='after_paste') {
              var string = input.val();
              var text = input.val();
              var regex = new RegExp('^('+options.regex+')+$');
            } else {
              return false;
            }

            if (regex.test(string)) {
              if (fchange)
                options.onChange(input);
                
              return true;
            } else if (typeof(options.feedback) == 'function') {
              options.feedback.call(this, string);
            }
            
            if (event.type=='after_paste') 
                  input.val(input.data('value_before_paste'));
                  
            return false;
          }
          
          // Plugin initializationt
          var jquery_version = $.fn.jquery.split('.');
          if (options.live) {
            if (parseInt(jquery_version[0]) >= 1 && 
                        parseInt(jquery_version[1]) >= 7) {
              $(this).on(options.events, filter_input_function); 
            } else {
              $(this).live(options.events, filter_input_function); 
            }
          } else {
            return this.each(function() {  
              var input = $(this);
              if (fempty || fchange || ftext) {
                // Detect text change
                var change_events = "cut keydown";
                input.off(change_events).on(change_events, 
                                                   check_input_changes);
              }
              
              if (ftext) {
                // Detect text change
                var change_events = "keyup";
                input.off(change_events).on(change_events, 
                   function() {
                     options.onText(input.val());
                   });
              }
              
              input.off(options.events).on(options.events, 
                                          filter_input_function);
            });  
          }
          
        }  
    });  
      
})(jQuery); 

/*
  Author - Don Myers
  Version - 0.1.0
  Release - March 1st 2013
*/

  /*
  use any of these filters or regular expression in some cases the regular expression is shorter but for some people the "names" might be easier

  ie.
   <input type="text" name="first_name" value="" data-mask="[a-zA-Z ]" placeholder="eg. John"/>
   <input type="text" name="last_name" value="" data-mask="int" placeholder="eg. Smith"/>

*/

/*
jQuery(document).ready(function() {

  var masks = {
    'int':     /[\d]/,
    'float':     /[\d\.]/,
    'money':    /[\d\.\s,]/,
    'num':      /[\d\-\.]/,
    'hex':      /[0-9a-f]/i,
    'email':    /[a-z0-9_\.\-@]/i,
    'alpha':    /[a-z_]/i,
    'alphanum': /[a-z0-9_]/i,
    'alphanumlower':/[a-z0-9_]/,
    'alphaspace':    /[a-z ]/i,
    'alphanumspace': /[a-z0-9_ ]/i,
    'alphanumspacelower':/[a-z0-9_ ]/
  };

  jQuery('input[data-mask]').each(function(idx) {
    var mask = jQuery(this).data('mask');
    var regex = (masks[mask]) ? masks[mask] : mask;

    jQuery(this).filter_input({ regex: regex, live: true }); 
  });
});

*/