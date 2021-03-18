package com.activiti6.editor.controller;

import java.io.*;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiImplicitParam;
import io.swagger.annotations.ApiImplicitParams;
import io.swagger.annotations.ApiOperation;
import org.activiti.editor.constants.ModelDataJsonConstants;
import org.activiti.engine.ActivitiException;
import org.activiti.engine.RepositoryService;
import org.activiti.engine.repository.Model;
import org.apache.batik.transcoder.TranscoderInput;
import org.apache.batik.transcoder.TranscoderOutput;
import org.apache.batik.transcoder.image.PNGTranscoder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import static com.activiti6.constant.UrlConstant.PLATFORM_URL;
import static com.activiti6.utils.HttpClientHelper.httpsRequest;
import static com.activiti6.utils.HttpClientHelper.postJSON;

/**
 * 流程信息入库
 * liuzhize 2019年3月7日下午3:32:32
 */
@Api(tags = {"模型存储"})
@RestController
@RequestMapping("service")
public class ModelSaveRestResource implements ModelDataJsonConstants {
  
  protected static final Logger LOGGER = LoggerFactory.getLogger(ModelSaveRestResource.class);

  @Autowired
  private RepositoryService repositoryService;
  
  @Autowired
  private ObjectMapper objectMapper;
 
  /**
   * 保存流程
   * @param modelId 模型ID
   * @param name 流程模型名称
   * @param description
   * @param json_xml 流程文件
   * @param svg_xml 图片
   */
  /*
  *  json_xml {"resourceId":"527504","properties":{"process_id":"process","name":"activiti--test","documentation":""},"stencil":{"id":"BPMNDiagram"},"bounds":{"lowerRight":{"x":1000,"y":800},"upperLeft":{"x":0,"y":0}},"stencilset":{"url":"stencilsets/bpmn2.0/bpmn2.0.json","namespace":"http://b3mn.org/stencilset/bpmn2.0#"},"ssextensions":[],"scenes":[{"name":"是的","properties":{},"id":"sid-1ABBAF08-2074-4B2B-AC1E-5CD3163FFF9A","$$hashKey":"03F","childShapes":[{"resourceId":"sid-E73147CD-A1D2-4AD6-830D-142C02C85DF7","properties":{"overrideid":"sid-E73147CD-A1D2-4AD6-830D-142C02C85DF7","name":"","documentation":"","initiator":"","events":"","startevent":"","currentscene":""},"stencil":{"id":"StartNoneEvent"},"childShapes":[],"outgoing":[{"resourceId":"sid-39C76532-9209-4F33-9DFC-DBA89862453B"}],"bounds":{"lowerRight":{"x":75.0204918032787,"y":719.88},"upperLeft":{"x":45.020491803278695,"y":689.88}},"dockers":[]},{"resourceId":"sid-3F466CAE-C43E-4B8F-B8A4-A813F9A16A06","properties":{"overrideid":"sid-3F466CAE-C43E-4B8F-B8A4-A813F9A16A06","name":"","documentation":"","type":"入口节点","initiator":"","events":"","services":"","nodecondition":""},"stencil":{"id":"EntryPoint"},"childShapes":[],"outgoing":[{"resourceId":"sid-F58F4C1B-F537-4169-A376-02F4BDFAB798"}],"bounds":{"lowerRight":{"x":68.80184133196721,"y":293.34000000000003},"upperLeft":{"x":10.17081133196721,"y":251.34000000000003}},"dockers":[]},{"resourceId":"sid-638E37A0-C865-4331-A5F4-F51EB7E9B012","properties":{"overrideid":"sid-638E37A0-C865-4331-A5F4-F51EB7E9B012","name":"","documentation":"","type":"出口节点","initiator":"","events":"","services":"","nodecondition":""},"stencil":{"id":"ExitPoint"},"childShapes":[],"outgoing":[],"bounds":{"lowerRight":{"x":966.78356,"y":292.36394},"upperLeft":{"x":920,"y":252.31606000000002}},"dockers":[]},{"resourceId":"sid-4BCA02C4-9A5E-46C5-B5A7-E19070D9382E","properties":{"overrideid":"sid-4BCA02C4-9A5E-46C5-B5A7-E19070D9382E","name":"AirCleaner","documentation":"","type":"Device","ownedbywho":"","initiator":"","events":"","services":"","referenceentity":"","entityspecificproperties":""},"stencil":{"id":"Device"},"childShapes":[],"outgoing":[],"bounds":{"lowerRight":{"x":269.07597450000003,"y":319.000001},"upperLeft":{"x":234.9240255,"y":278.999999}},"dockers":[]},{"resourceId":"sid-F58F4C1B-F537-4169-A376-02F4BDFAB798","properties":{"overrideid":"sid-F58F4C1B-F537-4169-A376-02F4BDFAB798","name":"","documentation":""},"stencil":{"id":"MessageFlow"},"childShapes":[],"outgoing":[{"resourceId":"sid-4BCA02C4-9A5E-46C5-B5A7-E19070D9382E"}],"bounds":{"lowerRight":{"x":235.9131421129134,"y":293.4126169156998},"upperLeft":{"x":69.52975287474352,"y":271.69777264289405}},"dockers":[{"x":33.631029999999996,"y":17},{"x":13.15194900000003,"y":16}],"target":{"resourceId":"sid-4BCA02C4-9A5E-46C5-B5A7-E19070D9382E"}},{"resourceId":"sid-39C76532-9209-4F33-9DFC-DBA89862453B","properties":{"overrideid":"","name":"","documentation":"","conditionsequenceflow":"","condition":"","defaultflow":"false"},"stencil":{"id":"SequenceFlow"},"childShapes":[],"outgoing":[{"resourceId":"sid-F0E4DE0F-D4FC-4F7C-B2B0-15CDEB04A2BC"}],"bounds":{"lowerRight":{"x":119.1767418032787,"y":704.88},"upperLeft":{"x":75.6298668032787,"y":704.88}},"dockers":[{"x":15,"y":15},{"x":50,"y":40}],"target":{"resourceId":"sid-F0E4DE0F-D4FC-4F7C-B2B0-15CDEB04A2BC"}},{"resourceId":"sid-F0E4DE0F-D4FC-4F7C-B2B0-15CDEB04A2BC","properties":{"overrideid":"sid-F0E4DE0F-D4FC-4F7C-B2B0-15CDEB04A2BC","name":"TurnOn","actioninputstatus":{},"actionoutputstatus":[],"documentation":"","activityelement":{"id":"sid-4BCA02C4-9A5E-46C5-B5A7-E19070D9382E","name":"AirCleaner","type":"Device"},"input":"","output":"","animate_direction":"0","currentscene":"","resourceline":[{"from":"sid-3F466CAE-C43E-4B8F-B8A4-A813F9A16A06","fromBounds":{"a":{"x":10.17081133196721,"y":251.34000000000003},"b":{"x":68.80184133196721,"y":293.34000000000003}},"to":"sid-4BCA02C4-9A5E-46C5-B5A7-E19070D9382E","toBounds":{"_changedCallbacks":[null,null,null],"a":{"x":234.9240255,"y":278.999999},"b":{"x":269.07597450000003,"y":319.000001},"suspendChange":false,"changedWhileSuspend":false}}],"interactionline":"","traceableactions":"","type":"http://b3mn.org/stencilset/bpmn2.0#UndefinedAction","workertarget":""},"stencil":{"id":"PhysicalAction"},"childShapes":[],"outgoing":[],"bounds":{"lowerRight":{"x":220.0204918032787,"y":744.88},"upperLeft":{"x":120.0204918032787,"y":664.88}},"dockers":[]}],"lastHighlightedActionId":"sid-F0E4DE0F-D4FC-4F7C-B2B0-15CDEB04A2BC","lastselectionOverrideIds":["sid-F0E4DE0F-D4FC-4F7C-B2B0-15CDEB04A2BC"]}],"selectedSceneIndex":0,"scenesRelations":{"childShapes":[{"resourceId":"sid-1ABBAF08-2074-4B2B-AC1E-5CD3163FFF9A","properties":{"overrideid":"sid-1ABBAF08-2074-4B2B-AC1E-5CD3163FFF9A","name":"是的","type":"场景","documentation":"","initiator":"","events":"","currentscene":"","traceablescenes":""},"stencil":{"id":"scene"},"childShapes":[],"outgoing":[],"bounds":{"lowerRight":{"x":148.37297,"y":195.91199},"upperLeft":{"x":75,"y":124.08801}},"dockers":[]}]}}
  *  svg_xml <svg xmlns="http://www.w3.org/2000/svg" xmlns:oryx="http://oryx-editor.org" id="sid-F6C5A60A-CCF4-4A16-ADF5-A945FE6967C4" width="988" height="797.8400268554688" class="rootNodeClass" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svg="http://www.w3.org/2000/svg" style="height: 779px;"><defs><marker id="sid-F58F4C1B-F537-4169-A376-02F4BDFAB798start" oryx:optional="yes" oryx:enabled="yes" refX="5" refY="5" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" orient="auto">
	  		undefined
	  		<circle id="sid-F58F4C1B-F537-4169-A376-02F4BDFAB798arrowhead" cx="5" cy="5" r="5" fill="white" stroke="black"/>
	  	</marker><marker id="sid-F58F4C1B-F537-4169-A376-02F4BDFAB798end" refX="10" refY="5" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" orient="auto">
	  		<path id="sid-F58F4C1B-F537-4169-A376-02F4BDFAB798arrowhead2" d="M 0 0 L 10 5 L 0 10 L 0 0" fill="white" stroke="#585858"/>
	  	</marker><marker id="sid-39C76532-9209-4F33-9DFC-DBA89862453Bstart" refX="1" refY="5" markerUnits="userSpaceOnUse" markerWidth="17" markerHeight="11" orient="auto">
	  		undefined
			<path id="sid-39C76532-9209-4F33-9DFC-DBA89862453Bdefault" d="M 5 0 L 11 10" fill="white" stroke="#585858" stroke-width="1" display="none"/>
	  	</marker><marker id="sid-39C76532-9209-4F33-9DFC-DBA89862453Bend" refX="15" refY="6" markerUnits="userSpaceOnUse" markerWidth="15" markerHeight="12" orient="auto">
	  		<path id="sid-39C76532-9209-4F33-9DFC-DBA89862453Barrowhead" d="M 0 1 L 15 6 L 0 11z" fill="#585858" stroke="#585858" stroke-linejoin="round" stroke-width="2"/>
	  	</marker></defs><svg id="underlay-container" style="position: absolute; top: 5px; z-index: -1; display: block;"><rect x="31" y="4%" width="938" height="67%" rx="5" ry="5" class="canvasPart" visibility="visible" transform="translate(-6, -6.159999847412109)"/><line x1="31" y1="22%" x2="968" y2="22%" rx="3" ry="3" style="fill:#CECDCFFF;stroke-width:2;stroke-dasharray:5;stroke:#000000" visibility="visible"/><text font-size="18" x="36" y="27%" style="font-family: Times New Roman;">SocialPhysicalSpace</text><rect x="31" y="80%" width="938" height="20%" rx="5" ry="5" class="canvasPart" visibility="visible"/><text font-size="18" x="36" y="85%" style="font-family: Times New Roman;">InteractionSequence</text></svg><svg id="scenesRelationsShow" style="position: absolute; top: 5px; z-index: -1; display: none;"><rect x="31" y="4%" width="938" height="87%" rx="5" ry="5" class="canvasPart" visibility="visible"/><text font-size="18" x="36" y="9%" style="font-family: Times New Roman;">Scene-Association View</text></svg><g stroke="none" font-family="Verdana, sans-serif" font-size-adjust="none" font-style="normal" font-variant="normal" font-weight="normal" line-heigth="normal" font-size="10"><g class="stencils"><g class="me"/><g class="children"><g id="svg-sid-E73147CD-A1D2-4AD6-830D-142C02C85DF7"><g class="stencils" transform="translate(45.020491803278695, 689.88)"><g class="me"><g pointer-events="fill" id="sid-E73147CD-A1D2-4AD6-830D-142C02C85DF7" title="开始">
    <circle id="sid-E73147CD-A1D2-4AD6-830D-142C02C85DF7bg_frame" cx="15" cy="15" r="15" stroke="#585858" fill="#ffffff" stroke-width="1"/>
	<text font-size="11" id="sid-E73147CD-A1D2-4AD6-830D-142C02C85DF7text_name" x="15" y="32" oryx:align="top center" stroke="#373e48" stroke-width="0pt" letter-spacing="-0.01px" transform="rotate(0 15 32)" oryx:fontSize="11" text-anchor="middle"/>
  </g></g><g class="children" style="overflow:hidden"/><g class="edge"/></g><g class="controls"><g class="dockers"/><g class="magnets" transform="translate(45.020491803278695, 689.88)"><g pointer-events="all" display="none" transform="translate(7, 7)"><circle cx="8" cy="8" r="4" stroke="none" fill="red" fill-opacity="0.3"/></g></g></g></g><g id="svg-sid-3F466CAE-C43E-4B8F-B8A4-A813F9A16A06"><g class="stencils" transform="translate(10.17081133196721, 251.34000000000003)"><g class="me"><g stroke="null" id="sid-3F466CAE-C43E-4B8F-B8A4-A813F9A16A06" title="Entry">
  <title style="vector-effect: non-scaling-stroke;" stroke="null" id="sid-3F466CAE-C43E-4B8F-B8A4-A813F9A16A06_sid-3F466CAE-C43E-4B8F-B8A4-A813F9A16A06_4">Layer 1</title>
  <g stroke="null" id="sid-3F466CAE-C43E-4B8F-B8A4-A813F9A16A06svg_3">
    <rect stroke="null" fill="none" id="sid-3F466CAE-C43E-4B8F-B8A4-A813F9A16A06canvas_background" height="42" width="42" y="0" x="16.63103000000001"/>
   <path stroke="null" id="sid-3F466CAE-C43E-4B8F-B8A4-A813F9A16A06svg_1" p-id="10292" fill="#515151" d=" m37.590680000000006 1  c-10.97781 0 -19.95966 8.9646 -19.95966 19.92134  s8.98185 19.92134 19.95966 19.92134  s19.95966 -8.9646 19.95966 -19.92134  s-8.98185 -19.92134 -19.95966 -19.92134  z m0 37.51853  c-9.64717 0 -17.63103 -7.96854 -17.63103 -17.59719  s7.98386 -17.59719 17.63103 -17.59719  s17.63103 7.96854 17.63103 17.59719  s-7.98386 17.59719 -17.63103 17.59719  z"/>
   <path stroke="null" id="sid-3F466CAE-C43E-4B8F-B8A4-A813F9A16A06svg_2" p-id="10293" fill="#515151" d=" m37.09169000000001 11.4587  c-0.66532 -0.66404 -1.6633 -0.66404 -2.32863 0  s-0.66532 1.66011 0 2.32416  l7.15221 7.13848  l-7.15221 7.13848  c-0.66532 0.66404 -0.66532 1.66011 0 2.32416  c0.33266 0.33202 0.83165 0.49803 1.16431 0.49803  s0.83165 -0.16601 1.16431 -0.49803  l8.31652 -8.30056  c0.66532 -0.66404 0.66532 -1.66011 0 -2.32416  l-8.31652 -8.30056  z"/>
  </g>
 </g></g><g class="children" style="overflow:hidden"/><g class="edge"/></g><g class="controls"><g class="dockers"/><g class="magnets" transform="translate(10.17081133196721, 251.34000000000003)"><g pointer-events="all" display="none" transform="translate(25.631029999999996, 9)"><circle cx="8" cy="8" r="4" stroke="none" fill="red" fill-opacity="0.3"/></g></g></g></g><g id="svg-sid-638E37A0-C865-4331-A5F4-F51EB7E9B012"><g class="stencils" transform="translate(920, 252.31606000000002)"><g class="me"><g id="sid-638E37A0-C865-4331-A5F4-F51EB7E9B012" title="Exit">
  <title id="sid-638E37A0-C865-4331-A5F4-F51EB7E9B012_sid-638E37A0-C865-4331-A5F4-F51EB7E9B012_4">Layer 1</title>
  <path stroke="null" id="sid-638E37A0-C865-4331-A5F4-F51EB7E9B012svg_1" p-id="6723" d=" m26.88413000000004 -3.552713678800501e-15  c10.99001 0 19.89943 8.96516 19.89943 20.02394  s-8.90942 20.02394 -19.89943 20.02394  s-19.89943 -8.96516 -19.89943 -20.02394  s8.90942 -20.02394 19.89943 -20.02394  z m-5.92008 10.98202  c-1.06351 1.16584 -0.9209 2.92238 0.3195 3.92136  l7.73424 6.23857  l-7.73314 6.22522  c-1.2404 0.99897 -1.38522 2.7544 -0.32171 3.92136  c1.0613 1.16695 2.92964 1.30156 4.17114 0.3037  l9.04318 -7.28093  c0.17246 -0.13906 0.33387 -0.29035 0.48201 -0.45276  c1.59527 -1.74876 1.3808 -4.38302 -0.4798 -5.88259  l-9.04318 -7.29316  c-1.2404 -1.0012 -3.10873 -0.86659 -4.17225 0.30036  l0 -0.00111  z"/>
 </g></g><g class="children" style="overflow:hidden"/><g class="edge"/></g><g class="controls"><g class="dockers"/><g class="magnets" transform="translate(920, 252.31606000000002)"><g pointer-events="all" display="none" transform="translate(14.984699999999986, 7.9999999999999964)"><circle cx="8" cy="8" r="4" stroke="none" fill="red" fill-opacity="0.3"/></g></g></g></g><g id="svg-sid-4BCA02C4-9A5E-46C5-B5A7-E19070D9382E"><g class="stencils" transform="translate(234.9240255, 278.999999)"><g class="me"><g pointer-events="fill" id="sid-4BCA02C4-9A5E-46C5-B5A7-E19070D9382E" title="Device">
 <path id="sid-4BCA02C4-9A5E-46C5-B5A7-E19070D9382Epath1" d=" m16.792947000000016 20.909091999999998  l0 -1.818182  l2.075533 -1.454545  c0.188685 -0.181818 0.188685 -0.363636 0.188685 -0.545455  l-1.886848 -3.090909  c-0.188685 -0.181818 -0.37737 -0.363636 -0.566054 -0.181818  l-2.452903 0.727273  c-0.566054 -0.363636 -1.132109 -0.727273 -1.698163 -0.909091  l-0.37737 -2.363636  c0 -0.181818 -0.188685 -0.363636 -0.566054 -0.363636  l-3.773696 0  c-0.188685 0 -0.37737 0.181818 -0.566054 0.363636  l-0.37737 2.363636  c-0.566054 0.181818 -1.132109 0.545455 -1.698163 0.909091  l-2.452903 -0.909091  c-0.188685 0 -0.37737 0 -0.566054 0.181818  l-1.886848 3.090909  c-0.188685 0.181818 0 0.363636 0.188685 0.545455  l2.075533 1.454545  l0 1.818182  l-2.075533 1.454545  c-0.188685 0.363636 -0.188685 0.545455 -0.188685 0.727273  l1.886848 3.090909  c0.188685 0.181818 0.37737 0.363636 0.566054 0.181818  l2.641587 -0.727273  c0.566054 0.363636 1.132109 0.727273 1.698163 0.909091  l0.37737 2.363636  c-0.188685 0.181818 0.188685 0.363636 0.37737 0.363636  l3.773696 0  c0.188685 0 0.37737 -0.181818 0.566054 -0.363636  l0.37737 -2.363636  c0.566054 -0.181818 1.132109 -0.545455 1.698163 -0.909091  l2.452903 0.909091  c0.188685 0 0.37737 0 0.566054 -0.181818  l1.886848 -3.090909  c0.188685 -0.181818 0 -0.363636 -0.188685 -0.545455  l-2.075533 -1.636364  z m-7.170023 2.727273  c-2.075533 0 -3.773696 -1.636364 -3.773696 -3.636364  s1.698163 -3.636364 3.773696 -3.636364  s3.773696 1.636364 3.773696 3.636364  s-1.698163 3.636364 -3.773696 3.636364  z m20.755329 -23.636364  l-18.868481 0  c-2.075533 0 -3.773696 1.636364 -3.773696 3.636364  l0 5.454546  l3.773696 0  l0 -3.636364  l18.868481 0  l0 29.09091  l-18.868481 0  l0 -3.636364  l-3.773696 0  l0 5.454546  c0 2 1.698163 3.636364 3.773696 3.636364  l18.868481 0  c2.075533 0 3.773696 -1.636364 3.773696 -3.636364  l0 -32.727274  c0 -2 -1.698163 -3.636364 -3.773696 -3.636364  z" fill="#585858" stroke="none"/>

	<text font-size="11" id="sid-4BCA02C4-9A5E-46C5-B5A7-E19070D9382Etext_name" x="13" y="32" oryx:align="top center" stroke="#373e48" stroke-width="0pt" letter-spacing="-0.01px" transform="rotate(0 13 32)" oryx:fontSize="11" text-anchor="middle"><tspan dy="18" x="18" y="32">AirCleaner</tspan></text>
 </g></g><g class="children" style="overflow:hidden"/><g class="edge"/></g><g class="controls"><g class="dockers"/><g class="magnets" transform="translate(234.9240255, 278.999999)"><g pointer-events="all" display="none" transform="translate(5.151949000000014, 7.9999999999999964)"><circle cx="8" cy="8" r="4" stroke="none" fill="red" fill-opacity="0.3"/></g></g></g></g><g id="svg-sid-F0E4DE0F-D4FC-4F7C-B2B0-15CDEB04A2BC"><g class="stencils" transform="translate(120.0204918032787, 664.88)"><g class="me"><g pointer-events="fill" oryx:minimumSize="50 40" id="sid-F0E4DE0F-D4FC-4F7C-B2B0-15CDEB04A2BC" title="物理动作">
	<rect id="sid-F0E4DE0F-D4FC-4F7C-B2B0-15CDEB04A2BCtext_frame" oryx:anchors="bottom top right left" x="1" y="1" width="94" height="79" rx="10" ry="10" stroke="none" stroke-width="0" fill="none"/>
	<rect id="sid-F0E4DE0F-D4FC-4F7C-B2B0-15CDEB04A2BCbg_frame" oryx:resize="vertical horizontal" x="0" y="0" width="100" height="80" rx="10" ry="10" stroke="#bbbbbb" stroke-width="1" fill="#04FF8E"/>
		<text font-size="12" id="sid-F0E4DE0F-D4FC-4F7C-B2B0-15CDEB04A2BCtext_name" x="50" y="40" oryx:align="middle center" oryx:fittoelem="text_frame" stroke="#373e48" stroke-width="0pt" letter-spacing="-0.01px" transform="rotate(0 50 40)" oryx:fontSize="12" text-anchor="middle"><tspan x="50" y="40" dy="5">TurnOn</tspan></text>

	<g id="sid-F0E4DE0F-D4FC-4F7C-B2B0-15CDEB04A2BCPhysicalAction" transform="translate(3,3)">
	<path oryx:anchors="top left" style="fill:#72a7d0;stroke:none" d="M 8,1 7.5,2.875 c 0,0 -0.02438,0.250763 -0.40625,0.4375 C 7.05724,3.330353 7.04387,3.358818 7,3.375 6.6676654,3.4929791 6.3336971,3.6092802 6.03125,3.78125 6.02349,3.78566 6.007733,3.77681 6,3.78125 5.8811373,3.761018 5.8125,3.71875 5.8125,3.71875 l -1.6875,-1 -1.40625,1.4375 0.96875,1.65625 c 0,0 0.065705,0.068637 0.09375,0.1875 0.002,0.00849 -0.00169,0.022138 0,0.03125 C 3.6092802,6.3336971 3.4929791,6.6676654 3.375,7 3.3629836,7.0338489 3.3239228,7.0596246 3.3125,7.09375 3.125763,7.4756184 2.875,7.5 2.875,7.5 L 1,8 l 0,2 1.875,0.5 c 0,0 0.250763,0.02438 0.4375,0.40625 0.017853,0.03651 0.046318,0.04988 0.0625,0.09375 0.1129372,0.318132 0.2124732,0.646641 0.375,0.9375 -0.00302,0.215512 -0.09375,0.34375 -0.09375,0.34375 L 2.6875,13.9375 4.09375,15.34375 5.78125,14.375 c 0,0 0.1229911,-0.09744 0.34375,-0.09375 0.2720511,0.147787 0.5795915,0.23888 0.875,0.34375 0.033849,0.01202 0.059625,0.05108 0.09375,0.0625 C 7.4756199,14.874237 7.5,15.125 7.5,15.125 L 8,17 l 2,0 0.5,-1.875 c 0,0 0.02438,-0.250763 0.40625,-0.4375 0.03651,-0.01785 0.04988,-0.04632 0.09375,-0.0625 0.332335,-0.117979 0.666303,-0.23428 0.96875,-0.40625 0.177303,0.0173 0.28125,0.09375 0.28125,0.09375 l 1.65625,0.96875 1.40625,-1.40625 -0.96875,-1.65625 c 0,0 -0.07645,-0.103947 -0.09375,-0.28125 0.162527,-0.290859 0.262063,-0.619368 0.375,-0.9375 0.01618,-0.04387 0.04465,-0.05724 0.0625,-0.09375 C 14.874237,10.52438 15.125,10.5 15.125,10.5 L 17,10 17,8 15.125,7.5 c 0,0 -0.250763,-0.024382 -0.4375,-0.40625 C 14.669647,7.0572406 14.641181,7.0438697 14.625,7 14.55912,6.8144282 14.520616,6.6141566 14.4375,6.4375 c -0.224363,-0.4866 0,-0.71875 0,-0.71875 L 15.40625,4.0625 14,2.625 l -1.65625,1 c 0,0 -0.253337,0.1695664 -0.71875,-0.03125 l -0.03125,0 C 11.405359,3.5035185 11.198648,3.4455201 11,3.375 10.95613,3.3588185 10.942759,3.3303534 10.90625,3.3125 10.524382,3.125763 10.5,2.875 10.5,2.875 L 10,1 8,1 z m 1,5 c 1.656854,0 3,1.3431458 3,3 0,1.656854 -1.343146,3 -3,3 C 7.3431458,12 6,10.656854 6,9 6,7.3431458 7.3431458,6 9,6 z" id="sid-F0E4DE0F-D4FC-4F7C-B2B0-15CDEB04A2BC_sid-F0E4DE0F-D4FC-4F7C-B2B0-15CDEB04A2BC_17"/>
	</g>

	<g id="sid-F0E4DE0F-D4FC-4F7C-B2B0-15CDEB04A2BCparallel">
		<path oryx:anchors="bottom" fill="none" stroke="#bbbbbb" d="M46 70 v8 M50 70 v8 M54 70 v8" stroke-width="2" id="sid-F0E4DE0F-D4FC-4F7C-B2B0-15CDEB04A2BC_sid-F0E4DE0F-D4FC-4F7C-B2B0-15CDEB04A2BC_18"/>
	</g>

	<g id="sid-F0E4DE0F-D4FC-4F7C-B2B0-15CDEB04A2BCsequential">
		<path oryx:anchors="bottom" fill="none" stroke="#bbbbbb" stroke-width="2" d="M46,76h10M46,72h10 M46,68h10" id="sid-F0E4DE0F-D4FC-4F7C-B2B0-15CDEB04A2BC_sid-F0E4DE0F-D4FC-4F7C-B2B0-15CDEB04A2BC_19"/>
	</g>

	<g id="sid-F0E4DE0F-D4FC-4F7C-B2B0-15CDEB04A2BCcompensation">
		<path oryx:anchors="bottom" fill="none" stroke="#bbbbbb" d="M 62 74 L 66 70 L 66 78 L 62 74 L 62 70 L 58 74 L 62 78 L 62 74" stroke-width="1" id="sid-F0E4DE0F-D4FC-4F7C-B2B0-15CDEB04A2BC_sid-F0E4DE0F-D4FC-4F7C-B2B0-15CDEB04A2BC_20"/>
	</g>
  </g></g><g class="children" style="overflow:hidden"/><g class="edge"/></g><g class="controls"><g class="dockers"/><g class="magnets" transform="translate(120.0204918032787, 664.88)"><g pointer-events="all" display="none" transform="translate(-7, 12)"><circle cx="8" cy="8" r="4" stroke="none" fill="red" fill-opacity="0.3"/></g><g pointer-events="all" display="none" transform="translate(-7, 32)"><circle cx="8" cy="8" r="4" stroke="none" fill="red" fill-opacity="0.3"/></g><g pointer-events="all" display="none" transform="translate(-7, 52)"><circle cx="8" cy="8" r="4" stroke="none" fill="red" fill-opacity="0.3"/></g><g pointer-events="all" display="none" transform="translate(17, 71)"><circle cx="8" cy="8" r="4" stroke="none" fill="red" fill-opacity="0.3"/></g><g pointer-events="all" display="none" transform="translate(42, 71)"><circle cx="8" cy="8" r="4" stroke="none" fill="red" fill-opacity="0.3"/></g><g pointer-events="all" display="none" transform="translate(67, 71)"><circle cx="8" cy="8" r="4" stroke="none" fill="red" fill-opacity="0.3"/></g><g pointer-events="all" display="none" transform="translate(91, 12)"><circle cx="8" cy="8" r="4" stroke="none" fill="red" fill-opacity="0.3"/></g><g pointer-events="all" display="none" transform="translate(91, 32)"><circle cx="8" cy="8" r="4" stroke="none" fill="red" fill-opacity="0.3"/></g><g pointer-events="all" display="none" transform="translate(91, 52)"><circle cx="8" cy="8" r="4" stroke="none" fill="red" fill-opacity="0.3"/></g><g pointer-events="all" display="none" transform="translate(17, -7)"><circle cx="8" cy="8" r="4" stroke="none" fill="red" fill-opacity="0.3"/></g><g pointer-events="all" display="none" transform="translate(42, -7)"><circle cx="8" cy="8" r="4" stroke="none" fill="red" fill-opacity="0.3"/></g><g pointer-events="all" display="none" transform="translate(67, -7)"><circle cx="8" cy="8" r="4" stroke="none" fill="red" fill-opacity="0.3"/></g><g pointer-events="all" display="none" transform="translate(42, 32)"><circle cx="8" cy="8" r="4" stroke="none" fill="red" fill-opacity="0.3"/></g></g></g></g></g><g class="edge"><g id="svg-sid-F58F4C1B-F537-4169-A376-02F4BDFAB798"><g class="stencils"><g class="me"><g pointer-events="painted"><path id="sid-F58F4C1B-F537-4169-A376-02F4BDFAB798_1" d="M69.52975287474352 271.69777264289405L235.9131421129134 293.4126169156998 " stroke="#585858" fill="none" stroke-width="2" stroke-dasharray="3, 4" marker-start="url(#sid-F58F4C1B-F537-4169-A376-02F4BDFAB798start)" marker-end="url(#sid-F58F4C1B-F537-4169-A376-02F4BDFAB798end)"/></g><text id="sid-F58F4C1B-F537-4169-A376-02F4BDFAB798text_name" x="152" y="274" oryx:edgePosition="midTop" stroke-width="0pt" letter-spacing="-0.01px" transform="rotate(7.435695635275636 152 282)" oryx:fontSize="10" text-anchor="middle"/></g><g class="children" style="overflow:hidden"/><g class="edge"/></g><g class="controls"><g class="dockers"/><g class="magnets"/></g></g><g id="svg-sid-39C76532-9209-4F33-9DFC-DBA89862453B"><g class="stencils"><g class="me"><g pointer-events="painted"><path id="sid-39C76532-9209-4F33-9DFC-DBA89862453B_1" d="M75.6298668032787 704.88L119.1767418032787 704.88 " stroke="#585858" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" marker-start="url(#sid-39C76532-9209-4F33-9DFC-DBA89862453Bstart)" marker-end="url(#sid-39C76532-9209-4F33-9DFC-DBA89862453Bend)"/></g><text id="sid-39C76532-9209-4F33-9DFC-DBA89862453Btext_name" x="83" y="696" oryx:edgePosition="startTop" stroke-width="0pt" letter-spacing="-0.01px" transform="rotate(360 75 704)" oryx:fontSize="10" text-anchor="start"/></g><g class="children" style="overflow:hidden"/><g class="edge"/></g><g class="controls"><g class="dockers"/><g class="magnets"/></g></g></g></g><g class="svgcontainer"><g display="none" transform="translate(116.0204918032787, 660.88)"><rect x="0" y="0" stroke-width="1" stroke="#777777" fill="none" stroke-dasharray="2,2" pointer-events="none" width="108" height="88"/></g><g display="none"><path stroke-width="1" stroke="silver" fill="none" stroke-dasharray="5,5" pointer-events="none" d="M80 0 L 80 800"/></g><g display="none"><path stroke-width="1" stroke="silver" fill="none" stroke-dasharray="5,5" pointer-events="none" d="M 0 160 L 1000 160"/></g><g><path stroke-width="2" fill="none" d="M-4 1 l0 -5 l5 0 M-4 799 l0 5 l5 0 M1004 799 l0 5 l-5 0 M1004 1 l0 -5 l-5 0 " stroke="#00FF00" stroke-opacity="1" display="none"/><path stroke-width="2" fill="none" d="M230.9240255 279.999999 l0 -5 l5 0 M230.9240255 318.000001 l0 5 l5 0 M273.07597450000003 318.000001 l0 5 l-5 0 M273.07597450000003 279.999999 l0 -5 l-5 0 " stroke="#00FF00" stroke-opacity="1" display="none"/></g></g></g></svg>
  * */

