package com.activiti6.editor.controller;

import java.io.IOException;
import java.util.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.activiti.bpmn.model.BpmnModel;
import org.activiti.editor.constants.ModelDataJsonConstants;
import org.activiti.editor.language.json.converter.BpmnJsonConverter;
import org.activiti.engine.HistoryService;
import org.activiti.engine.RepositoryService;
import org.activiti.engine.RuntimeService;
import org.activiti.engine.impl.persistence.entity.ModelEntity;
import org.activiti.engine.impl.persistence.entity.ModelEntityImpl;
import org.activiti.engine.repository.Deployment;
import org.activiti.engine.repository.Model;
import org.activiti.engine.repository.ModelQuery;
import org.activiti.engine.runtime.ProcessInstance;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

/**
 * 流程控制器
 * liuzhize 2019年3月7日下午3:28:14
 */
@Controller
public class ModelerController{

    private static final Logger logger = LoggerFactory.getLogger(ModelerController.class);

    @Autowired
    private RepositoryService repositoryService;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private HistoryService historyService;
    @Autowired
    private RuntimeService runtimeService;

    
	@RequestMapping("index")
	public ModelAndView index(ModelAndView modelAndView) {
        modelAndView.setViewName("index");

		List<Model> list = new ArrayList<Model>();
		list = repositoryService.createModelQuery().list();

//        Collections.sort(list, new Comparator<ModelEntityImpl>() {
//        	@Override
//			public int compare(ModelEntity u1, ModelEntity u2) {
//        		int diff = Integer.parseInt(u1.getId()) - Integer.parseInt(u2.getId());
//        		if (diff > 0) {
//        			return 1;
//        		}else if (diff < 0) {
//        			return -1;
//        		}
//        		return 0;
//        	}
//        });

		modelAndView.addObject("modelList", list);
        modelAndView.addObject("modelSize", repositoryService.createModelQuery().list().size());
        return modelAndView;
	}
//
//	/**
//	 * 分页显示某个类别下的商品
//	 */
//	@RequestMapping(value = "/category/{urlName}/{page}",method = RequestMethod.GET)
//	public String listDealsOfDealCategory(@PathVariable String urlName, @PathVariable Integer page, Model model,
//										  HttpServletRequest request){
//		model.addAttribute("pagingDealList", pagingResult);
//		return "/deal/category";
//	}
	
    /**
     * 跳转编辑器页面
     * @return
     */
    @GetMapping("editor")
    public String editor(){
        return "modeler";
    }
    
    
    /**
     * 创建模型
     * @param response
     * @param name 模型名称
     * @param key 模型key
     */
    @RequestMapping("/create")
    public void create(HttpServletResponse response,String name,String key) throws IOException {
    	logger.info("创建模型入参name：{},key:{}",name,key);
        Model model = repositoryService.newModel();
        ObjectNode modelNode = objectMapper.createObjectNode();
        modelNode.put(ModelDataJsonConstants.MODEL_NAME, name);
        modelNode.put(ModelDataJsonConstants.MODEL_DESCRIPTION, "");
        modelNode.put(ModelDataJsonConstants.MODEL_REVISION, 1);
        model.setName(name);
        model.setKey(key);
        model.setMetaInfo(modelNode.toString());
        repositoryService.saveModel(model);
        createObjectNode(model.getId());
        response.sendRedirect("/editor?modelId="+ model.getId());
        logger.info("创建模型结束，返回模型ID：{}",model.getId());
    }
    
    /**
     * 创建模型时完善ModelEditorSource
     * @param modelId
     */
	@SuppressWarnings("deprecation")
	private void createObjectNode(String modelId){
    	 logger.info("创建模型完善ModelEditorSource入参模型ID：{}",modelId);
    	 ObjectNode editorNode = objectMapper.createObjectNode();
         editorNode.put("id", "canvas");
         editorNode.put("resourceId", "canvas");
         ObjectNode stencilSetNode = objectMapper.createObjectNode();
         stencilSetNode.put("namespace","http://b3mn.org/stencilset/bpmn2.0#");
         editorNode.put("stencilset", stencilSetNode);
         try {
			repositoryService.addModelEditorSource(modelId,editorNode.toString().getBytes("utf-8"));
		} catch (Exception e) {
			 logger.info("创建模型时完善ModelEditorSource服务异常：{}",e);
		}
        logger.info("创建模型完善ModelEditorSource结束");
    }
    
