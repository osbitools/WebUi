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

function Entity() {}

Entity.prototype.init = function(name, project, is_new) {
  this.changed = false;
  this.busy = false;
  this.error = false;
  this.parent = $("#osbitools .entity_ctx");
  
  // HTML Container where components added
  this.body = $("#osbitools .entity-body");
  
  if (is_new)
    this.emptyBody();
                        
  this.name = name;
  this.is_new = is_new;
  this.saved = !is_new;
  this.project = project;
  
  // Body init flag. This is middle phase between new and saved
  this.binit = !is_new;
  
  // Request Parameters
  this.req_params = {};

  // Page properties
  this.page_props = {
    descr: {
      label: "LL_DESCRIPTION"
    }
  };
  
  // Data aware list for lang label set change
  this.llink = new Observer("ll_link", this.project.getLangLabelsList());
  
  // Full name
  this.dname = ((project !== undefined) ? project.name + "." : "") + name;
                                         
  // Call custom handler
  this.onInit(name, project, is_new);
};

Entity.prototype.onInit = function(name, project, is_new) {};

/**
 * Return parent application 
 */
Entity.prototype.getApp = function() {
  return this.getPrjMgr().getApp();
};

/**
 * Return base extension 
 */
Entity.prototype.getBaseExt = function() {
  return this.getPrjMgr().getBaseExt();
};

Entity.prototype.getConfig = function() {
  return this.project.getConfig();
};

Entity.prototype.loadRev = function(rev) {
  var me = this;
  
  // Check if not saved
  if (!this.project.canCloseEntity())
    return;
  
  // Always first
  this.busy = true;
  
  this.close();
  this.showLoaderProgress();
  
  //-- 57 Get revision 
  get_ajax_ex(make_rel_req_path(this.getUrlList().GIT, "revisions/" +
                                                   rev + "/" +this.dname), 57, 
    function(data) {
      me.onRevLoadSuccess(data, rev);
    },
    function(msg) {
      me.onLoadError(msg);
    }
  );
  
  // For any result close revision dialog
  $("#osbitools .change_log_wrapper").bPopup().close();
};

Entity.prototype.onRevLoadSuccess = function(data, rev) {
  this.onLoadSuccess({
    "entity" : data.entity,
    "has_log": true,
    "has_diff": true // TODO Check if last revision loaded and is yes use this.data.has_diff
  });
  
  // Set Revision controls
  this.setRev(rev);
  
  // Last. Clear saved since file differ from disk but allow save
  this.clearSaved(false);
};

Entity.prototype.setRev = function(rev) {
  this.rev = rev;
  
  // Display first 8 letters only
  $("#osbitools .rev_id").html(rev.substr(0,8));
  $("#osbitools .rev_info_wrapper").show();
  
  // Adjust control buttons
  if (this.data.has_diff)
    $("#osbitools .ll_load_current").attr("disabled", false).show();
  else
    $("#osbitools .ll_load_current").hide();
    
  // Hide preview
  if (this.getApp().has_preview)
    $("#osbitools .ll_preview").hide();
    
  // Enable change log
  $("#osbitools .ll_change_log").attr("disabled", false);
};

Entity.prototype.clearRev = function() {
  if (this.rev != undefined)
    delete this.rev;
    
  $("#osbitools .rev_info_wrapper").hide();
  
  // Hide Load Current button
  $("#osbitools .ll_load_current").hide();
  
  // Show Preview button (if has)
  if (this.getApp().has_preview)
    $("#osbitools .ll_preview").show();
};

Entity.prototype.load = function() {
  // Always first
  this.busy = true;
  
  var me = this;
  this.showLoaderProgress();
  
  //-- 51 Load Project
  get_ajax_ex(make_rel_req_path(this.getUrlList().ENTITY,this.dname), 51, 
    function(data) {
      me.onLoadSuccessEx(data);
    },
    function(msg) {
      me.onLoadError(msg);
      
      // Always last. True for any load result
      me.setSaved();
    }
  );
};

/**
 * Successful load entity from server (either last saved or from revision)
 * Set Entity Status as "saved"
 */
