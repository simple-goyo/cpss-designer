/*
 * Activiti Modeler component part of the Activiti project
 * Copyright 2005-2014 Alfresco Software, Ltd. All rights reserved.
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.

 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 */

var SaveSceneCtrl = ['$rootScope', '$scope', '$http', '$route', '$location',
    function ($rootScope, $scope, $http, $route, $location) {

        var modelMetaData = $scope.editor.getModelMetaData();

        var description = '';
        if (modelMetaData.description) {
            description = modelMetaData.description;
        }

        var saveDialog = {
            'name': modelMetaData.name,
            'description': description
        };

        $scope.saveDialog = saveDialog;


        let modelJson = $scope.editor.getJSON();
        delete modelJson.childShapes;
        modelJson["properties"]["name"] = modelMetaData.name;
        modelJson["properties"]["documentation"] = description;
        modelJson.scenes = $rootScope.scenes;
        modelJson.selectedSceneIndex = $rootScope.selectedSceneIndex;
        delete $rootScope.scenesRelations.img;
        delete $rootScope.scenesRelations.sceneTree; // todo 删除sceneTree，临时解决不能保存问题
        console.log($rootScope.scenesRelations);
        modelJson.scenesRelations = $rootScope.scenesRelations;
        modelJson = JSON.stringify(modelJson);


        var params = {
            modeltype: modelMetaData.model.modelType,
            json_xml: modelJson,
            name: 'model'
        };

        $scope.status = {
            loading: false
        };

        $scope.close = function () {
            $scope.$hide();
        };

        var saveJSON = undefined;
        $scope.updateModel = function () {
            // var url = "http://192.168.31.52:5001/save_app_class";
            var url = "https://www.cpss2019.fun:5001/save_app_class";
            // var json = $scope.editor.getJSON();
            // json["properties"]["name"] = modelMetaData.name;// add diagram name
            // json["properties"]["documentation"] = description;
            // json = JSON.stringify(json);
            let modelJson = $scope.editor.getJSON();
            delete modelJson.childShapes;
            modelJson["properties"]["name"] = modelMetaData.name;
            modelJson["properties"]["documentation"] = description;
            modelJson.scenes = $rootScope.scenes;
            modelJson.selectedSceneIndex = $rootScope.selectedSceneIndex;
            modelJson.scenesRelations = $rootScope.scenesRelations;
            modelJson = JSON.stringify(modelJson);
            // Update
            $http({
                method: 'POST',
                ignoreErrors: false,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json;charset=utf-8'
                },
                data: modelJson,
                url: url

            }).success(function (data) {
                console.log("模型保存成功!")
            })
                .error(function (data) {
                    console.log("模型保存失败!")
                });

        };

        $scope.saveAndClose = function () {
            $scope.updateModel();
            $scope.save(function () {
                //$scope.updateModel();
                window.location.href = "./index";
            });
        };


        $scope.save = function (successCallback) {
            if (!$scope.saveDialog.name || $scope.saveDialog.name.length === 0) {
                return;
            }

            // Indicator spinner image
            $scope.status = {
                loading: true
            };

            modelMetaData.name = $scope.saveDialog.name;
            modelMetaData.description = $scope.saveDialog.description;

            let modelJson = $scope.editor.getJSON();
            delete modelJson.childShapes;
            modelJson["properties"]["name"] = modelMetaData.name;
            modelJson["properties"]["documentation"] = description;
            modelJson.scenes = $rootScope.scenes;
            modelJson.selectedSceneIndex = $rootScope.selectedSceneIndex;
            modelJson.scenesRelations = $rootScope.scenesRelations;
            modelJson = JSON.stringify(modelJson);


            var selection = $scope.editor.getSelection();
            $scope.editor.setSelection([]);

            // Get the serialized svg image source
            var svgClone = $scope.editor.getCanvas().getSVGRepresentation(true);
            $scope.editor.setSelection(selection);
            if ($scope.editor.getCanvas().properties["oryx-showstripableelements"] === false) {
                var stripOutArray = jQuery(svgClone).find(".stripable-element");
                for (var i = stripOutArray.length - 1; i >= 0; i--) {
                    stripOutArray[i].remove();
                }
            }

            // Remove all forced stripable elements
            var stripOutArray = jQuery(svgClone).find(".stripable-element-force");
            for (var i = stripOutArray.length - 1; i >= 0; i--) {
                stripOutArray[i].remove();
            }

            // Parse dom to string
            var svgDOM = DataManager.serialize(svgClone);

            var params = {
                json_xml: modelJson,
                svg_xml: svgDOM,
                name: $scope.saveDialog.name,
                description: $scope.saveDialog.description
            };


            $http({
                method: 'PUT',
                data: params,
                ignoreErrors: true,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                transformRequest: function (obj) {
                    var str = [];
                    for (var p in obj) {
                        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    }
                    return str.join("&");
                },
                url: KISBPM.URL.putModel(modelMetaData.modelId)
            })

                .success(function (data, status, headers, config) {
                    $scope.editor.handleEvents({
                        type: ORYX.CONFIG.EVENT_SAVED
                    });
                    $scope.modelData.name = $scope.saveDialog.name;
                    $scope.modelData.lastUpdated = data.lastUpdated;

                    $scope.status.loading = false;
                    $scope.$hide();

                    // Fire event to all who is listening
                    var saveEvent = {
                        type: KISBPM.eventBus.EVENT_TYPE_MODEL_SAVED,
                        model: params,
                        modelId: modelMetaData.modelId,
                        eventType: 'update-model'
                    };
                    KISBPM.eventBus.dispatch(KISBPM.eventBus.EVENT_TYPE_MODEL_SAVED, saveEvent);

                    // Reset state
                    $scope.error = undefined;
                    $scope.status.loading = false;

                    // Execute any callback
                    if (successCallback) {
                        successCallback();
                    }

                })
                .error(function (data, status, headers, config) {
                    $scope.error = {};
                    console.log('Something went wrong when updating the process model:' + JSON.stringify(data));
                    $scope.status.loading = false;
                });
        };

    }];

