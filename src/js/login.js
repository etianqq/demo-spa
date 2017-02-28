/**
 * Created by linaqiu on 2016/9/1.
 */
var Login = (function () {

    var $errorMsg, ajaxErrorFlag = false;

    function bindAction() {
        $(".forgetPassword").click(function () {
            window.location.href = oauthApi + '/index.html#/retrievepd/inpaccount';
        });
        $('#login').click(function (event) {
            event.preventDefault();
            event.stopPropagation();
            login();
        });
        $(".js_download").click(function () {
            if ($(".js_download").hasClass("closeCode")) {
                $(".js_download").removeClass("closeCode");
                $(".js_download").text("下载房产销冠APP");
                $(".code").hide();
            } else {
                $(".js_download").addClass("closeCode");
                $(".js_download").text("关闭二维码");
                $(".code").show();
            }
        });

        $('body').keydown(function (event) {
            if (event.keyCode === 13) {
                event.preventDefault();
                event.stopPropagation();
                login();
            }
        });

        $('#login_info').on('keyup', '.js_userName', function (event) {
            if ($.trim(this.value)) {
                $('#js-userNameErr').hide();
            }
        }).on('keyup', '.js_passWord', function (event) {
            if ($.trim(this.value)) {
                $('#js-passwordErr').hide();
            }
        }).on('keyup', '.js_auth_code', function (event) {
            if ($.trim(this.value)) {
                $('#js-authCodeErr').hide();
            }
        }).on('click', '.js_auth_code_img', function () {
            setAuthCodeImg();
        });

        // hide warning bar
        $('.warning').click(function () {
            $('.warning').slideUp();
        });
    }

    function cmdEncrypt(val) {
        setMaxDigits(129);
        var pwdMD5Twice = $.md5(val);
        return pwdMD5Twice;
    }

    function login() {
        $errorMsg = $('.errorMsg');
        $errorMsg.text('');
        var rp = $("input[name=rp]").val();
        var name = $.trim($("#userName").val());
        var pwd = $.trim($("#password").val());
        var auth = $.trim($('.js_auth_code').val());
        if (name == "" || name == "请输入您的账号") {
            showError('#js-userNameErr', '请输入正确账号');
            $("#userName").focus();
            return;
        }
        $('#js-userNameErr').hide();

        if (pwd == "" || pwd == "请输入密码") {
            showError('#js-passwordErr', '请输入正确密码');
            $("#passWord").focus();
            return;
        }
        $('#js-passwordErr').hide();
        if ($('.check-block-auth-code').is(':visible') && auth == "") {
            showError('#js-authCodeErr', '请输入正确验证码');
            $(".js_auth_code").focus();
            return;
        }
        $('#js-authCodeErr').hide();
        ajaxErrorFlag = false;
        var pwd2 = cmdEncrypt(pwd);
        multiLogin(name, pwd2, auth);
    }

    function multiLogin(name, pwd2, auth) {
        var arg = {username: name, password: pwd2, loginCaptchaCode: auth};

        tops_common.loading_show();
        logout(function () {
            ajax('POST', API_CONFIG_URL.COMMON_API.LOGIN_SERVICE, arg)
                .success(function (res) {
                    if (res.Code === 0) {
                        UserInfo.setUk(res.Data);
                        $('#js-userNameErr').hide();
                        $('#js-passwordErr').hide();
                        //GetAdminInfoV14Web
                        ajax('POST', API_CONFIG_URL.COMMON_API.LOGIN_ADMIN_INFO_WEB, null)
                            .success(function (res) {
                                if (res.Code === 0) {
                                    var data = res.Data;
                                    UserInfo.setPortraitUrl(imageApi + data.F_PicUrl);
                                    UserInfo.setRoleModelFlag(data.F_RoleModuleFlag);
                                    tops_common.loading_hide();
                                    window.location = '/index.html';
                                } else {
                                    handlerErrorForAdminInfo(res);
                                }
                            })
                            .error(function (res) {
                                handlerErrorForAdminInfo(res);
                            });

                    }
                    else if (res.Code === 3015) {
                        tops_common.loading_hide();
                        var $authBlock = $('.check-block-auth-code');
                        if (!$authBlock.is(':visible')) {
                            showAuthCode($authBlock);
                        }
                        else {
                            showError('#js-authCodeErr', '请输入正确验证码');
                        }
                        $(".js_auth_code").focus();
                        setAuthCodeImg();
                    }
                    else {
                        handlerError(res);
                    }
                })
                .error(function (res) {
                    handlerError(res);
                });
        });
    }

    function handlerError(res) {
        tops_common.loading_hide();
        if (!ajaxErrorFlag) {
            if (res.Code == 4002) {
                var $authBlock = $('.check-block-auth-code');
                if (!$authBlock.is(':visible')) {
                    showAuthCode($authBlock);
                }
                showError('#js-passwordErr', '用户名或者密码错误');

            } else {
                var code = '（' + (res.Code || '') + '）';
                tops_message.showMsgErrMsg('系统错误' + code);
            }
            ajaxErrorFlag = true;
        }
        logout();
    }

    function handlerErrorForAdminInfo(res) {
        tops_common.loading_hide();
        if (!ajaxErrorFlag) {
            tops_message.showMsgErrMsg(res.Message);
            ajaxErrorFlag = true;
        }
        logout();
    }

    function showAuthCode($authBlock) {
        $authBlock.addClass('show_auth_code_wrapper');
        $('.check-block-password').addClass('show_auth_code_wrapper');
        $authBlock.show();
    }

    function setAuthCodeImg() {
        var timeStamp = +new Date();
        $('.js_auth_code_img').attr('src', topsalesApi + '/topsales-web/jcaptcha.jpg?timeStamp=' + timeStamp);
    }

    function showError(elt, msg) {
        $(elt).text(msg).fadeIn(100).fadeOut(2000);
    }

    function logout(callback) {
        ajax('GET', API_CONFIG_URL.COMMON_API.LOGIN_OUT, null)
            .success(function () {
                tops_common.cookie_clearAll();
                if (typeof callback === 'function') {
                    callback();
                }
            });
    }

    function ajax(type, url, data) {
        return $.ajax({
            dataType: "json",
            url: url,
            type: type,
            data: data || '',
            crossDomain: true,
            xhrFields: {withCredentials: true}
        });
    }

    return {
        init: function () {
            tops_message.init({imghref: '/images/messager/'});
            setAuthCodeImg();
            bindAction();
        }

    }
}());

