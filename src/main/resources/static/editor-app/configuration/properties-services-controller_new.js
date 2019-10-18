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

/*
 * entity
 */
var KisBpmServicesCtrl = ['$scope', '$modal', function ($scope, $modal) {

    // Config for the modal window
    var opts = {
        template: 'editor-app/configuration/properties/services-popup_new.html?version=' + Date.now(),
        scope: $scope
    };

    // Open the dialog
    $modal(opts);
}];

var KisBpmServicesPopupCtrl = ['$scope', function ($scope) {
    $scope.save = function () {

        $scope.property.value = {};
        $scope.property.value.entity = $scope.entity;

        $scope.updatePropertyInModel($scope.property);
        $scope.close();
    };

    // Close button handler
    $scope.close = function () {
        $scope.property.mode = 'read';
        $scope.$hide();
    };
}];

var ServicesPopupCtrl = ['$scope', function ($scope) {
    var ActivityElement;
    $scope.constfunctions = [
        {name: "获取水杯", type: "SocialAction"},
        {name: "获取咖啡", type: "SocialAction"},
        {name: "递交物品", type: "SocialAction"},
        {name: "制作咖啡", type: "PhysicalAction"},
        {name: "点咖啡服务", type: "CyberAction"}
    ];

    // Put json representing entity on scope
    if ($scope.property !== undefined && $scope.property.value !== undefined && $scope.property.value !== null
        && $scope.property.value.length > 0) {
        $scope.entity = {};
        $scope.entity.Services = [];
        for (var i = 0; i < $scope.property.value.length; i++) {
            $scope.entity.Services[$scope.entity.Services.length] = {value: $scope.property.value[i].function};
        }

    } else {
        $scope.entity = {};
        $scope.property = {};
    }

    if ($scope.entity.Services === undefined || $scope.entity.Services.length === 0) {
        $scope.entity.Services = [{value: ''}];
    }

    // Click handler for + button after enum value
    $scope.addServiceValue = function (index) {
        $scope.entity.Services.splice(index + 1, 0, {value: ''});
    };

    // Click handler for - button after enum value
    $scope.removeServiceValue = function (index) {
        $scope.entity.Services.splice(index, 1);
    };

    $scope.save = function () {
        handleEntityInput($scope);
        if ($scope.property.value === undefined || !$scope.property.value) {
            $scope.property.value = {"id": "", "function": ""};
        }

        ActivityElement = $scope.editor.getSelection()[0];
        var functions = [];
        var ids = [];
        if ($scope.property.value) {
            for (var i = 0; i < $scope.property.value.length; i++) {
                functions[functions.length] = {value: $scope.property.value[i].function};
                ids[ids.length] = {id: $scope.property.value[i].id};
            }
        } else {
            $scope.property.value = [];
        }
        if (!$scope.entity.Services) {
            $scope.entity.Services = [{value: $scope.selectedFunc}];
            // for (var i = $scope.property.value.length - 1; i >= 0; i--) {
            //     var remove = $scope.getShapeById($scope.property.value[i].id);
            //     $scope.editor.deleteShape(remove);
            // }
            // $scope.property.value = [];
            // $scope.updatePropertyInModel($scope.property);
            // $scope.close();
            // return;
        } else {
            $scope.entity.Services[$scope.entity.Services.length] = {value: $scope.selectedFunc};
        }
        var indexToRemove = [];
        var hasRemoveNum = 0;
        for (var i = 0; i < functions.length; i++) {
            var index = -1;
            for (var j = 0; j < $scope.entity.Services.length; j++) {
                if (functions[i].value === $scope.entity.Services[j].value) {
                    index = j;
                }
            }
            if (index < 0) {
                indexToRemove[indexToRemove.length] = i;
            }
        }
        for (var i = 0; i < indexToRemove.length; i++) {
            var index = indexToRemove[i];
            var shapeToRemove = $scope.getShapeById(ids[index].id);
            $scope.editor.deleteShape(shapeToRemove);
            functions.splice(index - hasRemoveNum, 1);
            $scope.property.value.splice(index - hasRemoveNum, 1);
            hasRemoveNum++;
        }


        var shape = $scope.selectedShape;

        for (var i = 0; i < $scope.entity.Services.length; i++) {
            index = -1;
            for (var j = 0; j < functions.length; j++) {
                if (functions[j].value === $scope.entity.Services[i].value) {
                    index = j;
                }
            }
            if (index < 0) {
                // var shapeToRemove = $scope.getShapeById($scope.property.value.id);
                // $scope.editor.deleteShape(shapeToRemove);
                $scope.createAction($scope, $scope.entity.Services[i].value);
                //$scope.createAction($scope,$scope.selectedFunc);
                $scope.property.value[$scope.property.value.length] = {
                    id: $scope.editor.getSelection()[0].id, function: $scope.entity.Services[i].value
                };
                shape.setProperty("oryx-services", $scope.property.value);
                $scope.editor.getCanvas().update();
                $scope.editor.updateSelection();
                // $scope.updatePropertyInModel($scope.property, shapeId);
                if ($scope.entity.Services[i].value === '点咖啡服务') {
                    $scope.createResource($scope, shape, "CyberObject");
                    $scope.editor.getSelection()[0].setProperty("oryx-name", "订单");
                    $scope.editor.getCanvas().update();
                    $scope.editor.updateSelection();
                }
            }
        }
        $scope.close();
    };

    $scope.createResource = function ($scope, shape, resourceId) {
        var resource = undefined;
        var stencilSets = $scope.editor.getStencilSets().values();
        for (var i = 0; i < stencilSets.length; i++) {
            var stencilSet = stencilSets[i];
            var nodes = stencilSet.nodes();
            for (var j = 0; j < nodes.length; j++) {
                if (nodes[j].idWithoutNs() === resourceId) {
                    resource = nodes[j];
                    break;
                }
            }
        }
        if (!resource)
            return undefined;

        var resourceOption = {type: 'set', x: shape.bounds.center().x + 50, y: shape.bounds.center().y};

        var option = {
            type: shape.getStencil().namespace() + resourceId,
            namespace: shape.getStencil().namespace(),
            parent: shape.parent,
            containedStencil: resource,
            positionController: resourceOption
        };

        var command = new KISBPM.CreateCommand(option, undefined, undefined, $scope.editor);

        $scope.editor.executeCommands([command]);
    };

    $scope.createAction = function ($scope, actionName) {
        var selectItem = ActivityElement;//$scope.editor.getSelection()[0];
        //var itemId = "actionActivity";
        var itemId = "SocialAction";
        if("点咖啡服务"===actionName){
            itemId = "CyberAction";
        }else if("制作咖啡"===actionName){
            itemId = "PhysicalAction";
        }else{
            itemId = "SocialAction";
        }
        var action = undefined;
        var stencilSets = $scope.editor.getStencilSets().values();
        for (var i = 0; i < stencilSets.length; i++) {
            var stencilSet = stencilSets[i];
            var nodes = stencilSet.nodes();
            for (var j = 0; j < nodes.length; j++) {
                if (nodes[j].idWithoutNs() === itemId) {
                    action = nodes[j];
                    break;
                }
            }
        }
        if (!action) return;

        var nodes = [$scope.editor.getCanvas()][0].children;
        var positionOffset = {type: 'offsetY', x: 0, y: 0};
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].properties["oryx-activityelement"]) {
                if (positionOffset.y < nodes[i].bounds.center().y) {
                    positionOffset.y = nodes[i].bounds.center().y;
                }
            }
        }
        //if (positionController.y !== 0) {
        // positionOffset.y += 30;
        //}

        var option = {
            type: selectItem.getStencil().namespace() + itemId,
            namespace: selectItem.getStencil().namespace(),
            parent: selectItem.parent,
            containedStencil: action,
            positionController: positionOffset
        };

        var command = new KISBPM.CreateCommand(option, undefined, undefined, $scope.editor);

        $scope.editor.executeCommands([command]);

        var actionActivity = $scope.selectedItem;
        for (var i = 0; i < actionActivity.properties.length; i++) {
            var property = actionActivity.properties[i];
            if (property.title === "Id") {
                property.value = $scope.editor.getSelection()[0].id;
                $scope.updatePropertyInModel(property);
            } else if (property.title === "名称") {
                property.value = actionName;
                $scope.updatePropertyInModel(property);
            } else if (property.title === "活动元素") {
                property.value = {
                    "id": selectItem.properties["oryx-overrideid"],
                    "name": selectItem.properties["oryx-name"],
                    "type": selectItem.properties["oryx-type"]
                };
                $scope.updatePropertyInModel(property);
            }
            // else if (property.title === "输入") {
            //     property.mode = 'set';
            // }
            else if (property.title === "动作输入状态") {
                property.value = $scope.inputStatus;
                $scope.inputStatus = [];
                $scope.updatePropertyInModel(property);
            } else if (property.title === "动作输出状态") {
                property.value = $scope.outputStatus;
                $scope.outputStatus = [];
                $scope.updatePropertyInModel(property);
            }
        }
    };

    $scope.changeData = function () {
        console.log("datachanged!")
    };

    // Close button handler
    $scope.close = function () {
        //handleEntityInput($scope);
        $scope.property.mode = 'read';
        $scope.$hide();
    };

    var handleEntityInput = function ($scope) {
        if ($scope.entity.Services) {
            var emptyUsers = true;
            var toRemoveIndexes = [];
            for (var i = 0; i < $scope.entity.Services.length; i++) {
                if ($scope.entity.Services[i].value !== '') {
                    emptyUsers = false;
                }
                else {
                    toRemoveIndexes[toRemoveIndexes.length] = i;
                }
            }

            for (var i = 0; i < toRemoveIndexes.length; i++) {
                $scope.entity.Services.splice(toRemoveIndexes[i], 1);
            }

            if (emptyUsers) {
                $scope.entity.Services = undefined;
            }
        }
    };

}];

var ServicesDisplayedCtrl = ['$scope', function ($scope) {
    if ($scope.property.value) {
        var indexToRemove = [];
        for (var i = 0; i < $scope.property.value.length; i++) {
            var shape = $scope.getShapeById($scope.property.value[i].id);
            if (!shape) {
                indexToRemove[indexToRemove.length] = i;
            }
        }
        var hasRemove = 0;
        for (var i = 0; i < indexToRemove.length; i++) {
            $scope.property.value.splice(indexToRemove[i] - hasRemove, 1);
            hasRemove++;
        }
        $scope.updatePropertyInModel($scope.property);
    }
    // if ($scope.property.value.id) {
    //     var shape = $scope.getShapeById($scope.property.value.id);
    //     if (!shape) {
    //         $scope.property.value = {};
    //     } else {
    //         //$scope.property.value.function = shape.properties["oryx-name"];
    //     }
    //     $scope.updatePropertyInModel($scope.property);
    // }
}];