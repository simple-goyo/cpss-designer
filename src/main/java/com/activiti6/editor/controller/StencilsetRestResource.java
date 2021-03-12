package com.activiti6.editor.controller;

import org.activiti.engine.ActivitiException;
import org.apache.commons.io.IOUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import springfox.documentation.annotations.ApiIgnore;

import java.io.InputStream;

import static com.activiti6.constant.StencilsetJson.STENCILSET_FILE_NAME;

/**
 * 获取编辑器组件及配置项信息
 * liuzhize 2019年3月7日下午3:33:28
 */
@RestController
@RequestMapping("service")
public class StencilsetRestResource {
  
/**
 * 获取流程json文件
 * @return
 */
  @ApiIgnore
  @RequestMapping(value="/editor/stencilset", method = RequestMethod.GET, produces = "application/json;charset=utf-8")
  @ResponseBody
  public String getStencilset() {
    InputStream stencilsetStream = this.getClass().getClassLoader().getResourceAsStream(STENCILSET_FILE_NAME);
    try {
      return IOUtils.toString(stencilsetStream, "utf-8");
    } catch (Exception e) {
      throw new ActivitiException("Error while loading stencil set", e);
    }
  }
}
