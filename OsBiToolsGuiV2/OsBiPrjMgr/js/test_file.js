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

function TestFile() {}

TestFile.prototype = new Entity();

TestFile.prototype.getSaveData = function() {
  // First line is file description
  var descr = this.getPageDescription();
  
  return (descr !== undefined ? descr : "") + "\n" + 
        $("#osbitools .test_file_name").html().replace(/<br>/g, "\n");
};

/** 
 * Load entity metadata into GUI
 * Use this.data variable to access loaded data
 * 
 */
TestFile.prototype.onLoadData = function() {
  // First line is description
  var pos = this.data.entity.indexOf("\n");
  
  // Check if last quotes in place
  var idx = this.data.entity.charAt(this.data.entity.length - 1) == '"' ? 1 : 0;
  this.setPageDescription(this.data.entity.substr(idx, pos));
  
  // Trim first and last double quotes
  this.initBodyCtx(this.data.entity.substring(pos + 1,
                          this.data.entity.length - idx));
  this.showEntityPropWin();
  
  return true;
};

TestFile.prototype.onBodyInit = function(src) {
  this.url = src;
  this.initBodyCtx(this.dname + ":" + get_file_name_from_url(src));
  
  return true;
};

TestFile.prototype.initBodyCtx = function(msg) {
  var me = this;
  this.body_ctx.html('<div class="test_file_name entity-ctx-empty ' + 
      'entity-body-empty ui-droppable dotted-border">' + 
                    msg.replace(/\n/g, "<br />") + '</div>');
  
  var text = $("#osbitools .test_file_name");
      
  // Add drag&drop for body context
  this.body_ctx.droppable({
    drop: function(event, ui) {
      if (!WEB_APP.base.DST_HANDLED)
        return false;
      me.appendBodyCtx(text, WEB_APP.base.DST_SRC);
      text.removeClass("dotted-border-ready");
      text.addClass("dotted-border");
    },
    over: function(event, ui) {
      if (WEB_APP.base.DST_HANDLED) {
        text.removeClass("dotted-border");
        text.addClass("dotted-border-ready");
      }
    },
    out: function() {
      if (WEB_APP.base.DST_HANDLED) {
        text.removeClass("dotted-border-ready");
        text.addClass("dotted-border");
      }
    }
  });
};

TestFile.prototype.appendBodyCtx = function(text, src) {
  text.html(text.html() + "<br />" + 
                this.dname + ":" + get_file_name_from_url(src));
  
  this.clearSaved(true);
  return true;
};

TestFile.prototype.onPreview = function(url, name, params) {
  alert(ts("LL_HAS_NO_PREVIEW"));
};
