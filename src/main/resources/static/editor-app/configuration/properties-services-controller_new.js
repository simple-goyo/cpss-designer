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
    // Put json representing entity on scope
    if ($scope.property.value !== undefined && $scope.property.value !== null
        && $scope.property.value.length > 0)
    {
        for(var i=0 ; i<$scope.property.value.length ; i++){
            $scope.entity.Services[i].value = $scope.property.value[i].function;
        }

    } else {
        $scope.entity = {};
    }
    //$scope.entity = {};
    if ($scope.entity.Services == undefined || $scope.entity.Services.length == 0) {
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
        if ($scope.property.value===undefined||!$scope.property.value) {
            $scope.property.value = {"id": "", "function": ""};
        }

        ActivityElement = $scope.editor.getSelection()[0];
        for(var i=0 ; i<$scope.entity.Services.length ; i++){
            if ($scope.entity.Services[i].value !== $scope.property.value.function) {
                // var shapeToRemove = $scope.getShapeById($scope.property.value.id);
                // $scope.editor.deleteShape(shapeToRemove);
                $scope.property.value.function = $scope.entity.Services[i].value;
                var shapeId = $scope.selectedShape.id;

                $scope.updatePropertyInModel($scope.property);
                $scope.close();

                $scope.createAction($scope);
                $scope.property.value.id = ActivityElement.id;
                //$scope.updatePropertyInModel($scope.property, shapeId);
            }
        }


    };

    $scope.createAction = function ($scope) {
        var selectItem = ActivityElement;//$scope.editor.getSelection()[0];
        var itemId = "actionActivity";
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
        var positionOffset = {x: 0, y: 0};
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].properties["oryx-activityelement"]) {
                if (positionOffset.y < nodes[i].bounds.center().y) {
                    positionOffset.y = nodes[i].bounds.center().y;
                }
            }
        }

        var option = {
            type: selectItem.getStencil().namespace() + itemId,
            namespace: selectItem.getStencil().namespace(),
            parent: selectItem.parent,
            containedStencil: action,
            positionOffset: positionOffset
        };

        var command = new KISBPM.CreateCommand(option, undefined, undefined, $scope.editor);

        $scope.editor.executeCommands([command]);

        console.log($scope.editor.getSelection()[0].bounds);

        var actionActivity = $scope.selectedItem;
        for (var i = 0; i < actionActivity.properties.length; i++) {
            var property = actionActivity.properties[i];
            if (property.title === "Id") {
                property.value = $scope.editor.getSelection()[0].id;
                $scope.updatePropertyInModel(property);
            } else if (property.title === "名称") {
                property.value = selectItem.properties["oryx-services"].function;
                $scope.updatePropertyInModel(property);

            } else if (property.title === "活动元素") {
                property.value = {
                    "id": selectItem.properties["oryx-overrideid"],
                    "name": selectItem.properties["oryx-name"],
                    "type": selectItem.properties["oryx-type"]
                };
                $scope.updatePropertyInModel(property);
            } else if (property.title === "输入") {
                property.mode = 'set';
            }
        }
    };

    // Close button handler
    $scope.close = function () {
        //handleEntityInput($scope);
        $scope.property.mode = 'read';
        $scope.$hide();
    };

    var handleEntityInput = function($scope) {
        if ($scope.entity.Services)
        {
            var emptyUsers = true;
            var toRemoveIndexes = [];
            for (var i = 0; i < $scope.entity.Services.length; i++)
            {
                if ($scope.entity.Services[i].value != '')
                {
                    emptyUsers = false;
                }
                else
                {
                    toRemoveIndexes[toRemoveIndexes.length] = i;
                }
            }

            for (var i = 0; i < toRemoveIndexes.length; i++)
            {
                $scope.entity.Services.splice(toRemoveIndexes[i], 1);
            }

            if (emptyUsers)
            {
                $scope.entity.Services = undefined;
            }
        }
    };
    
}];

var ServicesDisplayedCtrl = ['$scope', function ($scope) {
    if ($scope.property.value.id) {
        var shape = $scope.getShapeById($scope.property.value.id);
        if (!shape) {
            $scope.property.value = {};
        } else {
            //$scope.property.value.function = shape.properties["oryx-name"];
        }
        $scope.updatePropertyInModel($scope.property);
    }
}];