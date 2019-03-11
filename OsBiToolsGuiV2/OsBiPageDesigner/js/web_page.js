/*
 * Open Source Business Intelligence Tools - http://www.osbitools.com/
 * 
 * Copyright 2014-2016 IvaLab Inc. and by respective contributors (see below).
 * 
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 * Date: 2015-04-23
 * 
 * Contributors:
 * 
 */

/**
 * HTML prototype page with web widgets
 * 
 * Hidden properties are next
 * 
 * // Currently selected widget
 * this.swwg;
 */

function WebPage() {
  // Auto incremented counter for new widget ID generation
  // Must be saved and reload
  this.inc = 0;
  
  // Number of used widgets
  this.wcnt = 0;
  
  // List of web widgets
  this.wwg_list = {};
  
  // Map with all all loaded widget types
  this.wwg_classes = {};
  
  // Version of generated Web Page Metadata
  this.web_page_version = [1,0];
  
  // Define set of web page properties to edit & read/write to xml file
  this.wpp = {
    title: {
      label: "LL_PAGE_TITLE",
      dlink: "ll_link"
    },
    
    charset: {
      label: "LL_PAGE_CHARSET",
      def_val: "utf-8"
    },
    
    page_loading: {
      label: "LL_PAGE_LOADING_MSG",
      dlink: "ll_link"
    },
    
    copyright: {
      label: "LL_COPYRIGHT",
      def_val: ""
    }
  };
  
  // Prefix for property classes
  this.prop_prefix = "pd_prop_";
}

WebPage.prototype = new Entity();

WebPage.prototype.onInit = function(src) {
  var ll_list = [];
  for (var pname in this.wpp)
    if (this.wpp[pname].dlink == "ll_link")
      ll_list.push(pname);
  
  // Lang Labels data aware component listener
  this.ll_link = new LangSetUpdater(this, ll_list);
  this.getLangLabelSetLink().subscribe(this.ll_link);
};

WebPage.prototype.getSaveData = function() {
  // Web Page for save
  var web_page = {
    ver_max: this.web_page_version[0],
    ver_min: this.web_page_version[1],
    inc: this.inc
  };
  
  var descr = this.getPageDescription();
  if (!is_empty(descr))
    web_page["descr"] = descr;
    
  // web_page[""]
      
  // Attach additional properties
  for (var pname in this.wpp) {
    var value = this.wpp[pname].value;
    
    // Save only non-empty values
    if (!is_empty(value))
      web_page[pname] = value;
  }
  
  // Set Request Parameters (if any)
  this.setReqParam(web_page);
  
  var panels = [];
  
  // Go through each panel and collect widgets
  var me = this;
  $("div.comp-panel", this.body_ctx).each(function() {
    var idx = 0;
    var wwg_list = [];
    $(this).children("div.wwg").each(function() {
      // Get uid
      var uid = $(this).attr("uid");
      var wwg = me.wwg_list[uid];
      
      wwg_list.push(wwg.getJsonData(idx));
    });
    
    // res += get_crtt() + '</panel>';
    if (wwg_list.length > 0)
      panels.push({
        wwg_list: wwg_list
      });
  });
 
  if (panels.length > 0)
    web_page["panels"] = {
      panel: panels
    };
  
  return web_page;
};

/** 
 * Load entity metadata into GUI
 */
WebPage.prototype.onLoadData = function() {
  var wp = this.data.entity;
  
  this.wcnt = 0;
  this.inc = wp.inc;
  
  if (!is_empty(this.data.entity.descr))
    this.setPageDescription(this.data.entity.descr);
  
  // Init body b4 component panel load
  this.initBodyCtx();
  
  // Recreate panels
  var panels = wp.panels.panel;
  for (var i in panels) {
    var panel = panels[i];
    var rpanel = this.addComponentPanel(i == 0);
    
    if (panel.wwg_list !== undefined &&
          !this.loadWidgetSet(panel.wwg_list, rpanel))
      return false;
  }
  
  return true;
};

WebPage.prototype.onSaveSuccess = function(data, entity) {
  Entity.prototype.onSaveSuccess.call(this, data, entity);

  //Go through all web widget(s) and set all properties(s) save value as loaded
  for (var i in this.wwg_list) {
    var wwg = this.wwg_list[i];
    
    for (var j in wwg.props)
      wwg.prop_map[wwg.props[j].name].setLoaded();
  }
};
        
