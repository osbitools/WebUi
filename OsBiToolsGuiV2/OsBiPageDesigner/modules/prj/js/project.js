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

/**
 * Handle for current open project 
 */
function Project(name, plist) {
  // Pointer on currently open entity
  this.entity;
  
  this.plist = plist;
  this.init(name);
  this.ex_list = {};
  
  var ex_list = this.plist.getParams()["ext"];
  if (! jOsBiTools.is_empty(ex_list)) {
    exl = ex_list.split(",");
    for (var i in exl)
      this.ex_list[exl[i]] = [];
  }
  
  // Set type for new entity
  this.etype = window[this.getParams().ftype];
}

Project.prototype.init = function(name) {
	// Project Name
	this.name = name;
	
	// List of included files
	this.list = [];
	this.files = {};
	
	// Supported Extensions
	this.ex_list = {};
	
	this.is_default = true;
	this.root = $("#osbitools .proj-tree");

  // Init dynatree	
	this.dtree = this.initTree();
};

/**
 * Create context menu for project tree 
 */
Project.prototype.addEntityCtxMenu = function(node, nodeSpan) {
  var me = this;
  
  var items = [
    {
      label: t("LL_RENAME_ENTITY"),
      icon: ROOT_PATH + 'modules/prj/images/rename_entity.png',
      action:function() { 
        me.showEntityRenameDlg(node.data.key);
      } 
    },
    {
      label: t("LL_DELETE_ENTITY"),
      icon: ROOT_PATH + 'modules/prj/images/delete_entity.png',
      action:function() { 
        me.showEntityDeleteDlg(node.data.key);
      } 
    },
    null,
    {
      label: t("LL_DOWNLOAD"),
      icon: ROOT_PATH + 'modules/prj/images/download_entity.png',
      action:function() { 
        me.downloadEntity(node.data.key);
      } 
    }
  ];
  
  // Check for custom items to append
  if (typeof this.getMod().getEntityContextMenu == "function") {
    var mctx = this.getMod().getEntityContextMenu();
    
    if (mctx !== undefined && mctx.length > 0) {
      // Add delimiter b4 custom menu context
      items.push(null);
      
      // Translate menu labels and add menu items
      for (var i in mctx) {
        var item = mctx[i];
        item.label = ts(item.label);
        items.push(item);
      }
    }
  }
  $(nodeSpan).contextPopup({
    appendTo: "#osbitools",
    items: items
  });
};

/**
 * Init Project Tree in DynaTree component 
 */
Project.prototype.initTree = function() {
	var me = this;
	this.root.dynatree({
	  imagePath: ROOT_PATH + "modules/prj/images/",
		onCreate: function(node, nodeSpan) {
		  if (node.data.key.substr(0,1) != ".")
			 me.addEntityCtxMenu(node, nodeSpan);
		},
    onClick: function(node, event) {
      if (node.data.key == ".new") {
        me.showNewEntityDlg(me.list.length == 0);
        event.stopPropagation();
        return false;
      } else {
        // Ignore for self-click
        if (me.entity.name == node.data.key)
          return;
          
        if (!me.canCloseEntity()) {
          event.stopPropagation();
          return false;
        }
        
        me.loadEntity(node.data.key);
        return true;
      }
    },
		debugLevel: 0,
		// onFocus
	});
	
	var tree = this.root.dynatree("getTree");
	
	tree.getRoot().addChild({
    key: ".new",
    addClass: "node-new-btn",
    isFolder: false, 
	  icon: "new_entity.png",
    title: t("LL_NEW")
  });
  
  // Remove content popup from new button
  $("span.node-new-btn", this.root).on("contextmenu", 
                                   function(evt) {evt.stopPropagation();});
    
	return tree;
};

Project.prototype.getTree = function() {
  // Highlight file
  return this.dtree;
};

Project.prototype.getTreeRoot = function() {
  // Highlight file
  return this.dtree.getRoot();
};

