var $kk = $kk || {};

$kk.bindData = function (dom) {
    var $scope = $kk.$scope;

    function getLoopData(src, arr, scope, isRoot, isDecode) {
        var l = 0, src = {};
        if (!isRoot) {
            arr = arr.slice(1);
        }
        while (l < arr.length) {
            if (arr[l] in scope || arr[l] in src) {
                if (l === arr.length - 1) {
                    try {
                        src = src[arr[l]].toString();
                    } catch (e) {
                        src = scope[arr[l]].toString();
                    }
                    break;
                }
                src = src[arr[l]] || scope[arr[l]];
                l++;
            } else {
                src = "";
                break;
            }
        }
        if (isDecode) {
            return $kk.decodeHTML(src);
        }
        return $kk.encodeHTML(src);
    }

    function getTemplateParent() {
        for (var i = 0; i < $(this).parents().length; i++) {
            if ($(this).parents().eq(i).attr("kk-template")) {
                return false;
            }
        }
        return true;
    }

    var $repeatArr = dom.find("[kk-repeat]").filter(function () {
        return $(this).attr("kk-template");
    });
    $repeatArr.each(function () {
        var arr = $(this).attr("kk-repeat").split("in");
        var scopeArr = $.trim(arr[1]).split(".");
        var tempScope = $scope[scopeArr[0]] || [];
        if (scopeArr.length > 1 && !jQuery.isEmptyObject(tempScope)) {
            var i = 1;
            while (i <= scopeArr.length) {
                if (i == scopeArr.length) {
                    break;
                }
                try {
                    tempScope = tempScope[scopeArr[i]];
                } catch (e) {
                    console.log(e);
                    tempScope = [];
                    break;
                }
                i++;
            }
        }

        if (tempScope.length) {
            tempScope[tempScope.length - 1].index = tempScope.length - 1;
            $(this).attr("index", tempScope.length - 1).find("[kk-bind],[kk-if],[kk-attr]").andSelf().data("kk-repeat-data", tempScope[tempScope.length - 1]);
            for (var i = 0; i < tempScope.length; i++) {
                var cloneDom = $(this).clone(true);
                cloneDom.removeAttr("kk-template").show();
                tempScope[i].index = i;
                $(this).before(cloneDom).prev().attr("index", i).find("[kk-bind],[kk-if],[kk-attr]").andSelf().data("kk-repeat-data", tempScope[i]);
            }
        }
        $(this).hide();
    });

    var $if = dom.find("[kk-if]").filter(getTemplateParent);
    $if.each(function () {
        var arr = $(this).attr("kk-if").split("=="), src = "";
        var scopeArr = $.trim(arr[0]).split(".");
        var repeatData = $(this).data("kk-repeat-data");
        if (scopeArr.length == 1) {
            src = $scope[$.trim(arr[0])];
        } else {
            if (repeatData) {
                try {
                    src = getLoopData(src, scopeArr, repeatData, false);
                } catch (e) {
                    src = getLoopData(src, scopeArr, $scope, true);
                }
            } else {
                src = getLoopData(src, scopeArr, $scope, true);
            }
        }
        if (src !== $.trim(arr[1]).substring(1, $.trim(arr[1]).length - 1)) {
            $(this).hide();
        } else {
            $(this).show();
        }
    });

    var $attr = dom.find("[kk-attr]").filter(getTemplateParent);
    $attr.each(function () {
        var attrArr = $(this).attr("kk-attr").split(",");
        for (var i = 0; i < attrArr.length; i++) {
            var tempJson = JSON.parse("{" + attrArr[i] + "}");
            for (var k in tempJson) {
                var arr = tempJson[k].split(".");
            }
            var src = "";
            var repeatData = $(this).data("kk-repeat-data");
            if (arr.length == 1) {
                src = $scope[arr[0]];
            } else {
                if (repeatData) {
                    try {
                        src = getLoopData(src, arr, repeatData, false, true);
                    } catch (e) {
                        src = getLoopData(src, arr, $scope, true, true);
                    }
                } else {
                    src = getLoopData(src, arr, $scope, true, true);
                }
            }
            if ($(this).attr("kk-replaceValue") == "true") {
                $(this).attr("kk-attr-" + k, src);
            } else {
                $(this).attr(k, src);
                $(this)[0][k] = src;//对于用户输入的value改变
            }
        }
    });

    var $bind = dom.find("[kk-bind]").filter(getTemplateParent);
    $bind.each(function () {
        var arr = $(this).attr("kk-bind").split(".");
        var src = "";
        var repeatData = $(this).data("kk-repeat-data");
        if (arr.length == 1) {
            src = $scope[arr[0]];
        } else {
            if (repeatData) {
                try {
                    src = getLoopData(src, arr, repeatData, false);
                } catch (e) {
                    src = getLoopData(src, arr, $scope, true);
                }
            } else {
                src = getLoopData(src, arr, $scope, true);
            }
        }
        if ($(this).attr("kk-replaceDom")) {
            $(this).html(src);
        } else {
            $(this).html(src).replaceWith($(this).html() || " ");
        }
    });
};

