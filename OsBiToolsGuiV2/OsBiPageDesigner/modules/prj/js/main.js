/*
 * Open Source Business Intelligence Tools - http://www.osbitools.com/
 * 
 * Copyright 2014-2016 IvaLab Inc. and by respective contributors (see below).
 * 
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 * Date: 2015-03-13
 * 
 * Contributors:
 * 
 */

// Handler for open simple dialog
var SDIALOG;

// Handler for Entity Upload Dialog
var FDIALOG;

/**************************************************/
/***********  Project Manager Bootstrap ***********/
/**************************************************/
function prj_main(app) {
  return new PrjMgr();
}

/**************************************************/
/***********        Project Manager     ***********/
/**************************************************/

function PrjMgr() {
  // Available file sub-types
  this.AVAIL_DS_TYPES;

  // List of URL
  this.URL_LIST = {
    ENTITY: "entities",
    GIT: "git",
    PROJECT: "projects",
    EX_FILE: "ex_files",
    LANG_SET_UTILS: "ll_set"
  };
  
  // Version of generated LangLabelSet file
  this.ll_set_version = [1,0];
}

PrjMgr.prototype = new WebApp();

/**************************************************/
/***********        PROJECT METHODS     ***********/
/**************************************************/

PrjMgr.prototype.initConfig = function() {
  var err_list = {
    // 1 to 9 entries reserved to main ERR_LIST
  
    10: "LL_ERROR_JAVA_TYPE_NOT_SELECTED",
    11: "LL_ERROR_EXTRA_COLUMN_ALREADY_EXISTS",
    12: "LL_ERROR_GET_COLUMN_LIST",
    13: "LL_ERROR_BLOCK_NOT_SAVED",
    14: "LL_ERROR_EMPTY_VALUE",
    15: "LL_ERROR_UNKNOWN_EX_COL_TYPE",
    16: "LL_ERROR_INVALID_VAL_JTYPE_VALUE",
    17: "LL_ERROR_FILE_UPLOAD",
    18: "LL_ERROR_EXTRA_COLUMN_ALREADY_EXISTS",
    19: "LL_ERROR_DATA_SET_TYPE_NOT_SUPPORTED",
    20: "LL_ERROR_COLUMN_NAME_EMPTY",
    21: "LL_ERROR_CULUMN_NAME_ALREADY_USED",
    22: "LL_ERROR_JAVA_TYPE_NOT_SELECTED",
    23: "LL_ERROR_INVALID_VAL_JTYPE_VALUE",
    24: "LL_ERROR_EMPTY_VALUE",
    25: "LL_ERROR_COLUMN_NOT_SAVED",
    26: "LL_ERROR_DATASET_IS_EMPTY",
    27: "LL_ERROR_DATASET_NOT_SAVED",
    28: "LL_ERROR_SAVE_ENTITY",
    29: "LL_ERROR_EMPTY_SQL_QUERY",
    30: "LL_ERROR_GET_COLUMN_LIST",
    31: "LL_ERROR_EMPTY_VALUE",
    32: "LL_ERROR_INVALID_VAL_JTYPE_VALUE",
    33: "LL_ERROR_EMPTY_GROUP_DATA_SET",
    34: "LL_ERROR_EXTRA_COLUMN_ALREADY_EXISTS_GROUP",
    35: "LL_ERROR_PARAMETER_NAME_EMPTY",
    36: "LL_ERROR_JAVA_TYPE_NOT_SELECTED",
    37: "LL_ERROR_PARAM_NAME_ALREADY_EXIST",
    38: "LL_ERROR_COLUMN_NAME_EMPTY",
    39: "LL_ERROR_COLUMN_NAME_EMPTY",
    40: "LL_ERROR_EX_COLUMN_CONFIG_NOT_SAVED",
    41: "LL_ERROR_REQUEST_PARAMETER_NOT_SAVED",
    42: "LL_ERROR_CALC_EXPRESSION_EMPTY",
    43: "LL_ERROR_DELETING_PROJECT",
    44: "LL_ERROR_CREATING_PROJECT",
    45: "LL_ERROR_LOADING_PROJECT",
    46: "LL_ERROR_LOADING_ENTITY",
    47: "LL_ERROR_RENAMING_PROJECT",
    48: "LL_ERROR_SAVE_ENTITY",
    49: "LL_ERROR_RENAMING_ENTITY",
    50: "LL_ERROR_DELETING_ENTITY",
    51: "LL_ERROR_LOADING_ENTITY",
    52: "LL_ERROR_CHECK_FILE",
    53: "LL_ERROR_LOADING_PROJECT_METADATA",
    54: "LL_ERROR_DOWNLOAD_CSV_FILE",
    55: "LL_ERROR_COMMIT_ENTITY",
    56: "LL_ERROR_GET_CHANGE_LOG",
    57: "LL_ERROR_GET_REVISION",
    58: "LL_ERROR_EMPTY_SQL",
    59: "LL_ERROR_INVALID_CORRUPTED_ENTITY",
    60: "LL_ERROR_UPLOAD_ENTITY",
    // 61: "LL_ERROR_DOWNLOAD_ENTITY",
    62: "LL_ERROR_EXEC_GIT_PUSH",
    63: "LL_ERROR_READ_CUSTOM_LANG_LABELS",
    64: "LL_ERROR_SAVE_CUSTOM_LL_SET",
    65: "LL_ERROR_SERVER_LL_SET_VERSION_NOT_SUPPORTED",
    66: "LL_ERROR_READ_CUSTOM_LANG_LABELS",
  };
  
  var me = this;
  this.phaseLoader = new PhaseLoader([
    [function (phase_loader) {
        me.loadProjectList(phase_loader);
      }]], {
      critical: [0]/* ,
      on_load: function() {
        me.onLoaderCompleted();
      }, */
    });
  
  // Remember existing on_completed pointer
  var fcomp;
  if (this.app.config.phase_loader !== undefined)
    fcomp = this.app.config.phase_loader.on_completed;
  else
    this.app.config.phase_loader = new PhaseLoader([]);

  // Inject on_completed method into parent WebApp
  this.app.config.phase_loader.on_completed = function() {
      me.app.mod = new window["OsBi" + me.app.config.prj.qname](me);
      me.app.mod.init();
      
      // Check if preview flag available
      me.app.has_preview = typeof me.app.mod.hasPreview == "function" &&
                                                    me.app.mod.hasPreview();
      
      if (me.app.has_preview)
        // Show preview button
        $("#osbitools .ll_preview").show();
      else
        // Hide preview button
        $("#osbitools .ll_preview").hide();
        
      if (typeof fcomp == "function")
        fcomp();
  };
    
  return {
    // Module version
    version: [1,0,0],
    cfg_keys: ["minified", "comp_list"],
    loading: "LL_LOADING_PROJECT_MANAGER",
    styles: ["main.css"],
    scripts: ["lang_set.js", "entity.js", 
      "project_list.js", "project.js", "shared_jtypes.js"],
    on_logout: function() {
      me.onLogout();
    },
    phase_loader: this.phaseLoader,
    err_list: err_list
  };
};