Project.prototype.getActiveNode = function() {
  // Highlight file
  return this.root.dynatree("getActiveNode");
};

Project.prototype.getApp = function() {
  return this.getPrjMgr().getApp();
};

Project.prototype.getConfig = function() {
  return this.plist.getConfig();
};

Project.prototype.getPrjMgr = function() {
  return this.plist.pmgr;
};

Project.prototype.showLoaderProgress = function() {
  this.root.parent().addClass("loading");
};

Project.prototype.hideLoaderProgress = function() {
  this.root.parent().removeClass("loading");
};

/**
 * Send AJAX request to load project 
 */
Project.prototype.load = function() {
  var me = this;
  
  // Show bare project gui
  this.show();
  this.showLoaderProgress();
  
  //-- 45 Load Project 
  get_ajax_ex(make_rel_req_path(this.getUrlList().PROJECT, me.name), 45, 
    function(data) {
      me.onEntityListLoadSuccess(data);
    },
    function(msg) {
      me.hideLoaderProgress();
    }
  );
};

Project.prototype.getUrlList = function() {
  return this.plist.getUrlList();
};

Project.prototype.getParams = function() {
  return this.plist.getParams();
};

/**
 * Load project ext files after successfull ajax request
 * 
 * @data AJAX Data
 * 
 */
Project.prototype.onEntityListLoadSuccess = function(data) {
  var me = this;
  
  if (! jOsBiTools.is_empty_array(data))
    this.list = data;
  
  //-- 53 Load ext files (optional)
  var ext = this.getParams().ext;
  if (ext !== undefined) {
    get_ajax_ex(make_rel_req_path(this.getUrlList().EX_FILE, 
                                                  me.name + "/" + ext), 53, 
      function(data) {
        me.onLoadExtSuccess(data, ext);
      },
      function(msg) {
        me.hideLoaderProgress();
      }
    );
  }
};

/**
 * Load project after successfull ajax request
 * 
 * @data AJAX Data
 * 
 */
Project.prototype.onLoadExtSuccess = function(data, ext) {
  if (! jOsBiTools.is_empty(data))
    this.ex_list[ext] = data;
  
  this.loadLangLabelSet(data);
};

Project.prototype.loadLangLabelSet = function() {
  var me = this;
  
  //-- 66
  get_ajax_ex(make_rel_req_path(
                    this.getUrlList().LANG_SET_UTILS, this.name), 66,
    function(data) {
      me.onLoadLangLabelSetSuccess(data);
    },
    function(msg) {
      me.hideLoaderProgress();
    }
  );
};

Project.prototype.onLoadLangLabelSetSuccess = function(data) {
  this.lres = this.getPrjMgr().parseLangLabelSet(data);
  jOsBiTools.load_ll_set(this.lres.ll_set);
  
  this.onProjectLoadSuccess();
};
  
/**
 * Load project after successfull ajax request
 * 
 * @data AJAX Data
 * 
 */
Project.prototype.onProjectLoadSuccess = function(data, ext) {
  // Check if after_prj_loaded callback set
  var callback = this.plist.getParams().after_prj_loaded;
  if (typeof callback  == "function")
    callback(this);
  
  this.hideLoaderProgress();  
  this.findActiveEntity(true);
};

Project.prototype.getExEntityList = function(ext) {
  return this.ex_list[ext];
};

Project.prototype.addExEntityList = function(fname, ext) {
  var fex = ($.inArray(fname, this.ex_list[ext]) >= 0);
  if (!fex)
    this.ex_list[ext].push(fname);
    
  return fex;
};

Project.prototype.loadEntity = function(fname) {
  this.closeEntity();
  
  this.entity = this.files[fname];
  this.setActiveEntity(fname);
  
  if (!this.entity.isNew())
    this.entity.load();
  else
    this.showDesignEl();
};

