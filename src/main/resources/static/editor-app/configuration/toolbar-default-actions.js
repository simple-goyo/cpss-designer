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
'use strict';

var KISBPM = KISBPM || {};
KISBPM.TOOLBAR = {
    ACTIONS: {

        saveModel: function (services) {

            var modal = services.$modal({
                backdrop: true,
                keyboard: true,
                template: 'editor-app/popups/save-model.html?version=' + Date.now(),
                scope: services.$scope
            });
        },

        undo: function (services) {

            // Get the last commands
            var lastCommands = services.$scope.undoStack.pop();

            if (lastCommands) {
                // Add the commands to the redo stack
                services.$scope.redoStack.push(lastCommands);

                // Force refresh of selection, might be that the undo command
                // impacts properties in the selected item
                if (services.$rootScope && services.$rootScope.forceSelectionRefresh) 
                {
                	services.$rootScope.forceSelectionRefresh = true;
                }
                
                // Rollback every command
                for (var i = lastCommands.length - 1; i >= 0; --i) {
                    lastCommands[i].rollback();
                }
                
                // Update and refresh the canvas
                services.$scope.editor.handleEvents({
                    type: ORYX.CONFIG.EVENT_UNDO_ROLLBACK,
                    commands: lastCommands
                });
                
                // Update
                services.$scope.editor.getCanvas().update();
                services.$scope.editor.updateSelection();
            }
            
            var toggleUndo = false;
            if (services.$scope.undoStack.length == 0)
            {
            	toggleUndo = true;
            }
            
            var toggleRedo = false;
            if (services.$scope.redoStack.length > 0)
            {
            	toggleRedo = true;
            }

            if (toggleUndo || toggleRedo) {
                for (var i = 0; i < services.$scope.items.length; i++) {
                    var item = services.$scope.items[i];
                    if (toggleUndo && item.action === 'KISBPM.TOOLBAR.ACTIONS.undo') {
                        services.$scope.safeApply(function () {
                            item.enabled = false;
                        });
                    }
                    else if (toggleRedo && item.action === 'KISBPM.TOOLBAR.ACTIONS.redo') {
                        services.$scope.safeApply(function () {
                            item.enabled = true;
                        });
                    }
                }
            }
        },

        redo: function (services) {

            // Get the last commands from the redo stack
            var lastCommands = services.$scope.redoStack.pop();

            if (lastCommands) {
                // Add this commands to the undo stack
                services.$scope.undoStack.push(lastCommands);
                
                // Force refresh of selection, might be that the redo command
                // impacts properties in the selected item
                if (services.$rootScope && services.$rootScope.forceSelectionRefresh) 
                {
                	services.$rootScope.forceSelectionRefresh = true;
                }

                // Execute those commands
                lastCommands.each(function (command) {
                    command.execute();
                });

                // Update and refresh the canvas
                services.$scope.editor.handleEvents({
                    type: ORYX.CONFIG.EVENT_UNDO_EXECUTE,
                    commands: lastCommands
                });

                // Update
                services.$scope.editor.getCanvas().update();
                services.$scope.editor.updateSelection();
            }

            var toggleUndo = false;
            if (services.$scope.undoStack.length > 0) {
                toggleUndo = true;
            }

            var toggleRedo = false;
            if (services.$scope.redoStack.length == 0) {
                toggleRedo = true;
            }

            if (toggleUndo || toggleRedo) {
                for (var i = 0; i < services.$scope.items.length; i++) {
                    var item = services.$scope.items[i];
                    if (toggleUndo && item.action === 'KISBPM.TOOLBAR.ACTIONS.undo') {
                        services.$scope.safeApply(function () {
                            item.enabled = true;
                        });
                    }
                    else if (toggleRedo && item.action === 'KISBPM.TOOLBAR.ACTIONS.redo') {
                        services.$scope.safeApply(function () {
                            item.enabled = false;
                        });
                    }
                }
            }
        },

        cut: function (services) {
            KISBPM.TOOLBAR.ACTIONS._getOryxEditPlugin(services.$scope).editCut();
            for (var i = 0; i < services.$scope.items.length; i++) {
                var item = services.$scope.items[i];
                if (item.action === 'KISBPM.TOOLBAR.ACTIONS.paste') {
                    services.$scope.safeApply(function () {
                        item.enabled = true;
                    });
                }
            }
        },

        copy: function (services) {
            KISBPM.TOOLBAR.ACTIONS._getOryxEditPlugin(services.$scope).editCopy();
            for (var i = 0; i < services.$scope.items.length; i++) {
                var item = services.$scope.items[i];
                if (item.action === 'KISBPM.TOOLBAR.ACTIONS.paste') {
                    services.$scope.safeApply(function () {
                        item.enabled = true;
                    });
                }
            }
        },

        paste: function (services) {
            KISBPM.TOOLBAR.ACTIONS._getOryxEditPlugin(services.$scope).editPaste();
        },

        deleteItem: function (services) {
            KISBPM.TOOLBAR.ACTIONS._getOryxEditPlugin(services.$scope).editDelete();
        },

        addBendPoint: function (services) {

            var dockerPlugin = KISBPM.TOOLBAR.ACTIONS._getOryxDockerPlugin(services.$scope);

            var enableAdd = !dockerPlugin.enabledAdd();
            dockerPlugin.setEnableAdd(enableAdd);
            if (enableAdd)
            {
            	dockerPlugin.setEnableRemove(false);
            	document.body.style.cursor = 'pointer';
            }
            else
            {
            	document.body.style.cursor = 'default';
            }
        },

        removeBendPoint: function (services) {

            var dockerPlugin = KISBPM.TOOLBAR.ACTIONS._getOryxDockerPlugin(services.$scope);

            var enableRemove = !dockerPlugin.enabledRemove();
            dockerPlugin.setEnableRemove(enableRemove);
            if (enableRemove)
            {
                dockerPlugin.setEnableAdd(false);
                document.body.style.cursor = 'pointer';
            }
            else
            {
                document.body.style.cursor = 'default';
            }
        },

        addNextNode: function (services) {

/*            var opts = {
                template: 'editor-app/configuration/properties/services-popup_new.html?version=' + Date.now(),
                scope: services.$scope
            };
            $modal(opts);*/
            // var modal = services.$modal({
            //     backdrop: true,
            //     keyboard: true,
            //     template: 'editor-app/configuration/properties/services-popup_new.html?version=' + Date.now(),
            //     scope: services.$scope
            // });

            // to do
            // 如果画布上已经有未定义Action，则不添加新的Action
            // if(...) return;
            _createAction(services.$rootScope, services.$scope, "UndefinedAction");

        },

        addResource: function (services){
            var modal = services.$modal({
                backdrop: true,
                keyboard: true,
                template: 'editor-app/configuration/properties/input-popup.html?version=' + Date.now(),
                scope: services.$scope
            });
        },

        removeResource: function (services){
            var modal = services.$modal({
                backdrop: true,
                keyboard: true,
                template: 'editor-app/configuration/properties/input-popup.html?version=' + Date.now(),
                scope: services.$scope
            });
        },



        /**
         * Helper method: fetches the Oryx Edit plugin from the provided scope,
         * if not on the scope, it is created and put on the scope for further use.
         *
         * It's important to reuse the same EditPlugin while the same scope is active,
         * as the clipboard is stored for the whole lifetime of the scope.
         */
        _getOryxEditPlugin: function ($scope) {
            if ($scope.oryxEditPlugin === undefined || $scope.oryxEditPlugin === null) {
                $scope.oryxEditPlugin = new ORYX.Plugins.Edit($scope.editor);
            }
            return $scope.oryxEditPlugin;
        },

        zoomIn: function (services) {
            KISBPM.TOOLBAR.ACTIONS._getOryxViewPlugin(services.$scope).zoom([1.0 + ORYX.CONFIG.ZOOM_OFFSET]);
        },

        zoomOut: function (services) {
            KISBPM.TOOLBAR.ACTIONS._getOryxViewPlugin(services.$scope).zoom([1.0 - ORYX.CONFIG.ZOOM_OFFSET]);
        },
        
        zoomActual: function (services) {
            KISBPM.TOOLBAR.ACTIONS._getOryxViewPlugin(services.$scope).setAFixZoomLevel(1);
        },
        
        zoomFit: function (services) {
        	KISBPM.TOOLBAR.ACTIONS._getOryxViewPlugin(services.$scope).zoomFitToModel();
        },
        
        alignVertical: function (services) {
        	KISBPM.TOOLBAR.ACTIONS._getOryxArrangmentPlugin(services.$scope).alignShapes([ORYX.CONFIG.EDITOR_ALIGN_MIDDLE]);
        },
        
        alignHorizontal: function (services) {
        	KISBPM.TOOLBAR.ACTIONS._getOryxArrangmentPlugin(services.$scope).alignShapes([ORYX.CONFIG.EDITOR_ALIGN_CENTER]);
        },
        
        sameSize: function (services) {
        	KISBPM.TOOLBAR.ACTIONS._getOryxArrangmentPlugin(services.$scope).alignShapes([ORYX.CONFIG.EDITOR_ALIGN_SIZE]);
        },
        
        closeEditor: function(services) {
        	window.location.href = "./";
        },
        
        /**
         * Helper method: fetches the Oryx View plugin from the provided scope,
         * if not on the scope, it is created and put on the scope for further use.
         */
        _getOryxViewPlugin: function ($scope) {
            if ($scope.oryxViewPlugin === undefined || $scope.oryxViewPlugin === null) {
                $scope.oryxViewPlugin = new ORYX.Plugins.View($scope.editor);
            }
            return $scope.oryxViewPlugin;
        },
        
        _getOryxArrangmentPlugin: function ($scope) {
            if ($scope.oryxArrangmentPlugin === undefined || $scope.oryxArrangmentPlugin === null) {
                $scope.oryxArrangmentPlugin = new ORYX.Plugins.Arrangement($scope.editor);
            }
            return $scope.oryxArrangmentPlugin;
        },

        _getOryxDockerPlugin: function ($scope) {
            if ($scope.oryxDockerPlugin === undefined || $scope.oryxDockerPlugin === null) {
                $scope.oryxDockerPlugin = new ORYX.Plugins.AddDocker($scope.editor);
            }
            return $scope.oryxDockerPlugin;
        }
    }
};