PrjMgr.prototype.onResourceLoaded = function () {
  this.addContext();
  
  // Add system service dialogs
  this.addSrvDialogs();
  
  // Pointer on Project List - singleton
  this.plist = new ProjectList(this);
};

/**
 * Add service dialogs
 * @param frame Top level OsBiTools frame
 */
PrjMgr.prototype.addSrvDialogs = function(frame) {
  // Append simple dialog
  $("#osbitools").append('' +
'<!-- Simple Dialog -->' +
'<div class="simple_dialog wrapper hidden-block dialog">' +
  '<div class="lfloat">' +
    '<label for="sd_input" class="sd_label"></label>:&nbsp;' +
      '<input type="text" class="sd_input" autofocus />' +
      '<select class="sd_sel" autofocus onchange="check_sd_sel()"></select>' +
  '</div>' +
  '<div class="sd_ctrl btn-ctrls rfloat">' +
    '<button class="btn_ok"></button>' +
    '<button class="btn_cancel"></button>' +
  '</div>' +
'</div>' +

'<!-- Simple File Upload Dialog -->' +
'<div class="simple_file_dialog wrapper hidden-block dialog">' +
  '<div class="lfloat">' +
    '<form class="file_upload" enctype="multipart/form-data" method="post">' +
      '<input type="hidden" name="fname" class="fname" />' +
      '<input type="file" name="file" class="upload-file" />' +
      '<div class="upload-ctrl btn-ctrls rfloat file_upload_ctrl">' +
        '<button type="submit" class="ll_upload upload" ' +
          'disabled="">' + t('LL_UPLOAD') + '</button>' +
        '<button type="button" class="ll_upload_cancel upload" >' +
          t('LL_UPLOAD_CANCEL') + '</button>' +
      '</div>' +
    '</form>' +
  '</div>' +
'</div>'

  );

  // Init File Upload Dialog
  var fupload = $("#osbitools .file_upload");
  
  $("button.ll_upload_cancel", fupload).on("click", function() {
    FDIALOG.bPopup().close();
  });
  
  $("input.upload-file", fupload).on("change", function() {
    if (!this.files.length > 0) {
      $("#osbitools .ll_upload").prop("disabled", true);
      return;
    }
    
    var obj = $("#osbitools .file_upload").data("obj");
    var fname = obj.onUploadFileSelected(this.files[0].name);
    if (fname === undefined) {
      this.value = "";
      $("#osbitools .ll_upload").prop("disabled", true);
      return;
    }
    
    $("#osbitools .fname").val(fname);
    $("#osbitools .ll_upload").prop("disabled", false);
    
    var req = obj.getUploadFileUrl(fname);
    fupload.attr2("action", jOsBiTools.get_url(req));
    
    // Call on submit hook
    jOsBiTools.process_form(fupload, req);
  });
  
  // Assign file upload handler
  fupload.ajaxForm({
    dataType : "json",
    beforeSubmit : function(arr, $form, options) {
      var form = $("#osbitools .file_upload");
      var obj = form.data("obj");
      var res = obj.b4UploadFile(form);
      
      if (res)
        enable_wait_btns_ex($("#osbitools .file_upload_ctrl"));
      
      jOsBiTools.prep_form(form, arr);
        
      return true;
    },
    success: function(data) {
      disable_wait_btns_ex($("#osbitools .file_upload_ctrl"));
      var obj = $("#osbitools .file_upload").data("obj");
      
      if (data.error === undefined) {
        var fname = $("form input[name=fname]", FDIALOG).val();
        obj.onUploadFileSuccess(fname, data);
        FDIALOG.close();
      } else {
        obj.onUploadFileServerError(data.error);
      }
    },
    error: function(jqXHR, msg, error) {
      var obj = $("#osbitools .file_upload").data("obj");
      disable_wait_btns_ex($("#osbitools .file_upload_ctrl"));
      
      obj.onUploadFileError(jqXHR, msg, error);
    }
  });
};

/**
 * Add custom dialogs
 * @param frame Top level OsBiTools frame
 */
PrjMgr.prototype.addCustomDialogs = function(frame) {
};

/**
 * Add project widget into web app context container
 */
