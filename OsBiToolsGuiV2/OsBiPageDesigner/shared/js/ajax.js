/*
 * Open Source Business Intelligence Tools - http://www.osbitools.com/
 * 
 * Copyright 2014-2018 IvaLab Inc. and by respective contributors (see below).
 * 
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 * Date: 2018-03-31
 * 
 * Contributors:
 * 
 */

(function(osbi) {

  osbi.get_url = function(req) {
    var url;                                    
    if (req.abs) {
      url = req.url;
    } else {
      url = BASE_URL + req.api_name;
      
      if (req.path_params !== undefined && req.path_params.length > 0)
        url += "/" + req.path_params.join("/");
        
      if (req.query_params !== undefined) {
        var qs = "";
        for (key in req.query_params)
          qs += "&" + key + "=" + req.query_params[key];
          
        if (qs.length != "")
          url += "?" + qs.substr(1);
      }
    }
    
    return url;
  };
  
  osbi.get_data = function(req, http_method) {
    return req.data;
  };
  
  osbi.b4_ajax = function(adata) {
    // Do nothing
  };
  
  osbi.process_form = function(form, req) {
    // Do nothing
  };

  osbi.prep_form = function(form, arr, req) {
    // Do nothing
  };
  
  osbi.get_download_url = function(req) {
    return this.get_url(req);
  };
  
  osbi.get_redirect_url = function(req) {
    return this.get_url(req);
  };
  
  osbi.check_ctype  = function(ctype) {
    return ctype;
  };
  
  osbi.encode_query_param  = function(value) {
    return encodeURIComponent(value);
  };

})(jOsBiTools);

