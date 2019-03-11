/*
 * Open Source Business Intelligence Tools - http://www.osbitools.com/
 * 
 * Copyright 2014-2016 IvaLab Inc. and by respective contributors (see below).
 * 
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 * Date: 2014-12-22
 * 
 * Contributors:
 * 
 */


function ProjectList(pmgr) {
  this.pmgr = pmgr;
  this.sel = $("#osbitools .project_sel");
}

ProjectList.prototype.reset = function() {
  this.list = [];
  this.projects = {};
  this.sel.empty();
  
  // Close & delete active project (if apply)
  if (this.project !== undefined) {
    this.project.close();
    delete this.project;
  }
};

ProjectList.prototype.getConfig = function() {
  return this.pmgr.getConfig();
};

ProjectList.prototype.getCount = function() {
  return this.list.length;
};

ProjectList.prototype.getProject = function() {
  return this.project;
};

/**
 * Load project list from ajax string
 */
ProjectList.prototype.load = function(data) {
  this.reset();
  if (! jOsBiTools.is_empty_array(data)) {
    this.list = data;
    
    for (var i in this.list) {
     var pname = this.list[i];
     this.projects[pname] = {};
     this.sel.append('<option value="' + 
          pname + '">' + pname + '</option>');
    }
  }
};

/**
 * Show Project List 
 */
ProjectList.prototype.show = function() {
  if (this.list.length == 0) {
    // Show new project dialog
    this.showNewProjDlg(true);
  } else if (this.list.length == 1) {
    // Add single project by default
    this.addNewProject(this.list[0]);
  } else {
    // Check for previously remembered project
    var last_project = $.cookie("project");
    if (last_project === undefined || 
        this.projects[last_project] === undefined)
      // Show project selection dialog
      this.showProjSelDlg();
    else
      this.addNewProject(last_project);
  }
};

ProjectList.prototype.showProjSelDlg = function() {
  var me = this;
  var data = {};
  for (var i in this.list)
    data[this.list[i]] = this.list[i];
  
  show_simple_selection_dialog({
    sel_title: t("LL_SELECT_PROJECT"),
    data: data,
    btnOk: t("LL_LOAD"),
    btnCancel: t("LL_CANCEL"),
    modalClose: false,
    onOk: function() {
      hide_simple_dialog($("#osbitools .sd_sel").val());
    },
    onClose: {
      success: function(pname) {
        me.addNewProject(pname);
      },
      error: show_server_error
    },
    title: t("LL_PROJECT_NAME")
  });
};

ProjectList.prototype.showNewProjDlg = function(is_new) {
  var me = this;
  
  show_simple_input_dialog({
    btnOk: t("LL_CREATE"),
    btnCancel: t((!is_new) ? "LL_CANCEL" : "LL_LOGOUT"),
    modalClose: true,
    filter: ID_FILTER.regex,
    onOk: function() {
      me.onNewProjectCreate();
    },
    onClose: {
      success: function(pname) {
        me.onNewProjectCreateSuccess(pname);
      },
      error: show_server_error,
      cancel: function() {
        if (is_new)
          me.pmgr.bs.logout();
      }
    },
    title: t("LL_PROJECT_NAME")
  });
};

ProjectList.prototype.checkNewProject = function(http_type, error_id, prj) {
  var pname = $("#osbitools .sd_input").val();
  
  if ( jOsBiTools.is_empty(pname)) {
    alert(ts("LL_PROJ_NAME_REQ"));
    return;
  } else if (this.projects[pname] !== undefined) {
    alert(ts("LL_PROJ_KEY_EXISTS").replace("[key]", "[" + pname + "]"));
    return;
  }
  
  // Enable wait state
  enable_wait_btns("sd_ctrl");

  ajax_req_base(make_rel_req_path(this.getUrlList().PROJECT, 
        ((prj !== undefined) ? prj.name + "/" + pname : pname)),
            http_type, error_id, 
    function() {
      hide_simple_dialog(pname);
    },
    function() {
      disable_wait_btns("sd_ctrl");
    }
  );
};

ProjectList.prototype.onNewProjectCreate = function() {
  //-- 44
  this.checkNewProject("put", 44);
};

ProjectList.prototype.renameProject = function(old_name, new_name) {
  this.projects[new_name] = this.projects[old_name];
  delete this.projects[old_name];
  
  for (var i in this.list) {
    if (this.list[i] == old_name) {
      this.list.splice(i, 0, new_name);
      this.list.splice(Number(i) + 1, 1);
      
      break;
    }
  }
  
  var old_item = $("#osbitools .project_sel option[value=" + old_name + "]");
  old_item.before('<option value="' + 
              new_name + '">' + new_name + '</option>');
  old_item.remove();
  this.sel.val(new_name);
  
  // Remember new cookie
  $.cookie("project", new_name);
};

ProjectList.prototype.deleteProject = function(pname) {
  delete this.projects[pname];
  
  for (var i in this.list) {
    if (this.list[i] == pname) {
      this.list.splice(i, 1);
      
      break;
    }
  }
  
  $("#osbitools .project_sel option[value=" + pname + "]").remove();
  
  $.removeCookie("project");
  delete this.project;
  
  this.show();
};

ProjectList.prototype.onNewProjectCreateSuccess = function(pname) {
  if (this.project !== undefined)
    this.project.close();
  
  this.list.push(pname);
  this.sel.append('<option value="' + 
              pname + '">' + pname + '</option>');
              
  // After project created auto-ask create new file
  this.addNewProject(pname);
};

ProjectList.prototype.canChangeProject = function(fdel) {
  if (this.project !== undefined) {
    if (!this.project.canCloseEntity())
      return false;
      
    if (fdel)
      this.project.close();
  }
  
  return true;
};

ProjectList.prototype.addNewProject = function(pname) {
  // Set project as default selection
  this.sel.val(pname);
  
  // Save current project in cookies
  $.cookie("project", pname);
  
  // Load project
  this.project = new Project(pname, this);
  
  // Update project list
  this.projects[pname] = this.project;

  this.project.load();
  
  return this.project;
};

ProjectList.prototype.getUrlList = function() {
  return this.pmgr.getUrlList();
};

ProjectList.prototype.getParams = function() {
  return this.pmgr.getParams();
};
