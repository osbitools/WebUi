/*
 * Open Source Business Intelligence Tools - http://www.osbitools.com/
 * 
 * Copyright 2014-2016 IvaLab Inc. and by respective contributors (see below).
 * 
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 * Date: 2018-10-14
 * 
 * Contributors:
 * 
 */

OsBiPageDesigner.prototype.addRegWin = function(win) {
  // Min password length
  var MIN_PWD_LEN = 8;

  // Min password length
  var MAX_PWD_LEN = 64;
  
  win.html('<h1 class="error-text center">' + t('LL_LICENSE_INFO_NOT_FOUND') + '</h1>' +
  '<h2 class="success-text center">' + t('LL_REGISTER_NEW_ACCOUNT').replace("[eval_period]", 14) + '</h2>' +
  '<form autocomplete="on">' +
    '<table>' +
      '<tr>' +
        '<td align="right"><label>' + t('LL_EMAIL') + '</label>:&nbsp; </td>' +
        '<td>' +
          '<table>' +
            '<tr>' +
              '<td>' +
                '<input type="email" name="email" class="r-field" autocomplete="username" />' +
              '</td>' +
              '<td>' +
                '<image class="icon-check email-check hidden-block" src="shared/images/check.png" />' +
              '</td>' +
            '</tr>' +
          '</table>' +
        '</td>' +
      '</tr>' +

      '<tr>' +
        '<td align="right"><label>' + t('LL_PASSWORD') + '</label>:&nbsp; </td>' +
        '<td>' +
          '<table>' +
            '<tr>' +
              '<td>' +
                '<input type="password" name="pwd" class="r-field" " autocomplete="new-password" />' +
              '</td>' +
              '<td>' +
                '<image class="icon-check pwd-check hidden-block" src="shared/images/check.png" />' +
              '</td>' +
            '</tr>' +
          '</table>' +
        '</td>' +
      '</tr>' +
      
      '<tr>' +
        '<td></td>' +
        '<td class="warn-text">' +
        '<i><ul>' + 
        '<li>' + t('LL_MIN_SIX_CHAR').
                replace('[min_pwd_len]', MIN_PWD_LEN) + '</li>' +
        '<li>' + t('LL_PWD_MIX') + '</li>' +
        '</ul></i>' + 
        '</td>' +
      '</tr>' +
      
      '<tr>' +
        '<td align="right"><label>' + t('LL_RETYPE_PASSWORD') + '</label>:&nbsp; </td>' +
        '<td>' +
        '<table>' +
            '<tr>' +
              '<td>' +
                '<input type="password" name="retype" class="retype" autocomplete="off" />' +
              '</td>' +
              '<td>' +
                '<image class="icon-check retype-check hidden-block" src="shared/images/check.png" />' +
              '</td>' +
            '</tr>' +
          '</table>' +
        '</td>' +
      '</tr>' +
      '<tr>' +
        '<td id="login_ctrls" align="left">' +
          '<button type="button" class="btn-cancel">' + t('LL_CANCEL') + '</button>' +
        '</td>' +
        '<td id="login_ctrls" align="right">' +
          '<button type="button" class="btn-submit" disabled>' + t('LL_SUBMIT') + '</button>' +
        '</td>' +
      '</tr>' +
    '</table>' +
  '</form>');
  
  /// TEST START
  $("input[name=email]", win).val("qq@qq.com");
  $("input[name=pwd]", win).val("qwerty1!");
  $("input[name=retype]", win).val("qwerty1!");
  $(".btn-submit", win).removeAttr("disabled");
  /// TEST END
  
  // Bind email check
  var email_check = $(".email-check", win);
  var email_regex = /\S+@\S+\.\S{1,11}/;
  var femail = false;
  $("input[name=email]", win).filter_input({
    regex: "[^ ]",
    onText: function(val) {
      femail = checkFormState(email_check, email_regex, val);
      checkSubmitBtn();
    }
  });
  
  // Password regex
  var pwd_specials = '`~!@#\?\$%\^\&*\)\(+=._-';
  var pwd_check = $(".pwd-check", win);
  var pwd_field = $("input[name=pwd]", win);
  var pwd_regex = RegExp('(?=.*[^0-9' + pwd_specials + ']+)(?=.*[0-9]+)(?=.*[' +
     pwd_specials + ']+).{' + MIN_PWD_LEN + ',' + MAX_PWD_LEN + '}');
  var fpwd = false;
  // Bind password check
  pwd_field.filter_input({
    onText: function(val) {
      fpwd = checkFormState(pwd_check, pwd_regex, val);
      checkPwdRetype(val, retype_field.val());
      checkSubmitBtn();
    }
  });
  
  // Password retype
  var retype_check = $(".retype-check", win);
  var retype_field = $("input[name=retype]", win);
  var fretype = false;
  retype_field.filter_input({
    onText: function(val) {
      checkPwdRetype(pwd_field.val(), val);
      checkSubmitBtn();
    }
  });
  
  var btn = $(".btn-submit", win);
  function checkFormState(check, regex, val) {
    var f = regex.test(val);
    enableCheck(f, check);

    return f;
  }
  
  function checkPwdRetype(val1, val2) {
    fretype = val1 != "" &&  val1 == val2;
    enableCheck(fretype, retype_check);
  }
  
  function enableCheck(enabled, check) {
    if (enabled)
      check.removeClass("hidden-block");
    else
      check.addClass("hidden-block");
  }
  
  function checkSubmitBtn() {
    if (femail && fpwd && fretype)
      btn.removeAttr("disabled");
    else
      btn.attr("disabled", "disabled");
  }
};