var _createAction = function($rootScope, $scope, ItemId){
  if(ItemId === "UndefinedAction"){
      return __createNormalAction($rootScope, $scope);
  }else if(ItemId === "StartNoneEvent"){
      return __createStartNode($rootScope, $scope);
  }
};

var __createStartNode = function($rootScope, $scope){
    var itemId = "StartNoneEvent";
    var containedStencil = undefined;
    var stencilSets = $scope.editor.getStencilSets().values();
    for (var i = 0; i < stencilSets.length; i++) {
        var stencilSet = stencilSets[i];
        var nodes = stencilSet.nodes();
        for (var j = 0; j < nodes.length; j++) {
            if (nodes[j].idWithoutNs() === itemId) {
                containedStencil = nodes[j];
                break;
            }
        }
    }

    if (!containedStencil) return;

    var positionOffset = { x: 180, y: 30};

    var option = {
        type: "http://b3mn.org/stencilset/bpmn2.0#" + itemId,
        namespace: "http://b3mn.org/stencilset/bpmn2.0#",
        positionController: positionOffset,
        containedStencil: containedStencil
    };
    var command = new KISBPM.CreateCommand(option, undefined, undefined, $scope.editor);
    $scope.editor.executeCommands([command]);

};

var __createNormalAction = function($rootScope, $scope){
    var itemId = "UndefinedAction";

    var shapes = $rootScope.editor.getSelection();
    if (shapes && shapes.length === 1) {
        $rootScope.currentSelectedShape = shapes.first();

        var containedStencil = undefined;
        var stencilSets = $scope.editor.getStencilSets().values();
        for (var i = 0; i < stencilSets.length; i++) {
            var stencilSet = stencilSets[i];
            var nodes = stencilSet.nodes();
            for (var j = 0; j < nodes.length; j++) {
                if (nodes[j].idWithoutNs() === itemId) {
                    containedStencil = nodes[j];
                    break;
                }
            }
        }

        if (!containedStencil) return;

        var positionOffset = {type: 'offsetY', x: 0, y: 0};
        var node = $rootScope.currentSelectedShape;
        if (node.properties["oryx-activityelement"]||node.properties["oryx-startevent"] !== undefined) {
            if (positionOffset.y < node.bounds.center().y) {
                positionOffset.y = node.bounds.center().y;
            }
        }

        var option = {
            type: $scope.currentSelectedShape.getStencil().namespace() + itemId,
            namespace: $scope.currentSelectedShape.getStencil().namespace(),
            positionController: positionOffset,
            connectedShape:$rootScope.currentSelectedShape,
            parent:$rootScope.currentSelectedShape.parent,
            containedStencil:containedStencil
        };
        // option['connectedShape'] = $rootScope.currentSelectedShape;
        // option['parent'] = $rootScope.currentSelectedShape.parent;
        // option['containedStencil'] = containedStencil;

        var args = {sourceShape: $rootScope.currentSelectedShape, targetStencil: containedStencil};
        var targetStencil = $scope.editor.getRules().connectMorph(args);
        if (!targetStencil) {
            return;
        }// Check if there can be a target shape
        option['connectingType'] = targetStencil.id();

        var command = new KISBPM.CreateCommand(option, undefined, undefined, $rootScope.editor);
        $scope.editor.executeCommands([command]);

        // 取消之前的高亮
        var oldShapeId = $scope.getHighlightedShapeId();
        jQuery('#' + oldShapeId + 'bg_frame').attr({"fill":"#f9f9f9"}); //高亮显示

        // 高亮
        var newShapeId = $scope.editor.getSelection()[0].id;
        $scope.setHighlightedShape(newShapeId);
        jQuery('#' + newShapeId + 'bg_frame').attr({"fill":"#04FF8E"}); //高亮显示

        $scope.toDoAboutResourceLineAfterChangingAction();
    }
};

