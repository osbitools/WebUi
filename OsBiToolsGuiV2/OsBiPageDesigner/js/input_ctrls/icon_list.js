/*
 * Open Source Business Intelligence Tools - http://www.osbitools.com/
 * 
 * Copyright 2014-2016 IvaLab Inc. and by respective contributors (see below).
 * 
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 * Date: 2015-06-11
 * 
 * Contributors:
 * 
 */

/**
 * Class to handle drop down list with icon assigned for each option 
 *                          plus additional option for uploading new icon
 * 
 * @param {String} name Input name
 * @param {String} label Index for human readable label
 * @param {Object} value Object or String that contains 
 *    current and/or default value. If it's String than this is the only value 
 *    for input field. If it object than it contains the pair current/default 
 *    values. If value missing the default value should point on existing item
 *    in the list. If item from the list is doesn't correspond the either 
 *    current value or default value than the first item from list will 
 *    be selected. Input list should not be empty and contain at least one item.
 * @param {Object} list Array with key->object (key->string) pair.
 *        {Function} function that returns list of key->object or key->string
 *          If value is object than it should have getKey/getValue method
 * @param {Object} params Optional parameters as next:
 *    {Object} list Object that contains methods that allow new icon upload.
 *              When it set than "LL_UPLOAD_NEW_ICON" menu item is available.
 *    {Function} on_save Save handler (optional)
 *    {String} tooltip (optional) Tooltip to show when mouse over input field
 * 
 */

function IconListInput(wwg, name, label, params) {
  AbstractInput.prototype.init.call(this, wwg, name, label, params);
  
  this.list = this.params.list;
  this.icons = this.params.iicons;
  
  AbstractInput.prototype.init_sel.call(this, this.list);
  
  // Set upload flag
  this.fupload = (this.params.list !== undefined);
}

IconListInput.prototype = new AbstractInput();

IconListInput.prototype.onGetInputHtml = function() {
  var value = this.getVisibleValue();
  
  return '' + 
    '<table class="' + this.cname + '">' + 
      '<tr>' +
        '<td>' +
          '<div class="header-icon hidden' + 
              (this.isDefValue() ? ' default' : '') + '">' + 
              (this.lmap[value] != undefined ? this.lmap[value] : EMPTY_ICON)  +
            '<span class="icon-name">' + value + '</span>' + 
            '<span class="ui-icon ui-icon-triangle-2-n-s hidden"></span>' + 
          '</div>' +
        '</td>' +
      '</tr>' +
      '<tr>' +
        '<td class="icon-sel-wrapper">' +
          '<ul class="icon-list hidden">' +
            this.getListItems() +
            (this.fupload ?
              '</li class="delim"><hr /></li>' +
              '<li class="icon-upload-wrapper">' + 
                  t("LL_UPLOAD_NEW_ICON") + " ..." : ""
            ) +
            '</li>' +
          '</ul>' +  
        '</td>' +
      '</tr>' +
    '</table>';
};

IconListInput.prototype.bindCtrlEvents = function() {  
  var me = this;
  this.tinput = $("div.header-icon", this.ctrl);
  this.tlist = $("ul", this.ctrl);
  
  this.tinput.on("click", function() {
    if (!$(this).hasClass("edited"))
      return;
    
    $(".icon-list", me.ctrl).toggle();
  });
  
  this.bindListItemEvents($("li.icon-item", this.ctrl));
 
  $("li.icon-upload-wrapper", this.ctrl).on("click", function(evt) {
    // Display file upload dialog
    show_simple_file_dialog(me.params.icons);
  });
  
  // Check if upload allowed
  if (this.fupload)
    this.params.icons.setIconListCtrl(this);
};

IconListInput.prototype.bindListItemEvents = function(litem) {
  var me = this;
  
  litem.on("click", function() {
    var name = $("span.icon-name", this).html();
    
    $("ul li.selected", me.ctrl).removeClass("selected");
    $(this).addClass("selected");
    $(".icon-list", me.ctrl).toggle();
    
    me.setInputValue(name);
    
    // Call default handler
    me.onSelChange();
  });
};

IconListInput.prototype.appendListItem = function(item) {
  // Add item to global list
  this.addListItem.call(this, item);
  
  var litem = $('<li class="icon-item" icon_name="' + item.getKey() + '">' + 
      item.getValue() + '<span class="icon-name">' + item.getKey() + 
        '</span></li>');
  $("li.icon-item:last", this.tlist).after(litem);
  
  this.bindListItemEvents(litem);
};

IconListInput.prototype.setInputValue = function(value) {
  // Set new file name
  $("span.icon-name", this.tinput).html(value);
  
  // Set new icon
  $("img", this.tinput).remove();
  this.tinput.prepend(this.lmap[value]);
  
  if (this.isDefValue())
    this.tinput.addClass("default");
  else
    this.tinput.removeClass("default");
};

IconListInput.prototype.enableEdit = function() {
  this.tinput.addClass("edited");
  $("span.ui-icon").addClass("edited");
};

IconListInput.prototype.disableEdit = function() {
  var me = this;
  this.tinput.removeClass("edited");
  $("span.ui-icon").removeClass("edited");
  
  // Remove selected
  $("ul li.selected", this.ctrl).removeClass("selected");
    
  if (!this.isDefValue()) {
    var cval = this.getVisibleValue();
    // Find previously selected
    $("ul li", me.ctrl).each(function() {
      if ($("span.icon-name", this).html() == cval)
        $(this).addClass("selected");
    });
  }
  
  // Hide icon list
  $(".icon-list", me.ctrl).hide();
};

IconListInput.prototype.getInputValue = function() {
  return $("span.icon-name", this.tinput).html();
};

IconListInput.prototype.getSavedValue = function() {
  var value = this.getInputValue();
  this.value.current = value;
  
  return value;
};

IconListInput.prototype.setInputError = function(value) {
  this.tinput.addClass("error");
};

IconListInput.prototype.emptyItems = function() {
  this.getListInputCtrl().empty();
};

IconListInput.prototype.getListInputCtrl = function() {
  return this.tlist;
};

IconListInput.prototype.getListItem = function(obj, fsel) {
  var res = '<li class="icon-item' + 
      (fsel ? ' selected' : '') + 
        '" icon_name="' + obj.getKey() + '">' + obj.getValue() + 
          '<span class="icon-name">' + obj.getKey() + '</span></li>';
          
  return res;
};

IconListInput.prototype.getEmptyItem = function(obj, fsel) {
  return '<li class="icon-item><span class="empty-item">' + 
                                        this.sempty + '</span></li>';
};

IconListInput.prototype.getFirstItem = function(value) {
  return $("li:first span", this.tlist);
};

// Register input control constructor in global array
jOsBiTools.input_ctrls["icon_list"] = IconListInput;
