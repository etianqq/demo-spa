$(function () {
    /*---------- config ajax -------------*/
    spa_ajax.redirectToLogin(function () {
        window.location.replace('/login.html');
    });

    /*---------- set routeWrapper height -------------*/
    resize();
    addResizeEvent();

    function addResizeEvent() {
        var timer;
        $(window).resize(function () {
            clearTimeout(timer);
            timer = setTimeout(function () {
                resize();
            }, 100)
        });
    }

    function resize() {
        var height = $(window).height();
        $('#menu-bar').height(height - 55);
        $('#routeWrapper').height(height - 55);
    }

    /*---------- config route -------------*/
    $kk.route(config_route, '#routeWrapper', '#mainPage');
});