Project.prototype.findActiveEntity = function(is_load) {
  if (this.list.length > 0) {
  
    if (this.list.length == 1) {
      // Add single entity by default
      this.setCurEntity(this.list[0], false);
    } else {
      // Show Tree
      if (is_load)
        for (var i in this.list)
          this.addNewEntity(this.list[i], false);
        
      // Check for previously remembered file
      var last_file = $.cookie("entity");
      if (!( jOsBiTools.is_empty(last_file) || 

          this.files[last_file] === undefined))
        // Load last saved
        this.setCurEntityEx(this.files[last_file], false);
      else
        // Load first element
        this.setCurEntityEx(this.files[this.list[0]], false);
    }
  } else {
    this.showNewEntityDlg(true);
  }  
};

Project.prototype.show = function() {
  $("#osbitools .project_widget").fadeIn("slow");
  $("#osbitools .project_ctx").fadeIn("slow");
  
  $("#osbitools .project_controls").fadeIn("slow");
};

Project.prototype.showNewEntityDlg = function(is_new) {
  this.hideContextMenu();
  
  if (!this.canCloseEntity())
      return false;
      
  var me = this;  
  show_simple_input_dialog({
    btnOk: t("LL_CREATE"),
    btnCancel: t("LL_CANCEL"),
    modalClose: true,
    filter: ID_FILTER.regex,
    onOk: function() {
      me.onNewEntityCreate();
    },
    onClose: {
      success: function(res) {
        me.onNewEntityCreateSuccess(res, is_new);
      },
      error: show_error_win
    },
    title: t("LL_ENTITY_NAME")
  });
};

Project.prototype.onNewEntityCreate = function() {
  var fname = this.checkNewEntitySimple();
  if (fname === undefined)
    return;
    
  hide_simple_dialog(fname);
};

Project.prototype.checkNewEntitySimple = function() {
  var fname = $("#osbitools .sd_input").val();
  
  if ( jOsBiTools.is_empty(fname)) {
    alert(ts("LL_FILE_NAME_REQ"));
    return;
  }
  
  return this.checkNewEntityExists(fname);
};

Project.prototype.checkNewEntityExists = function(fname) {
  if (this.files[fname] !== undefined) {
    alert(ts("LL_ENTITY_NAME_EXISTS").
          replace("[fname]", "[" + fname + "]"));
    return;
  }
  
  return fname;
};

Project.prototype.clearEntity = function() {
  delete this.entity;
};

Project.prototype.onNewEntityCreateSuccess = function(fname, is_new) {
  this.list.push(fname);
	this.setCurEntity(fname, true);
	
  // Show project elements
  this.showDesignEl();
};

/**
 * Load file into gui and set it as default 
 */
Project.prototype.setCurEntity = function(fname, is_new) {
  this.closeEntity();
  
  var file = this.files[fname];
  this.setCurEntityEx(file !== undefined ? file : 
                          this.addNewEntity(fname, is_new), is_new);
};

/**
 * Load existing file into gui and set it as default 
 */
Project.prototype.setCurEntityEx = function(file, is_new) {
  this.entity = file;
  this.setActiveEntity(this.entity.name);
  if (!is_new)
    this.entity.load();
};

/**
 * Activate Loaded file in the gui and set it as default 
 */
Project.prototype.setActiveEntity = function(fname) {
  // Highlight file
  this.getTree().activateKey(fname);
  
  // Remember last loaded file
  $.cookie("entity", fname);
};

/**
 * Add new file into the Project and paint it in Project Tree
 * 
 * @param fname Entity Name to load 
 */
Project.prototype.addNewEntity = function(fname, is_new) {
  var me = this;
  var entity = new this.etype();
  entity.init(fname, this, is_new);
  
  this.files[fname] = entity;
  
  var child = this.getTreeRoot().addChild({
    title: fname, 
    isFolder: false, 
    key: fname
  });
  
  return entity;
};