/** Custom controller for the save dialog */
var SaveModelCtrl = [ '$rootScope', '$scope', '$http', '$route', '$location',
    function ($rootScope, $scope, $http, $route, $location) {

    var modelMetaData = $scope.editor.getModelMetaData();

    var description = '';
    if (modelMetaData.description) {
    	description = modelMetaData.description;
    }
    
    var saveDialog = { 'name' : modelMetaData.name,
            'description' : description};
    
    $scope.saveDialog = saveDialog;
    
    var json = $scope.editor.getJSON();
    json["properties"]["name"] = modelMetaData.name;
    json["properties"]["documentation"] = description;
    json = JSON.stringify(json);

    var params = {
        modeltype: modelMetaData.model.modelType,
        json_xml: json,
        name: 'model'
    };

    $scope.status = {
        loading: false
    };

    $scope.close = function () {
    	$scope.$hide();
    };

    var saveJSON = undefined;
    $scope.updateModel = function(){
        // var url = "http://192.168.31.52:5001/save_app_class";
        var url = "https://www.cpss2019.fun:5001/save_app_class";
        var json = $scope.editor.getJSON();
        json["properties"]["name"] = modelMetaData.name;// add diagram name
        json["properties"]["documentation"] = description;
        json = JSON.stringify(json);
        // Update
        $http({
            method: 'POST',
            ignoreErrors: false,
            headers: {'Accept': 'application/json',
                'Content-Type': 'application/json;charset=utf-8'
            },
            data:json,
            url:url

        }).success(function(data){
                console.log("模型保存成功!")
        })
        .error(function(data){
                console.log("模型保存失败!")
        });

    };

    $scope.saveAndClose = function () {
        $scope.updateModel();
    	$scope.save(function() {
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

        var json = $scope.editor.getJSON();
        json["properties"]["name"] = modelMetaData.name;// add diagram name
        json["properties"]["documentation"] = description;
        json = JSON.stringify(json);

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
            json_xml: json,
            svg_xml: svgDOM,
            name: $scope.saveDialog.name,
            description: $scope.saveDialog.description
        };


        $http({    method: 'PUT',
            data: params,
            ignoreErrors: true,
            headers: {'Accept': 'application/json',
                      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
            transformRequest: function (obj) {
                var str = [];
                for (var p in obj) {
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                }
                return str.join("&");
            },
            url: KISBPM.URL.putModel(modelMetaData.modelId)})

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