PrjMgr.prototype.addContext = function() {
  var ctx = this.getContext();
  
  // Prepare set of available languages for language labels editor
  this.lang_set = [];
  
  lang_titles = "";
  
  for (var lang in LANG_SET_TITLES) {
    this.lang_set.push(lang);
    lang_titles += '<th class="lang_' + lang + '">' + 
          LANG_SET_TITLES[lang][jOsBiTools.lang] + ' (' + lang + ')' + '</th>';
  }
  
  ctx.html('' +

/************* Project Widget Start *************/
'<div class="project_widget">' +

  // Project controls
  '<div class="proj_ctrl_widget">' +
    '<div class="project_controls wrapper-ctrl-ex hidden-block">' +
      '<table class="wide">' +
        '<tr>' +
          '<td class="project_list_wrapper">' +
            '<div class="project_list">' +
              '<label for="project_sel" class="ll_select_project">' + 
                     t("LL_SELECT_PROJECT") + '</label>' + ': ' +
              '<select class="project_sel"></select>' +
              '<button class="ll_new ml5" class="ml5">' + 
                          t("LL_NEW") + '</button>' +
              '<button class="ll_rename ml5">' + 
                            t("LL_RENAME") + '</button>' +
              '<button class="ll_delete ml5">' + 
                          t("LL_DELETE") + '</button>' +
              '<button class="ll_lang_labels ml5">' + 
                          t("LL_LANG_LABELS") + '</button>' +
            '</div>' +
          '</td>' +
          '<td align="right" class="ws_list_wrapper">' +
            '<div class="ws_list hidden-block">' +
              '<label for="ws_source_list" class="ll_data_source">' + 
                    t("LL_DATA_SOURCE") + '</label>:&nbsp;' +
              '<div class="ds_sel_wrapper inline-wrapper">' +
                '<select class="ds_sel"></select>' +
              '</div>' +
            '</div>' +
          '</td>' +
          '<td class="ralign nowrap">' +
            '<button class="ll_git_push">' + 
                  t("LL_GIT_PUSH") + '</button>' +
            (window["LOGIN_URL"] !== undefined  ?
                '<button class="ll_logout"  class="ml5">' + 
                  t("LL_LOGOUT") + '</button>' : "") +
          '</td>' +
        '</tr>' +
      '</table>' +
    '</div>' +
  '</div>' +
  
  // Project body
  '<div class="project_ctx wrapper hidden-block">' +
    '<table width="100%" class="map_design_wrapper">' +
      '<tr>' +
        '<td width="10%" class="proj-tree-wrapper wrapper" rowspan="2">' +
          '<div class="proj-tree"></div>' +
          '<div class="proj-ptr"></div>' +
        '</td>' +
        '<td width="88%" class="entity_wrapper">' +
          '<table class="entity" width="100%">' + 
            '<tr>' + 
              '<td>' + 
                '<div class="entity_ctx">' +
                  '<div class="req-params-wrapper wrapper-ctrl hidden-block">' +
                    '<div class="ctrl">' +
                      '<span class="ll_request_parameters">' + 
                          t("LL_REQUEST_PARAMETERS") + '</span>' +
                      '<span class="ctrl-toggle rfloat ui-icon' + 
                          ' ui-icon-triangle-1-n"' + 
                          ' title="' + ts("LL_MINIMIZE") + '"' +
                          ' onclick="toggle_wrapper_ctrl(this)"></span>' +
                    '</div>' +
            
                    // Request Parameters 
                    '<table class="req_params">' +
                      '<thead>' +
                        '<tr>' +
                          '<th class="lalign">' +
                            '<label class="ll_parameter_name bold">' + 
                              t("LL_PARAMETER_NAME") + '</label>' + 
                          '</th>' +
                          '<th class="lalign">' +
                            '<label class="ll_java_type bold">' + 
                                t("LL_JAVA_TYPE") + '</label>' + 
                          '</th>' +
                          '<th class="ralign">' +
                            '<label class="ll_size bold">' + 
                                  t("LL_SIZE") + '</label>' + 
                          '</th>' +
                          '<th class="ralign">' +
                            '<label class="ll_action pl5 bold">' + 
                                  t("LL_ACTION") + '</label>' + 
                          '</th>' +
                        '</tr>' +
                      '</thead>' +
                      '<tbody class="rparams_list"></tbody>' +
                      '<tbody class="rparams-ctrl">' +
                        '<tr>' +
                          '<td>' +
                            '<input type="text" class="req_param_name" />' +
                            '<span class="mandatory-field">*</span>' +
                          '</td>' +
                          '<td>' +
                            '<select class="req_param_jtype java_types">' +
                              '<option value=""></option>' +
                            '</select><span class="mandatory-field">*</span>' +
                          '</td>' +
                          '<td>' +
                            '<input type="text" class="req_param_size"' + 
                                                  ' size="5" disabled="" />' +
                          '</td>' +
                          '<td>' +
                            '<button class="btn_add_req_param pl5">' + 
                                t("LL_ADD") + '</button>' +
                          '</td>' +
                        '</tr>' +
                      '</tbody>' +
                    '</table>' +
                  '</div>' +
                  '<div class="entity-body ' + 
                          'dotted-border entity-body-empty hidden-block">' +
                  '</div>' +
                '</div>' + 
              '</td>' + 
            '</tr>' + 
            '<tr>' + 
              '<td class="property">' +
                '<div class="property_wrapper wrapper-ctrl hidden-block">' +
                  '<div class="ctrl">' +
                    '<span class="ll_properties">' + 
                          t("LL_PROPERTIES") + '</span>' +
                    '<span class="prop_ctrls prop-ctrls">' +
                      '<button class="prop_edit">' + 
                            ts("LL_EDIT") + '</button>' +
                    '</span>' +
                    '<span class="prop_edit_ctrls hidden-block prop-ctrls">' +
                      '<button class="save btn-row" disabled>' + 
                                ts("LL_SAVE") + '</button>' +
                      '<button class="cancel btn-row">' + 
                                ts("LL_CANCEL") + '</button>' +
                    '</span>' +
                      '<span class="ui-icon ui-icon-close"' + 
                        ' title="' + ts("LL_CLOSE") + '"' + 
                        '></span>' + 
                    '<span class="ctrl-toggle ui-icon ui-icon-triangle-1-n"' + 
                        ' onclick="toggle_wrapper_ctrl(this)"' + 
                        ' title="' + ts("LL_MINIMIZE") + '"' + 
                        '></span>' +
                  '</div>' +
                  '<table class="prop-edit">' +
                    '<tr>' +
                      '<td class="prop_win hidden-block"></td>' +
                    '</tr>' +
                  '</table>' +
                '</div>' + 
              '</td>' +
            '</tr>' + 
          '</table>' + 
        '</td>' +
        '<td width="2%" class="ds_types wrapper' + 
                                    ' ui-state-disabled" rowspan="2">' +
          '<div class="icon_list_wrapper">' +
            '<div class="icon_list hidden-block"></div>' +
          '</div>' +
        '</td>' +
      '</tr>' +
      '<tr>' +
        '<td class="entity_ctrl_wrapper">' +
          '<table class="entity_ctx_ctrl hidden-block">' +
            '<tr>' +
              '<td class="entity_ctx_git_ctrl lalign entity-ctrl-grp" width="35%">' +
                '<button class="ll_commit" disabled="disabled">' + 
                        t("LL_COMMIT") + '</button>' +
                '<button class="ll_change_log" disabled="disabled">' + 
                        t("LL_CHANGE_LOG") + '</button>' +
              '</td>' +
              '<td class="ralign" width="35%">' +
                '<div class="rev_info_wrapper hidden-block">' +
                  '<span class="ll_version">' + 
                              t("LL_VERSION") + '</span>' +
                  '<span class="rev_id"></span>' +
                '</div>' +
              '</td>' +
              '<td class="entity_ctx_ex_ctrl ralign entity-ctrl-grp"' + 
                                                              ' width="15%">' +
                '<button class="ll_load_current hidden-block">' + 
                    t("LL_LOAD_CURRENT") + '</button>' +
                '<button class="ll_preview preview" disabled="disabled">' + 
                      t("LL_PREVIEW") + '</button>' +
              '</td>' +
              '<td class="entity_ctx_session_ctrl ralign entity-ctrl-grp" width="15%">' +
                '<button class="ll_save" disabled="disabled">' + 
                    t("LL_SAVE") + '</button>' +
                '<button class="ll_cancel" disabled="disabled">' + 
                    t("LL_CANCEL") + '</button>' +
              '</td>' +
            '</tr>' +
          '</table>' +
        '</td>' +
      '</tr>' +
    '</table>' +
  '</div>' +
'</div>' +

/************* Change Log Dialog *************/
'<div class="change_log_wrapper hidden-block popup-wrapper">' +
  '<button class="b-close">X</button>' +
  '<table class="change_log grid-popup">' +
    '<thead>' +
      '<tr>' +
        '<th class="ll_commit_dts">' + 
                    t("LL_COMMIT_DTS") + '</th>' +
        '<th class="ll_user">' + 
                    t("LL_USER") + '</th>' +
        '<th class="ll_comment">' + 
                    t("LL_COMMENT") + '</th>' +
      '</tr>' +
    '</thead>' +
    '<tbody class="log_records"></tbody>' +
  '</table>' +
'</div>' +

/************* Request Param Values Dialog *************/
'<div class="req_param_values_wrapper hidden-block popup-wrapper">' +
  '<button class="b-close">X</button>' +
  '<table class="req_param_values grid-popup">' +
    '<thead>' +
      '<tr>' +
        '<th class="ll_parameter">' + 
                    t("LL_PARAMETER") + '</th>' +
        '<th class="ll_value">' + 
                    t("LL_VALUE") + '</th>' +
      '</tr>' +
    '</thead>' +
    '<tbody class="req_param_values_list"></tbody>' +
  '</table>' +
  '<div class="bottom-btn">' +
    '<button class="preview_rparams preview">' + 
                    t("LL_PREVIEW") + '</button>' +
  '</div>' +
'</div>' + 

/************* Language Labels Editor *************/
'<div class="lang_labels_editor_wrapper hidden-block popup-wrapper">' +
  '<div class="title">' +
    '<span class="dialog-header">' + t("LL_RPOJ_LANG_LABELS_EDITOR") + '</span>' +
    '<div class="btn-ctrls rfloat">' +
      '<button class="download lfloat">' + t("LL_DOWNLOAD") + '</button>' +
      '<button class="close rfloat">' + t("LL_CLOSE") + '</button>' +
      '<button class="save rfloat">' + t("LL_SAVE") + '</button>' +
    '</div>' +
  '</div>' +
  '<table class="lang_labels_editor grid-popup">' +
    '<thead>' +
      '<tr>' +
        '<th class="ll_label_id">' + t("LL_LABEL_ID") + '</th>' + 
        lang_titles +
      '</tr>' +
    '</thead>' +
    '<tbody class="lang_labels_list"></tbody>' +
    '<tbody class="empty_ll_msg">' +
    '  <tr>' +
    '    <td colspan="' + (this.lang_set.length + 1) +'">' +
    '      <label class="ll_new_label_id" for="new_ll_input">' +
                                      t("LL_LABEL_ID") + ': &nbsp;</label>' +
    '      <input type="text" class="new_ll_input" />' +
    '      <button class="add_lang_label" disabled>' +
                            t("LL_ADD_NEW_LANG_LABEL") + '</button>' +
    '    </td>' +
    '  </tr>' +
    '</tbody>' +
  '</table>' +
  '<div class="btn-ctrls">' +
    '<button class="download lfloat">' + t("LL_DOWNLOAD") + '</button>' +
    '<button class="close rfloat">' + t("LL_CLOSE") + '</button>' +
    '<button class="save rfloat" disabled>' + t("LL_SAVE") + '</button>' +
  '</div>' +
'</div>'
  );
  
  var me = this;
  
  $("#osbitools .ll_cancel").on("click", function() {
    var entity = me.getCurrentEntity();
    
    // Don't ask confirmation when entity not in body init state 
    //                            i.e entity saved but body deleted
    if (entity.isBodyInit() && 
          !confirm(ts("LL_CONFIRM_ENTITY_CHANGES_CANCEL")))
      return;
  
    entity.cancel();
  });
  
  $("#osbitools .ll_save").on("click", function() {
    me.getCurrentEntity().save();
  });
  
  $("#osbitools .preview_rparams").on("click", function() {
    me.getCurrentEntity().preview(false);
  });
  
  $("#osbitools .ll_preview").on("click", function() {
    me.getCurrentEntity().preview(true);
  });
  
  $("#osbitools .ll_load_current").on("click", function() {
    me.getCurrentEntity().load();
  });
  
  $("#osbitools .ll_commit").on("click", function() {
    me.getCurrentEntity().commit();
  });
  
  $("#osbitools .ll_change_log").on("click", function() {
    me.getCurrentEntity().gitLog();
  });
  
  $("#osbitools .project_sel").on("change", function() {
    me.loadProject();
  });
  
  $("#osbitools .ll_new").on("click", function() {
    me.newProject();
  });
  
  $("#osbitools .ll_rename").on("click", function() {
    me.renameProject();
  });

  $("#osbitools .ll_delete").on("click", function() {
    me.deleteProject();
  });

  $("#osbitools .ll_git_push").on("click", function() {
    me.gitPush();
  });
  
  if (window["LOGIN_URL"] !== undefined)
    $("#osbitools .ll_logout").on("click", function() {
      me.bs.logout();
    });
  
  // Request Parameters dialog
  
  $("#osbitools .req_param_jtype").on("change", function() {
    me.jtypeReqParamChanged();
  });
  
  $("#osbitools .btn_add_req_param").on("click", function() {
    me.addReqParam();
  });
  
  // Property tab
  
  $("#osbitools .prop_edit_ctrls button.save").on("click", function() {
    if (me.getPropWinObj().saveProperty()) {
      me.disablePropCtrls();
      me.clearSaved();
    }
  });
    
  $("#osbitools .prop_edit_ctrls button.cancel").on("click", function() {
    me.getPropWinObj().cancelProperty();
    me.disablePropCtrls();
  });
 
  $("#osbitools .prop_edit").on("click", function() {
    me.showPropTab();
    me.enablePropCtrls();
  });
  
  $("#osbitools .property_wrapper span.ui-icon-close").on("click", function() {
    if (me.checkPropTabSaved())
      me.hidePropTab();
  });
  
  // Lang Labels controls
  
  $("#osbitools .ll_lang_labels").on("click", function() {
    var label = $("#osbitools .ll_select_project");
    label.hide();
    $("#osbitools ." + label.attr("for")).hide();
    
    enable_wait_btns("project_list", "min");
    me.showLangLablesEditor();
  });
  
  $("#osbitools .lang_labels_editor_wrapper div.btn-ctrls button.save").
                                                on("click", function() {
    me.saveLangLabelSet();
  });
  
  $("#osbitools .lang_labels_editor_wrapper div.btn-ctrls button.download").
                                              on("click", function() {
    me.downloadLangLabelSet();
  });
  
  $("#osbitools .lang_labels_editor_wrapper div.btn-ctrls button.close").
                                              on("click", function() {
    me.closeLangLabelSetEditor();
  });
  
  $("#osbitools .add_lang_label").on("click", function() {
    me.addLangLabel();
  });
  
  // Attach filter to new lang label input
  $("#osbitools .new_ll_input").filter_input({
      regex: LL_FILTER.regex,
      onChange: function() {
        $("#osbitools .add_lang_label").prop("disabled", false);
      },
      onEmpty: function() {
        $("#osbitools .add_lang_label").prop("disabled", true);
      },
      onEnter: function() {
        $("#osbitools .add_lang_label").trigger("click");
      }
  }).attr("title", t(LL_FILTER.info));
};

