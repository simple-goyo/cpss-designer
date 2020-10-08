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
        let modelMetaData = $scope.editor.getModelMetaData();
        console.log($rootScope.editor);
        let description = '';
        if (modelMetaData.description) {
            description = modelMetaData.description;
        }

        $scope.exportDialog = {
            'name': modelMetaData.name,
            'description': description
        };

        $scope.close = function () {
            $scope.$hide();
        };

        $scope.export = function () {
            let scenes = $scope.getScenes();
            let relations = $scope.getSceneRelations();
            $scope.createModelFile(scenes, relations);
        };

        $scope.getAllActionFromScenes = function (scenes, patten, exclude){
            let action_list = [];
            scenes.each(function (s) {
                if(s.childShapes){
                    let len = s.childShapes.length;
                    if (len) {
                        for (let i = 0; i < len; i++)
                            if (exclude !== s.childShapes[i].stencil.id && patten.test(s.childShapes[i].stencil.id)) {
                                action_list.push(s.childShapes[i]);
                            }
                    }
                }
            });

            return action_list;
        };

        $scope.getEdgebyId = function (edgeid) {
            let edges = $scope.editor.getCanvas().getChildEdges(true);
            for(let i=0;i<edges.length;i++){
                if(edgeid === edges[i].resourceId){
                    return edges[i];
                }
            }
            return undefined;
        }

        $scope.getOutgoingAction = function (outgoing) {
            if(outgoing.length > 0){
                // 有outgoing线,分两种情况，一种是事件，一种是Action
                let flow_tempate = {"id":"","to":"","condition":""};
                let flowid = outgoing[0].resourceId;
                let flowto = "";
                let edge = $scope.getEdgebyId(flowid);
                if(edge !== undefined) {
                    flowto = edge.outgoing[0].resourceId;
                }
                flow_tempate["id"] = flowid;
                flow_tempate["to"] = flowto;
                return flow_tempate;
            }else{
                // 没有outgoing线，当前scene结束
                let flow_tempate = {"id":"","to":"","condition":""};

                return flow_tempate;
            }
        }

        $scope.getServices = function(scenes){
            let services = [];
            let service_list = $scope.getAllActionFromScenes(scenes, /(.*?)Action/, "UndefinedAction");

            service_list.forEach(function (service) {
                let action_template = {
                    "id":"",
                    "name":"",
                    "enactedBy":{"id":"eeeee-5","name":"众包工人"},
                    "type":"DeviceOperation",
                    "input":"",
                    "output":"",
                    "flow":{"id":"", "to":"", "condition":""}
                };
                // id
                let id = service.properties["overrideid"];
                // name
                let name = service.properties["name"];
                // enactedBy
                let enactedBy = service.properties["activityelement"];
                // type
                let type = service.stencil.id
                // input
                let input = service.properties["actioninputstatus"];
                // output
                let output = service.properties["output"];
                // flow

                let flow = $scope.getOutgoingAction(service.outgoing);
                // if(service.outgoing.length){
                //    flowid = service.outgoing[0].resourceId;
                //    flowto = $scope.getOutgoingAction(flowid);
                // }

                action_template["id"] = id;
                action_template["name"] = name;
                action_template["enactedBy"] = enactedBy;
                action_template["type"] = type;
                action_template["input"] = input;
                action_template["output"] = output;
                action_template["flow"] = flow;
                services.push(action_template);

            })
            // console.log("services "+services);
            return services;
        };

        $scope.getEvents = function(scenes){
            let events = [];

            let event_list = $scope.getAllActionFromScenes(scenes, /^(.*?)Event$/, "StartNoneEvent");
            event_list.forEach(function (event) {
                let event_template = {
                    "id":"aaaaa-12",
                    "name":"会议准备事件",
                    "enactedBy":{"id":"eeeee-1","name":"会议室预定系统"},
                    "type":"CyberEvent",
                    "input":"",
                    "output":"[Order]",
                    "flow":{
                        "id":"fffff-0",
                        "to":"aaaaa-14",
                        "condition":""
                    }

                };
                // id
                let id = event.properties["overrideid"];
                // name
                let name = event.properties["name"];
                // enactedBy
                let enactedBy = event.properties["activityelement"];
                // type
                let type = event.stencil.id
                // input
                let input = event.properties["actioninputstatus"];
                // output
                let output = event.properties["output"];
                // flow
                let flowid = "";
                let flowto = "";

                if(event.outgoing.length){
                    flowid = event.outgoing[0].resourceId;
                    flowto = $scope.getOutgoingAction(flowid);
                }

                event_template["id"] = id;
                event_template["name"] = name;
                event_template["enactedBy"] = enactedBy;
                event_template["type"] = type;
                event_template["input"] = input;
                event_template["output"] = output;
                event_template["flow"] = {"id":flowid,"to":flowto,"condition":""};
                events.push(event_template);
            })
            console.log("events"+events);
            return events;
        };

        $scope.getGateways = function(scenes, relations){
            // let gateways = [];
            // let gateway_list = $scope.getAllActionFromScenes(scenes, /Gateway|EntryPoint|ExitPoint/);
            // gateway_list.forEach(function (gateway) {
            //     let gateway_template = {
            //         "id":"aaaaa-14",
            //         "name":"决策",
            //         "type":"fork",//join
            //         "input":"[Order]",
            //         "output":"[Order]",
            //         "flow":{
            //             "id":"fffff-1",
            //             "to":[
            //                 "aaaaa-4",
            //                 "aaaaa-5",
            //                 "aaaaa-6"
            //             ],
            //             "condition":[
            //                 "Order.content==coffee",
            //                 "Order.content==print",
            //                 "Order.content==project"
            //             ]
            //         }
            //     };
            //     console.log(gateway);
            //
            // })

            if(relations.childShapes){
                let gateway_patten = /(.*?)Gateway/;
                let flow_patten = /(.*?)Flow/;
                let tmp = relations.childShapes;
                tmp.each(function (relation) {
                    // console.log("relation " + relation);
                    if(flow_patten.test(relation.stencil.id)){
                        // 取出所有的flow
                        console.log("flow " + relation);
                    }
                    if(gateway_patten.test(relation.stencil.id)){
                        console.log("gateway " + relation);
                    }
                })

            }
            //console.log("gateways"+gateways);
            return "gateways";
        };

        $scope.getConstraints = function(scenes){
            let constraint_template = {
                "entity": {
                    "anchor": {
                        "id": "eeeee-10",
                        "name": "投影仪"
                    },
                    "adjustable":{
                        "id": "sppp-01",
                        "name": "会议室"
                    }
                },
                "flow": {
                    "from": "sppp-01",
                    "to":  "eeeee-10",
                    "condition": "包含"
                }
            };
        };


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
            let service = $scope.getServices(scenes);

            jsonObj["action"]["service"] = service;

            // event
            let event = $scope.getEvents(scenes);

            jsonObj["action"]["event"] = event;

            // gateway
            let gateway = $scope.getGateways(scenes, relations);

            jsonObj["gateway"] = gateway;

            //console.log(jsonObj);

            // constraint
            let constraint = $scope.getConstraints(scenes);
            jsonObj["constraint"] = constraint;

            console.log(JSON.stringify(jsonObj));
            $scope.close();

            return scenes;


        }
    }];

var activitiModule = angular.module('activitiModeler');
activitiModule.controller('ExportModelCtrl', ExportModelCtrl);