Entity.prototype.onLoadSuccessEx = function(data) {
  this.onLoadSuccess(data);
      
  // Always last. True for any load result
  this.setSaved();
};


/**
 * Successful load entity from server (either last saved or from revision)
 * None of control button(s) changed
 */
Entity.prototype.onLoadSuccess = function(data) {
  // Remember last validated data
  this.data = data;
  
  // Init page properties
  this.setPageProperties();  
  
  // First
  this.hideLoaderProgress();
  
  this.initBody();
  
  // Wrap internal errors during load
  this.error = true;
  try {
    this.error = !this.onLoadData();
  } catch(err) {
    //-- 59
    show_client_error_ex(59, err.name + ": " + err.message);
    jOsBiTools.log.error(err.stack);
  }
  
  if (!this.error)
      this.project.showDesignEl();
  
  // Always last
  this.busy = false;
};

Entity.prototype.setPageProperties = function() {};

/** 
 * Load entity metadata into GUI
 */
Entity.prototype.onLoadData = function() {};

Entity.prototype.setCommitCtrl = function() {
  // Adjust Git buttons
  $("#osbitools .ll_commit").attr("disabled", this.error ||
              this.data === undefined || !this.data.has_diff);
  $("#osbitools .ll_change_log").attr("disabled", this.error ||
              this.data === undefined || !this.data.has_log);
};

Entity.prototype.onLoadError = function(msg) {
  this.error = true;
  this.onLoadCompleted();
};

Entity.prototype.onLoadCompleted = function(msg) {
  // First
  this.hideLoaderProgress();
  
  // Always last
  this.busy = false;
};

Entity.prototype.onSaveValidation = function() {
  return true;
};

Entity.prototype.getSaveText = function(entity) {
  return JSON.stringify((entity === undefined) 
    ? this.getSaveData()
    : entity);
};

Entity.prototype.save = function() {
  // Always first
  this.busy = true;
  
  // Validation
  if (!this.onSaveValidation())
    return;
  
  // Check if request parameters not set
  if (!( jOsBiTools.is_empty($("#osbitools .req_param_name").val()) && 
     jOsBiTools.is_empty($("#osbitools .req_param_jtype").val()) &&
     jOsBiTools.is_empty($("#osbitools .req_param_size").val()))) {
      //-- 41
      show_client_error(41, $("#osbitools .btn_add_req_param"));
      return;
  }
      
  $("#osbitools .entity_ctx_git_ctrl").hide();
  $("#osbitools .entity_ctx_ex_ctrl").hide();
  enable_wait_btns("entity_ctx_session_ctrl", "right");
  
  var me = this;
  var entity = this.getSaveData();
  var req = make_rel_req_path(this.getUrlList().ENTITY, this.dname, 
    this.getSaveText(entity));
      
  if (this.is_new) {
    error_id = 48;
    http_method = "put";
  } else {
    error_id = 28;
    http_method = "post";
  }
  
  ajax_req_base(req, http_method, error_id, 
      function(data) {
        me.onSaveSuccess(data, entity);
      }, 
      function(msg) {
        me.onSaveError(msg);
      }, APP_JSON_UTF8);
};

Entity.prototype.onSaveSuccess = function(data, entity) {
  this.error = false;
  
  $("#osbitools .entity_ctx_git_ctrl").show();
  $("#osbitools .entity_ctx_ex_ctrl").show();
  disable_wait_btns("entity_ctx_session_ctrl", "right");
  
  // Allow commit after success save
  $("#osbitools .ll_commit").attr("disabled", false);
  
  if (this.is_new)
    // Create local entity
    // No log set since it's the new entity
    this.data = {
      has_log: false
    };
  
  // Populate local entity
  this.data.entity = entity;
  
  // Set diff flag
  this.data.has_diff = true;
        
  // Always last b4 last
  this.setSaved();
  
  // Always last
  this.busy = false;
};

