package com.activiti6.editor.controller;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import org.activiti.engine.ActivitiException;
import org.apache.commons.io.IOUtils;
import org.springframework.web.bind.annotation.*;

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
// 返回{"name":Eleme, "service":"...", "event":"...","input":...,"output":... ,capability:...}
@RestController
@RequestMapping("service")
public class ModelGetResourcesFromKG {
    final String filePath = "/root/activiti/kg/hct_Ontology_latest.ttl";
    @RequestMapping(value="/resources", method = RequestMethod.GET, produces = "application/json;charset=utf-8")
    @ResponseBody
    public String getResources() throws UnsupportedEncodingException {
        // 返回resourceFunctions结构
        JSONArray resourceList = getResourceList();

        // 查询服务


        InputStream resourceStream = new ByteArrayInputStream(resourceList.toString().getBytes("utf-8"));

        try {
            return IOUtils.toString(resourceStream, "utf-8");
        } catch (Exception e) {
            throw new ActivitiException("Error while loading resources", e);
        }
    }

    @RequestMapping(value="/resource/{rid}/services", method = RequestMethod.GET, produces = "application/json;charset=utf-8")
    @ResponseBody
    public String getResourceServices(@PathVariable String rid){
        // String retnStr = getResourceType("Eleme");
        return "";
    }

    @RequestMapping(value="/resource/{rid}/events", method = RequestMethod.GET, produces = "application/json;charset=utf-8")
    @ResponseBody
    public String getResourceEvents(@PathVariable String rid){
        // String retnStr = getResourceType("Eleme");
        return "";
    }

    @RequestMapping(value="/resource/{rid}/capabilities", method = RequestMethod.GET, produces = "application/json;charset=utf-8")
    @ResponseBody
    public String getResourceCapabilities(@PathVariable String rid){
        // String retnStr = getResourceType("Eleme");
        return "";
    }

    @RequestMapping(value="{resName}/funcs", method = RequestMethod.GET, produces = "application/json;charset=utf-8")
    @ResponseBody
    public String getResourceFunc(@PathVariable String resName) {
        final String KGURL = "http://www.cpss2019.fun:21910/KG201910/getResourceDetails";
        //String resName = "CoffeeMaker";
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
        // resourceCapability
        // resourceEvent
        // resourceService —— output input name
        // resourceCategory

        List<String> resCap = parseString(job.getString("resourceCapability"));
        List<String> resEve = parseString(job.getString("resourceEvent"));
        List<String> resCat = parseString(job.getString("resourceCategory"));
        List<String> resServs = parseString(job.getString("resourceService"));
        JSONObject serv = new JSONObject();

//        for(String resServ:resServs){
//            serv = JSON.parseObject(resServ);
//            // serv = {"input":...,"output":...,"name":...}
//            String input = serv.getString("input");
//            String output = serv.getString("output");
//            String name = serv.getString("name");
//
//            // 建立结构
//            // {"name":Eleme, "service":"...", "event":"...","input":...,"output":... ,capability:...}
//            // retn = "{\"name\":\""+resName+"\",\"service\":\""+name+"\",\"event\":\""+resEve.get(0)+"\"，}";
//        }

        return "{\"name\":\""+resName+"\",\"service\":"+resServs.toString()+",\"event\":"+resEve.toString()+"，\"capability\":"+resCap.toString()+",\"category\":"+resCat.toString()+"}";
    }

    // 获取所有的实体资源（类）
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
        for(String c : crt){
            retnJSON.add(JSON.parseObject("{\"name\":\""+c+"\",\"type\":\"CyberAction\"}"));
        }

        for(String p : prt){
            retnJSON.add(JSON.parseObject("{\"name\":\""+p+"\",\"type\":\"PhysicalAction\"}"));
        }

        return retnJSON;
    }

    private List<String> parseString(String str){
        List<String> retnList = new ArrayList<>();
        if (str.substring(0, 1).equals("[")) {
            // 将返回值中的"['foo1','foo2']"字符串转换成JSON格式{'foo1','foo2'}
            String v   = str.substring(1, str.length()-1);
            String[] splitedStrs = v.split(", ");
            Collections.addAll(retnList, splitedStrs);
        }else{
            Collections.addAll(retnList, str);
        }
        return retnList;
    }
}