/**
 * Show project visual design elements 
 */
Project.prototype.showDesignEl = function() {
  $("#osbitools .ds_types").removeClass("ui-state-disabled");
  $("#osbitools .ws_list").show();
  $("#osbitools .req-params-wrapper").show();
  $("#osbitools .entity-body").show();
  $("#osbitools .entity_wrapper").addClass("wrapper");
  $("#osbitools .entity_ctx_ctrl").show();
  
  // Show & Adjust min height of component panel
  var icons = $("#osbitools .icon_list");
  icons.show();
  icons.parent().css("min-height", (icons.height()));
};

/**
 * Hide project visual design elements 
 */
Project.prototype.hideDesignEl = function() {
  $("#osbitools .ds_types").addClass("ui-state-disabled");
  $("#osbitools .ws_list").hide();
  
  $("#osbitools .req_param_name").val("");
  $("#osbitools .req_param_jtype").val("");
  $("#osbitools .req-params-wrapper").hide();
  $("#osbitools .entity-body").hide();
  
  $("#osbitools .entity_wrapper").removeClass("wrapper");
  $("#osbitools .entity_ctx_ctrl").hide();
  
  // Show & Adjust min height of component panel
  var icons = $("#osbitools .icon_list");
  icons.hide();
  // icons.parent().css("min-height", "");
};

Project.prototype.hideContextMenu = function() {
  $(".contextMenuPlugin").hide();
};

Project.prototype.hasActiveEntity = function() {
	return ! jOsBiTools.is_empty(this.entity);
};

Project.prototype.showRenameDlg = function() {
  var me = this;
  
  this.hideContextMenu();
    
  show_simple_input_dialog({
    btnOk: t("LL_RENAME"),
    btnCancel: t("LL_CANCEL"),
    modalClose: true,
    filter: ID_FILTER.regex,
    onOk: function() {
      me.onRename();
    },
    onClose: {
      success: function(res) {
        me.onRenameSuccess($("#osbitools .sd_input").val());
      },
      error: show_error_win
    },
    value: me.name,
    title: t("LL_PROJECT_NAME")
  });
};

Project.prototype.onRename = function() {
  //-- 47
  this.plist.checkNewProject("post", 47, this);
};

Project.prototype.onRenameSuccess = function(pname) {
  this.plist.renameProject(this.name, pname);
  
  // Always last
  this.name = pname;
};

Project.prototype.showDeleteDlg = function() {
  this.hideContextMenu();
  
  if (!window.confirm(ts("LL_PLEASE_CONFIRM")))
    return;
    
  this.onDelete();
};

Project.prototype.onDelete = function() {
  var me = this;
  
  //-- 43
  delete_ajax(make_rel_req_path(this.getUrlList().PROJECT, this.name), 43,
    function() {
      me.onDeleteSuccess();
    }
  );
};

/**
 * Check if project can be saved 
 * 
 * @return {Boolean} true if succeed and false if not
 *  
 */
Project.prototype.canClose = function() {
  return (this.entity === undefined || this.canCloseEntity());
};

/**
 * Close project and destroy GUI elements
 * 
 * @return {Boolean} true if succeed and false if not
 *  
 */
Project.prototype.close = function() {
  this.closeEntity();
  this.hideDesignEl();
  
  // Remove dynatree
  this.root.dynatree('destroy'); 
  this.root.empty();
};

Project.prototype.canCloseEntity = function() {
  // Check if project saved
  return (this.entity === undefined || !this.entity.isBusy() && 
            this.getPrjMgr().checkPropTabSaved() && this.entity.canClose());
};

Project.prototype.onDeleteSuccess = function(pname) {
  this.close();
  
  // Always last
  this.plist.deleteProject(this.name, pname);
};

Project.prototype.getEntity = function() {
  return this.entity;
};

Project.prototype.getName = function() {
  return this.name;
};

Project.prototype.getMod = function() {
  return this.getApp().mod;
};