Entity.prototype.preview = function(fshow) {
  var rp_val = $("#osbitools .req_param_values_wrapper");
  
  if (fshow && this.req_params.length > 0) {
    // Show request param dialog
      
    var rpl = $("#osbitools .req_param_values_list").empty();
    for (var i in this.req_params) {
      var item = this.req_params[i];
      var name = item["name"];
      var jtype = item.java_type;
      
      var is;
      if (jtype == JTYPE_BOOL) {
        is = '<select class="rp_val">' + get_bool_sel(true) + '</select>';
      } else {
        is = '<input type=\"text\" class="rp_val" />';
      }
      
      var tr = $('<tr name="' + name + '" class="ralign"><td>' + name + 
                         ': </td><td class="lalign">' + is + '</td></tr>');
      if (jtype != JTYPE_BOOL)        
        tr.filter_input({regex: get_jtype_regex(item.java_type)});
        
      rpl.append(tr);
    }
    
    rp_val.bPopup({
      speed: 450,
      opacity: 0.6,
      appendTo: "#osbitools",
      transition: 'slideDown',
    });
  } else {
    // Optional request param string
    var qparams = {};
    
    if (jOsBiTools.log.enabled)
      qparams["debug"] = "on";
    if (jOsBiTools.trace.enabled)
      qparams["trace"] = "on";
    
    // Check if lang parameter requires
    if (!jOsBiTools.is_def_lang())
      qparams["lang"] = jOsBiTools.lang;
      
    if (this.req_params.length > 0) {
      
      rp_val.bPopup().close();
      
      // Combine set of parameters
      $("#osbitools .req_param_values_list tr").each(function() {
        var name = $(this).attr("name");
        var val = $(".rp_val", this).val();
        
        qparams[name] = jOsBiTools.encode_query_param(val);
      });
    }
    
    var url = this.getProject().getPrjMgr().config.ds_item.url;
    
    // Check if language parameter required
    this.onPreview(url, qparams, this.dname, 
            'height=' + window.innerHeight + 
              ',width=' + window.innerWidth + ',left=' + 
                window.screenX + ',top=' + window.screenY);
  }
};

/**
 * "Cancel" button handler
 */
Entity.prototype.cancel = function() {
  // Remember revision
  var rev = this.rev;
  
  // Close Entity
  this.close();
  
  // Reload last data
  this.initBody();
  this.onLoadData();  
  
  // Always last
  if (rev !== undefined) {
    this.rev = rev;
    this.setRev(rev);
    this.clearSaved(false);
  } else {
    this.setSaved();
  } 
};

Entity.prototype.canClose = function() {
  return (!this.isChanged() || 
    confirm(ts(
      "LL_CONFIRM_ENTITY_CHANGES_CANCEL")));
};
            
Entity.prototype.onSaveError = function() {
  this.error = true;
  
  $("#osbitools .entity_ctx_git_ctrl").show();
  $("#osbitools .entity_ctx_ex_ctrl").show();
  disable_wait_btns("entity_ctx_session_ctrl", "right");
  
  // Always last
  this.busy = false;
};

Entity.prototype.close = function() {
  $("#osbitools .rparams_list").empty();
    
  this.clearRev();
  // this.project.clearEntity();

  $("#osbitools .entity_ctx_ctrl button").each(function() {
    $(this).attr("disabled", true);
  });
  
  this.closeBody();
};

Entity.prototype.commit = function() {
  var me = this;
  
  // Ask for comment
  show_simple_input_dialog({
    btnOk: t("LL_COMMIT"),
    btnCancel: t("LL_CANCEL"),
    modalClose: true,
    onOk: function() {
      me.onCommit();
    },
    onClose: {
      success: function(pname) {
        me.onCommitSuccess(pname);
      },
      error: show_server_error
    },
    title: t("LL_COMMIT_MESSAGE")
  });
};

Entity.prototype.gitLog = function() {
  var me = this;
  
  get_ajax(make_rel_req_path(this.getUrlList().GIT,
                                  "revisions/" + this.dname), 
    56, function(data) {
      me.onGitLogSuccess(data);
  });
};

