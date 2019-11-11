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

/**
 * 从知识图谱中获取资源信息
 * FigoHu 2019年11月1日
 */
@RestController
@RequestMapping("service")
public class ModelGetResourcesFromKG {
    @RequestMapping(value="/resources", method = RequestMethod.GET, produces = "application/json;charset=utf-8")
    @ResponseBody
    public String getResources() throws UnsupportedEncodingException {




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

}
