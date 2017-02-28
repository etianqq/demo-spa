/*
 * @action 将ajax进行封装
 */
var spa_ajax = (function () {
    var me = this;
    //配置
    me.config = {
        jsonpTimeout: 60000, //jsonp超时时间,默认60秒
        login: {
            url: "/OAuth/Login",     //当ajax请求返回4002未登录的时候跳转到指定地址
            target: window
        }
    };

    function _processResult(result, success, fail) {
        if (result.Code != null) {
            if (result.Code === 3) {
                document.write(result.Message);
            }
            else if (result.Code === 302) {
                window.location = result.Message + window.location.hash;
            }

            else if (result.Code === 4002) {
                if (config.redirectToLogin) {
                    config.redirectToLogin();
                } else {
                    _redirectLoginView();
                }
            }
            else if (result.Code != 0) {
                _handleErrorResponse(fail, result);
            }
            else {
                _resolveResult(success, result);
            }
        } else {
            _resolveResult(success, result);
        }
    }

    function _resolveResult(success, result) {
        try {
            success && success(result);
        } catch (e) {
            var message = "回调方法异常:" + e.message;
            _showMsgInfo(message);
        }
    }

    function _ajax(config) {
        var data = config.data || {};
        //data.agent = "ajax";
        // data._r_ = Math.random();
        var apiUrl = config.url.match(/^(([^:\/?#]+:)?(?:\/\/(([^\/?#:]*)(?::([^\/?#:]*))?)))?([^?#]*)(\?[^#]*)?(#.*)?$/);
        if (config.isOpenCors && window.location.host != apiUrl) {
            xhrFields = {withCredentials: true};
        }
        var encodeData = config.isEncodeData ? _encodeData(data) : data;
        _showLoading(config.showLoading);
        var ajaxConfig = {
            dataType: "json",
            url: config.url,
            type: config.method,
            data: encodeData,
            headers: config.headers || {},
            xhrFields: xhrFields,
            //timeout: me.config.jsonpTimeout,
            success: function (r) {
                _hideLoading();
                _processResult(r, config.success, config.fail);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                _hideLoading();
                if (typeof config.fail === 'function') {
                    config.fail(jqXHR.responseText);
                }
                if (me.config.redirectToErrorView) {
                    me.config.redirectToErrorView(jqXHR.status);
                }
            }
        };
        // if contentType is 'json', which is defined in header, it should set contentType property as 'application/json', too.
        if (config.headers && config.headers["Content-Type"] && config.headers["Content-Type"].indexOf('application/json')>-1 ){
            $.extend(ajaxConfig, {contentType: "application/json; charset=UTF-8"});
        }
        return $.ajax(ajaxConfig);
    }

    function _encodeData(data) {
        if (data == null) {
            return "";
        }

        var isNoString = !(typeof data === 'string');
        var jsonData = isNoString ? JSON.stringify(data) : data;
        var encodeData = jsonData.toString().replace(/[<>]/g, function (m) {
            switch (m) {
                case "<":
                    return "&lt;";
                case ">":
                    return "&gt;";
                default:
                    break;
            }
        });

        if (isNoString) {
            return JSON.parse(encodeData);
        }
        return encodeData;
    }

    function _redirectLoginView() {
        if (me.config.login.url) {
            var baseUrl = window.location.origin || (window.location.protocol + "//" + window.location.host);
            var loginUrl = _urlCombine(baseUrl, me.config.login.url);

            if (window.location.hash.length > 0) {
                var _path = !!_parseUrlString(loginUrl, "search") ? "&_referrer=" : "?_referrer=";
                loginUrl += _path + encodeURIComponent(window.location.href);
            }
            me.config.login.target.location = loginUrl;
        } else {
            _showMsgInfo("用户未登陆");
        }
    }

    function _urlCombine(url, route) {
        if (route == null) {
            return url;
        }
        if (route.indexOf('://') > 0) {
            return route;
        }
        if (route.charAt(0) == '/') {
            var start = url.indexOf("://") + 3;
            var length = url.substring(start).indexOf("/");
            if (length > 0) {
                var domain = url.substring(0, start + length);
                return domain + route;
            }
            return url + route;
        }
        if (url.slice(-1) != '/') {
            return url + "/" + route;
        }
        return url + route;
    }

    function _queryString(name) {
        var rex = new RegExp("[?&]\s*" + name + "\s*=([^&$#]*)", "i");
        var r = rex.exec(location.search);

        if (r && r.length == 2) {
            return decodeURIComponent(r[1]);
        }
    }

    function _parseUrlString(urlStr, type) {
        var url = $('<a>', {
            href: url
        });
        return url.prop(type);
    }

    function _ajaxSetup() {
        $.ajaxSetup({
            cache: !debugMode,
            traditional: true,
            error: function (jqXHR, textStatus, errorThrown) {
                if (jqXHR.status == 401) {
                    eval(jqXHR.responseText);
                    return;
                }
                if (textStatus == "timeout") {
                    $.messager.showReqErr("系统正忙,请稍后再试...");
                }
                else if (jqXHR.responseText == "top.location='/Home/Login'") {
                    $.messager.showReqErr("登录超时，请重新登录。", function () {
                        eval(jqXHR.responseText);
                    });
                }
            }
        });
    }

    function _handleErrorResponse(fail, result) {
        if (typeof fail === 'function') {
            fail(result);
        } else {
            _showMsgInfo(result.Message || "暂无数据，请重试！");
        }
    }

    function _showLoading(showLoading) {
        if (showLoading && me.config.loading && me.config.loading.show) {
            me.config.loading.show.call(me.config.loading.scope);
        }
    }

    function _hideLoading() {
        if (me.config.loading && me.config.loading.hide) {
            me.config.loading.hide.call(me.config.loading.scope);
        }
    }

    function _showMsgInfo(msg) {
        if (me.config.msgInfo && me.config.msgInfo.show) {
            me.config.msgInfo.show.call(me.config.msgInfo.scope, msg);
        }
    }

    function _validateAjaxArgs(url, config) {
        if (typeof url !== 'string') {
            throw Error('Url must be a string!');
        }
        if (typeof config !== 'object') {
            throw Error('Config must be a object!');
        }
        config.showLoading = config.showLoading != null ? config.showLoading : true;
        config.isOpenCors = config.isOpenCors != null ? config.isOpenCors : true;
        config.isEncodeData = config.isEncodeData != null ? config.isEncodeData : true;
    }

    /*----------------------------------public functions------------------------------------*/
    var get = function (url, config) {
        _validateAjaxArgs(url, config);
        config.url = url;
        config.method = 'GET';
        return _ajax(config);
    };

    var post = function (url, config) {
        _validateAjaxArgs(url, config);
        config.url = url;
        config.method = 'POST';
        return _ajax(config);
    };

    var deleteImp = function (url, config) {
        _validateAjaxArgs(url, config);
        config.url = url;
        config.method = 'DELETE';
        return _ajax(config);
    };

    var put = function (url, config) {
        _validateAjaxArgs(url, config);
        config.url = url;
        config.method = 'PUT';
        return _ajax(config);
    };


    var jsonp = function (url, config) {
        _validateAjaxArgs(url, config);

        var data = config.data || {};
        data.agent = "jsonp";
        data.uk || (data.uk = _queryString("uk"));

        _showLoading(config.showLoading);
        var result = $.ajax({
            dataType: "jsonp",
            url: url,
            type: "GET",
            data: config.data,
            crossDomain: true,
            timeout: me.config.jsonpTimeout,
            success: function (result) {
                if (result.isTimeout == null) {
                    _hideLoading();
                    _processResult(result, config.success, config.fail);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                _hideLoading();
                if (typeof config.fail === 'function') {
                    config.fail(data);
                }
                if (me.config.redirectToErrorView) {
                    me.config.redirectToErrorView(jqXHR.status);
                }
            }
        });
    };

    /**
     * Config object format is {showLoading:function, hideLoading:function, scope: obj}
     * @param config
     */
    function configLoading(config) {
        if (typeof config !== 'object' && typeof config.showLoading !== 'function' && typeof config.hideLoading !== 'function') {
            throw Error("config must be a object, which has parameters 'showLoading' and 'hideLoading', both should be function type!");
        }
        me.config.loading = {};
        me.config.loading.show = config.showLoading;
        me.config.loading.hide = config.hideLoading;
        me.config.loading.scope = config.scope || window;
    }

    /**
     * Config object format is {showMsgInfo:function, scope:obj}
     * @param config
     */
    function configMsg(config) {
        if (typeof config !== 'object' && typeof config.showMsgInfo !== 'function') {
            throw Error("config must be a object, which has parameters 'showMsgInfo', should be function type!");
        }
        me.config.msgInfo = {};
        me.config.msgInfo.show = config.showMsgInfo;
        me.config.msgInfo.scope = config.scope || window;
    }

    function redirectToLogin(func) {
        if (typeof func !== 'function') {
            throw Error("directToLogin must be a function object.");
        }
        me.config.redirectToLogin = func;
    }

    function redirectToErrorView(func){
        if (typeof func !== 'function') {
            throw Error("redirectToErrorView must be a function object.");
        }
        me.config.redirectToErrorView = func;
    }

    _ajaxSetup();
    return {
        /*
         * Url must a none empty string.
         * Config should be a object and format as below:
         *
         * @param url: 请求路径（全路径）
         * {
         *  @param data: 请求参数
         *  @param success: 成功回调
         *  @param fail: 失败回调
         *  @param headers: 自定义HTTP头信息
         *  @param showLoading: true/false (default value is true)
         * }
         */
        get: get,
        /*
         * Url must a none empty string.
         * config should be a object and format as below:
         *
         * @param url: 请求路径（全路径）
         * {
         *  @param data: 请求参数
         *  @param success: 成功回调
         *  @param fail: 失败回调
         *  @param headers: 自定义HTTP头信息
         *  @param showLoading: true/false (default value is true)
         * }
         */
        post: post,
        /*
         * Url must a none empty string.
         * config should be a object and format as below:
         *
         * @param url: 请求路径（全路径）
         * {
         *  @param data: 请求参数
         *  @param success: 成功回调
         *  @param fail: 失败回调
         *  @param headers: 自定义HTTP头信息
         *  @param showLoading: true/false (default value is true)
         * }
         */
        jsonp: jsonp,
        delete: deleteImp,
        put: put,
        configLoading: configLoading,
        configMsg: configMsg,
        redirectToLogin: redirectToLogin,
        redirectToErrorView: redirectToErrorView,
        hideLoading: _hideLoading
    };
}());