Entity.prototype.onGitLogSuccess = function(logs) {
  var trec = $("#osbitools .log_records");
  trec.empty();
  
  for (var i in logs) {
    var log = logs[i];
    var flink = !(this.rev !== undefined && this.rev == log.id);
    
    trec.append(
      '<tr>' + 
        '<td>' + 
          (flink ? '<span class="rev" rev_id="' + log.id + '">' : "") +
            $.format(new Date(log.commit_time * 1000), "F", jOsBiTools.locale) +
          (flink ? '</span>' : "") +
        '</td>' +
        '<td>' + log.committer + '</td>' +
        '<td>' + log.comment + '</td>' + 
      '</tr>'
    );
    
    if (flink) {
      var me = this;
      $(".rev", trec).on("click", function() {
        me.loadRev($(this).attr("rev_id"));
      });
    }
  }
  
  $("#osbitools .change_log_wrapper").bPopup({
    speed: 450,
    opacity: 0.6,
    appendTo: "#osbitools"
  });
};


Entity.prototype.onCommit = function() {
  var msg = $("#osbitools .sd_input").val();
  if ( jOsBiTools.is_empty(msg)) {
    alert(ts("LL_COMMIT_MESSAGE_REQUIRED"));
    $("#osbitools .sd_input").focus();
    
    return;
  }
  
  put_ajax(make_rel_req_ex(this.getUrlList().GIT, 
        "commit/" + this.dname, {"comment": jOsBiTools.encode_query_param(msg)}), 55, 
    function() {
      hide_simple_dialog(msg);
        $("#osbitools .ll_commit").attr("disabled", false);
  });
};

Entity.prototype.onCommitSuccess = function() {
  // Update git status
  this.data.has_log = true;
  this.data.has_diff = false;
  this.setCommitCtrl();
};

/**
 * Run when entity loaded or physically saved on the disk 
 */
Entity.prototype.setSaved = function() {
  this.saved = true;
  this.binit = true;
  this.is_new = false;
  this.changed = false;
  
  $("#osbitools .entity_ctx_session_ctrl button").each(function() {
  	$(this).attr("disabled", true);
  });
  
  // Set preview
  var has_data = this.data !== undefined;
  this.setPreviewCtrl(!this.error && has_data);
  
  // Remove revision info (if any)
  this.clearRev();
  this.setCommitCtrl();
};

/**
 * Reset save buttons only 
 */
Entity.prototype.resetSaved = function() {
  $("#osbitools .ll_save").attr("disabled", true);
  $("#osbitools .ll_cancel").attr("disabled", this.is_new);
  $("#osbitools .ll_commit").attr("disabled", true);
  $("#osbitools .ll_preview").attr("disabled", true);
};

/**
 * Run when entity changes from one's physically saved on the disk
 * @param can_cancel Enable/Disable "Cancel" button. 
 *      Only false when revision loaded
 */
Entity.prototype.clearSaved = function(can_cancel) {
  this.saved = false;
  this.changed = can_cancel;
  
  $("#osbitools .ll_save").attr("disabled", !(can_cancel || 
                        this.data === undefined || this.data.has_diff));
  $("#osbitools .ll_cancel").attr("disabled", !can_cancel || this.is_new);
  $("#osbitools .ll_commit").attr("disabled", true);
  
  this.setPreviewCtrl(!can_cancel);
};

Entity.prototype.isSaved = function() {
  return this.saved;
};

Entity.prototype.isChanged = function() {
  return this.changed;
};

Entity.prototype.isNew = function() {
  return this.is_new;
};

Entity.prototype.setPreviewCtrl = function(enable) {
  if (this.getApp().has_preview)
    $("#osbitools .ll_preview").attr("disabled", !enable);
};

Entity.prototype.isBusy = function() {
  return this.busy;
};

Entity.prototype.showLoaderProgress = function() {
  this.project.hideDesignEl();
  $("#osbitools .entity_ctx").addClass("loading");
  $("#osbitools .proj-tree-wrapper").addClass("ui-state-disabled");
};

Entity.prototype.hideLoaderProgress = function() {
  $("#osbitools .entity_ctx").removeClass("loading");
  $("#osbitools .proj-tree-wrapper").removeClass("ui-state-disabled");
};

Entity.prototype.getUrlList = function() {
  return this.project.getUrlList();
};

Entity.prototype.getParams = function() {
  return this.project.getParams();
};

Entity.prototype.getPageDescription = function() {
  return this.page_props.descr.value;
};

Entity.prototype.setPageDescription = function(descr) {
  return this.page_props.descr.value = descr;
};