Project.prototype.showEntityRenameDlg = function(fname) {
  var me = this;
  this.hideContextMenu();
  
  show_simple_input_dialog({
    btnOk: t("LL_RENAME"),
    btnCancel: t("LL_CANCEL"),
    modalClose: true,
    filter: ID_FILTER.regex,
    onOk: function() {
      me.onEntityRename(fname);
    },
    onClose: {
      success: function(res) {
        me.onEntityRenameSuccess(fname, res);
      },
      error: show_error_win
    },
    value: fname,
    title: t("LL_ENTITY_NAME")
  });
};

Project.prototype.onEntityRename = function(old_name) {
  var fname = this.checkNewEntitySimple();
  if (fname === undefined)
    return;
    
  var me = this;
  
  if (this.entity.isNew())
    hide_simple_dialog(fname);
  else
    //-- 49
    post_ajax(make_rel_req_path(this.getUrlList().ENTITY, 
        this.getFullEntityName(old_name) + "/" + 
                   this.getFullEntityName(fname)), 49,
      function() {
        hide_simple_dialog(fname);
      }
    );
};

Project.prototype.onEntityRenameSuccess = function(old_name, new_name) {
  // Rename visual element
  var node = this.getTree().getNodeByKey(old_name);
  node.data.key = new_name;
  node.data.title = new_name;
  node.render();
  
  // Rename element inside internal storage
  this.files[new_name] = this.files[old_name];
  delete this.files[old_name];
  
  for (var i in this.list) {
    if (this.list[i] == old_name) {
      this.list.splice(i, 0, new_name);
      this.list.splice(i + 1, 1);
      
      break;
    }
  }
  
  // Rename entity itself
  this.entity.name = new_name;
  this.entity.dname = this.name + "." + new_name;
};

Project.prototype.showEntityDeleteDlg = function(fname) {
  this.hideContextMenu();
  
  if (!window.confirm(ts("LL_PLEASE_CONFIRM")))
    return;
    
  this.onEntityDelete(fname);
};

Project.prototype.onEntityDelete = function(fname) {
  var me = this;
  
  if (this.entity.isNew())
    me.onEntityDeleteSuccess(fname);
  else
    //-- 50
    delete_ajax(make_rel_req_path(this.getUrlList().ENTITY, 
                                    this.getFullEntityName(fname)), 50, 
      function() {
        me.onEntityDeleteSuccess(fname);
      }
    );
};

Project.prototype.onEntityDeleteSuccess = function(fname) {
  // Remove file from internal storage
  delete this.files[fname];
  
  for (var i in this.list) {
    if (this.list[i] == fname) {
      this.list.splice(i, 1);
      
      break;
    }
  }
  
  // Remove from UI
  this.getTree().getNodeByKey(fname).remove();
  
  var cnode = this.getActiveNode();
  if (cnode == null || cnode.data.key == fname) {
    this.closeEntity();
    
    // Activate new node
    this.findActiveEntity(false);
  }
};

Project.prototype.closeEntity = function(fname) {
  if (this.entity !== undefined) {
    this.entity.close();
    this.clearEntity();
  }
    
  $.removeCookie("entity");
  this.hideDesignEl();    
};

Project.prototype.showEntityUploadDlg = function() {
  show_simple_file_dialog(this);
};

Project.prototype.b4UploadFile = function(fname) {
  return this.canCloseEntity();
};

Project.prototype.getFullEntityName = function(fname) {
  return this.name + "." + fname;
};

/*******************************************************/
/**            FILE UPLOAD CALLBACKS                  **/
/*******************************************************/

Project.prototype.onUploadFileSuccess = function(fname, data) {
  // Add new Entity file into project list
  this.list.push(fname);
  this.setCurEntity(fname, true);
  
  // Show project elements
  this.showDesignEl();
  
  this.entity.onLoadSuccessEx(data);
};

