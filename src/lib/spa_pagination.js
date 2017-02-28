(function ($, window) {
    function fillPager(selector, config) {
        var pager = selector;
        if (pager.length == 0) {
            return;
        }
        pager.empty();

        var totalCount = config.TotalCount; //总记录数
        var totalPageCount = Math.ceil(config.TotalCount / config.PageSize) || 1; //总分页数

        if (config.Type == 1) {
            var ul = $('<ul class="tops_page tops_page1"></ul>');
            var end = totalPageCount;
            var btns = [];
            if (config.PageNumber > 1) {
                ul.append($('<li class="page_off page_left" ></li>').addClass("page_hover").attr("gotopage", config.PageNumber - 1));
            }
            if (config.PageNumber >= 1 && end > 6) {
                if (config.PageNumber <= 3 && config.PageNumber <= end - 3) {
                    btns.push(1);
                    btns.push(2);
                    btns.push(3);
                    btns.push(4);
                    btns.push(5);
                    btns.push("...");
                    btns.push(end);//最后一页```````

                }
                if (config.PageNumber >= 4 && config.PageNumber <= end - 4) {
                    btns.push(1);
                    btns.push("...");
                    for (var i = -1; i < 3; i++) {
                        btns.push(config.PageNumber + i);
                    }
                    btns.push("...");
                    btns.push(end);//最后一页```````
                }
                if (config.PageNumber > end - 4 && config.PageNumber <= end) {
                    btns.push(1);
                    btns.push("...");
                    btns.push(end - 4);
                    btns.push(end - 3);
                    btns.push(end - 2);
                    btns.push(end - 1);
                    btns.push(end);
                }
            } else {
                for (var i = 1; i <= end; i++) {
                    btns.push(i);
                }
            }

            btns.forEach(function (btnText) {
                if (btnText === '...') {
                    ul.append($('<li class="page_off page_apostrophe">…</li>'));
                }
                else {
                    var elt = btnText == config.PageNumber ? '<li class="page_on"></li>' : '<li class="page_off"></li>';
                    ul.append($(elt).addClass("page_hover").text(btnText).attr("gotopage", btnText));
                }
            });

            if (config.PageNumber < end) {
                ul.append($('<li class="page_off page_right"></li>').addClass("page_hover").attr("gotopage", config.PageNumber + 1));
            }

            ul.append($('<li class="page_ic txtPageGoLi">转到 <input name="" type="text" class="txtPageGo form-control"/></li>')).find(".txtPageGo").val(config.PageNumber);

            ul.append($('<li class="page_last page_off">确定</li>'));

            ul.append($('<li class="page_ic" style="width:auto;">每页记录数 <select name="selectedPageSize" id="selectedPageSize">' +
                '<option value="10">10</option>' +
                '<option value="20">20</option>' +
                '<option value="30">30</option>' +
                '<option value="50">50</option>' +
                '<option value="100">100</option>' +
                '</select></li>'));
            var selectPageSize = ul.find("select[name='selectedPageSize']");
            selectPageSize.val(config.PageSize);
            selectPageSize.find("option[value=" + config.PageSize + "]").attr("selected", true);

            ul.on('click', "li[gotopage]", function () {
                var val = parseInt($(this).attr("gotopage"));
                if (isNaN(val) == false && val != config.PageNumber) {
                    runCallback(config, val, config.PageSize);
                }
            });

            ul.on('keyup', ".txtPageGo", function () {
                this.value = this.value.replace(/[^\d]/g, "");
                if (this.value === '0') {
                    this.value = this.value.replace(0, "");
                }
                var num = $(this).val();
                if (+num > end) {
                    $(this).val(end);
                }
            });

            ul.on('keypress', ".txtPageGo", function (e) {
                var ev = document.all ? window.event : e;
                if (ev.keyCode == 13) {
                    pageConfirm($(this).val());
                    $(this).blur();
                }
            });

            ul.on('click', '.page_last', function () {
                pageConfirm($('.txtPageGo').val());
            });

            selectPageSize.change(function () {
                var pageSize = $(this).find('option:selected').val();
                runCallback(config, 1, parseInt(pageSize));
            });

            function pageConfirm(valStr) {
                if (valStr.trim() === '') {
                    $('.txtPageGo').val(1);
                }
                var val = parseInt(valStr, 10) || 1;
                if (isNaN(val) == false && val != config.PageNumber) {
                    runCallback(config, val, config.PageSize);
                }
            }
        }
        else if (config.Type == 2) {
            var ul = $('<div class="tops_page tops_page2">');
            if (config.PageNumber == 1) {
                ul.append($('<a href="javascript:void(0)" class="page_left last"></a>'));
            } else {
                ul.append($('<a href="javascript:void(0)" class="page_left last"></a>').attr("gotopage", config.PageNumber - 1));
            }
            ul.append($('<span class="num">' + config.PageNumber + '</span>'));
            ul.append($('<span class="nu">/</span>'));
            ul.append($('<span class="num">' + totalPageCount + '</span>'));
            if (config.PageNumber == totalPageCount || totalCount == 0) {
                ul.append($('<a href="javascript:void(0)" class="page_right last"></a>'));
            } else {
                ul.append($('<a href="javascript:void(0)" class="page_right last"></a>').attr("gotopage", config.PageNumber + 1));
            }
            ul.find("[gotopage]").click(function () {
                var val = parseInt($(this).attr("gotopage"));
                if (isNaN(val) == false && val != config.PageNumber) {
                    runCallback(config, val, config.PageSize);
                }
            });

        }
        pager.append(ul);
    }

    function runCallback(config, val, pageSize) {
        if (config.scrollWrapperSelector) {
            var selector = config.scrollWrapperSelector;
            var wrapper;
            if (typeof selector == 'string') {
                wrapper = $('#' + selector);
            } else if (typeof selector == 'object') {
                wrapper = selector;
            }
            if (wrapper) {
                wrapper.animate({scrollTop: 0}, 500);
            }
        }
        config.Click(val, pageSize);
    }

    function getConfig(config, type) {
        if (config == null || config.TotalCount == null) {
            throw new Error("参数不足！");
        }
        if (parseInt(config.TotalCount) < 0) {
            throw new Error("TotalCount参数错误！");
        }
        if (config.Click && config.Click.constructor !== Function) {
            throw new Error("请设置回调参数Click！");
        }
        var defaultConfig = {
            Type: type, PageNumber: 1, PageSize: 20
        };

        return $.extend(defaultConfig, config);
    }

    /*
     * config:
     * TotalCount 数据总条数
     * PageNumber 当前页码
     * PageSize 页码容量
     * Callback: 回调函数
     * */
    $.fn.extend({
        tops_pagination_type1: function (config) {
            fillPager($(this), getConfig(config, 1));
        },
        tops_pagination_type2: function (config) {
            fillPager($(this), getConfig(config, 2));
        },
        tops_pagination_type3: function (config) {
            fillPager($(this), getConfig(config, 2));
        }
    })
}(jQuery, this));
//计算分页的显示