OsBiPageDesigner.prototype.addPostRegWin = function(win) {
  win.html('<h1 class="success-text center"><b>' + t('CHECK_YOUR_INBOX') + '</b></h1>' +
    '<h2 class="center">' + t('LL_CONGRATS_NEW_ACCOUNT') + '</h2>' +
    '<h2 class="center">' + t('LL_LICENSE_CODE_SENT').replace("[lcode_len]", 6) + '</h2>' +
    '<form>' +
    '<table>' +
      '<tr class="pad15">' +
        '<div class="pad15">' + 
          '<td align="right"><h1><b>' + t('LL_LICENSE_CODE') + ':</b></h1>&nbsp; </td>' +
          '<td>' +
          '<input type="text" name="lcode" class="r-field" style="font-size: 2em;" maxlength="6" size="6" />' +
          '</td>' +
        '</div>' +
      '</tr>' +
      '<tr>' +
        '<td id="login_ctrls" align="left">' +
          '<button type="button" class="btn-cancel">' + t('LL_CANCEL') + '</button>' +
        '</td>' +
        '<td id="login_ctrls" align="right">' +
          '<button type="button" class="btn-submit">' + t('LL_SUBMIT') + '</button>' +
        '</td>' +
      '</tr>' +
    '</table>' +
    '</form>');

  /// TEST START
  $("input[name=lcode]", win).val("123456");
  $(".btn-submit", win).removeAttr("disabled");
  /// TEST END
  
  var btn = $(".btn-submit", win);
    
  // Bind license code check
  var lcode_regex = /\d{6}/;
  $("input[name=lcode]", win).filter_input({
    regex: "[0-9]",
    onText: function(val) {
    if (lcode_regex.test(val))
      btn.removeAttr("disabled");
    else
      btn.attr("disabled", "disabled");
    }
  });
};

OsBiPageDesigner.prototype.onRegistration = function(rdata) {
  var me = this;
  var req = make_abs_req(REGISTER_URL);
  req.data = rdata;
  
  /// TEST START
  // qq@qq.com
  // qwerty1!
  // UI Test
  
  req.data = "jKxtk6X8PyR7zxiTFutc8EkBZ6sys2cQQ2iWMV5M2YXS+NhmoID/lijqoV/8c3WmGcbcwPIIOA65LBDokQXOhaEJ/LurbaswwvhuUqpPI/RPgP/pQURRCnstSoQ/0jySG5LVY6gozVKBhxUfShjp3a31UWwVAnABqSC5sw0JhuEeiodxt4ddtJafkTLR1rWLBwW1gnMGB145GvNxRoQGeoH7QwF2+VcYg2jI0hWe+/R4MFsVscpwlEkSyOubNC6lwhHkuwF+pw28gQSfnjIKvu9iB6eJOZDCAwZpblXDm/3OEql+jwX0q4j8FjErge+vsc3DzcK3gtsx4cjcwFHhjLMQBxTLacg2n0lCWQ8NY4GZcn8EhphaMt8BojGcU0u9";
  /// TEST END
  
  put_ajax_data(req, 117, function(data) {
    me.showPostRegWin();
  }, undefined, "text/plain");
};

OsBiPageDesigner.prototype.onLicenseCodeValidation = function(rdata) {
  var me = this;
  var req = make_abs_req(VALIDATE_LICENSE_CODE_URL);
  req.data = rdata;
  
  /// TEST START
  // qq@qq.com
  // qwerty1!
  // UI Test
  // 123456

  req.data = "LXJ4Dh7Ki2es11CuCd2DZVsAnQ0+5R/9ZLCdOQ1uL+BovZ+rX4fmXF8eM3xXcYDQ/TtnDt7i7q3d4xGmPBuJOgJz6ADnV1hPNFZwtfJ6wjfXREEcGNtRjHi6zUQhxum53VpjM9EBL0z94fwn4VVeEDkkQSlV7VS231bh3TvuBCW0XYCO5qo7U6j2sBWucav7SclpX9ieAJtPq/nlFmZ6AdhbbXg0IWDZD2GB7KnPh9GKXMOe+6Tb4yKuOEHjB/N1Kxkqqu1JfC0b+yQObusg3Wi9v14sTSWhGD428vOaE/YrEIb1H7/zdNKwRMh/eaUM6A+FtR3U+innQxZEBy2PamkzSyG2pnpBWv5d7Hi0b0qJN5Zr5EQnpij9uzcVjv0zqkvOamlZLTMJkpW8FxtfowTSRJprftuI96J/eY6anj21ymRka2U4nkhrfgeROOC2e1ifmrDlNFeuGEP8e8Xde7qW7LN44A464we4Wl0bwiY=";
  /// TEST END
  

  post_ajax_data(req, 118, function(data) {
    // Go back on preview
    me.pmgr.plist.project.entity.preview();
  }, undefined, "text/plain");
};