PrjMgr.prototype.getDataSource = function() {
  return $("#osbitools .ds_sel").val();
};

PrjMgr.prototype.setDataSourceSelect = function(enabled) {
  var ds = $("#osbitools .ds_sel");
  if (ds.prop("tagName").toLowerCase() == "select")
    ds.prop("disabled", !enabled);
};

/*****************  Property tab management *****************/

PrjMgr.prototype.showPropTab = function() {
  var pwin = this.getPropWin();
  $("#osbitools .property_wrapper").show();
  if (!pwin.is(":visible")) {
    pwin.show();
    $("#osbitools .property_wrapper span.ui-icon-triangle-1-s").trigger("click");
  }
};

PrjMgr.prototype.hidePropTab = function() {
  $("#osbitools .prop_ctrls").show();
  $("#osbitools .prop_edit_ctrls").hide();
  $("#osbitools .property_wrapper").hide();
};

PrjMgr.prototype.showPropTabEx = function(pbody) {
  this.getPropWin().empty().append(pbody);
  $("#osbitools .ll_properties").html(t("LL_PROPERTIES") + 
                  " - " + this.getPropWinObj().getPropTabTitle());
  this.showPropTab();
};

PrjMgr.prototype.hidePropTab = function() {
  $("#osbitools .property_wrapper").hide();
};