    /**
     * 发布流程
     * @param modelId 模型ID
     * @return
     */
    @ResponseBody
    @RequestMapping("/publish")
    public Object publish(String modelId){
    	logger.info("流程部署入参modelId：{}",modelId);
    	Map<String, String> map = new HashMap<String, String>();
		try {
			Model modelData = repositoryService.getModel(modelId);
	        byte[] bytes = repositoryService.getModelEditorSource(modelData.getId());
	        if (bytes == null) {
	        	logger.info("部署ID:{}的模型数据为空，请先设计流程并成功保存，再进行发布",modelId);
	        	map.put("code", "FAILURE");
	            return map;
	        }
			JsonNode modelNode = new ObjectMapper().readTree(bytes);
			BpmnModel model = new BpmnJsonConverter().convertToBpmnModel(modelNode);
	        Deployment deployment = repositoryService.createDeployment()
	        		.name(modelData.getName())
	        		.addBpmnModel(modelData.getKey()+".bpmn20.xml", model)
	        		.deploy();
	        modelData.setDeploymentId(deployment.getId());
	        repositoryService.saveModel(modelData);
	        map.put("code", "SUCCESS");
		} catch (Exception e) {
			logger.info("部署modelId:{}模型服务异常：{}",modelId,e);
			map.put("code", "FAILURE");
		}
		logger.info("流程部署出参map：{}",map);
        return map;
    }
    
    /**
     * 撤销流程定义
     * @param modelId 模型ID
     * @param result
     * @return
     */
    @ResponseBody
    @RequestMapping("/revokePublish")
    public Object revokePublish(String modelId){
    	logger.info("撤销发布流程入参modelId：{}",modelId);
    	Map<String, String> map = new HashMap<String, String>();
		Model modelData = repositoryService.getModel(modelId);
		if(null != modelData){
			try {
				/**
				 * 参数不加true:为普通删除，如果当前规则下有正在执行的流程，则抛异常 
				 * 参数加true:为级联删除,会删除和当前规则相关的所有信息，包括历史 
				 */
				repositoryService.deleteDeployment(modelData.getDeploymentId(),true);
				map.put("code", "SUCCESS");
			} catch (Exception e) {
				logger.error("撤销已部署流程服务异常：{}",e);
				map.put("code", "FAILURE");
			}
		}
		logger.info("撤销发布流程出参map：{}",map);
        return map;
    }
    
    /**
     * 删除流程实例
     * @param modelId 模型ID
     * @param result
     * @return
     */
    @ResponseBody
    @RequestMapping("/delete")
    public Object deleteProcessInstance(String modelId){
    	logger.info("删除流程实例入参modelId：{}",modelId);
    	Map<String, String> map = new HashMap<String, String>();
		Model modelData = repositoryService.getModel(modelId);
		if(null != modelData){
			try {
					repositoryService.deleteModel(modelId); // 之前缺少这行代码，导致删不掉模型

					ProcessInstance pi = runtimeService.createProcessInstanceQuery().processDefinitionKey(modelData.getKey()).singleResult();
					if(null != pi) {
					   runtimeService.deleteProcessInstance(pi.getId(), "");
					   historyService.deleteHistoricProcessInstance(pi.getId());
					}
					map.put("code", "SUCCESS");
			} catch (Exception e) {
				logger.error("删除流程实例服务异常：{}",e);
				map.put("code", "FAILURE");
			}
		}
		logger.info("删除流程实例出参map：{}",map);
        return map;
    }
}
