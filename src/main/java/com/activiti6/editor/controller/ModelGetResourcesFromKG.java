package com.activiti6.editor.controller;

import org.activiti.engine.ActivitiException;
import org.activiti.engine.impl.util.json.JSONArray;
import org.activiti.engine.impl.util.json.JSONObject;
import org.apache.commons.io.IOUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;

import static com.activiti6.utils.HttpClientHelper.postJSON;

/**
 * 从知识图谱中获取资源信息
 * FigoHu 2019年11月1日
 */
@RestController
@RequestMapping("service")
public class ModelGetResourcesFromKG {
    final String filePath = "/root/activiti/hct_Ontology.ttl";
    @RequestMapping(value="/resources", method = RequestMethod.GET, produces = "application/json;charset=utf-8")
    @ResponseBody
    public String getResources() throws UnsupportedEncodingException {
//        String resList = getResourceList();
//        String retnStr = getResourceType("Eleme");
//
//        System.out.println(resList.toString());
//        System.out.println(retnStr);

        JSONArray resourceToFunctionType = new JSONArray("[{\"name\":\"设备\",\"type\":\"PhysicalAction\"},{\"name\":\"机器人\",\"type\":\"PhysicalAction\"}]");

        InputStream stencilsetStream = this.getClass().getClassLoader().getResourceAsStream("stencilset.json");
//      从知识图谱中获取资源的动作（包括URI）以及参数值，如：咖啡机制作咖啡，参数为咖啡
        InputStream resourceStream = new ByteArrayInputStream(resourceToFunctionType.toString().getBytes("utf-8"));

        try {
            return IOUtils.toString(resourceStream, "utf-8");
        } catch (Exception e) {
            throw new ActivitiException("Error while loading resources", e);
        }
    }

    private String getResourceType(String resName) {
        final String KGURL = "http://47.100.34.166:21910/KG201910/getResourceDetails";
        // String resName = "Eleme";
        String reqParam = "?resourceType="+resName+"&filePath="+filePath;
        try{
            return postJSON( KGURL+reqParam,"");
        }catch (Exception e){
            e.printStackTrace();
        }
        return "";
    }

    private String getResourceList(){
        final String KGURL = "http://47.100.34.166:21910/KG201910/getResourceTypes";
        String reqParam = "?filePath="+filePath;
        String retn;
        JSONArray retnJSON = new JSONArray();
        try{
            retn = postJSON( KGURL+reqParam,"");
        }catch (Exception e){
            e.printStackTrace();
            retn = "";
        }

        // 建立JSONArray
        JSONObject ps = parseString(retn);
        JSONArray ja = new JSONArray();

        JSONArray cyberResources = ps.getJSONArray("cyberResourceTypes");
        JSONArray physicalResources = ps.getJSONArray("physicalResourceTypes");

//        for (String cyberResource : cyberResources) {
//            String job = "{\"name\":" + (String) cyberResource + ",\"type\":\"CyberAction\"}";
//            ja.put(job);
//        }
//
//        for (String physicalResource : physicalResources) {
//            String job = "{\"name\":" + (String) physicalResource + ",\"type\":\"PhysicalAction\"}";
//            ja.put(job);
//        }

        System.out.println(cyberResources);
        return retn;
        // return new JSONArray("[{\"name\":\"设备\",\"type\":\"PhysicalAction\"},{\"name\":\"机器人\",\"type\":\"PhysicalAction\"}]");
    }

    private JSONObject parseString(String str){
        // 将返回值中的"['foo1','foo2']"字符串转换成JSON格式{'foo1','foo2'}
        JSONObject jb= new JSONObject(str);
        // System.out.println(jb.toString());
        Iterator<String> it =jb.keys();
        while(it.hasNext()){
            String key = it.next();
            String val = jb.getString(key);
            String v   = val.substring(1, val.length()-2);

            String[] splitedStr = v.split(",");
//            System.out.println(splitedStr[0]);
            List<String> tmp=new ArrayList<>();
            Collections.addAll(tmp, splitedStr);
            jb.put(key, tmp);
        }

        return jb;
    }
}