PrjMgr.prototype.disablePropCtrls = function() {
  var pwin = $("#osbitools .property_wrapper");
  
  // Hide save buttons
  var ctrl_btns = $("#osbitools .prop_edit_ctrls");
  ctrl_btns.hide();
  $("button", ctrl_btns).removeClass("error");
  
  // Show edit button
  $("#osbitools .prop_ctrls").show();
  
  // Disable DataSource selection
  this.setDataSourceSelect(true);
};

PrjMgr.prototype.enablePropCtrls = function() {
  var pwin = $("#osbitools .property_wrapper");
  var dctrl = $("#osbitools .prop_edit_ctrls");
  
  // Show save buttons
  dctrl.show();
  $("button.save", dctrl).prop("disabled", true);
  $("button.cancel", dctrl).prop("disabled", false);
  
  // Hide edit button
  $("#osbitools .prop_ctrls").hide();
  
  this.getPropWinObj().editProperty();
  
  // Enable DataSource selection
  this.setDataSourceSelect(false);
};

/**
 * Get property on property window
 */
PrjMgr.prototype.getPropWin = function () {
  return $("#osbitools .prop_win");
};

/**
 * Check if property tab is visible
 */
PrjMgr.prototype.isPropWinVisible = function () {
  return this.getPropWin().is(":visible");
};

/**
 * Extract object from property window that support next methods:
 * 
 *    saveProperty - must return true/false
 *    cancelProperty
 *    editProperty
 */
PrjMgr.prototype.getPropWinObj = function () {
  return this.getPropWin().data("obj");
};

PrjMgr.prototype.setPropSave = function(enabled) {
  $("#osbitools .prop_edit_ctrls button.save").prop("disabled", !enabled);
};

PrjMgr.prototype.checkPropTabSaved = function() {
  
  if (!this.isPropTabSaved()) {
    alert(ts("LL_PROPERTIES_NOT_SAVED"));
    
    // If save property tab not visible than enlarge and display it
    this.showPropTab();
    
    // Mark save button in red
    $("#osbitools .prop_edit_ctrls button.save").addClass("error");
    
    return false;
  }
  
  // Just in case disable property controls
  this.disablePropCtrls();
  
  return true;
};

PrjMgr.prototype.isPropTabSaved = function() {
  var div_ctrls = $("#osbitools .prop_edit_ctrls");
  // Check if control buttons are visible
  return (!(div_ctrls.is(":visible") && 
     !$("button.save", div_ctrls).prop("disabled")));
};

PrjMgr.prototype.onConfigLoaded = function () {
  var me = this;
  
  this.config.minified = (is_empty(this.bs.config.minified)) ? true : 
      eval(this.bs.config.minified);
                                           
  // Populate DataSet sources
  this.config.has_ds = this.bs.config.ds_src !== undefined;
  if (this.config.has_ds) {
    this.config.has_ds = true;
    this.config.ds_map = {};
    var ds_list = this.bs.config.ds_src.split(";");
    
    // Flag that indicates that cookie value found and selected
    var fsel = false;
    
    // Selection dialog
    var ds_sel = $("#osbitools .ds_sel");
    
    // Last value for selection
    var ds_src = $.cookie('ds_src');
    
    for (var i in ds_list) {
      var ds_item = this.getDsConfigItem(ds_list[i]);
      
      // Check if proper format
      if (ds_item !== undefined) {
        var sel = "";
        if (ds_src == ds_item.id) {
          fsel = true;
          sel = " selected";
          this.config.ds_item = ds_item;
        }
        
        ds_sel.append('<option value="' + ds_item.url + '"' + 
                                  sel + '>' + ds_item.id + '</option>');
      } else {
        jOsBiTools.log.error("Invalid DataSet Item #:" + i + 
                                                    " - " + ds_list[i]);
      }
    }
    
    if (!fsel) {
      // Remember default selection alias
      this.config.ds_item = this.getDsConfigItem(ds_list[0]);
      $.cookie('ds_src', this.config.ds_item.id);
    }
   
  }
 
  $("#osbitools .sd_input").keyup(function(e) {
    if (e.keyCode == 13) {
      $("#osbitools .btn_ok").click();
    }
  });
  
  // Drag & Drop handlers
  $("#osbitools .entity-body").droppable({
    drop: function(event, ui) {
      if (!(me.DST_HANDLED && !me.plist.getProject().getEntity().isBodyInit() &&
               !me.isHandled(this)))
        return false;
      me.DST_HANDLED = false;
      
      var entity = me.getCurrentEntity();
      entity.initBody(me.DST_SRC);
      
      // Show property tab
      if (!me.isPropWinVisible())
        entity.showEntityPropWin();
  
      $(this).prop("handled", true);
    },
    over: function(event, ui) {
      if (me.DST_HANDLED && !me.plist.getProject().getEntity().isBodyInit() &&
                                                      !me.isHandled(this)) {
        $(this).removeClass("dotted-border");
        $(this).addClass("dotted-border-ready");
      }
    },
    out: function() {
      if (me.DST_HANDLED && !me.plist.getProject().getEntity().isBodyInit() &&
                                                      !me.isHandled(this)) {
        $(this).addClass("dotted-border");
        $(this).removeClass("dotted-border-ready");
      }
    }
  });
  
  // Populate Java Types
  $(".java_types").each(function() {
    for (var jtype in JAVA_TYPES)
      $(this).append('<option value="' + 
        JAVA_TYPES[jtype] + '">' + jtype + '</option>');
  });
  
  $("#osbitools .req_param_name")
    .filter_input({
      regex: ID_FILTER.regex,
      onChange: clear_error
  }).prop("title", ts(ID_FILTER.info));
  
  $("#osbitools .req_param_java_type").click(function() {
    $(this).removeClass("error");
  });
  
  $("#osbitools .req_param_size")
    .filter_input({
      regex: INT_FILTER.regex
  }).prop("title", ts(INT_FILTER.info));
  
  $("#osbitools .proj-tree-wrapper").contextPopup({
    appendTo: "#osbitools",
    items: [
      {
        label: t("LL_CREATE_ENTITY"),     
        icon: ROOT_PATH + 'modules/prj/images/new_entity.png',
        action:function() {
          var project = me.plist.getProject();
          project.showNewEntityDlg(project.list.length == 0);
        } 
      },
      {
        label: t("LL_UPLOAD_ENTITY"),     
        icon: ROOT_PATH + 'modules/prj/images/upload_entity.png',
        action:function() { 
          me.plist.getProject().showEntityUploadDlg();
        } 
      }
    ]
  });
  
  // Add component icon(s) if any
  var icons = $("#osbitools .icon_list");
  icons.html(this.getComponentList());
  
  if (!WEB_APP_CFG.prj.cust_comp) {
    $("img", icons).each(function() {
      $(this).draggable({ 
        helper: "clone",
        // cursor: "crosshair",
        drag: function(event, ui) {
          me.DST_HANDLED = true;
          me.DST_SRC = this.src;
        },
        // cursor: "url(images/no_drop.gif), no-drop"
        // cursor: "move"
      });
    });
  }
};

