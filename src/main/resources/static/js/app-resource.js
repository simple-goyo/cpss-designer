
function  startGetAppInstance(){
    setInterval(function () {
        getAppInstance()
    }, 5000);
}

function getAppInstance() {
    var param = {};
    var url = getAppBackEndServiceURL(APP_BACK_END_SERVICE.GET_APP_INSTANCE)
    var res = $.post(url,
        param,
        function (data) //回调函数
        {
            $("#ongoing_service_list").empty();
            $.each(data.app_instance_introduction, function (i, item) {
                //显示应用进程
                $("#ongoing_service_list").append('<a class="weui-cell weui-cell_access weui-cell_example" id="' + item._id + '" onclick="getServiceWorkflow(this)">\n' +
                    '                <div class="weui-cell__hd"><img src="../img/' + item.user_id + '.png" alt="" style="width:20px;margin-right:16px;display:block"></div>\n' +
                    '                <div class="weui-cell__bd">\n' +
                    '                    <p>' + item.app_class.properties.name + '</p>\n' +
                    '                </div>\n' +
                    '                <div class="weui-cell__ft">' + item.create_time + '</div>\n' +
                    '            </a>');
                //找到应用相关资源
            });
        }, "json"
    )
}

function getServiceWorkflow(ob) {
    // var instanceId = ob.id;
    //更新要显示页面信息
    updateAppShowInstanceId("1", ob.id);
    //显示流程页面
    // var appName = $(ob).text();
    $("#ongoing_service_list").css("display", "none");
    $("#ongoing_service_workflow").css("display", "");
    // $("#app-instance-title").text(appName);
    //获取流程
    startWorkflow(instanceId);
}

function updateAppShowInstanceId(userId, instanceId) {
    var param = {
        "user_id": userId,
        "instance_id": instanceId,
    };
    var url = getAppBackEndServiceURL(APP_BACK_END_SERVICE.UPDATE_APP_SHOW_INSTANCE_ID)
    $.post(url, param)
}