WebPage.prototype.loadWidgetSet = function(wset, container, on_load) {
  /*
   // Delete obsoleted
  // Arrange wwg by idx and remember max idx
  var midx = 0;
  var wlist = {};
  for (var wtype in wset) {
    var wdata = wset[wtype];
    
    for (var k in wdata) {
      var data = wdata[k];
      midx = Math.max(midx, data.idx);
      wlist[data.idx] = data;
    }
  }
  
  for (var i = 0; i <= midx; i++)  
    if (!this.loadWidget(wtype, wlist[i], container, on_load))
      return false;
  */
 
 for (var i in wset) {
   witem = wset[i];
   
   // Detect widget type. It's a first and single object key
   for (wtype in witem)
     break;
   
   if (!this.loadWidget(wtype, witem[wtype], container, on_load))
        return false;
  }
  return true;
};

WebPage.prototype.loadWidget = function(wtype, wdata, container, on_load) {
  // Check for support web widget types
  var wtemp;
  var prj = this.getPrjMgr();
  for (var idx in prj.params.wwg_types) {
    var wt = "wwg_" + prj.params.wwg_types[idx];
    if (wtype == wt) {
      wtemp = wt;
      break;
    }
  }
  
  if (wtemp === undefined) {
    //-- 107
    show_client_err(107);
    return false;
  }
  
  // Initialize new web widget component
  var cname = wdata.class_name;
  var wwg = this.getWebWidgetByRegName(cname);
  if (wwg === undefined)
    return false;
  
  if (!wwg.load(wdata))
    return false;
  
  this.addWebWidgetItem(wwg, wdata.uid);
  if (this.wwg_classes[cname] === undefined)
    // Lookup global array
    this.wwg_classes[cname] = jOsBiTools.wwg_list[cname];
    
  this.setWebWidgetContainer(wwg, container);
  
  // Invoke callback
  if (typeof on_load == "function")
      on_load(wwg);
 
 return true;
};

WebPage.prototype.onBodyInit = function(src) {
  this.initBodyCtx();
  var wwg = this.addWebWidget(src, this.addComponentPanel(true));
  
  // For now only "container" web widgets doesn't required initialization, 
  // others does
  return (wwg.nname == "container");
};

WebPage.prototype.initBodyCtx = function() {
  this.body_ctx.html('<div class="comp-cont-wrapper">' +
    '<table class="comp-container">' + 
      '<tbody class="comp-container"></tbody>' + 
    '</table>' +
    '</div>'
  );
};

WebPage.prototype.addComponentPanel = function(fpanel) {
  var rpanel = this.getComponentPanelRow(fpanel);
  var panel = $("div.comp-panel", rpanel);
  $("tbody.comp-container", this.body_ctx).append(rpanel);
  
  return panel;
};

WebPage.prototype.appendBodyCtx = function(src) {
  
};

WebPage.prototype.addPanelCtxMenu = function(panel) {
  var me = this;
  
  panel.contextPopup({
    items: [
      {
        label: t("LL_SPLIT_VERTICALLY"),
        icon:'images/layout-split-vertical.png',
        action:function() { 
          me.splitContainer(panel);
        } 
      }
    ]
  });   
};

WebPage.prototype.onBodyClose = function(src) {
  this.wcnt = 0;
  this.wwg_list = {};
};

WebPage.prototype.splitContainer = function(container) {
  // Add extra container below
  var parent = $(container).parent().parent().parent();
 
  parent.append(this.getComponentPanelRow(false));
};

/**
 * Create panel for adding components (web widgets).
 * 
 * @param {Object} fpanel Flag set to True for first panel added 
 *                                            and False for others
 */