PrjMgr.prototype.getDsConfigItem = function (val) {
  var arr = val.split("@");
        
  // Check if proper format
  if (arr.length != 2)
    return;
    
  var ds_item = {
    id: arr[0],
    url: arr[1]
  };
  
  // Remember ds_src parsed value
  this.config.ds_map[ds_item.id] = ds_item.url;
  
  return ds_item;
};

PrjMgr.prototype.isHandled = function(el) {
  var handled = $(el).prop("handled");
  return (handled !== undefined && handled);
};

/**
 * Get list of icons to display as available components
 */
PrjMgr.prototype.getComponentList = function() {
  var res = "";
  this.ww_len = 0;
  this.ww_idx = {};
  
  if (!is_empty(WEB_APP.bs.config.comp_list)) {
    this.comp_list = eval("(" + WEB_APP.bs.config.comp_list + ")");
    
    for (var key in this.comp_list) {
      var lbl_id = key.toUpperCase() + "_COMP_GROUP_NAME";
      
      // Expected 2 level structure
      res += '<div class="' + key + '" title="' + ts(lbl_id) +
                                      '">' + t(lbl_id) + '</div>';
      
      var items = this.comp_list[key];
      this.ww_len += items.length;
      
      for (var i in items) {
        var item = items[i];
        res += '<img src="' + 
          ROOT_PATH + (WEB_APP_CFG.prj.cust_comp ? 
            'shared/images/loading_circle.gif' : 
              'images/comp_icons/' + items[i] + '.png') + 
                '"' + ' class="ww_icon_' +
                  item.replace(/\./g, "_") + '" ui-draggable" />';
                
        this.ww_idx[items[i]] = {};
      }
    }
  }
  
  return res;
};

/**
 * Load projects list during main phase load 
 */
PrjMgr.prototype.loadProjectList = function(phase_loader) {
  var me = this;
  get_ajax_phase(phase_loader,
        make_rel_req(this.URL_LIST.PROJECT), 0,
    function(data) {
      me.plist.load(data);
      return true;
    }, "projects");
};

/**
 * Init previously loaded projects list 
 */
PrjMgr.prototype.showProjectList = function(phase_loader) {
  this.plist.show();
};

PrjMgr.prototype.onDataSetChanged = function() {
  $.cookie('ds_src', $("#osbitools .ds_sel option:selected").text());
};

/*****************  General Utils *****************/

// clear_saved
PrjMgr.prototype.clearSaved = function() {
  this.getCurrentEntity().clearSaved(true);
};

PrjMgr.prototype.getConfig = function () {
  return this.config;
};

// git_push
PrjMgr.prototype.gitPush = function () {
  post_ajax_ex(make_rel_req_path(this.URL_LIST.GIT, "push"), 62, 
    function(data) {
      show_success_msg(t("LL_ERROR_GIT_PUSH_SUCCESS" +
        (data != "" ? "<br>" + data : "")));
    });
};

// prj_logout
PrjMgr.prototype.onLogout = function () {
  this.plist.reset();
};

PrjMgr.prototype.getResourcePrefix = function() {
  return "modules/prj";
};

PrjMgr.prototype.getUrlList = function() {
  return this.URL_LIST;
};

PrjMgr.prototype.getParams = function() {
  return this.params;
};

/**
 * Invoked from Project Selection onchange event 
 */
PrjMgr.prototype.loadProject = function() {
  var sel = $("#osbitools .project_sel");
  
  // Check if current project can be changed
  if (!this.plist.canChangeProject(true))
    // Return old value
    sel.val(this.plist.getProject().getName());
  else
    this.plist.addNewProject(sel.val());
};

/**
 * Invoked from GUI button "New" Project Button
 */
PrjMgr.prototype.newProject = function() {
  // Check if current project can be changed
  if (!this.plist.canChangeProject(false))
    return;
  
  this.plist.showNewProjDlg(false);
};

/**
 * Invoked from GUI button "Delete" Project Button
 */
PrjMgr.prototype.deleteProject = function() {
  // Check if project can be closed
  if (!this.plist.getProject().canClose())
    return;
    
  this.plist.getProject().showDeleteDlg();
};

/**
 * Invoked from GUI button "Rename" Project Button
 */
PrjMgr.prototype.renameProject = function() {
  this.plist.getProject().showRenameDlg();
};

/**
 * Invoked from GUI Java Type selection
 */
PrjMgr.prototype.jtypeReqParamChanged = function() {
  var sel = $("#osbitools .req_param_jtype");
  
  $(sel).removeClass("error");
  var psize = $("#osbitools .req_param_size");
  var fs = sel.val() == JTYPE_STR;
  psize.attr("disabled", !fs);
  if (!fs)
    psize.val("");
};

/**
 * Invoked from Request Parameter Add GUI button
 */
PrjMgr.prototype.addReqParam = function() {
  // First
  $("#osbitools .btn_add_req_param").removeClass("error");
  var pname = $("#osbitools .req_param_name");
  var pjtype = $("#osbitools .req_param_jtype");
  var psize = $("#osbitools .req_param_size");
  
  var param = {
    name: pname.val(),
    java_type: pjtype.val(),
    size: psize.val()
  };
  
  if (is_empty(param.name)) {
    //-- 35
    show_client_error(35, pname);
    
    return;
  } else if (is_empty(param.java_type)) {
    //-- 36
    show_client_error(36, pjtype);
    
    return;
  } else if (this.getCurrentEntity().getReqParam(param.name) !== undefined) {
    //--37 Check for duplication
    show_client_error_substr(37, pname, {name: param.name});
    
    return;
  }
  
  this.addReqParamData(param);
 
  // Reset entered values
  pname.val("");
  pjtype.val("");
  psize.val("");
  psize.attr("disabled", true);
};

