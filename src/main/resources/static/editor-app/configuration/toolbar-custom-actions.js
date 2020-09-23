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
        var modelMetaData = $scope.editor.getModelMetaData();
        var rootScope = $rootScope;
        console.log(rootScope.editor);
        var description = '';
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
            let scene = $scope.getScenes();

            $scope.createModelFile(scene);
        };


        $scope.getAction = function (scene, patten, exclude){
            let action_template = {
            "id":"aaaaa-7",
            "name":"取文件",
            "enactedBy":{"id":"eeeee-5","name":"众包工人"},
            "type":"DeviceOperation",
                "input":"[order]",
                "output":"",
                "flow":{
                "id":"fffff-6",
                    "to":"aaaaa-10",
                    "condition":""
                }
            };

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

            let gateway_template = {
                "id":"aaaaa-14",
                "name":"决策",
                "input":"[Order]",
                "output":"[Order]",
                "flow":{
                    "id":"fffff-1",
                    "to":[
                        "aaaaa-4",
                        "aaaaa-5",
                        "aaaaa-6"
                    ],
                    "condition":[
                        "Order.content==coffee",
                        "Order.content==print",
                        "Order.content==project"
                    ]
                }
            };


            let action = [];
            scene.each(function (s) {
                let len = s.childShapes.length;
                if (len) {
                    for (let i = 0; i < len; i++)
                        if (exclude !== s.childShapes[i].stencil.id && patten.test(s.childShapes[i].stencil.id)) {
                            action.push(s.childShapes[i]);
                        }
                }
            });

            return action;
        };

        $scope.getConstraints = function(scene){
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


        $scope.createModelFile = function (scene) {
            let jsonObj = {
                "id": "",
                "properties": {
                    "name": "",
                    "documentation": ""
                },
                "scene": [],
                "action": {
                    "service": [],
                    "event": []
                },
                "gateway": [],
                "constraint": [],
                "scenesRelations": {}
            };
            jsonObj["properties"]["name"] = modelMetaData.name;// add diagram name
            jsonObj["properties"]["documentation"] = description;

            scene.each(function (s) {
                delete s.img;
            });

            // 填写模型内容（For建模）
            jsonObj["id"] = $scope.editor.getModelId();
            jsonObj["scene"] = scene;
            jsonObj["scenesRelations"] = $rootScope.scenesRelations;

            // 填写action内容（For运行）
            // service
            let service = $scope.getAction(scene, /(.*?)Action/, "UndefinedAction");
            service.each(function (s) {
                console.log(s);
            });
            jsonObj["action"]["service"] = service;

            // event
            let event = $scope.getAction(scene, /^(.*?)Event$/, "StartNoneEvent");

            jsonObj["action"]["event"] = event;

            // gateway
            let gateway = $scope.getAction(scene, /Gateway|EntryPoint|ExitPoint/);

            jsonObj["gateway"] = gateway;

            //console.log(jsonObj);

            // constraint
            let constraint = $scope.getConstraint(scene);
            jsonObj["constraint"] = constraint;
            return scene;
        }
    }];

var activitiModule = angular.module('activitiModeler');
activitiModule.controller('ExportModelCtrl', ExportModelCtrl);


