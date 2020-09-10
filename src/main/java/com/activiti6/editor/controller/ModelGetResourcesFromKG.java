package com.activiti6.editor.controller;

import com.activiti6.service.KnowledgeGraphService;
import com.alibaba.fastjson.JSONArray;
import org.activiti.engine.ActivitiException;
import org.apache.commons.io.IOUtils;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;

import static com.activiti6.service.KnowledgeGraphService.*;

/**
 * 从知识图谱中获取资源信息
 * FigoHu 2019年11月1日
 */

// 该模块提供的接口
// 查询所有资源实体的子类：如设备类的子类——咖啡机、体重秤等。
// 返回资源的名称(name)、能力（service）、事件（event）、类（class）、输入输出（input/output）和对外附能（passiveService）
// 返回{"name":Eleme, "service":"...", "event":"...","input":...,"output":... ,capability:...}

// 知识图谱一共两个接口
// 1.getResourceDetails
// 接口功能：查询实体资源的详细信息
// 请求地址：http://www.cpss2019.fun:21910/KG201910/getResourceDetails
// 请求方式：POST
// 参数：(1)filePath;(2)resourceType e.g."ElectricKettle"
// 返回值样例：
// {
//     "resourceCapability":"[boiled water be taken away]",
//     "resourceEvent":"[finish boiling water]",
//     "resourceService":[
//     {
//         "output":"[BoiledWater]",
//         "input":"[OnlineOrder]",
//         "name":"boiling water"
//     }],
//     "resourceCategory":"PhysicalEntity"
// }
//
// 2.getResourceTypes
// 接口功能：查询除工人外所有的实体资源
// 请求地址：http://www.cpss2019.fun:21910/KG201910/getResourceTypes
// 请求方式：POST
// 参数：(1)filePath
// 返回值样例：
//     {
//         "cyberResourceTypes":"[NeteaseNews, Eleme, Meituan, Keep, Orders, DZH]",
//         "physicalResourceTypes":"[CoffeeMaker, ElectricKettle, WaterDispenser,WeighingScale, AirCleaner]"
//     }

@RestController
@RequestMapping("service")
public class ModelGetResourcesFromKG {

    @RequestMapping(value="/resources", method = RequestMethod.GET, produces = "application/json;charset=utf-8")
    @ResponseBody
    public String getResources() throws UnsupportedEncodingException {
        // 返回resourceFunctions结构
        JSONArray resourceList = getResourceList();
//        String resourceFunctions = "[" +
//            "{\"name\": \"获取水杯\", \"type\": \"SocialAction\"}, " +
//            "{\"name\": \"获取咖啡\", \"type\": \"SocialAction\"}, " +
//            "{\"name\": \"递交物品\", \"type\": \"SocialAction\"}, " +
//            "{\"name\": \"制作咖啡\", \"type\": \"PhysicalAction\"}, " +
//            "{\"name\": \"点咖啡服务\", \"type\": \"CyberAction\"}, " +
//            "{\"name\": \"准备订单\", \"type\": \"PhysicalAction\"}, " +
//
//            "{\"name\": \"烧水\", \"type\": \"PhysicalAction\"}, " +
//            "{\"name\": \"开启空气净化\", \"type\": \"PhysicalAction\"}, " +
//            "{\"name\": \"获取当前空气状态\", \"type\": \"PhysicalAction\"}, " +
//            "{\"name\": \"获取体重数据\", \"type\": \"PhysicalAction\"}, " +
//            "{\"name\": \"播放语音通知\", \"type\": \"PhysicalAction\"}, " +
//
//            "{\"name\": \"获取头条新闻\", \"type\": \"CyberAction\"}, " +
//            "{\"name\": \"获取推荐菜\", \"type\": \"CyberAction\"}, " +
//            "{\"name\": \"获取股票列表\", \"type\": \"CyberAction\"}, " +
//            "{\"name\": \"播放锻炼视频\", \"type\": \"CyberAction\"}, " +
//            "{\"name\": \"线上就诊\", \"type\": \"CyberAction\"}, " +
//            "{\"name\": \"药品分配\", \"type\": \"PhysicalAction\"}, " +
//            "{\"name\": \"取药品\", \"type\": \"SocialAction\"}, " +
//            "{\"name\": \"送药品\", \"type\": \"SocialAction\"}, " +
//            "{\"name\": \"社区医生上门\", \"type\": \"SocialAction\"}, " +
//            "{\"name\": \"医生用药\", \"type\": \"SocialAction\"} " +
//        "]";


        // 查询服务
        InputStream resourceStream = new ByteArrayInputStream(resourceList.toString().getBytes(StandardCharsets.UTF_8));

        try {
            return IOUtils.toString(resourceStream, "utf-8");
        } catch (Exception e) {
            throw new ActivitiException("Error while loading resources", e);
        }
    }

    @RequestMapping(value="{resName}/funcs", method = RequestMethod.GET, produces = "application/json;charset=utf-8")
    @ResponseBody
    public String getResourceFunc(@PathVariable String resName) throws UnsupportedEncodingException {
        String retnList = getResourceDetails(resName);
        InputStream resourceDetailsStream = new ByteArrayInputStream(retnList.getBytes("utf-8"));

        try {
            return IOUtils.toString(resourceDetailsStream, "utf-8");
        } catch (Exception e) {
            throw new ActivitiException("Error while loading resources", e);
        }
    }

    @RequestMapping(value="loc/{locName}/funcs", method = RequestMethod.GET, produces = "application/json;charset=utf-8")
    @ResponseBody
    public String getResourceByLoc(@PathVariable String locName) throws UnsupportedEncodingException {
        JSONArray retnList = getResourceByLocation(locName);
        InputStream resourceDetailsStream = new ByteArrayInputStream(retnList.toString().getBytes("utf-8"));

        try {
            return IOUtils.toString(resourceDetailsStream, "utf-8");
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

    @RequestMapping(value="/resource/{rid}/property", method = RequestMethod.GET, produces = "application/json;charset=utf-8")
    @ResponseBody
    public String getPropertyByLocation(@PathVariable String loc){
        return "";
    }

}