var ExportModelCtrl = ['$rootScope', '$scope', '$http', '$route', '$location',
    function ($rootScope, $scope, $http, $route, $location) {
        $scope.scenes = [];

        let modelMetaData = $scope.editor.getModelMetaData();
        let description = '';
        if (modelMetaData.description) {
            description = modelMetaData.description;
        }

        $scope.exportDialog = {
            'name': modelMetaData.name,
            'description': description
        };

        $scope.close = function () {
            // let properties = $rootScope.getAllEntitySpecificProperties($scope.getScenes());
            $scope.$hide();
        };

        $scope.export = function () {
            let scenes = $scope.getScenes();
            let relations = $scope.getSceneRelations();
            delete relations.img;
            $scope.scenes = scenes;
            $scope.getSceneIndexByAction("");
            $scope.createModelFile(scenes, relations);
        };

        $scope.getAllActionFromScenes = function (scenes, patten, exclude) {
            let action_list = [];
            if(exclude.source !== undefined){
                scenes.each(function (s) {
                    if (s.childShapes) {
                        let len = s.childShapes.length;
                        if (len) {
                            for (let i = 0; i < len; i++)
                                if (!exclude.test(s.childShapes[i].stencil.id) && patten.test(s.childShapes[i].stencil.id)) {
                                    action_list.push(s.childShapes[i]);
                                }
                        }
                    }
                });


            }else if(typeof(exclude) === "object" && exclude!==null){
                scenes.each(function (s) {
                    if (s.childShapes) {
                        let len = s.childShapes.length;
                        if (len) {
                            for (let i = 0; i < len; i++){
                                if(patten.test(s.childShapes[i].stencil.id)){
                                    let isnotinclude = true;
                                    for(let j=0;j<exclude.length;j++){
                                        if (exclude[j].test(s.childShapes[i].stencil.id)) {
                                            isnotinclude = false;
                                        }
                                    }
                                    if(isnotinclude){
                                        action_list.push(s.childShapes[i]);
                                    }

                                }
                            }

                        }
                    }
                });
            }

            return action_list;

        };

        $scope.getEdgebyId = function (edgeid, scene_index) {
            //console.log($rootScope.scenes[scene_index]);

            for(let index=0; index < $rootScope.scenes.length; index++){
                let childshapes = $rootScope.scenes[index].childShapes
                for (let i = 0; i < childshapes.length; i++) {
                    if (edgeid === childshapes[i].resourceId) {
                        return childshapes[i];
                    }
                }
            }

            return undefined;
        };

        $scope.getActionbyId = function (actionid) {
            let nodes = $scope.editor.getCanvas().getChildNodes(true);
            for (let i = 0; i < nodes.length; i++) {
                if (actionid === nodes[i].resourceId) {
                    return nodes[i];
                }
            }
            return undefined;
        }

        // 返回Scene中第一个Action
        $scope.getFirstActionFromSceneByIndex = function (index) {
            if (index < 0) return undefined;
            let childShapes = $rootScope.scenes[index].childShapes;
            // get StartNoneEvent ID
            return $scope.getFirstActionFromScene(childShapes);
        }

        $scope.getFirstActionFromScene = function (childShapes) {
            for (let i = 0; childShapes !== undefined && i < childShapes.length; i++) {
                if (childShapes[i].stencil.id === "StartNoneEvent") {
                    // get NextAction
                    let edgeid = childShapes[i].outgoing[0].resourceId;
                    for (let j = 0; j < childShapes.length; j++) {
                        if (childShapes[j].resourceId === edgeid) {
                            let edge = childShapes[j];
                            return edge.outgoing[0].resourceId;
                        }
                    }
                }
            }
            return undefined;
        }

        $scope.getOutgoingShapeById = function (relations, sceneid) {
            let retn = undefined;

            //for(let i=0;i<$scope.scenes.length;i++){
                //let sceneid = $scope.scenes[i].id;
                relations.childShapes.each(function (shape) {
                    if (shape.properties["overrideid"] === sceneid || shape.resourceId === sceneid){
                        retn = shape;
                    }
                });
                // if(retn !== undefined){
                //     break;
                // }
            //}

            return retn;
        }

        // $scope.getEdgeFromRelations = function(relations, edgeid){
        //     let retn = undefined;
        //     console.log('edgeid'+edgeid);
        //     relations.childShapes.each(function (shape) {
        //         console.log(shape);
        //     });
        //
        //     return retn;
        // }

        $scope.getSceneIndexByAction = function (actionid) {//actionshapeid
            let scene_index = -1;
            $scope.scenes.each(function (scene, index) {
                if (scene.childShapes) {
                    let len = scene.childShapes.length;
                    if (len) {
                        for (let i = 0; i < len; i++) {
                            if (scene.childShapes[i].resourceId === actionid) {
                                scene_index = index;
                                return scene_index;
                            }
                        }
                    }
                }
            });
            return scene_index;
        }

        $scope.getSceneIndexById = function (sceneid) {
            let scene_index = -1;
            $scope.scenes.each(function (scene, index) {
                if (scene.id === sceneid) {
                    scene_index = index;
                }
            });
            return scene_index;
        }

        // 返回下一个Action节点 {"id":"", "to":"", "condition":""}
        $scope.getOutgoingAction = function (service, outgoing, relations) {
            if (outgoing.length > 0) {
                // 有outgoing线,分两种情况，一种是事件，一种是Action
                let flow_tempate = {"id": "", "to": "", "condition": ""};
                let flowid = outgoing[0].resourceId;
                let flowto = "";
                let scene_index = $scope.getSceneIndexByAction(service.resourceId);
                let edge = $scope.getEdgebyId(flowid, scene_index);

                // hiddenProperties: Hash
                // oryx-type: "http://b3mn.org/stencilset/bpmn2.0#SequenceEventFlow"
                if(edge !== undefined && edge.stencil.id === "SequenceEventFlow"){
               // if (edge !== undefined && edge.hiddenProperties["oryx-type"] === "http://b3mn.org/stencilset/bpmn2.0#SequenceEventFlow") {
                    // 事件流
                    // console.log("事件流,不加入flow中");
                } else {
                    flow_tempate["id"] = flowid;
                    flow_tempate["to"] = edge.outgoing[0].resourceId;
                }
                return flow_tempate;
            } else {
                // Action没有outgoing线，表示当前scene结束
                // 下一个节点可能是gateway，也可能是scene，也可能是最终节点
                let flow_tempate = {"id": "", "to": "", "condition": ""};
                let scene_index = $scope.getSceneIndexByAction(service.resourceId);

                let sceneNum = $scope.getNumberOfScene();
                // 跳过最后一个scene
                if (scene_index !== sceneNum - 1)  {
                    // 获取下一个node————gateway或scene，node和node之间存在edge
                    let this_scene = $scope.scenes[scene_index];
                    let next_scene = $scope.scenes[scene_index + 1];

                    let shape = $scope.getOutgoingShapeById(relations, this_scene.id);
                    if(shape.outgoing[0] !== undefined){
                        let edgeid = shape.outgoing[0].resourceId;

                        let edge = $scope.getOutgoingShapeById(relations, edgeid);
                        let next_node = $scope.getOutgoingShapeById(relations, edge.outgoing[0].resourceId);

                        if (next_scene.id === next_node["properties"].overrideid) {
                            // scene，获取scene中第一个action的id
                            let actionid = $scope.getFirstActionFromSceneByIndex(scene_index + 1);
                            flow_tempate["id"] = edgeid;
                            flow_tempate["to"] = actionid;
                        } else {
                            // gateway，直接给出gateway的id
                            let gatewayid = next_node.resourceId;
                            flow_tempate["id"] = edgeid;
                            flow_tempate["to"] = gatewayid;
                        }
                    }
                }
                return flow_tempate;
            }
        }

        // 获取ExclusiveGateway中的条件
        $scope.getGatewayCondition = function (relations, gateway) {
            let condition = [];
            let outgoings = gateway.outgoing;
            for (let i = 0; i < outgoings.length; i++) {
                let condition_template = {"id": "", "condition": ""};

                let edgeid = outgoings[i].resourceId;
                let edge = $scope.getOutgoingShapeById(relations, edgeid);
                let nextScene = $scope.getOutgoingShapeById(relations, edge.outgoing[0].resourceId);
                // scene 的id转换
                let _sceneid = nextScene.properties["overrideid"];
                let sceneIndex = $scope.getSceneIndexById(_sceneid);
                let actionid = $scope.getFirstActionFromSceneByIndex(sceneIndex);

                if (actionid !== undefined) {
                    condition_template["id"] = actionid;
                }

                let nodeConditions = edge.properties["nodecondition"].nodeConditions;
                if (nodeConditions.length > 0) {
                    condition_template["condition"] = nodeConditions[0]; // todo 需要样例做测试
                }

                condition.push(condition_template);
            }
            return condition;
        };

        // 获取资源
        $scope.getResourceById = function(resourceId, resource_list){
            let resource = undefined;
            resource_list.each(function (value) {
                if(resourceId === value.resourceId || resourceId === value.properties["overrideid"]){
                    resource = value;
                }
            })
            return resource;
        };


        $scope.getServices = function (scenes, relations) {
            let services = [];
            let service_list = $scope.getAllActionFromScenes(scenes, /(.*?)Action/, /UndefinedAction/);
            let resource_list = $scope.getAllActionFromScenes(scenes, /(.*?)/, [/(.*?)Action/, /(.*?)Event/, /(.*?)Gateway/, /(.*?)Point/, /(.*?)Flow/]);

            service_list.forEach(function (service) {
                let action_template = {
                    "id": "",
                    "name": "",
                    "enactedBy": {"id": "eeeee-5", "name": "众包工人", "type":"Worker"},
                    "type": "DeviceOperation",
                    "interaction":{"id": "交互对象资源ID", "name":"user123", "type":"User"},
                    "input": "",
                    "output": "",
                    "flow": {"id": "", "to": "", "condition": ""}
                };
                // id
                let id = service.properties["overrideid"];
                // name
                let name = service.properties["name"];
                // enactedBy
                let enactedBy = service.properties["activityelement"];
                // 判断entity是否是被引用的实体
                let resShape = $scope.getResourceById(enactedBy.id, resource_list);
                if(resShape !== undefined && resShape.properties["referenceentity"] && resShape.properties["referenceentity"] !== ""){
                    enactedBy["id"] = resShape.properties["overrideid"];
                    enactedBy["name"] = resShape.properties["name"];
                    enactedBy["type"] = resShape.properties["type"];
                }
                // type
                let type = service.stencil.id;
                // interaction
                let interaction = {};
                let workertarget = {};
                if(enactedBy.type === "Worker"){
                    workertarget = service.properties["workertarget"];
                    if (workertarget.properties["overrideid"]){
                        if(workertarget.properties["referenceentity"] && workertarget.properties["referenceentity"] !== ""){
                            interaction["id"] = workertarget.properties["referenceentity"];
                        }else {
                            interaction["id"] = workertarget.properties["overrideid"];
                        }
                    }else if(workertarget.properties["oryx-overrideid"]){
                        if(workertarget.properties["oryx-referenceentity"] && workertarget.properties["oryx-referenceentity"] !== ""){
                            interaction["id"] = workertarget.properties["oryx-referenceentity"];
                        }else {
                            interaction["id"] = workertarget.properties["oryx-overrideid"];
                        }
                    }
                    interaction["name"] = workertarget.properties["name"];
                    interaction["type"] = workertarget.properties["type"];
                }

                // input
                let input = service.properties["actioninputstatus"];
                // output
                let output = service.properties["actionoutputstatus"];
                // flow

                let flow = $scope.getOutgoingAction(service, service.outgoing, relations);
                // if(service.outgoing.length){
                //    flowid = service.outgoing[0].resourceId;
                //    flowto = $scope.getOutgoingAction(flowid);
                // }

                action_template["id"] = id;
                action_template["name"] = name;
                action_template["enactedBy"] = enactedBy;
                action_template["type"] = type;
                action_template["interaction"] = interaction;
                action_template["input"] = input;
                action_template["output"] = output;
                action_template["flow"] = flow;
                services.push(action_template);

            })
            // console.log("services "+services);
            return services;
        };

        $scope.getEvents = function (scenes, relations) {
            let events = [];

            let event_list = $scope.getAllActionFromScenes(scenes, /^(.*?)Event$/, /StartNoneEvent/);
            let resource_list = $scope.getAllActionFromScenes(scenes, /(.*?)/, [/(.*?)Action/, /(.*?)Event/, /(.*?)Gateway/, /(.*?)Point/, /(.*?)Flow/]);
            event_list.forEach(function (event) {
                let event_template = {
                    "id": "aaaaa-12",
                    "name": "会议准备事件",
                    "enactedBy": {"id": "eeeee-1", "name": "会议室预定系统"},
                    "type": "CyberEvent",
                    "input": "",
                    "output": "[Order]",
                    "flow": {
                        "id": "fffff-0",
                        "to": "aaaaa-14",
                        "condition": ""
                    }

                };
                // id
                let id = event.properties["overrideid"];
                // name
                let name = event.properties["name"];
                // enactedBy
                let enactedBy = event.properties["activityelement"];
                // 判断entity是否是被引用的实体
                let resShape = $scope.getResourceById(enactedBy.id, resource_list);
                if(resShape !== undefined && resShape.properties["referenceentity"] && resShape.properties["referenceentity"] !== ""){
                    enactedBy["id"] = resShape.properties["overrideid"];
                    enactedBy["name"] = resShape.properties["name"];
                    enactedBy["type"] = resShape.properties["type"];
                }
                // type
                let type = event.stencil.id
                // input
                let input = event.properties["actioninputstatus"];
                // output
                let output = event.properties["actionoutputstatus"];

                let flow = $scope.getOutgoingAction(event, event.outgoing, relations);
                // if(event.outgoing.length){
                //     flowid = event.outgoing[0].resourceId;
                //     flowto = $scope.getOutgoingAction(flowid);
                // }

                event_template["id"] = id;
                event_template["name"] = name;
                event_template["enactedBy"] = enactedBy;
                event_template["type"] = type;
                event_template["input"] = input;
                event_template["output"] = output;
                event_template["flow"] = flow;
                events.push(event_template);
            })
            return events;
        };

        $scope.getFromActionId = function (childShapes, gateway_id) {
            let actionids = []
            let edges = []
            let edges2 = []
            for(let i=0;i<childShapes.length;i++){
                let outgo = childShapes[i].outgoing
                for(let j=0; outgo!==undefined && j<outgo.length;j++){
                    if(outgo[j].resourceId === gateway_id){
                        let edgeid = childShapes[i].resourceId
                        edges.push(edgeid)
                    }
                }
            }

            for(let k=0;k<edges.length;k++){
                for(let i=0;i<childShapes.length;i++){
                    let outgo = childShapes[i].outgoing
                    for(let j=0; outgo!==undefined && j<outgo.length;j++){
                        if(outgo[j].resourceId === edges[k]){
                            let actionid = childShapes[i].resourceId
                            edges2.push(actionid)
                        }
                    }
                }
            }

            for(let k=0;k<edges2.length;k++){
                for(let i=0;i<childShapes.length;i++){
                    let outgo = childShapes[i].outgoing
                    for(let j=0; outgo!==undefined && j<outgo.length;j++){
                        if(outgo[j].resourceId === edges2[k]){
                            let actionid = childShapes[i].resourceId
                            actionids.push(actionid)
                        }
                    }
                }
            }

            return actionids
        }
        $scope.getGateways = function (scenes, relations, service, event) {
            let gateways = [];
            if (relations.childShapes) {
                let gateway_patten = /(.*?)Gateway/;
                let flow_patten = /(.*?)Flow/;
                let tmp = relations.childShapes;
                tmp.each(function (relation) {
                    if (gateway_patten.test(relation.stencil.id)) {
                        let gateway_template = {
                            "id": "",
                            "name": "",
                            "type": "",
                            "flow": {
                                "id": "",
                                "from":[],
                                "to": []
                            }
                        };
                        gateway_template["id"] = relation.resourceId;
                        gateway_template["name"] = relation.properties["name"];
                        let type = relation.stencil.id;
                        let flow = {
                            "id": "",
                            "from":[],
                            "to": []
                        };

                        if (/Start(.*?)Gateway/.test(type)) {
                            gateway_template["type"] = "fork";
                        } else {
                            gateway_template["type"] = "join";
                        }

                        if (/Start(.*?)Gateway/.test(type)) {
                            for (let i = 0; i < relation.outgoing.length; i++) {
                                let flowto = {
                                    "id": "",
                                    "condition": ""
                                };

                                if (/(.*?)ExclusiveGateway/.test(relation.stencil.id)) {
                                    // 如果是条件网关，还需要要设置条件
                                    let condition = $scope.getGatewayCondition(relations, relation);
                                    flowto["condition"] = condition;
                                } else {
                                    let edgeid = relation.outgoing[i].resourceId;
                                    let edge = $scope.getOutgoingShapeById(relations, edgeid);
                                    let _scene = $scope.getOutgoingShapeById(relations, edge.outgoing[0].resourceId);
                                    // scene 的id转换
                                    let _sceneid = _scene.properties["overrideid"];
                                    let sceneIndex = $scope.getSceneIndexById(_sceneid);
                                    let actionid = $scope.getFirstActionFromSceneByIndex(sceneIndex);
                                    if (actionid !== undefined) {
                                        flowto["id"] = actionid;
                                    }
                                    flowto["condition"] = "true";
                                }
                                flow["to"].push(flowto);
                            }
                            gateway_template["flow"] = flow;
                        } else {// End
                            let flowto = {
                                "id": "",
                                "condition": ""
                            };

                            let edgeid = relation.outgoing[0].resourceId;
                            let edge = $scope.getOutgoingShapeById(relations, edgeid);
                            let _scene = $scope.getOutgoingShapeById(relations, edge.outgoing[0].resourceId);
                            // scene 的id转换
                            let _sceneid = _scene.properties["overrideid"];
                            let sceneIndex = $scope.getSceneIndexById(_sceneid);
                            let actionid = $scope.getFirstActionFromSceneByIndex(sceneIndex);
                            if (actionid !== undefined) {
                                flowto["id"] = actionid;
                            }

                            if (/(.*?)ExclusiveGateway/.test(relation.stencil.id)) {
                                // 如果是条件网关，还需要要设置条件
                                let condition = $scope.getGatewayCondition(relations, actionid);
                                flowto["condition"] = condition;
                            } else {
                                flowto["condition"] = "true";
                            }
                            flow["to"].push(flowto);

                            // from
                            let gateway_id = relation.resourceId;
                            // let fromflowids = $scope.getFromActionId(relations.childShapes, gateway_id);
                            // for(let i=0;i<fromflowids.length;i++){
                            //     let flowfrom = {
                            //         "id": "",
                            //         "condition":"true"
                            //     }
                            //     flowfrom["id"] = fromflowids[i];
                            //     flow["from"].push(flowfrom);
                            // }

                            for(let i=0;i<service.length;i++){
                                if(gateway_id === service[i].flow.to){
                                    let flowfrom = {
                                        "id": "",
                                        "condition":"true"
                                    }
                                    flowfrom["id"] = service[i].id;
                                    flow["from"].push(flowfrom);
                                }
                            }
                            for(let i=0;i<event.length;i++){
                                if(gateway_id === event[i].flow.to){
                                    let flowfrom = {
                                        "id": "",
                                        "condition":"true"
                                    }
                                    flowfrom["id"] = event[i].id;
                                    flow["from"].push(flowfrom);
                                }
                            }


                            gateway_template["flow"] = flow;
                        }
                        gateways.push(gateway_template);
                    }

                })

            }
            return gateways;
        };

        $scope.getConstraints = function (scenes) {
            return $scope.getAllEntitySpecificProperties(scenes);
        };

        $scope.getAllEntitySpecificProperties = function (scenes) {
            let allEntitySpecificProperties = [];
            if (scenes !== undefined && scenes.length > 0) {
                scenes.forEach((scene) => {
                    let shapes = scene.childShapes;
                    if (shapes !== undefined && shapes.length > 0) {
                        shapes.forEach((shape) => {
                            let entitySpecificProperties = shape.properties['entityspecificproperties'];
                            if (entitySpecificProperties !== undefined && entitySpecificProperties !== "") {
                                let id = shape.properties['overrideid'];
                                let name = shape.properties['name'];
                                let type = shape.properties['type'];
                                allEntitySpecificProperties.push({
                                    id: id,
                                    name:name,
                                    type:type,
                                    entitySpecificProperties: entitySpecificProperties
                                });
                            }
                        });
                    }
                });
            }
            return allEntitySpecificProperties;
        }

        $scope.upLoadModel = function (json) {
            //let url = "https://www.cpss2019.fun:5001/save_app_class_new";
            let url = KISBPM.URL.genModel();
            json = JSON.stringify(json);
            // Update
            $http({
                method: 'POST',
                ignoreErrors: false,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json;charset=utf-8'
                },
                data: json,
                url: url

            }).success(function (data) {
                console.log("模型保存成功!")
            })
                .error(function (data) {
                    console.log("模型保存失败!")
                });
        }
        $scope.createModelFile = function (scenes, relations) {
            let jsonObj = {
                "id": "",
                "properties": {
                    "name": "",
                    "documentation": ""
                },
                "action": {
                    "service": [],
                    "event": []
                },
                "gateway": [],
                "constraint": []
            };
            jsonObj["properties"]["name"] = modelMetaData.name;// add diagram name
            jsonObj["properties"]["documentation"] = description;

            scenes.each(function (s) {
                delete s.img;
            });

            // 填写模型内容（For建模）
            jsonObj["id"] = $scope.editor.getModelId();
            //jsonObj["scene"] = scenes;
            //jsonObj["scenesRelations"] = $rootScope.scenesRelations;

            // 填写action内容（For运行）
            // service
            let service = $scope.getServices(scenes, relations);

            jsonObj["action"]["service"] = service;

            // event
            let event = $scope.getEvents(scenes, relations);

            jsonObj["action"]["event"] = event;

            // gateway
            let gateway = $scope.getGateways(scenes, relations, service, event);

            jsonObj["gateway"] = gateway;

            //console.log(jsonObj);

            // constraint
            let constraint = $scope.getConstraints(scenes);
            jsonObj["constraint"] = constraint;

            console.log(JSON.stringify(jsonObj));
            $scope.upLoadModel(jsonObj);
            $scope.close();

            return scenes;


        }
    }];

var activitiModule = angular.module('activitiModeler');
activitiModule.controller('ExportModelCtrl', ExportModelCtrl);