Project.prototype.onUploadFileError = function(jqXHR, msg, error) {
  //-- 60
  show_ajax_error(60, jqXHR, msg, error);
};

Project.prototype.onUploadFileServerError = function(error) {
  show_server_error(error);
};

/**
 * Validate file name for base extension.
 * 
 * @name {String} Input file name
 * @return {String} file name without extension 
 *          or undefined if file name is wrong
 * 
 */ 
Project.prototype.onUploadFileSelected = function(name) {
  var ext = this.getApp().base.getBaseExt();
  var ext_len = ext.length;
  var ext_err = ts("LL_FILE_WITH_EXT_REQUIRED").
                                            replace("[ext]", ext);
  if (name.length < ext_len + 2) {
    alert(ext_err);
    return;
  }
  
  if (name.substr(-ext_len) != ext) {
    alert(ext_err);
    return;
  }  
  
  // Check if file name exists in current project
  var fname = this.checkNewEntityExists(name.substr(0, 
                                      name.length - ext_len - 1));
  
  return fname;
};

Project.prototype.getUploadFileUrl = function(fname) {
  return make_rel_req_path(this.getUrlList().ENTITY,
                      "upload/" + this.getFullEntityName(fname));
};

Project.prototype.downloadEntity = function(fname) {
  
  var furl = make_rel_req_path(this.getUrlList().ENTITY,
                  "download/" + this.getFullEntityName(fname) + "." +
                                          this.getPrjMgr().getBaseExt());
  
  window.location = jOsBiTools.get_download_url(furl);
};

Project.prototype.getExFileList = function(ext) {
  return this.ex_list[ext];
};

/**
 * Return file in format /resource directory (dname)/file name (fname) 
 */
Project.prototype.getExFilePath = function(fname) {
  return this.getParams().ext + "/" +
      this.name + "." + fname;
};

Project.prototype.getExFileInfoParam = function() {
  return "file_info";
};

Project.prototype.getExFileInfoUrl = function(fname) {
  return make_rel_req_path(this.getUrlList().EX_FILE,
            this.getExFileInfoParam() + "/" + this.getExFilePath(fname));
};

Project.prototype.getExFileUrl = function(fname) {
  return make_rel_req_path(this.getUrlList().EX_FILE,
            this.getExFilePath(fname));
};

Project.prototype.addExFileList = function(fname, ext) {
  var fex = ($.inArray(fname, this.ex_list[ext]) >= 0);
  if (!fex)
    this.ex_list[ext].push(fname);
    
  return fex;
};

Project.prototype.getLangLabelsList = function() {
  return this.lres.ll_list;
};

Project.prototype.getLangLabelSet = function() {
  return this.lres.ll_set;
};

Project.prototype.setLangLabels = function(lres) {
  this.lres = lres;
  this.getEntity().onLangLabelSetChange(lres.ll_list);
  jOsBiTools.load_ll_set(lres.ll_set);
};

/*
function animate_proj_ctrl(onCompleted) {
	var pc = $("#osbitools .project_controls");
	var offs = pc.offset();
	// console.log(offs.top + ":" + offs.left);

	// Set left/top/right offset to
	// let animation will work correctly
	pc.css("left", offs.left);
	pc.css("top", offs.top);
	
	pc.animate({
		right: 0,
		top: "-=" + offs.top,
		left: "-=" + offs.left,
	}, "slow", function() {
			$("#osbitools .project_list_wrapper").css("text-align", "left");
			// $("#osbitools .proj_ctrl_wrapper").removeClass("vcenter-cell");
			$("#osbitools .proj_ctrl_widget").removeClass("vcenter-cell");
			$("#osbitools .project_controls").removeClass("middle-container");
			$("#osbitools .project_list_wrapper").addClass("pad3");
			$("#osbitools .ws_list_wrapper").addClass("pad3");
			
			onCompleted();
		}
	);
}
*/