  @ApiOperation(value = "保存应用模型")
  @ApiImplicitParams({
      @ApiImplicitParam(name = "modelId", value="模型Id", dataType="int", paramType = "path", defaultValue="527504", required = true),
      @ApiImplicitParam(name = "json_xml", value = "建模工程的xml文档", dataType = "String", paramType = "query", required = true, defaultValue="{\"resourceId\":\"527504\",\"properties\":{\"process_id\":\"process\",\"name\":\"activiti--test\",\"documentation\":\"\"},\"stencil\":{\"id\":\"BPMNDiagram\"},\"bounds\":{\"lowerRight\":{\"x\":1000,\"y\":800},\"upperLeft\":{\"x\":0,\"y\":0}},\"stencilset\":{\"url\":\"stencilsets/bpmn2.0/bpmn2.0.json\",\"namespace\":\"http://b3mn.org/stencilset/bpmn2.0#\"},\"ssextensions\":[],\"scenes\":[{\"name\":\"是的\",\"properties\":{},\"id\":\"sid-1ABBAF08-2074-4B2B-AC1E-5CD3163FFF9A\",\"$$hashKey\":\"03F\",\"childShapes\":[{\"resourceId\":\"sid-E73147CD-A1D2-4AD6-830D-142C02C85DF7\",\"properties\":{\"overrideid\":\"sid-E73147CD-A1D2-4AD6-830D-142C02C85DF7\",\"name\":\"\",\"documentation\":\"\",\"initiator\":\"\",\"events\":\"\",\"startevent\":\"\",\"currentscene\":\"\"},\"stencil\":{\"id\":\"StartNoneEvent\"},\"childShapes\":[],\"outgoing\":[{\"resourceId\":\"sid-39C76532-9209-4F33-9DFC-DBA89862453B\"}],\"bounds\":{\"lowerRight\":{\"x\":75.0204918032787,\"y\":719.88},\"upperLeft\":{\"x\":45.020491803278695,\"y\":689.88}},\"dockers\":[]},{\"resourceId\":\"sid-3F466CAE-C43E-4B8F-B8A4-A813F9A16A06\",\"properties\":{\"overrideid\":\"sid-3F466CAE-C43E-4B8F-B8A4-A813F9A16A06\",\"name\":\"\",\"documentation\":\"\",\"type\":\"入口节点\",\"initiator\":\"\",\"events\":\"\",\"services\":\"\",\"nodecondition\":\"\"},\"stencil\":{\"id\":\"EntryPoint\"},\"childShapes\":[],\"outgoing\":[{\"resourceId\":\"sid-F58F4C1B-F537-4169-A376-02F4BDFAB798\"}],\"bounds\":{\"lowerRight\":{\"x\":68.80184133196721,\"y\":293.34000000000003},\"upperLeft\":{\"x\":10.17081133196721,\"y\":251.34000000000003}},\"dockers\":[]},{\"resourceId\":\"sid-638E37A0-C865-4331-A5F4-F51EB7E9B012\",\"properties\":{\"overrideid\":\"sid-638E37A0-C865-4331-A5F4-F51EB7E9B012\",\"name\":\"\",\"documentation\":\"\",\"type\":\"出口节点\",\"initiator\":\"\",\"events\":\"\",\"services\":\"\",\"nodecondition\":\"\"},\"stencil\":{\"id\":\"ExitPoint\"},\"childShapes\":[],\"outgoing\":[],\"bounds\":{\"lowerRight\":{\"x\":966.78356,\"y\":292.36394},\"upperLeft\":{\"x\":920,\"y\":252.31606000000002}},\"dockers\":[]},{\"resourceId\":\"sid-4BCA02C4-9A5E-46C5-B5A7-E19070D9382E\",\"properties\":{\"overrideid\":\"sid-4BCA02C4-9A5E-46C5-B5A7-E19070D9382E\",\"name\":\"AirCleaner\",\"documentation\":\"\",\"type\":\"Device\",\"ownedbywho\":\"\",\"initiator\":\"\",\"events\":\"\",\"services\":\"\",\"referenceentity\":\"\",\"entityspecificproperties\":\"\"},\"stencil\":{\"id\":\"Device\"},\"childShapes\":[],\"outgoing\":[],\"bounds\":{\"lowerRight\":{\"x\":269.07597450000003,\"y\":319.000001},\"upperLeft\":{\"x\":234.9240255,\"y\":278.999999}},\"dockers\":[]},{\"resourceId\":\"sid-F58F4C1B-F537-4169-A376-02F4BDFAB798\",\"properties\":{\"overrideid\":\"sid-F58F4C1B-F537-4169-A376-02F4BDFAB798\",\"name\":\"\",\"documentation\":\"\"},\"stencil\":{\"id\":\"MessageFlow\"},\"childShapes\":[],\"outgoing\":[{\"resourceId\":\"sid-4BCA02C4-9A5E-46C5-B5A7-E19070D9382E\"}],\"bounds\":{\"lowerRight\":{\"x\":235.9131421129134,\"y\":293.4126169156998},\"upperLeft\":{\"x\":69.52975287474352,\"y\":271.69777264289405}},\"dockers\":[{\"x\":33.631029999999996,\"y\":17},{\"x\":13.15194900000003,\"y\":16}],\"target\":{\"resourceId\":\"sid-4BCA02C4-9A5E-46C5-B5A7-E19070D9382E\"}},{\"resourceId\":\"sid-39C76532-9209-4F33-9DFC-DBA89862453B\",\"properties\":{\"overrideid\":\"\",\"name\":\"\",\"documentation\":\"\",\"conditionsequenceflow\":\"\",\"condition\":\"\",\"defaultflow\":\"false\"},\"stencil\":{\"id\":\"SequenceFlow\"},\"childShapes\":[],\"outgoing\":[{\"resourceId\":\"sid-F0E4DE0F-D4FC-4F7C-B2B0-15CDEB04A2BC\"}],\"bounds\":{\"lowerRight\":{\"x\":119.1767418032787,\"y\":704.88},\"upperLeft\":{\"x\":75.6298668032787,\"y\":704.88}},\"dockers\":[{\"x\":15,\"y\":15},{\"x\":50,\"y\":40}],\"target\":{\"resourceId\":\"sid-F0E4DE0F-D4FC-4F7C-B2B0-15CDEB04A2BC\"}},{\"resourceId\":\"sid-F0E4DE0F-D4FC-4F7C-B2B0-15CDEB04A2BC\",\"properties\":{\"overrideid\":\"sid-F0E4DE0F-D4FC-4F7C-B2B0-15CDEB04A2BC\",\"name\":\"TurnOn\",\"actioninputstatus\":{},\"actionoutputstatus\":[],\"documentation\":\"\",\"activityelement\":{\"id\":\"sid-4BCA02C4-9A5E-46C5-B5A7-E19070D9382E\",\"name\":\"AirCleaner\",\"type\":\"Device\"},\"input\":\"\",\"output\":\"\",\"animate_direction\":\"0\",\"currentscene\":\"\",\"resourceline\":[{\"from\":\"sid-3F466CAE-C43E-4B8F-B8A4-A813F9A16A06\",\"fromBounds\":{\"a\":{\"x\":10.17081133196721,\"y\":251.34000000000003},\"b\":{\"x\":68.80184133196721,\"y\":293.34000000000003}},\"to\":\"sid-4BCA02C4-9A5E-46C5-B5A7-E19070D9382E\",\"toBounds\":{\"_changedCallbacks\":[null,null,null],\"a\":{\"x\":234.9240255,\"y\":278.999999},\"b\":{\"x\":269.07597450000003,\"y\":319.000001},\"suspendChange\":false,\"changedWhileSuspend\":false}}],\"interactionline\":\"\",\"traceableactions\":\"\",\"type\":\"http://b3mn.org/stencilset/bpmn2.0#UndefinedAction\",\"workertarget\":\"\"},\"stencil\":{\"id\":\"PhysicalAction\"},\"childShapes\":[],\"outgoing\":[],\"bounds\":{\"lowerRight\":{\"x\":220.0204918032787,\"y\":744.88},\"upperLeft\":{\"x\":120.0204918032787,\"y\":664.88}},\"dockers\":[]}],\"lastHighlightedActionId\":\"sid-F0E4DE0F-D4FC-4F7C-B2B0-15CDEB04A2BC\",\"lastselectionOverrideIds\":[\"sid-F0E4DE0F-D4FC-4F7C-B2B0-15CDEB04A2BC\"]}],\"selectedSceneIndex\":0,\"scenesRelations\":{\"childShapes\":[{\"resourceId\":\"sid-1ABBAF08-2074-4B2B-AC1E-5CD3163FFF9A\",\"properties\":{\"overrideid\":\"sid-1ABBAF08-2074-4B2B-AC1E-5CD3163FFF9A\",\"name\":\"是的\",\"type\":\"场景\",\"documentation\":\"\",\"initiator\":\"\",\"events\":\"\",\"currentscene\":\"\",\"traceablescenes\":\"\"},\"stencil\":{\"id\":\"scene\"},\"childShapes\":[],\"outgoing\":[],\"bounds\":{\"lowerRight\":{\"x\":148.37297,\"y\":195.91199},\"upperLeft\":{\"x\":75,\"y\":124.08801}},\"dockers\":[]}]}}"),
      @ApiImplicitParam(name = "svg_xml", value = "建模工程的svg结构", dataType = "String", paramType = "query", required = true)
  })
  @RequestMapping(value="/model/{modelId}/save", method = RequestMethod.PUT)
  @ResponseStatus(value = HttpStatus.OK)
  public void saveModel(@PathVariable String modelId
          , String name, String description
          , String json_xml, String svg_xml) {
    try {
      
        Model model = repositoryService.getModel(modelId);

        ObjectNode modelJson = (ObjectNode) objectMapper.readTree(model.getMetaInfo());

        modelJson.put(MODEL_NAME, name);
        modelJson.put(MODEL_DESCRIPTION, description);
        model.setMetaInfo(modelJson.toString());
        model.setName(name);
        repositoryService.saveModel(model);

        repositoryService.addModelEditorSource(model.getId(), json_xml.getBytes("utf-8"));

//        // 输出到文件,文件名：model.getId()
//        File directory = new File("");
//        String courseFile = directory.getCanonicalPath(); // 项目目录
//        // System.out.println(courseFile);
//
//        FileOutputStream out = new FileOutputStream(new File(courseFile+"\\model\\"+model.getId()+".json"));
//        out.write(json_xml.getBytes("utf-8"));
//        out.flush();
//        out.close();


        InputStream svgStream = new ByteArrayInputStream(svg_xml.getBytes("utf-8"));
        TranscoderInput input = new TranscoderInput(svgStream);

        PNGTranscoder transcoder = new PNGTranscoder();
        // Setup output
        ByteArrayOutputStream outStream = new ByteArrayOutputStream();
        TranscoderOutput output = new TranscoderOutput(outStream);

        // Do the transformation
        transcoder.transcode(input, output);
        final byte[] result = outStream.toByteArray();
        repositoryService.addModelEditorSourceExtra(model.getId(), result);
        outStream.close();
    } catch (Exception e) {
        LOGGER.error("Error saving model", e);
        throw new ActivitiException("Error saving model", e);
    }
  }

