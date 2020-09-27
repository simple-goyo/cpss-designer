package com.activiti6.service;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import org.activiti.engine.ActivitiException;
import org.apache.commons.io.IOUtils;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static com.activiti6.constant.UrlConstant.KG_URL;
import static com.activiti6.utils.HttpClientHelper.postJSON;

/**
 * @Auther FigoHu
 * @Date 2020/9/10
 */

public class KnowledgeGraphService {
    static final String filePath = "/home/k8s-node1/KG/data/hct_Ontology_20200810.ttl";

    public static List<String> parseString(String str){
        List<String> retnList = new ArrayList<>();
        if ( !str.isEmpty() && str.charAt(0) == '[') {
            // 将返回值中的"['foo1','foo2']"字符串转换成List格式['foo1','foo2']
            String v   = str.substring(1, str.length()-1);
            String[] splitedStrs = v.split(",");

            // [foo] -> ['foo']
            // [coffee finished] -> ["coffee finished"]
            // ['foo1','foo2'] -> ['foo1','foo2']
            if(splitedStrs.length == 1){
//                Collections.addAll(retnList, "\""+v+"\"");
                Collections.addAll(retnList, v);
            }else{
                Collections.addAll(retnList, splitedStrs);
            }

        }else{
            Collections.addAll(retnList, "\""+str+"\"");
        }
        return retnList;
    }

    // 获取所有的实体资源（类）
    // {"cyberResouceTypes":"[NeteaseNews, Eleme, Meituan, Keep, Orders, DZH]","physicalResouceTypes":"[CoffeeMaker, ElectricKettle, WaterDispenser, WeighingScale, AirCleaner]"}
    public static JSONArray getResourceList() {
        final String KGURL = KG_URL+"getResourceTypes";
        final String defaultLocation = "roomD2008_InterdisciplineBuilding2";
        String reqParam = "?location="+defaultLocation+"&filePath="+filePath;
        String retn;
        JSONArray retnJSON = new JSONArray();
        JSONObject job;
        try{
            retn = postJSON( KGURL+reqParam,"");
        }catch (Exception e){
            e.printStackTrace();
            retn = "";
        }

        // 建立JSONArray
        // retn = {"cyberResouceTypes":"[Keep, Eleme]","physicalResouceTypes":"[CoffeeMaker, ElectricKettle, WeighingScale, AirCleaner]"}

        job = JSON.parseObject(retn);

        List<String> crt = parseString(job.getString("cyberResouceTypes"));
        List<String> prt = parseString(job.getString("physicalResouceTypes"));

        // build JSONArray
        for(String c : crt){
            retnJSON.add(JSON.parseObject("{\"name\":"+c+",\"type\":\"CyberAction\"}"));
        }

        for(String p : prt){
            retnJSON.add(JSON.parseObject("{\"name\":"+p+",\"type\":\"PhysicalAction\"}"));
        }

        return retnJSON;
    }

    // 获取指定资源类型的能力、事件等信息
    public static String getResourceDetails(String resName){
        final String KGURL = KG_URL+"getResourceDetails";
        //String resName = "CoffeeMaker";
        String reqParam = "?resourceType="+resName+"&filePath="+filePath;
        String query;
        String retn;

        JSONObject job;
        JSONArray retnJSON = new JSONArray();

        /*
         *  众包worker的details暂时先写死，处理完直接返回
         * */
        //////////////////////////众包///////////////////////////////
        if( resName.length()>=6 && resName.toLowerCase().startsWith("worker")){

            retn = "{\"name\":\"CrowdSouring\",\"service\":[{\"output\":\"[]\",\"input\":[],\"inputParameter\":\"[]\",\"Capability\":\"get item\",\"outputParameter\":\"[]\"},{\"output\":\"[]\",\"input\":[],\"inputParameter\":\"[]\",\"Capability\":\"deliver item\",\"outputParameter\":\"[]\"}],\"event\":\"[]\",\"capability\":\"[]\",\"category\":\"[\\\"SocialEntity\\\"]\"}";
            InputStream resourceDetailsStream = new ByteArrayInputStream(retn.getBytes(StandardCharsets.UTF_8));

            try {
                return IOUtils.toString(resourceDetailsStream, "utf-8");
            } catch (Exception e) {
                throw new ActivitiException("Error while loading resources", e);
            }
        }
        //////////////////////////众包///////////////////////////////

        try{
            query = postJSON( KGURL+reqParam,"");
        }catch (Exception e){
            e.printStackTrace();
            query = "";
        }
        job = JSON.parseObject(query);

        // 返回参数是一个json格式的列表，有以下几个参数
        // resourceCapability——被执行某种动作的能力
        // resourceEvent——事件
        // resourceService——服务
        // resourceCategory——目录（CyberEntity）
        //List<String> resCap = parseString(job.getString("resourceCapability"));
//        JSONObject tmp = new JSONObject();
//        tmp.put("name", parseString(job.getString("resourceEvent")).get(0).replace("\"",""));
//        List<String> resEve = new ArrayList<String>();
//        resEve.add(tmp.toString());
        List<String> resEve = parseString(job.getString("resourceEvent"));
        JSONObject tmp = new JSONObject();


        List<String> resCat = parseString(job.getString("resourceCategory"));
        List<String> resServs = parseString(job.getString("resourceCapability"));


        // resourceService中有以下几个参数
        //   output——输出
        //   input——输入
        //   inputParameter——输入参数名称
        //   outputParameter——服务参数名称
        //   descrition——描述
        return "{\"name\":\""+resName+"\",\"service\":"+resServs.toString()+",\"event\":"+resEve.toString()+",\"category\":"+resCat.toString()+"}";
    }