Entity.prototype.getProject = function() {
  return this.project;
};

Entity.prototype.addReqParamRecord = function(param) {
  // Register new parameter
  this.addReqParam(param);
  
  var req = $('<tr>' + 
      '<td field="name" class="name">' + param.name + '</td>' +
      '<td field="java_type">' + param.java_type + '</td>' +
      '<td field="size"  class="ralign">' + 
                ( jOsBiTools.is_empty(param.size) ? "" : param.size) + '</td>' +
      '<td class="row-ctrls">' + 
        '<span class="ui-icon ui-icon-trash" title="' + 
          t("LL_DELETE") + '"></span>' +
      '</td>' +
    '</tr>');
  
  var me = this;
  $("#osbitools .rparams_list").append(req);
  
  $("span.ui-icon", req).on("click", function() {
    me.delReqParamRecord(this);
  });
        
  // Last
  this.doAfterAddReqParamRecord(param);
};

Entity.prototype.addReqParam = function(param) {
  return this.req_params[param.name] = param;
};

Entity.prototype.getReqParam = function(name) {
  return this.req_params[name];
};

Entity.prototype.delReqParam = function(name) {
  delete this.req_params[name];
};

Entity.prototype.emptyBody = function() {
  this.body.html(this.getNewEntityBody());
};

Entity.prototype.getNewEntityBody = function() {
    return '<div class="new_entity_body_msg entity-ctx ' + 
        'entity-ctx-empty">' + t("NEW_ENTITY_BODY_MSG") + '</div>';
};

Entity.prototype.initBody = function(src) {
  this.body
      .removeClass("entity-body-empty")
      .addClass("entity-body-assigned")
      .removeClass("dotted-border")
      .removeClass("dotted-border-ready")
      .addClass("wrapper");
  
  // Set default title is file name
  this.body.html('<span class="ctx_title title wrapper">' + 
                        this.dname + '</span>' + 
    '<span class="ui-icon ui-icon-triangle-1-n entity-btn toggle-btn wrapper" ' + 
                    'title="' + ts("LL_MINIMIZE") + '"></span>' +
    '<span class="ui-icon ui-icon-close entity-btn wrapper" ' + 
                    'title="' + ts("LL_CLOSE") + '"></span>' +
    '<div class="body_ctx"></div>'
  );
  
  var me = this;
  this.body_ctx = $("#osbitools .body_ctx");
  
  $(".ctx_title", this.body).on("click", function() {
    // Check if property object different from entity object
    if (me == me.getPrjMgr().getPropWinObj()) {
      // Just show prop tab
      me.getPrjMgr().showPropTab();
      
      return;
    }
    
    // Check if property tab saved and replace with entity property
    if (!me.getPrjMgr().checkPropTabSaved())
      return;
      
    // Notify internal components that property changing
    me.onProTabChanging();
    
    me.showEntityPropWin();
  });
  
  // Assign handlers
  $(".ui-icon-close", this.body).on("click", function() {
    if (me.project.canCloseEntity() && 
            window.confirm(t("LL_PLEASE_CONFIRM"))) {
        me.closeBody();
        me.resetSaved();
      }
  });
  
  $(".toggle-btn", this.body).on("click", function() {
    $(".body_ctx", $(this).parent()).toggle(); 
    toggle_wrapper_btn(this);
  });
    
  // Invoke callback
  if (src !== undefined) {
    var res = this.onBodyInit(src);
  
    if (res)
      this.clearSaved(true);
  }
  
  // Last
  this.binit = true;
};

Entity.prototype.onProTabChanging = function() {};

Entity.prototype.isBodyInit = function() {
  return this.binit;
};

Entity.prototype.closeBody = function() {
  delete this.body_ctx;
  this.emptyBody();
  
  this.body
      .addClass("entity-body-empty")
      .removeClass("entity-body-assigned")
      .addClass("dotted-border")
      .removeClass("wrapper")
      .prop("handled", false);

  this.getPrjMgr().hidePropTab();

  // Last b4 last - Invoke callback
  this.onBodyClose();
            
  // Last
  this.binit = false;
};

Entity.prototype.setTitle = function(title) {
  $("#osbitools .ctx_title").html(title);
};