    /**
     * 发布模型
     * 作用：将模型发布到运行平台数据库中
     * @param jsonModel JSON格式的模型
     * @return
     */
    /*
    jsonModel {"action":{"service":[{"id":"sid-F0E4DE0F-D4FC-4F7C-B2B0-15CDEB04A2BC","name":"TurnOn","enactedBy":{"id":"sid-4BCA02C4-9A5E-46C5-B5A7-E19070D9382E","name":"AirCleaner","type":"Device"},"type":"PhysicalAction","interaction":{},"input":{},"output":[],"flow":{"id":"","to":"","condition":""}}],"event":[]},"constraint":[],"id":"527504","properties":{"name":"activiti--test","documentation":""},"gateway":[]}
    * */

    @ApiOperation(value = "发布模型")
    @ApiImplicitParam(name="jsonModel", value="json格式的应用模型", dataType="json", paramType = "body", defaultValue="{\"action\":{\"service\":[{\"id\":\"sid-F0E4DE0F-D4FC-4F7C-B2B0-15CDEB04A2BC\",\"name\":\"TurnOn\",\"enactedBy\":{\"id\":\"sid-4BCA02C4-9A5E-46C5-B5A7-E19070D9382E\",\"name\":\"AirCleaner\",\"type\":\"Device\"},\"type\":\"PhysicalAction\",\"interaction\":{},\"input\":{},\"output\":[],\"flow\":{\"id\":\"\",\"to\":\"\",\"condition\":\"\"}}],\"event\":[]},\"constraint\":[],\"id\":\"527504\",\"properties\":{\"name\":\"activiti--test\",\"documentation\":\"\"},\"gateway\":[]}", required = true)
    @ResponseBody
    @RequestMapping(value="/generate", method={RequestMethod.POST}, produces = "application/json;charset=UTF-8")
    public String generate(@RequestBody JSONObject jsonModel) {
        if (jsonModel.isEmpty()){
            return "";
        }
        LOGGER.info("成功：{}", jsonModel);
        String id = (String) jsonModel.get("id");
        if (id.equals("527501")){
            return "";
        }

        String url =  PLATFORM_URL+ "save_app_class_new";
        String app_id = httpsRequest( url, "POST", jsonModel.toString());
        return app_id;

    }



}