    // 获取指定空间包含的物理、信息资源类型
    public static JSONArray getResourceByLocation(String Location){
        final String KGURL = KG_URL+"getResourceTypes";
        String reqParam = "?location="+Location+"&filePath="+filePath;
        String query;
        String retn;

        JSONObject job;
        JSONArray retnJSON = new JSONArray();

        try{
            query = postJSON( KGURL+reqParam,"");
        }catch (Exception e){
            e.printStackTrace();
            query = "";
        }

        job = JSON.parseObject(query);

        List<String> crt = parseString(job.getString("cyberResouceTypes"));
        List<String> prt = parseString(job.getString("physicalResouceTypes"));

        // build JSONArray
        for(String c : crt){
            retnJSON.add(JSON.parseObject("{\"name\":"+c+",\"type\":\"CyberAction\"}"));
        }

        for(String p : prt){
            retnJSON.add(JSON.parseObject("{\"name\":"+p+",\"type\":\"PhysicalAction\"}"));
        }

        return retnJSON;
    }

    // 获取指定空间包含的Property
    public static JSONObject getPropertyByLocation(String Location){
        final String KGURL = KG_URL+"getEnvProperties";
        String reqParam = "?location="+Location+"&filePath="+filePath;
        String query;
        String retn;

        JSONObject job;
        JSONArray retnJSON = new JSONArray();

        try{
            query = postJSON( KGURL+reqParam,"");
        }catch (Exception e){
            e.printStackTrace();
            query = "";
        }

        job = JSON.parseObject(query);
//        List<String> props = parseString(job.getString("properties"));
//        retnJSON.add(props);
        return job;
    }

    // 获取资源类型的能力类型
    public static JSONObject getCapabilityByResName(String resName){
        final String KGURL = KG_URL+"getResourceCapabilities";
        String reqParam = "?resourceType="+resName+"&filePath="+filePath;
        String query;
        String retn;

        JSONObject job;
        JSONArray retnJSON = new JSONArray();

        try{
            query = postJSON( KGURL+reqParam,"");
        }catch (Exception e){
            e.printStackTrace();
            query = "";
        }

        job = JSON.parseObject(query);
        return job;
    }

    // 根据实例名获取指定的属性值
    public static JSONObject getInstanceAttributes(List<String> attributes, String instanceName) throws UnsupportedEncodingException {
        final String KGURL = KG_URL+"getInstanceAttributes";
        String reqParam = "?attributes=" +  URLEncoder.encode(attributes.toString(),"utf-8") + "&instanceName=" + instanceName + "&filePath="+filePath;
        String query;
        String retn;
        JSONObject job;
        JSONArray retnJSON = new JSONArray();

        try{
            query = postJSON( KGURL+reqParam,"");
        }catch (Exception e){
            e.printStackTrace();
            query = "";
        }

        job = JSON.parseObject(query);
        return job;
    }

    // 根据位置获取所属的组织
    public static JSONObject getOrgByLocation(String Location){
        final String KGURL = KG_URL+"getEnvProperties";
        String reqParam = "?location="+Location+"&filePath="+filePath;
        String query;
        String retn;

        JSONObject job;
        JSONArray retnJSON = new JSONArray();

        try{
            query = postJSON( KGURL+reqParam,"");
        }catch (Exception e){
            e.printStackTrace();
            query = "";
        }

        job = JSON.parseObject(query);
        return job;
    }


    public static void main(String[] args) {
        //// 接口测试
        try{
//        getResourceByLocation("roomD2008_InterdisciplineBuilding2");
//        getPropertyByLocation("meeting_room_FudanSELab");
//        getCapabilityByResName("CoffeeMaker");
//        List<String> attri = Arrays.asList("\"inputParameter\"", "\"outputParameter\"", "\"accessAddress\"", "\"methodType\"");
//        getInstanceAttributes( attri, "makeCoffee_coffeeMaker_roomD2008");
//        getOrgByLocation("roomD2008_InterdisciplineBuilding2");
        String a = getResourceDetails("MeetingRoomMS");
        System.out.println(a);
        }catch (Exception e){
            e.printStackTrace();
        }
    }
}
