package com.activiti6.editor.controller;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import org.activiti.engine.ActivitiException;
import org.apache.commons.io.IOUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.util.*;

import static com.activiti6.utils.HttpClientHelper.postJSON;

/**
 * 从知识图谱中获取资源信息
 * FigoHu 2019年11月1日
 */
// 知识图谱提供的接口：
// 1. 查询所有资源实体的子类：如设备类的子类——咖啡机、体重秤等。
// 返回资源的名称(name)、能力（service）、事件（event）、类（class）、输入输出（input/output）和对外附能（passiveService）
// 返回格式：[{"name":"coffeeMaker","class":"Device","service":"make_coffee","event":"making_coffee_completed",...},{...}]
@RestController
@RequestMapping("service")
public class ModelGetResourcesFromKG {
    final String filePath = "/root/activiti/hct_Ontology.ttl";
    @RequestMapping(value="/resources", method = RequestMethod.GET, produces = "application/json;charset=utf-8")
    @ResponseBody
    public String getResources() throws UnsupportedEncodingException {

        JSONArray resourceList = getResourceList();

//        String retnStr = getResourceType("Eleme");
//
//        System.out.println(resList.toString());
//        System.out.println(retnStr);

//        JSONArray resourceToFunctionType = JSON.parseArray("[{\"name\":\"设备\",\"type\":\"PhysicalAction\"},{\"name\":\"机器人\",\"type\":\"PhysicalAction\"}]");
//
//        InputStream stencilsetStream = this.getClass().getClassLoader().getResourceAsStream("stencilset.json");
//

        InputStream resourceStream = new ByteArrayInputStream(resourceList.toString().getBytes("utf-8"));

        try {
            return IOUtils.toString(resourceStream, "utf-8");
        } catch (Exception e) {
            throw new ActivitiException("Error while loading resources", e);
        }
    }

    private String getResourceFunc(String resName) {
        final String KGURL = "http://47.100.34.166:21910/KG201910/getResourceDetails";
        // String resName = "Eleme";
        String reqParam = "?resourceType="+resName+"&filePath="+filePath;
        String retn;
        JSONObject job;
        JSONArray retnJSON = new JSONArray();
        try{
            retn = postJSON( KGURL+reqParam,"");
        }catch (Exception e){
            e.printStackTrace();
            retn = "";
        }
        job = JSON.parseObject(retn);

        return "";
    }

    private JSONArray getResourceList() {
        final String KGURL = "http://www.cpss2019.fun:21910/KG201910/getResourceTypes";
        String reqParam = "?filePath="+filePath;
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
        JSONObject tmpJB = new JSONObject();
        for(String c : crt){
            retnJSON.add(JSON.parseObject("{\"name\":\""+c+"\",\"type\":\"CyberAction\"}"));
        }

        for(String p : prt){
            retnJSON.add(JSON.parseObject("{\"name\":\""+p+"\",\"type\":\"PhysicalAction\"}"));
        }

        return retnJSON;
    }

    private List<String> parseString(String str){
        // 将返回值中的"['foo1','foo2']"字符串转换成JSON格式{'foo1','foo2'}
        List<String> retnList = new ArrayList<>();

        String v   = str.substring(1, str.length()-1);
        String[] splitedStrs = v.split(", ");

        Collections.addAll(retnList,splitedStrs);

        return retnList;
    }
}
