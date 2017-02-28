var config_route = [
    {
        url: "#mainPage",
        template: "template/mainPage.html",
        resolve: function ($scope, isComplete) {
            isComplete(function () {
                $.getScript("js_online/mainPage.js");
            });
        }
    },
    {
        url: "#accountManager",
        template: "template/accountManager.html",
        resolve: function ($scope, isComplete) {
            isComplete(function () {
                 $.getScript("js_online/accountManager.js");
            });
        }
    },
    {
        url: "#operationLog",
        template: "template/operationLog.html",
        resolve: function ($scope, isComplete) {
            isComplete(function () {
                 $.getScript("js_online/operationLog.js");
            });
        }
    },
    {
        url: "#orderManager",
        template: "template/orderManager.html",
        resolve: function ($scope, isComplete) {
            isComplete(function () {
                 $.getScript("js_online/orderManager.js");
            });
        }
    },
    {
        url: "#productManager",
        template: "template/productManager.html",
        resolve: function ($scope, isComplete) {
            isComplete(function () {
                 $.getScript("js_online/productManager.js");
            });
        }
    }
];
