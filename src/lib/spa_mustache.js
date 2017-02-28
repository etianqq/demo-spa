/**
 * Help for mustache-js
 *
 * mustache.js - Logic-less {{mustache}} templates with JavaScript
 *
 * Github: https://github.com/janl/mustache.js
 * @type {{renderHtmlTemplate, renderHtmlScript, clearTemplateCache}}
 */
var spa_mustache = (function () {
    var templateFileCache = {};

    function _html_module(url, callback) {
        if (templateFileCache[url] != null) {
            callback(templateFileCache[url]);
            return;
        }
        $.ajax({
            url: url,
            type: "get",
            success: function (data) {
                if (typeof callback == 'function') {
                    templateFileCache[url] = data;
                    callback(data);
                }
            },
            error: function (e) {
                console.log(e);
            }
        })
    }

    function _renderTemplateWithPartialsData(partialsData, callback) {
        if (partialsData.templateUrl) {
            _html_module(partialsData.templateUrl, function (templateStr) {
                callback(templateStr);
            });
        }
        else if (partialsData.template) {
            callback(partialsData.template)
        }
    }


    function _renderTemplate(config) {
        var elt;
        // if config.id is a string
        if (typeof config.id === 'string'){
            elt = $('#' + config.id);
        }
        // if config.id is a jquery selector object
        else if (typeof config.id === 'object'){
            elt = config.id;
        }
        var template = config.template;
        var data = config.data || {};
        var partialsData = config.partialsData;
        var callback = config.callback;
        if (typeof partialsData === 'object' && partialsData != null) {
            _renderTemplateWithPartialsData(partialsData, function (partialsTemplate) {
                var subData = {};
                subData[partialsData["context"]] = partialsTemplate;
                var rendered = Mustache.render(template, data, subData);
                _endRenderTemplate(elt, callback, rendered);
            });
        }
        else {
            var rendered = Mustache.render(template, data);
            _endRenderTemplate(elt, callback, rendered);
        }
    }

    function _endRenderTemplate(elt, callback, rendered) {
        if (elt != null) {
            elt.html(rendered);
        }
        if (typeof callback === 'function') {
            callback(rendered);
        }
    }

    /*------------------------public functions--------------------------*/

    function renderHtmlTemplate(config) {
        _html_module(config.templateUrl, function (template) {
            config.template = template;
            _renderTemplate(config);
        });
    }

    function renderHtmlScript(config) {
        config.template = $('#' + config.templateId).html();
        _renderTemplate(config);
    }

    function clearTemplateCache() {
        for (var key in templateFileCache) {
            if (templateFileCache.hasOwnProperty(key)) {
                delete templateFileCache[key];
            }
        }
    }

    return {
        /**
         * @params {Object}:config
         *
         * id {String/jquery selector Object}: it will be filled with the rendered html
         * templateUrl {String}: the url link which template file is kept
         * data {Object}: the actual data, which is bind to template file
         * partialsData {Object}: nested template data, format as:
         * {
         * context: include context name in parent template
         * templateUrl: html link or...
         * template: template string
         * }
         * callback {Function}: run callback after rendering template
         *
         *
         * eg: tops_mustache.renderHtmlTemplate({id:'js-render-table', templateUrl:'template/template_table.html', data:data});
         * or
         * var partialsData = {context: 'outerContent', templateUrl: 'template/template_list.html'};
         * tops_mustache.renderHtmlTemplate({id='js-render-table', templateUrl:'template/template_table.html', data:data, partialsData:partialsData});
         */
        renderHtmlTemplate: renderHtmlTemplate,
        /**
         * @params:[element, templateElement, data, partialsData]
         *
         * id {String /jquery selector Object}: it will be filled with the rendered html
         * templateId: the template element will be bind to data
         * data {Object}: the actual data, which is bind to template file
         * partialsData {Object}: nested template data, format as:
         * {
         * context: include context name in parent template
         * templateUrl: html link or...
         * template: template string
         * }
         *
         * eg:tops_mustache.renderHtmlScript({id:'js-render-list', templateId:'list-template', data:data});
         * or
         * var partialsData = {context: 'content', template: $('#list-template').html()};
         * tops_mustache.renderHtmlScript({id:'js-render-list', templateId:'list-template', data:data, partialsData:partialsData});
         */
        renderHtmlScript: renderHtmlScript,
        /**
         * Clear template cache object
         */
        clearTemplateCache: clearTemplateCache
    }
}());