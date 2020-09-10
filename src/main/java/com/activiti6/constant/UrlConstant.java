package com.activiti6.constant;


/**
 * <pre>
 *     author : shenbiao
 *     e-mail : 1105125966@qq.com
 *     time   : 2018/08/11
 *     desc   :
 *     version: 1.0
 * </pre>
 */
public class UrlConstant {

    /**
     * App后端url
     */
    public static final String APP_BACK_END_IP = "www.fudanse.club";//142,148给前端返回IP地址
    public static final String APP_BACK_END_PORT = "80/sc";

    public static String getAppBackEndServiceURL(String service) {
        String serviceURL = String.format("http://%s:%s/%s", APP_BACK_END_IP, APP_BACK_END_PORT, service);
        return serviceURL;
    }

    public static final String KG_URL = "http://106.15.102.123:21910/KG201910/";

}