$kk.route = function (cf, wrapper, defaultHash) {
    var route = {
        config: null,
        flag: true,
        urlObj: {},
        $scope: {},
        $routeWapper: null,
        render: function (cf, wrapper) {
            var self = this;
            self.config = cf;
            self.$routeWapper = $(wrapper);
            //绑定change事件
            $(window).hashchange(function () {
                self.$scope = {};
                self.renderView();
            });

            //第一次带有#路由,或者不带
            if (!location.hash.length || (location.hash.length && self.flag)) {
                self.renderView();
            }
        },
        /*
         * @action 开始route的其实方法，主要是解析hash，分析路由
         */
        renderView: function () {
            var self = this;
            self.currentUrlObj = self.getNowHash();

            if (self.currentUrlObj.resolve) {
                self.currentUrlObj.resolve(self.$scope, self.jsonpComplete);
            }
            else {
                self.jsonpComplete();
            }
        },
        /*
         * @action 处理方法的起始方法
         */
        jsonpComplete: function (callback) {
            var self = route;
            $kk.$scope = self.$scope;
            self.removeGuideMsg();
            self.view(self.currentUrlObj, callback);
        },
        /*
         * @action 解析hash，获得路由
         */
        getNowHash: function () {
            var self = this;
            var hash = location.hash.split("?")[0],
                hashArray = hash.split("#"),
                hashText = hashArray[hashArray.length - 1] != '' ? "#" + hashArray[hashArray.length - 1] : (defaultHash || ''),
                currentUrlObj;


            self.config.some(function (urlObj) {
                if ((urlObj.url || urlObj.url == "") && self.pathRegExp(urlObj.url).regexp.test(hashText)) {
                    currentUrlObj = urlObj;
                    return true;
                }
                return false;
            });
            if (currentUrlObj === undefined) {
                console.log('it use the last route config item as default!');
                currentUrlObj = self.config[self.config.length - 1];
            }
            return currentUrlObj;
        },

        /*
         * @action 匹配路由
         */
        pathRegExp: function (path) {
            var self = this;
            var insensitive = false,
                ret = {
                    originalPath: path,
                    regexp: path
                },
                keys = ret.keys = [];

            path = path.replace(/([().])/g, '\\$1').replace(/(\/)?:(\w+)([\?\*])?/g, function (_, slash, key, option) {
                var optional = option === '?' ? option : null;
                var star = option === '*' ? option : null;

                keys.push({name: key, optional: !!optional});
                slash = slash || '';

                return ''
                    + (optional ? '' : slash)
                    + '(?:'
                    + (optional ? slash : '')
                    + (star && '(.+?)' || '([^/]+)')
                    + (optional || '')
                    + ')'
                    + (optional || '');
            }).replace(/([\/$\*])/g, '\\$1');

            ret.regexp = new RegExp('^' + path + '$', insensitive ? 'i' : '');

            return ret;
        },
        /*
         * @action处理背景
         */
        removeGuideMsg: function () {
            $(".guide_msg_bg").remove();
            $(".guide_msg_box").remove();
        },
        /*
         * @action 获得模板
         */
        view: function (nowhash, callback) {
            var self = this;

            $.ajax({
                url: nowhash.template,
                method: "get",
                async: true,
                success: function (data) {
                    self.success(data);
                    // run callback function if necessary
                    if (typeof callback === "function") {
                        callback();
                    }
                }
            })
        },
        /*
         * @action 根据模板和数据，整合出最终html页面
         */
        success: function (data) {
            var self = this;
            //将数据和模板进行绑定
            var html = self.drawData(data, self.$scope);

            var fdom = $(html);
            //即跟数据替换模板中的变量，生成最终的html
            $kk.bindData(fdom, self.$scope);

            self.$routeWapper.empty().append(fdom);
        },
        drawData: function (html, field) {
            function replace(scope) {
                var count = 0;

                for (var k in scope) {
                    if (k !== "isJsonpComplete") {
                        count++;
                    }
                }

                if (count == 0) {
                    return html;
                }

                html = html.replace(/\@![^!@@!]+\!@/g, function (a) {

                    var name = a.slice(2, -2);

                    if (name.indexOf(".") >= 0) {
                        var arr = name.split("."),
                            src = false,
                            l = 0;

                        while (l < arr.length) {

                            if ($.isNumeric(src[arr[l]]) || $.isNumeric(scope[arr[l]])) {
                                src = src[arr[l]].toString() || scope[arr[l]].toString();
                            } else {
                                src = src[arr[l]] || scope[arr[l]] || "";
                            }

                            l++;
                        }

                        return $kk.encodeHTML(src);
                    } else {
                        return $kk.encodeHTML(scope[name]);
                    }
                });
            }

            if ($.isArray(field)) {
                var chtml = "";

                for (var i = 0; i < field.length; i++) {
                    template = replace(field[i]);
                    chtml += html;
                }

                return chtml;
            }

            replace(field);
            return html;
        }
    };
    route.render(cf, wrapper);
};