WebPage.prototype.getComponentPanelRow = function(fpanel) {
  var me = this;
  
  var rpanel = $('<tr>' + 
    '<td class="comp-panel">' + 
      '<div class="comp-panel dashed-border">' + 
        (!fpanel ? '<span class="ui-icon ui-icon-close hidden panel-icon ' + 
          'bg-item" title="' + ts("LL_CLOSE") + '"></span>' : "") + 
      '</div>' + 
    '</td>' + 
  '</tr>');
  
  var panel = $("div.comp-panel", rpanel);
      
  // Add context menu on body part
  this.addPanelCtxMenu(panel);
  
  // Add Drag & Drop for panel
  this.addDragDrop(panel, function(src) {
    var wwg = me.addWebWidget(src, panel);
    
    // For now only "container" web widgets doesn't required initialization, 
    // others does i.e. web page can be saved right after widget added 
      me.clearSaved(true);
  });
  
  if (!fpanel) {
    rpanel.on("mouseover", function() {
      $(".ui-icon-close:first", this).show();
    });
    
    rpanel.on("mouseout", function() {
      $(".ui-icon-close:first", this).hide();
    });
    
    $(".panel-icon", rpanel).on("click", function() {
      // Check if panel has containers
      var cnt = $(".wwg", panel).length;
      
      if (cnt > 0) {
        if (!confirm(ts("LL_DEL_NON_EMPTY_PANEL_CONFIRM")))
          return;
      
        // TODO
        // Detect and remove web widgets
      }
       
      rpanel.remove();
    });
    
    $(".panel-icon", panel).on("contextmenu", 
                        function(ev) {ev.stopPropagation();});
  }
    
  return rpanel;
};

/**
 * Add web widget into parent container by drop icon source path.
 * 
 * @param {Object} src source path of web widget icon
 * @param {Object} container parent container
 * 
 * @return pointer on Web Widget Object
 * 
 */
