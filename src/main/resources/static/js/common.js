//获取参数
function getQueryVariable(variable)
{
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        if(pair[0] == variable){return pair[1];}
    }
    return("");
}

//显示错误提示
function showErrorMsg(errormsg) {

    var $tooltips = $("#js_tooltips");
    if ($tooltips.css('display') != 'none') return;

    // toptips的fixed, 如果有`animation`, `position: fixed`不生效
    $('.page.cell').removeClass('slideIn');

    $("#js_tooltips").html(errormsg);
    $tooltips.css('display', 'block');
    setTimeout(function () {
        $tooltips.css('display', 'none');
    }, 2000);

}

