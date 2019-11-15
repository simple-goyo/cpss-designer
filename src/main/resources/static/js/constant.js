var APP_BACK_END_IP = "www.cpss2019.fun";//142,148给前端返回IP地址
var APP_BACK_END_PORT = "5001";
var APP_BACK_END_SERVICE = {
    "GET_APP_INSTANCE" : "get_all_app_instance_introduction",
    "GET_APP_CLASS_BY_INSTANCE_ID" : "get_app_class_by_instance_id",
    "GET_APP_INSTANCE_ACTION_STATE_BY_INSTANCE_ID" : "get_app_instance_action_state_by_instance_id",
    "UPDATE_APP_SHOW_INSTANCE_ID" : "update_app_show_instance_id",
    "UPDATE_APP_SHOW_RESOURCE_ID" : "update_app_show_resource_id",
    "GET_APP_SHOW" : "get_app_show",
};

function getAppBackEndServiceURL(service) {
    var serviceURL =  "https://"+APP_BACK_END_IP+":"+APP_BACK_END_PORT+"/"+service;
    return serviceURL;
}