WebPage.prototype.addWebWidget = function(src, container) {
  var lst = src.toLowerCase().match(/.*\/web_widgets\/(.*)\/[a-z_]*\.png/);
  if (lst == null || lst.length != 2) {
    //-- 100
    show_client_err(100);
    return;
  }
  
  return this.addWebWidgetEx(lst[1].replace(/\//g, "."), container);
};

/**
 * // Add web widget into parent container by common name.
 * 
 * @param {Object} src source path of web widget icon
 * @param {Object} container parent container
 * 
 */
WebPage.prototype.addWebWidgetEx = function(cname, container) {
  // Always first - Initiate Web Widget. 
  // Common Name (cname) is not validated at this point.  
  var wwg = this.getWebWidgetByRegName(cname);
  
  // Initialize new web widget component
  this.inc++;
  this.addWebWidgetItem(wwg, this.inc);

  var cn = cname.replace(/\./g, "_") + "_" + this.inc;
  wwg.initProps({
    uid: this.inc,
    props: {
      prop: [
        {
          name: "id",
          value: cn
        }
      ]
    }
  });
  
  this.setWebWidgetContainer(wwg, container);
  
  return wwg;
};

WebPage.prototype.addWebWidgetItem = function(wwg, uid) {
  this.wcnt++;
  this.wwg_list[uid] = wwg;
};

WebPage.prototype.getWebWidgetByRegName = function(name) {  
  // Find Web Widget source
  var wcomp = jOsBiTools.wwg_list[name];
  
  // Check if widget loaded
  if (wcomp === undefined) {
    //-- 101
    show_client_error_ex(101, "Web Widget: " + name);
    return;
  }
  
  // Try instantinate Web Widget.
  var wwg;
  try {
    wwg = jOsBiTools.make_wwg(name, this);
    wwg.body = wcomp["body.html"];
  } catch (e) {
    //-- 103
    show_client_error_ex(103, "Web Widget: " + cname + 
                                  "<br />Error: " + e.message);
    return;
  }
  
  return wwg;
};

WebPage.prototype.setPageProperties = function(data) {
  Entity.prototype.setPageProperties.call(this);
  
  // Attach additional properties
  for (var pname in this.wpp) {
    // Init only non-empty values
    if (this.data.entity[pname] !== undefined)
      this.wpp[pname].value = this.data.entity[pname];
  }
};

WebPage.prototype.setWebWidgetContainer = function(wwg, container) {
  // Add selected class for new component
  container.append('<div uid="' + wwg.uid + '" class="' + 
    wwg.getClassName() + ' ' + wwg.getTypeClassName() + ' ' + wwg.getId() + ' selected">' + 
    
    wwg.body + 
    
    // Always last
    
    '<div class="ctrl-panel bg-item hidden">' +
      '<span class="ui-icon ui-icon-close wwg-icon" ' + 
            'title="' + ts("LL_CLOSE") + '"></span>' +
    '</div>' +
    
    // '</div>' + 
    '</div>');
  
  wwg.addContainerToolBar($("." + wwg.getId() + " div.ctrl-panel", container));
  
  // Ignore context menu for widget body
  var me = this;
  var wwg_cont = $("#osbitools ." + wwg.getId()); // TODO Add container ?
  wwg_cont.on("contextmenu", function(ev) {ev.stopPropagation();});
  
  wwg_cont.on("mouseover", function(evt) {
    $(".ctrl-panel:last", this).show();
    evt.stopPropagation();
  });
  
  wwg_cont.on("mouseout", function(evt) {
    $(".ctrl-panel:last", this).hide();
    evt.stopPropagation();
  });
  
  // Add component close button
  $(".ui-icon-close", wwg_cont).on("click", function(evt) {
    evt.stopPropagation();
    me.closeWebWidget(wwg);
  });
  
  wwg_cont.on("click", function(evt) {
    // Check if already selected
    if ($(this).hasClass("selected")) {
      evt.stopPropagation();
      return;
    }
    
    // Check if current property tab can be closed
    if (!me.getPrjMgr().checkPropTabSaved())
      return;
      
    me.removeDefSelection(container);
    $(this).addClass("selected");
    
    // Show property for selected widget
    me.showWebWidgetPropWin(wwg);
    
    evt.stopPropagation();
  });
  
  // Remove selection from others components
  this.removeDefSelection();
  wwg.setContainer(wwg_cont);
  
  // Show property window
  this.showWebWidgetPropWin(wwg);
  
  return wwg;
};

/**
 * Close web widget
 */
WebPage.prototype.closeWebWidget = function(wwg) {
  if (!wwg.canClose()) {
    alert(ts("LL_WEB_WIDGET_NOT_SAVED"));
    return;
  }
  
  var cont = wwg.getContainer();

  cont.remove();
  
  // Update widget counter
  this.wcnt = $(".wwg", this.body_ctx).length;
  
  if (this.wcnt == 0) {
    // Remove all panel and Restore initial state
    this.close();
    this.hidePropWin();
  } else {
    // Check if any widget has selected class
    if ($(".wwg.selected", this.body_ctx).length == 0)
      // Hide property tab
      this.hidePropWin();
      
    this.clearSaved();
  }
  
};

/**
 * Show property window
 */
WebPage.prototype.showWebWidgetPropWin = function(wwg) {
  // Set is active selection
  this.swwg = wwg;

  this.setPropertyWinObj(wwg);
  this.showPropWin(wwg.getPropertyWin());
};

/**
 * Hide property window
 */
WebPage.prototype.hidePropWin = function(wwg) {
  this.getPrjMgr().hidePropTab();
};

/**
 * Remove default Web Widget selection.
 */
WebPage.prototype.removeDefSelection = function() {
  $(".wwg.selected", this.body_ctx).each(function() {
    $(this).removeClass("selected");
  });
  
  // remove active selection
  delete this.swwg;
};

WebPage.prototype.addDragDrop = function(el, on_drop) {
  var me = this;
  
  el.droppable({
    greedy: true,
    hoverClass: "dashed-border-ready",
    drop: function(event, ui) {
      if (!WEB_APP.base.DST_HANDLED)
        return false;
      on_drop(WEB_APP.base.DST_SRC);
    }
  });
};

WebPage.prototype.onProTabChanging = function() {
  // Unselect all web widgets
  this.removeDefSelection();
};

WebPage.prototype.getPropertyWin = function() {
  // Call super method
  var pwin = Entity.prototype.getPropertyWin.call(this);
  
  // Attach custom properties
  var tbody = $("tbody", pwin);
  
  for (var pname in this.wpp) {
    var prop = this.wpp[pname];
    var ids = this.prop_prefix + pname;
    var title = ts("LL_PROP_INFO_" + prop.label.substr(3));
    
    tbody.append('<tr><th><label class="prop-name">' + 
      t(prop.label) + ':</label></th><td>' +
        (prop.dlink == "ll_link" ? 
        
        // Select input
        '<select class="pd-prop ' + ids + '" title="' + title +
            '" disabled></select>' :

        // Regular text input  
        '<input  value="' + (is_empty(prop.value) ? prop.def_val : prop.value) +
            '" class="pd-prop ' + ids + '" title="' + title + '" disabled />') +
            
      '</td></tr>');
  }
  
  // Fill data for lang set links
  this.ll_link.addLangLabelSet(tbody);
  
  var me = this;
  $("input.pd-prop", tbody).on("input", function(evt) {
    me.getPrjMgr().setPropSave(true);
  });
  
  $("select.pd-prop", tbody).on("change", function(evt) {
    me.getPrjMgr().setPropSave(true);
  });
  
  return pwin;
};

WebPage.prototype.editProperty = function() {
  // Call super method
  Entity.prototype.editProperty.call(this);
  
  $(".pd-prop", this.prop_win).prop("disabled", false);
};

WebPage.prototype.cancelProperty = function() {
  for (var pname in this.wpp) {
    var prop = this.wpp[pname];
    var el = $("." + this.prop_prefix + pname, this.prop_win);
    var value = is_empty(prop.value) ? prop.def_val : prop.value;
    
    if (prop.dlink == "ll_link")
      this.ll_link.cancel(el, value);
    else
      el.val(unescape_xml(value));
    
    el.prop("disabled", true);
  }
  
  // Last. Call super method
  Entity.prototype.cancelProperty.call(this);
};

WebPage.prototype.saveProperty = function() {
  for (var pname in this.wpp) {
    var el = $("." + this.prop_prefix + pname, this.prop_win);
    var prop = this.wpp[pname];
  
    prop.value = escape_xml(el.val());
    el.prop("disabled", true);
  }
  
  // Last
  return Entity.prototype.saveProperty.call(this);
};

WebPage.prototype.getPreviewApiName = function() {
  return "export";
};

WebPage.prototype.getExportApiName = function() {
  return "zip";
};

WebPage.prototype.getPreviewBaseUrl = function() {
  return (window["EXPORT_URL"] === undefined 
    ? "preview" 
    : "exports");
};

WebPage.prototype.getExportUrl = function() {
  return (window["EXPORT_URL"] === undefined 
    ? WEB_APP.bs.config.preview_host 
    : EXPORT_URL);
};

WebPage.prototype.onPreview = function(ds_src, qparams, fname, params, wparams) {
  var me = this;
  
  // Start spinning
  enable_wait_btn("ll_preview", "right");
  
  this.uploadWebPage(ds_src, qparams, fname, "html_site",
    function(name) {
      
      /* TODO Duplicated code
      // Define query parameters
      if (jOsBiTools.log.enabled)
        qparams["debug"] = "on";
      if (jOsBiTools.trace.enabled)
        qparams["trace"] = "on";
      */
     
      var path = me.getPreviewBaseUrl() + "/html_site/" +
        name.replace(".", "/") + "/index.html";
      
      // Check if url embedded or external
      var url = me.getExportUrl();
      var req = (url == "")
        // Embedded
        ? make_rel_req_ex(me.getPreviewApiName(), path, qparams)
        // External
        : make_abs_req_query(url + path, qparams);

      // Open preview window
      window.open(jOsBiTools.get_redirect_url(req),name + " preview",
        wparams + ',menubar=no,location=yes,resizable=yes' + 
                                  ',scrollbars=yes,status=yes', false);
            
      // Stop spinning
      disable_wait_btn("ll_preview", "right");
    }, 
    function(err, code) {
      // Stop spinning
      disable_wait_btn("ll_preview", "right");
     
      me.onExportError(err, code);
    });
};

WebPage.prototype.onExportError = function(err, code) {
  var rwin = $(this.getPrjMgr().reg_win);
      
  if (code == 403) {
    rwin.data("res", false);
    
    rwin.bPopup({
      appendTo: "#osbitools",
      onClose: function() { 
        var res = rwin.data("res");
        if (res) {
          
          // Collect all form parameters and send for registration
          var rdata = {};
          $(".r-field", rwin).each(function() {
            var el = $(this);
            rdata[el.attr("name")] = el.val();
          });
          
          window.setTimeout(function() {
            rwin.data("register")(rdata);
          }, 0);
        }
      }
    });
  } else if (code == 200) {
    show_server_error(err);
  } else {
    //-- 102 
    show_ajax_error_ex(102, err);
  }
};

WebPage.prototype.uploadWebPage = function(ds_src, qparams, name,
                                              type, on_success, on_error) {
  // Zip and uload source
  var js_zip = new JSZip();
  
  // Get entity name without extension
  var name = this.getProject().getName();
  
  // Create top level directory hierarchy
  var zip = js_zip.folder(name);

  name += "." + this.name;
  zip = zip.folder(this.name);
  
  // Add images in resource base folder
  var fimg = zip.folder("images");
  
  for (var idx in WEB_APP.icon_list.map) {
    var img = WEB_APP.icon_list.map[idx];
    fimg.file(img.key, img.base64, {base64: true});
  }
  
  zip = zip.folder("src");
  
  // Zip and uload source
  zip.file("lang_set.js", "(function(osbi) {" + get_crt() +
    "osbi.load_ll_set(" + get_crt() + 
      JSON.stringify(this.getProject().getLangLabelSet()) + 
        get_crt() + ")" + get_cr() + "})(jOsBiTools);");
      
  zip.file("version.txt", RES_VERSION);
  zip.file("wp.json", this.getSaveText());
  
  var base = "web_widgets";
  var fwwgs = zip.folder(base);
  
  var res = "";
  for (var i in this.wwg_list) {
    var cname = this.wwg_list[i].name;
    var wwg_def = jOsBiTools.wwg_list[cname];
    
    // Define path
    var fwwg = fwwgs.folder(cname.replace(/\./g, "/"));
    
    // Add all web widget class resources  
    for (var j in WWG_RES_LIST) {
      var rname = WWG_RES_LIST[j];
      fwwg.file(rname, wwg_def[rname]);
    }
  }
  
  var req = this.getUploadWebPageReq(ds_src, qparams, name, type);
  
  req["data"] = js_zip.generate({type:"base64"});
  
   post_ajax_data(req, 0, function() {
      on_success(name);
    }, on_error, "application/octet-stream");
};

WebPage.prototype.getUploadWebPageReq = function(ds_src, qparams, name, type) {
  // Add additional parameters
  var qpr = {
    corews_url: encodeURIComponent(ds_src),
    exp_type: type
  };

  // Copy the rest
  for (key in qparams)
    qpr[key] = qparams[key];
     
  // Check if url embedded or external
  return (WEB_APP.bs.config.preview_host == "")
    // Embedded
    ? make_rel_req_ex(this.getPreviewApiName(), name, qpr)
    // External
    : make_abs_req_query(WEB_APP.bs.config.preview_host + 
        this.getPreviewApiName() + "/" + name, qpr);
};

WebPage.prototype.export = function(type) {
  var me = this;
  
  // Optional request param string
  var qparams = {};
  
  // Check if lang parameter requires
  if (!jOsBiTools.is_def_lang())
    qparams["lang"] = jOsBiTools.lang;
      
  this.uploadWebPage(this.getProject().getPrjMgr().config.ds_item.url,
      qparams, this.dname, type,
    function(name) {
      var url = WEB_APP.bs.config.preview_host;
      var qpr = {
        exp_type: type
      };
      
      var req = (url == "")
        // Embedded
        ? make_rel_req_ex(me.getExportApiName(), name, qpr)
        // External
        : make_abs_req_query(url + me.getExportApiName() + "/" + name, qpr);
        
      window.location = jOsBiTools.get_download_url(req);
    }, 
    function(err, code) {
      me.onExportError(err, code);
    }
  );
};

function LangSetUpdater(wp, list) {
  // Web Page
  this.page = wp;
  
  // List of lang labels data aware components
  this.list = list;
}

LangSetUpdater.prototype.load = function(data) {
  this.data = data;
  
  // Create index map
  this.lmap = {};
  for (var idx in data) {
    var litem = data[idx];
    this.lmap[litem.getKey()] = litem;
  }
};

LangSetUpdater.prototype.reload = function(data) {
  this.load(data);
  this.addLangLabelSet();
};

LangSetUpdater.prototype.addLangLabelSet = function(container) {
  for (var i in this.list) {
    var pname = this.list[i];
    var item = $(".pd_prop_" + pname, container);
    var prop = this.page.wpp[pname];
    var value = is_empty(prop.value) ? prop.def_val : prop.value;
    
    item.empty();
  
    if (is_empty(value) || this.lmap[value] === undefined)
      item.append('<option value="">-- ' + ts("LL_SELECT") + ' --</option>');
    
    for (var idx in this.data) {
      var litem = this.data[idx];
      var lvalue = litem.getValue();
      item.append('<option value="' + litem.getKey() + '"' + 
        (lvalue == value ? " selected" : "") + ">" + lvalue + '</option>');
    }
  }
};

LangSetUpdater.prototype.cancel = function(el, value) {
  el.val(this.lmap[value] !== undefined ? value : "");
};

LangSetUpdater.prototype.enable = function() {
  this.setState(true);
};

LangSetUpdater.prototype.disable = function() {
  this.setState(false);
};

LangSetUpdater.prototype.setState = function(enabled) {
  for (var i in this.list)
    this.list[i].attr("disabled", !enabled);
};