PrjMgr.prototype.getCurrentEntity = function() {
  return this.plist.getProject().getEntity();
};

PrjMgr.prototype.addReqParamData = function(param) {
  // Register new parameter
  var entity = this.getCurrentEntity();
  entity.addReqParamRecord(param);
};

PrjMgr.prototype.getApp = function() {
  return this.app;
};

PrjMgr.prototype.getBaseExt = function() {
  return this.params.base_ext;
};

/************* Language Labels Editor *************/

PrjMgr.prototype.showLangLablesEditor = function() {
  var lrec = $("#osbitools .lang_labels_list");
  lrec.empty();
  
  // Load latest label
  var me = this;
  get_ajax(make_rel_req_path(this.URL_LIST.LANG_SET_UTILS,
                            this.plist.getProject().getName()), 63,
  function(data) {
      me.showLangLabelSetEditorSuccess(lrec, data);
    }
  );
};

PrjMgr.prototype.showLangLabelSetEditorCtrList = function() {
  $("#osbitools .lang_labels_editor_wrapper button.save").each(function() {
    $(this).show().prop("disabled", false);
  });
  
  $("#osbitools .lang_labels_editor_wrapper button.download").show();
};

PrjMgr.prototype.hideLangLabelSetEditorCtrList = function() {
  // $("#osbitools .empty_ll_msg").show();
  $("#osbitools .lang_labels_editor_wrapper button.save").hide();
  $("#osbitools .lang_labels_editor_wrapper button.download").hide();
};  
  
PrjMgr.prototype.parseLangLabelSet = function(ll_set) {
  var res = {
    ll_set: {},
    ll_list: []
  };
    
  // Quick check for empty result
  if (ll_set == "")
    return res;
    
  // Check if lang_labels version supported
  if (ll_set.ver_max > this.ll_set_version[0] || 
        ll_set.ver_max == this.ll_set_version[0] && 
          ll_set.ver_min > this.ll_set_version[1]) {
    
    //-- 65
    show_client_error_ex(65, "Loaded version " + ll_set.ver_max + "." + 
      ll_set.ver_min + " is higher than supported " + 
                                              this.ll_set_version.join("."));
                                              
    return;
  }

  // Convert server side json to internal one
  for (var i in ll_set.lang_label) {
    var ll = ll_set.lang_label[i];
    var label = {};
    
    for (var j in ll.ll_def) {
      var ld = ll.ll_def[j];
      label[ld.lang] = ld.value;
    }
    
    res.ll_set[ll.id] = label;
    
    // Strip LX_ prefix for visible id
    res.ll_list.push(new ListItem(ll.id, ll.id.substr(3)));
  }
  
  return res;
};

PrjMgr.prototype.showLangLabelSetEditorSuccess = function(lrec, ll_set) {
  
  // Check if lang_labels version supported
  if (ll_set.ver_max > this.ll_set_version[0] || 
      ll_set.ver_max == this.ll_set_version[0] && 
        ll_set.ver_min > this.ll_set_version[1]) {
   
    show_client_error_ex(65, "Loaded version " + ll_set.ver_max + "." + 
      ll_set.ver_min + " is higher than supported " + 
                                              this.ll_set_version.join("."));
                                              
    return;
  }

  // Convert server side
  var lang_labels = this.parseLangLabelSet(ll_set)["ll_set"];
         
  // Show project control elements
  var label = $("#osbitools .ll_select_project");
  label.show();
  $("#osbitools ." + label.attr("for")).show();
    
  disable_wait_btns("project_list", "min");
    
  // Remember lang labels for further use
  this.cust_ll_set = lang_labels;
  
  // Sort by label id before show
  var keys = Object.keys(lang_labels), i, len = keys.length;

  keys.sort();

  if (len == 0) {
    // Display no data message
    $("#osbitools .lang_labels_editor").css("min-width", 
                    $("#osbitools .lang_labels_editor_wrapper").width());
    this.hideLangLabelSetEditorCtrList();
  } else {
    for (var i = 0; i < len; i++) {
      var lbl_id = keys[i];
      var ll = lang_labels[lbl_id];
      
      this.addLangLabelRow(lrec, lbl_id, ll, false);
    }
    
    this.showLangLabelSetEditorCtrList();
    
    // Disable lang buttons
    $("#osbitools .lang_labels_editor_wrapper button.save").show().prop("disabled", true);
  }
  
  $("#osbitools .lang_labels_editor_wrapper").bPopup({
    speed: 450,
    opacity: 0.6,
    modalClose: false,
    appendTo: "#osbitools"
  }, function() {
      if (len == 0)
        $("#osbitools .new_ll_input").focus();
  });
};

PrjMgr.prototype.delLangLabelRow = function(lrec, btn) {
  if (confirm(ts("LL_PLEASE_CONFIRM"))) {
        
    // Remember current table width
    var w = lrec.width();
    
    var flast = ($(">tr", lrec).length == 1);
    
    if (flast)
      // Fix table width
      $("#osbitools .lang_labels_editor").css("min-width", w);
    
    var row = $(btn).closest("tr.lang-label").remove();
    
    if (flast)
      // Show Empty message body
      this.hideLangLabelSetEditorCtrList();
    else
      $("#osbitools .lang_labels_editor_wrapper button.save").
        prop("disabled", row.hasClass("new"));
  }
};

