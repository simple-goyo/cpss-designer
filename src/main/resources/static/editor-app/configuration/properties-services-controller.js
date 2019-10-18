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
 * Assignment
 */
var KisBpmServicesCtrl = ['$scope', '$modal', function ($scope, $modal) {

    // Config for the modal window
    var opts = {
        template: 'editor-app/configuration/properties/services-popup.html?version=' + Date.now(),
        scope: $scope
    };

    // Open the dialog
    $modal(opts);
}];

var KisBpmServicesPopupCtrl = ['$scope', function ($scope) {

    // Put json representing assignment on scope
    if ($scope.property.value !== undefined && $scope.property.value !== null
        && $scope.property.value.assignment !== undefined
        && $scope.property.value.assignment !== null) {
        $scope.assignment = $scope.property.value.assignment;
    } else {
        $scope.assignment = {};
    }

    if ($scope.assignment.candidateUsers == undefined || $scope.assignment.candidateUsers.length == 0) {
        $scope.assignment.candidateUsers = [{value: ''}];
    }

    // Click handler for + button after enum value
    var userValueIndex = 1;
    $scope.addCandidateUserValue = function (index) {
        $scope.assignment.candidateUsers.splice(index + 1, 0, {value: 'value ' + userValueIndex++});
    };

    // Click handler for - button after enum value
    $scope.removeCandidateUserValue = function (index) {
        $scope.assignment.candidateUsers.splice(index, 1);
    };

    if ($scope.assignment.candidateGroups == undefined || $scope.assignment.candidateGroups.length == 0) {
        $scope.assignment.candidateGroups = [{value: ''}];
    }

    var groupValueIndex = 1;
    $scope.addCandidateGroupValue = function (index) {
        $scope.assignment.candidateGroups.splice(index + 1, 0, {value: 'value ' + groupValueIndex++});
    };

    // Click handler for - button after enum value
    $scope.removeCandidateGroupValue = function (index) {
        $scope.assignment.candidateGroups.splice(index, 1);
    };

    $scope.save = function () {

        $scope.property.value = {};
        handleAssignmentInput($scope);
        $scope.property.value.assignment = $scope.assignment;

        $scope.updatePropertyInModel($scope.property);
        $scope.close();
    };

    // Close button handler
    $scope.close = function () {
        handleAssignmentInput($scope);
        $scope.property.mode = 'read';
        $scope.$hide();
    };

    var handleAssignmentInput = function ($scope) {
        if ($scope.assignment.candidateUsers) {
            var emptyUsers = true;
            var toRemoveIndexes = [];
            for (var i = 0; i < $scope.assignment.candidateUsers.length; i++) {
                if ($scope.assignment.candidateUsers[i].value != '') {
                    emptyUsers = false;
                }
                else {
                    toRemoveIndexes[toRemoveIndexes.length] = i;
                }
            }

            for (var i = 0; i < toRemoveIndexes.length; i++) {
                $scope.assignment.candidateUsers.splice(toRemoveIndexes[i], 1);
            }

            if (emptyUsers) {
                $scope.assignment.candidateUsers = undefined;
            }
        }

        if ($scope.assignment.candidateGroups) {
            var emptyGroups = true;
            var toRemoveIndexes = [];
            for (var i = 0; i < $scope.assignment.candidateGroups.length; i++) {
                if ($scope.assignment.candidateGroups[i].value != '') {
                    emptyGroups = false;
                }
                else {
                    toRemoveIndexes[toRemoveIndexes.length] = i;
                }
            }

            for (var i = 0; i < toRemoveIndexes.length; i++) {
                $scope.assignment.candidateGroups.splice(toRemoveIndexes[i], 1);
            }

            if (emptyGroups) {
                $scope.assignment.candidateGroups = undefined;
            }
        }
    };
}];

var ServicesPopupCtrl = ['$scope', function ($scope) {

    $scope.save = function () {
        if (!$scope.property.value) {
            $scope.property.value = {"id": "", "function": ""};
        }

        if ($scope.property.function !== $scope.property.value.function) {

            var shapeToRemove = $scope.getShapeById($scope.property.value.id);
            $scope.editor.deleteShape(shapeToRemove);

            $scope.property.value.function = $scope.property.function;
            //var shapeId = $scope.selectedShape.id;

            $scope.updatePropertyInModel($scope.property);
            $scope.close();

            $scope.createAction($scope);
            $scope.property.value.id = $scope.editor.getSelection()[0].id;
            //$scope.updatePropertyInModel($scope.property, shapeId);
        }

    };

    $scope.createAction = function ($scope) {
        var selectItem = $scope.editor.getSelection()[0];
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
            positionController: positionOffset
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
        $scope.property.mode = 'read';
        $scope.$hide();
    };
}];

var ServicesDisplayedCtrl = ['$scope', function ($scope) {
    if ($scope.property.value.id) {
        var shape = $scope.getShapeById($scope.property.value.id);
        if (!shape) {
            $scope.property.value = {};
        } else {
            $scope.property.value.function = shape.properties["oryx-name"];
        }
        $scope.updatePropertyInModel($scope.property);
    }
}];