Entity.prototype.setReqParam = function(ds_map) {
  if (this.req_params.length > 0) {
    var rparams = [];
    
    for (var i in this.req_params) {
      rparams.push({
        name: rparam[name]
      });
    }
    
    ds_map["req_params"] = {
      param: rparams
    };
  }
};
  
/**
 * Callback on first component add (body initialization)
 * 
 * @param {Object} src Source objct
 * @return True if Save button can be enabled and False otherwise 
 * 
 */
Entity.prototype.onBodyInit = function(src) {
  return true;
};

/**
 * Callback on body closed. Same as entity initialization 
 * except it keep parameter list. For saved entities it can be canceled.
 * 
 * @param {Object} src Source objct
 * @return True if Save button can be enabled and False otherwise 
 * 
 */
Entity.prototype.onBodyClose = function(src) {};

/**
 * Callback on new request parameter added
 * 
 * @param {Object} New Parameter
 */
Entity.prototype.doAfterAddReqParamRecord = function(param) {};

/**
 * Invoked from Request Parameter Add GUI button
 */
Entity.prototype.delReqParamRecord = function(btn) {
  var row = $(btn).parent().parent();
  var name = $("td.name", row).html();
  
  row.remove();
  this.delReqParam(name);
  
  // Last
  this.doAfterDelReqParamRecord(name);
};

Entity.prototype.doAfterDelReqParamRecord = function(name) {};

Entity.prototype.getPropertyWin = function() {
  var twin = '<table class="entity-prop-wrapper"><tbody>';
  for (var pname in this.page_props) {
    var prop = this.page_props[pname];
    var pidx = "entity_prop_" + pname;
    
    twin += '<tr><th><label class="prop-name" for="' + pidx + '">' + 
        t(prop.label) + ':</label>' + 
            '</th><td><input value="' + 
                   (!is_empty(prop.value) ? prop.value : "") + 
                        '" class="' + pidx + ' prop" disabled /></td></tr>';
  }
  
  var pwin = $(twin + '</tbody></table>');
  
  var me = this;
  $("input.prop", pwin).on("input", function(evt) {
    me.getPrjMgr().setPropSave(true);
  });
      
  return pwin;
};

Entity.prototype.setPropertyWinObj = function(obj) {
  // Attach to property window top DOM element
  this.project.getPrjMgr().getPropWin().data("obj", obj);
};

Entity.prototype.getPrjMgr = function() {
  return this.project.getPrjMgr();
};

/**
 * Show property window
 * 
 * @param {Object} el jQuery object to inject into property tab
 */
Entity.prototype.showPropWin = function(el) {
  this.getPrjMgr().showPropTabEx(el);
};

/**
 * Show entity property window
 */
Entity.prototype.showEntityPropWin = function() {
  // Attach to property window top DOM element
  this.setPropertyWinObj(this);
  
  // Remember pointer on property window
  this.prop_win = this.getPropertyWin();
  this.showPropWin(this.prop_win);
};

/******* Property Editor Methods **************/

/**
 * Edit entity property 
 */
Entity.prototype.editProperty = function() {
  for (var pname in this.page_props)
    $("#osbitools .entity_prop_" + pname).prop("disabled", false);
};

Entity.prototype.cancelProperty = function() {
  for (var pname in this.page_props) {
    var prop = this.page_props[pname];
    
    var el = $("#osbitools .entity_prop_" + pname);
    el.val(unescape_xml(prop.value));
    el.prop("disabled", true);
  }
};

Entity.prototype.saveProperty = function() {
  for (var pname in this.page_props) {
    var prop = this.page_props[pname];
  
    var el = $("#osbitools .entity_prop_" + pname);
    prop.value = escape_xml(el.val());
    el.prop("disabled", true);
  }
    
  // Last
  this.clearSaved(true);
  
  return true;
};

Entity.prototype.getPropTabTitle = function() {
  return t("LL_ENTITY") + ":" + this.name;
};

Entity.prototype.onLangLabelSetChange = function(data) {
  this.llink.update(data);
};

Entity.prototype.getLangLabelSetLink = function() {
  return this.llink;
};