PrjMgr.prototype.addLangLabelRow = function(lrec, lbl_id, ll, is_new) {
  var row = '<tr lbl_id="' + lbl_id + '" class="lang-label' + 
                                (is_new ? " new" : "") + '"><th>' +
    '<table class="wrapper-wide"><tr>' + 
      '<td class="vcenter-middle">' +
        '<span class="label-id">' + lbl_id.substr(3).toUpperCase() +
                                                        '</span></td>' + 
      '<td class="vcenter-middle">' + 
        '<span class="ui-icon ui-icon-circle-close"' + 
                      ' title="' + ts("LL_DELETE") + '"></span></td>' + 
    '</tr></table></th>';
  
  ll = (ll !== undefined) ? ll : {};
  
  for (var j in this.lang_set) {
    var lang = this.lang_set[j];
    
    var value = (ll[lang] !== undefined) ? ll[lang] : "";
    
    // Escape quotes
    value = value.replace(/"/g, '&quot;');

    row += '<td><div class="ll-cell"><input lang="' + lang + '"' + 
        (is_empty(value) ? "" : ' value="' + value + '"') + 
                                    ' def_val="' + value + '" />' +
      '<span class="ui-icon ui-icon-arrowreturnthick-1-w hidden-block"' + 
        ' title="' + ts("LL_UNDO") + '"></span></div></td>';
  }
  
  var rec = $(row + "</tr>");
  lrec.append(rec);
  
  var me = this;
  $("span.ui-icon-circle-close", rec).on("click", function() {
    me.delLangLabelRow(lrec, this);
  });
  
  // Change color when edited
  $("input", rec).on("change", function() {
    var input = $(this);
    // Check if row is new
    if (input.closest("tr").hasClass("new"))
      return;
    
    input.addClass("changed");
    
    // Enable undo button
    input.next().show().addClass("undo");
    
    // Enable save
    $("#osbitools .lang_labels_editor_wrapper button.save").show().prop("disabled", false);
  });
  
  $("span.ui-icon-arrowreturnthick-1-w", rec).on("click", function() {
    var input = $(this).prev();
    input.val(input.attr("def_val")).removeClass("changed");
    
    $(this).hide().removeClass("undo");
    
    // Check if any changes left
    me.clearLangLabelSetSave();
  });
    
  return rec;
};

PrjMgr.prototype.clearLangLabelSetSave = function() {
  // Check if any changes
  $("#osbitools .lang_labels_editor_wrapper button.save").show().prop("disabled", 
    ($("#osbitools .lang_labels_list tr.new").length == 0 && 
      $("#osbitools .lang_labels_list .ui-icon-arrowreturnthick-1-w.undo").length == 0));
};

PrjMgr.prototype.saveLangLabelSet = function() {
  // Go through list and collect changes
  var clist = {
    "fnew": [],
    "changed": "",
    "deleted": []
  };
  
  // Get list of all lang labels id's to see what was deleted
  var lst = {};
  for (var lbl_id in this.cust_ll_set)
    lst[lbl_id] = this.cust_ll_set[lbl_id];
    
  // Get list of list items
  var ll_list = [];
  
  // Create saved xml header
  var ll_set = {
    ver_max: this.ll_set_version[0],
    ver_min: this.ll_set_version[1],
    lang_list: this.lang_set.join(",")
  };
  
  var lang_labels = [];
  
  var me = this;
  $("#osbitools .lang_labels_list>tr").each(function() {
    var lbl_id = $(this).attr("lbl_id");
    
    // Remove from list index
    delete lst[lbl_id];
    
    // Trimi label prefix
    ll_list.push(new ListItem(lbl_id, lbl_id.substr(3)));
    
    var lang_label = {
      id: lbl_id,
      ll_def: []
    };
    
    // sxml += get_crt() + '<lang_label class="' + lbl_id + '">';
    var fnew = me.cust_ll_set[lbl_id] === undefined;
    if (fnew) {
      // Add new label
      clist.fnew.push(lbl_id);
      me.cust_ll_set[lbl_id] = {};
    }
    
    var lchanged = "";
    lbl = me.cust_ll_set[lbl_id];
    
    $("div.ll-cell input", this).each(function() {
      var input = $(this);
      var value = input.val();
      var lang = input.attr("lang");
      
      lang_label.ll_def.push({
        lang: lang,
        value: escape_xml(value)
      });
      
      if (lbl[lang] != value) {
        // Record changed label:lang
        lbl[lang] = value;
        if (!fnew)
          lchanged += ":" + lang;
      }
    });
    
    if (!is_empty(lchanged))
      clist.changed += ";" + lbl_id + ":" + lchanged.substr(1);
      
      lang_labels.push(lang_label);
  });
  
  ll_set["lang_label"] = lang_labels;
  
  // Check what needs to be deleted
  for (var lbl_id in lst)
    clist.deleted.push(lbl_id);
    
  var cstr = '' +
    (clist.fnew.length > 0 ? " - NEW:" + clist.fnew.join(";") : "") +
    (!is_empty(clist.changed) ? " - CHANGED:" + clist.changed.substr(1) : "") +
    (clist.deleted.length > 0 ? " - DELETED:" + clist.deleted.join(";") : "");
  
  if (!is_empty(cstr)) {
    this.uploadLangLabelSet(ll_set, {
      ll_set: this.cust_ll_set,
      ll_list: ll_list
    }, "List of changed labels" + cstr);
  } else {
    this.closeLangLabelSetEditor();
  }
};

PrjMgr.prototype.uploadLangLabelSet = function(res, lres, comment) {
  var me = this;
  var btns_container = 
          $("#osbitools .lang_labels_editor_wrapper div.btn-ctrls");
  enable_wait_btns_ex(btns_container, "right");
  
  //-- 64
  post_ajax_data(make_rel_req_ex(this.URL_LIST.LANG_SET_UTILS, 
    this.plist.getProject().getName(),
      {"comment": comment}, JSON.stringify(res)), 64,
  function() {
    // Disable save button
    $("#osbitools .lang_labels_editor_wrapper button.save").
                                      show().prop("disabled", true);
    
    // Clear all new rows
    $("#osbitools .lang_labels_list tr.new").removeClass("new");
    
    // Hide all undo buttons
    $("#osbitools .lang_labels_list .ui-icon-arrowreturnthick-1-w").hide();
    
    // Clear input background
    $("#osbitools .lang_labels_list input.changed").removeClass("changed");
    
    // Show buttons
    disable_wait_btns_ex(btns_container, "right");
    
    // Save current project with new ll_set
    me.plist.getProject().setLangLabels(lres);
  }, function() {
    // Show buttons
    disable_wait_btns_ex(btns_container, "right");
  }, APP_JSON_UTF8);
};

PrjMgr.prototype.downloadLangLabelSet = function() {
  // TODO
  alert("In TODO list");
};

PrjMgr.prototype.closeLangLabelSetEditor = function() {
  $("#osbitools .lang_labels_editor_wrapper").bPopup().close();
};

PrjMgr.prototype.addLangLabel = function() {
  var input = $("#osbitools .new_ll_input");
  
  // Add prefix for custom lang labels
  var lbl_id = "LX_" + input.val().toUpperCase();
  
  if (LL_FILTER.validation !== undefined) {
    pattern = RegExp(LL_FILTER.validation);
          
    if (!pattern.test(lbl_id)) {
      alert(ts("LL_INVALID_LABEL_ID_FORMAT")); 
      return;
    }
  }
    
  // Add new label to custom ll_set
  if (this.cust_ll_set === undefined)
    this.cust_ll_set = {};
    
  // Pointer on new label
  var label;
  
  // Row with new label
  var row = this.addLangLabelRow($("#osbitools .lang_labels_list"), lbl_id, label, true);
  
  // Put focus on first element
  $("input:first", row).focus();
  
  // Enable save button
  this.showLangLabelSetEditorCtrList();
  
  // Reset input field and disable add button
  input.val("");
  $("#osbitools .add_lang_label").prop("disabled", true);
};
