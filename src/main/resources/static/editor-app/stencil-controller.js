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

angular.module('activitiModeler')
    .controller('StencilController', ['$rootScope', '$scope', '$http', '$modal', '$timeout', '$compile', function ($rootScope, $scope, $http, $modal, $timeout, $compile) {

        // 上次高亮的Action的ID和项
        $scope.lastHighlightedId = "";
        $scope.HighlightedItem;

        // 最新的资源连线
        $scope.latestLine = undefined;

        // 最新的线两端
        $scope.latestfromto = {'from': undefined, 'to': undefined};

        // 资源与人机物三种Action的对应（固定不变）
        // const constTypeOfResource = [
        //     {name: "设备", type: "PhysicalAction"},
        //     {name: "物品", type: "PhysicalAction"},
        //     {name: "机器人", type: "PhysicalAction"},
        //     {name: "用户", type: "SocialAction"},
        //     {name: "工人", type: "SocialAction"},
        //     {name: "人群", type: "SocialAction"},
        //     {name: "组织", type: "SocialAction"},
        //     {name: "云应用", type: "CyberAction"},
        //     {name: "移动应用", type: "CyberAction"},
        //     {name: "嵌入式应用", type: "CyberAction"},
        //     {name: "信息对象", type: "CyberAction"}
        // ];

        const constTypeOfResource = [
            {name: "Device", type: "PhysicalAction"},
            {name: "PhysicalItem", type: "PhysicalAction"},
            {name: "Robot", type: "PhysicalAction"},
            {name: "User", type: "SocialAction"},
            {name: "Worker", type: "SocialAction"},
            {name: "Group", type: "SocialAction"},
            {name: "Organization", type: "SocialAction"},
            {name: "CloudApp", type: "CyberAction"},
            {name: "MobileApp", type: "CyberAction"},
            {name: "EmbeddedApp", type: "CyberAction"},
            {name: "CyberObject", type: "CyberAction"}
        ];

        angular.module('activitiModeler').UIClass($rootScope, $scope, $timeout);
        angular.module('activitiModeler').RouterClass($rootScope, $scope);
        angular.module('activitiModeler').ModalClass($rootScope, $scope, $modal);
        angular.module('activitiModeler').ParameterPoolClass($rootScope, $scope);
        // Code that is dependent on an initialised Editor is wrapped in a promise for the editor
        $scope.editorFactory.promise.then(function () {
            $scope.canvasShowChange();

            /* Build stencil item list */

            // Build simple json representation of stencil set
            var stencilItemGroups = [];

            // Helper method: find a group in an array
            var findGroup = function (name, groupArray) {
                for (var index = 0; index < groupArray.length; index++) {
                    if (groupArray[index].name === name) {
                        return groupArray[index];
                    }
                }
                return null;
            };

            // Helper method: add a new group to an array of groups
            var addGroup = function (groupName, groupArray) {
                var group = {name: groupName, items: [], paletteItems: [], groups: [], visible: true};
                groupArray.push(group);
                return group;
            };

            /*
             StencilSet items
             */
            $http({method: 'GET', url: KISBPM.URL.getStencilSet()}).success(function (data, status, headers, config) {
                // var quickMenuDefinition = ['UserTask', 'EndNoneEvent', 'ExclusiveGateway',
                //     'CatchTimerEvent', 'ThrowNoneEvent', 'TextAnnotation',
                //     'SequenceFlow', 'Association'];
                var quickMenuDefinition = ['ConstraintFlow'];
                var ignoreForPaletteDefinition = ['SequenceFlow', 'SequenceEventFlow', 'MessageFlow', 'Association', 'DataAssociation', 'DataStore', 'SendTask'];
                var quickMenuItems = ['ConstraintFlow'];

                var morphRoles = [];
                for (var i = 0; i < data.rules.morphingRules.length; i++) {
                    var role = data.rules.morphingRules[i].role;
                    var roleItem = {'role': role, 'morphOptions': []};
                    morphRoles.push(roleItem);
                }

                // Check all received items
                for (var stencilIndex = 0; stencilIndex < data.stencils.length; stencilIndex++) {
                    // Check if the root group is the 'diagram' group. If so, this item should not be shown.
                    var currentGroupName = data.stencils[stencilIndex].groups[0];
                    if (currentGroupName === 'Diagram' || currentGroupName === 'Form') {
                        continue;  // go to next item
                    }

                    var removed = false;
                    if (data.stencils[stencilIndex].removed) {
                        removed = true;
                    }

                    var currentGroup = undefined;
                    if (!removed) {
                        // Check if this group already exists. If not, we create a new one

                        if (currentGroupName !== null && currentGroupName !== undefined && currentGroupName.length > 0) {

                            currentGroup = findGroup(currentGroupName, stencilItemGroups); // Find group in root groups array
                            if (currentGroup === null) {
                                currentGroup = addGroup(currentGroupName, stencilItemGroups);
                            }

                            // Add all child groups (if any)
                            for (var groupIndex = 1; groupIndex < data.stencils[stencilIndex].groups.length; groupIndex++) {
                                var childGroupName = data.stencils[stencilIndex].groups[groupIndex];
                                var childGroup = findGroup(childGroupName, currentGroup.groups);
                                if (childGroup === null) {
                                    childGroup = addGroup(childGroupName, currentGroup.groups);
                                }

                                // The current group variable holds the parent of the next group (if any),
                                // and is basically the last element in the array of groups defined in the stencil item
                                currentGroup = childGroup;

                            }

                        }
                    }

                    // Construct the stencil item
                    var stencilItem = {
                        'id': data.stencils[stencilIndex].id,
                        'name': data.stencils[stencilIndex].title,
                        'description': data.stencils[stencilIndex].description,
                        'icon': data.stencils[stencilIndex].icon,
                        'type': data.stencils[stencilIndex].type,
                        'roles': data.stencils[stencilIndex].roles,
                        'removed': removed,
                        'customIcon': false,
                        'canConnect': false,
                        'canConnectTo': false,
                        'canConnectAssociation': false
                    };

                    if (data.stencils[stencilIndex].customIconId && data.stencils[stencilIndex].customIconId > 0) {
                        stencilItem.customIcon = true;
                        stencilItem.icon = data.stencils[stencilIndex].customIconId;
                    }

                    if (!removed) {
                        if (quickMenuDefinition.indexOf(stencilItem.id) >= 0) {
                            quickMenuItems[quickMenuDefinition.indexOf(stencilItem.id)] = stencilItem;
                        }
                    }

                    if (stencilItem.id === 'TextAnnotation' || stencilItem.id === 'BoundaryCompensationEvent') {
                        stencilItem.canConnectAssociation = true;
                    }

                    for (var i = 0; i < data.stencils[stencilIndex].roles.length; i++) {
                        var stencilRole = data.stencils[stencilIndex].roles[i];
                        if (stencilRole === 'sequence_start' || 'message_start') {
                            stencilItem.canConnect = true;
                        } else if (stencilRole === 'sequence_end' || 'message_end') {
                            stencilItem.canConnectTo = true;
                        }

                        for (var j = 0; j < morphRoles.length; j++) {
                            if (stencilRole === morphRoles[j].role) {
                                if (!removed) {
                                    morphRoles[j].morphOptions.push(stencilItem);
                                }
                                stencilItem.morphRole = morphRoles[j].role;
                                break;
                            }
                        }
                    }

                    if (currentGroup) {
                        // Add the stencil item to the correct group
                        currentGroup.items.push(stencilItem);
                        if (ignoreForPaletteDefinition.indexOf(stencilItem.id) < 0) {
                            currentGroup.paletteItems.push(stencilItem);
                        }

                    } else {
                        // It's a root stencil element
                        if (!removed) {
                            stencilItemGroups.push(stencilItem);
                        }
                    }
                }

                var stencilVisibleGroup = ["SocialEntity", "CyberEntity", "PhysicalEntity", "SpaceEntity"];
                for (var i = 0; i < stencilItemGroups.length; i++) {
                    if (stencilItemGroups[i].paletteItems && stencilItemGroups[i].paletteItems.length === 0) {
                        stencilItemGroups[i].visible = false;
                    }
                    // if (stencilItemGroups[i].name !== "SocialEntity" && stencilItemGroups[i].name !== "CyberEntity" && stencilItemGroups[i].name !== "PhysicalEntity") {
                    //     stencilItemGroups[i].visible = false;
                    // }
                    if (!stencilVisibleGroup.includes(stencilItemGroups[i].name)) {
                        stencilItemGroups[i].visible = false;
                    }
                }

                $scope.stencilItemGroups = stencilItemGroups;

                var containmentRules = [];
                for (var i = 0; i < data.rules.containmentRules.length; i++) {
                    var rule = data.rules.containmentRules[i];
                    containmentRules.push(rule);
                }
                $scope.containmentRules = containmentRules;

                // remove quick menu items which are not available anymore due to custom pallette
                var availableQuickMenuItems = [];
                for (var i = 0; i < quickMenuItems.length; i++) {
                    if (quickMenuItems[i]) {
                        availableQuickMenuItems[availableQuickMenuItems.length] = quickMenuItems[i];
                    }
                }

                $scope.quickMenuItems = availableQuickMenuItems;
                $scope.morphRoles = morphRoles;
            }).error(function (data, status, headers, config) {
                console.log('Something went wrong when fetching stencil items:' + JSON.stringify(data));
            });

            $scope.editor.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEDOWN, function (event) {
                var shapes = $scope.editor.getSelection();
                if (shapes && shapes.length > 0) {
                    var selectedShape = shapes.first();
                    $scope.addToInputStatus(selectedShape);
                    var selections = [];
                    var coffeeMachines = [];
                    for (var i = 0; i < $scope.inputStatus.length; i++) {
                        if ($scope.inputStatus[i].name === '咖啡机') {
                            coffeeMachines[coffeeMachines.length] = $scope.getShapeById($scope.inputStatus[i].id);
                            continue;
                        }
                        selections[selections.length] = $scope.getShapeById($scope.inputStatus[i].id);
                    }
                    if (selections.length === 0)
                        $scope.editor.setSelection(coffeeMachines);
                    else
                        $scope.editor.setSelection(selections);
                    $scope.editor.getCanvas().update();
                } else $scope.inputStatus = [];
            });

            $scope.addToInputStatus = function (shape) {
                if (shape.properties["oryx-ownedbywho"]) {
                    shape = $scope.getShapeById(shape.properties["oryx-ownedbywho"].id);
                    $scope.addToInputStatus(shape);
                } else {
                    $scope.inputStatus = [{
                        id: shape.id,
                        type: shape.properties["oryx-type"],
                        name: shape.properties["oryx-name"],
                        position: shape.bounds.center()
                    }];
                    if (shape.properties["oryx-owner"]) {
                        for (var i = 0; i < shape.properties["oryx-owner"].length; i++) {
                            var ownerId = shape.properties["oryx-owner"][i].id;
                            var ownerShape = $scope.getShapeById(ownerId);
                            $scope.inputStatus[$scope.inputStatus.length] = {
                                id: ownerId,
                                type: ownerShape.properties["oryx-type"],
                                name: ownerShape.properties["oryx-name"],
                                position: ownerShape.bounds.center()
                            }
                        }
                    }
                }
            };

            $scope.editor.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEUP, function (event) {
                var action = $scope.getHighlightedShape();
                if (action) {
                    action.setProperty("oryx-resourceline", $scope.getResourceConnect());
                }
                // 选都没选中，直接返回
                if ($scope.selectedItem.auditData !== undefined) {
                    if ($scope.lastHighlightedId !== "" && event.clientX < document.documentElement.clientWidth * 0.2745) { //375
                        // 取消高亮
                        // 只有鼠标在中间的时候,才取消高亮
                        jQuery('#' + $scope.lastHighlightedId + 'bg_frame').attr({"fill": "#f9f9f9"});
                        $scope.lastHighlightedId = "";
                    }
                    return;
                }
                if ($scope.inputStatus) {
                    $scope.outputStatus = [];
                    var userShape = undefined;
                    var userOriginPosition = undefined;
                    for (var i = 0; i < $scope.inputStatus.length; i++) {
                        var id = $scope.inputStatus[i].id;
                        var shape = $scope.getShapeById(id);
                        if ($scope.inputStatus[i].type === "工人" || $scope.inputStatus[i].type === "用户" ||
                            $scope.inputStatus[i].type === "Worker" || $scope.inputStatus[i].type === "User") {
                            userShape = shape;
                            userOriginPosition = $scope.inputStatus[i].position;
                        }
                        //console.log(shape);
                        $scope.outputStatus[$scope.outputStatus.length] = {
                            id: id,
                            type: shape.properties["oryx-type"],
                            name: shape.properties["oryx-name"],
                            position: shape.bounds.center()
                        }
                    }
                    //  && (shape.properties["oryx-activityelement"]===undefined)
                    if (userShape) {
                        var position = userShape.bounds.center();

                        if (userOriginPosition.x !== position.x || userOriginPosition.y !== position.y) {
                            var shapes = [$scope.editor.getCanvas()][0].children;
                            $scope.neibor = [];
                            var width = Math.abs(userShape.bounds.b.x - userShape.bounds.a.x);
                            var height = Math.abs(userShape.bounds.b.y - userShape.bounds.a.y);
                            for (var i = 0; i < shapes.length; i++) {
                                var shape = shapes[i];
                                var inOutputStatus = false;
                                for (var j = 0; j < $scope.outputStatus.length; j++) {
                                    if (shape.id === $scope.outputStatus[j].id) {
                                        inOutputStatus = true;
                                        break;
                                    }
                                }
                                var shapePosition = shape.bounds.center();
                                if (!inOutputStatus && Math.abs(position.y - shapePosition.y) <= 2 * height && Math.abs(position.x - shapePosition.x) <= 2 * width)
                                    $scope.neibor[$scope.neibor.length] = {
                                        "id": shape.id,
                                        "type": shape.properties["oryx-type"],
                                        "name": shape.properties["oryx-name"],
                                        "position": shapePosition
                                    };
                            }
                            if ($scope.neibor && $scope.neibor.length !== 0) {
                                $scope.popupThingGetOrLeave();
                            }
                        }

                    } else {
                        $scope.outputStatus = [];
                        // 两个阶段的要求
                        // 1.选中的Action，高亮(被选中元素高亮，未选中元素取消高亮)
                        // 2.选中的Action，显示当前画布
                        // 1
                        shape = $scope.selectedItem;
                        for (i = shape.properties.length; i > 0; i--) {
                            if (shape.properties[i - 1].key === "oryx-activityelement") break;
                        }

                        if (shape && i > 0) {
                            var item = $scope.editor.getSelection()[0];
                            var lastId = $scope.lastHighlightedId;
                            // 取消上次高亮
                            if (lastId !== "") {
                                jQuery('#' + $scope.HighlightedItem.id + 'bg_frame').attr({"fill": "#f9f9f9"});
                            }
                            var lastSelectedAction = $scope.getHighlightedShape();
                            // 高亮
                            jQuery('#' + item.id + 'bg_frame').attr({"fill": "#04FF8E"});

                            $scope.lastHighlightedId = item.id;
                            $scope.HighlightedItem = item;

                            $scope.toDoAboutResourceLineAfterChangingAction(lastSelectedAction);
                        }
                    }
                }
            });

            angular.module('activitiModeler').ConnectClass($rootScope, $scope);

            angular.module('activitiModeler').WorkerClass($rootScope, $scope);

            /**
             * Listen to double clicked events
             * */
            $scope.editor.registerOnEvent(ORYX.CONFIG.EVENT_DBLCLICK, function (event) {
                let selectedShape = $scope.editor.getSelection()[0];
                if (selectedShape.properties['oryx-entityspecificproperties'] !== undefined) {
                    $scope.setEntitySpecificProperties();
                }
            });

            /*
             * Listen to selection change events: show properties
             */
            $scope.editor.registerOnEvent(ORYX.CONFIG.EVENT_SELECTION_CHANGED, function (event) {
                var shapes = event.elements;
                var canvasSelected = false;
                if (shapes && shapes.length == 0) {
                    shapes = [$scope.editor.getCanvas()];
                    canvasSelected = true;
                }
                if (shapes && shapes.length > 0) {

                    var selectedShape = shapes.first();
                    var stencil = selectedShape.getStencil();

                    if ($rootScope.selectedElementBeforeScrolling && stencil.id().indexOf('BPMNDiagram') !== -1) {
                        // ignore canvas event because of empty selection when scrolling stops
                        return;
                    }

                    if ($rootScope.selectedElementBeforeScrolling && $rootScope.selectedElementBeforeScrolling.getId() === selectedShape.getId()) {
                        $rootScope.selectedElementBeforeScrolling = null;
                        return;
                    }

                    // Store previous selection
                    $scope.previousSelectedShape = $scope.selectedShape;

                    // Only do something if another element is selected (Oryx fires this event multiple times)
                    if ($scope.selectedShape !== undefined && $scope.selectedShape.getId() === selectedShape.getId()) {
                        if ($rootScope.forceSelectionRefresh) {
                            // Switch the flag again, this run will force refresh
                            $rootScope.forceSelectionRefresh = false;
                        } else {
                            // Selected the same element again, no need to update anything
                            return;
                        }
                    }

                    var selectedItem = {'title': '', 'properties': []};

                    if (canvasSelected) {
                        selectedItem.auditData = {
                            'author': $scope.modelData.createdByUser,
                            'createDate': $scope.modelData.createDate
                        };
                    }

                    // Gather properties of selected item
                    var properties = stencil.properties();
                    for (var i = 0; i < properties.length; i++) {
                        var property = properties[i];
                        if (property.popular() === false) continue;
                        var key = property.prefix() + "-" + property.id();

                        if (key === 'oryx-name') {
                            selectedItem.title = selectedShape.properties[key];
                        }

                        // First we check if there is a config for 'key-type' and then for 'type' alone
                        var propertyConfig = KISBPM.PROPERTY_CONFIG[key + '-' + property.type()];
                        if (propertyConfig === undefined || propertyConfig === null) {
                            propertyConfig = KISBPM.PROPERTY_CONFIG[property.type()];
                        }

                        if (propertyConfig === undefined || propertyConfig === null) {
                            console.log('WARNING: no property configuration defined for ' + key + ' of type ' + property.type());
                        } else {

                            if (selectedShape.properties[key] === 'true') {
                                selectedShape.properties[key] = true;
                            }

                            // if (KISBPM.CONFIG.showRemovedProperties == false && property.isHidden()) {
                            //     continue;
                            // }

                            if (KISBPM.CONFIG.showRemovedProperties == false && $scope.isHiddenProperty(property.id())) {
                                continue;
                            }

                            var currentProperty = {
                                'key': key,
                                'title': property.title(),
                                'type': property.type(),
                                'mode': 'read',
                                'hidden': property.isHidden(),
                                'value': selectedShape.properties[key]
                            };

                            // if ((currentProperty.type === 'complex' || currentProperty.type === 'multiplecomplex') && currentProperty.value && currentProperty.value.length > 0) {
                            //     try {
                            //         currentProperty.value = JSON.parse(currentProperty.value);
                            //     } catch (err) {
                            //         // ignore
                            //     }
                            // }

                            if (propertyConfig.readModeTemplateUrl !== undefined && propertyConfig.readModeTemplateUrl !== null) {
                                currentProperty.readModeTemplateUrl = propertyConfig.readModeTemplateUrl + '?version=' + $rootScope.staticIncludeVersion;
                            }
                            if (propertyConfig.writeModeTemplateUrl !== undefined && propertyConfig.writeModeTemplateUrl !== null) {
                                currentProperty.writeModeTemplateUrl = propertyConfig.writeModeTemplateUrl + '?version=' + $rootScope.staticIncludeVersion;
                            }

                            if (propertyConfig.templateUrl !== undefined && propertyConfig.templateUrl !== null) {
                                currentProperty.templateUrl = propertyConfig.templateUrl + '?version=' + $rootScope.staticIncludeVersion;
                                currentProperty.hasReadWriteMode = false;
                            } else {
                                currentProperty.hasReadWriteMode = true;
                            }

                            // if (currentProperty.title === "Id")
                            //     currentProperty.value = selectedShape.id;

                            if (currentProperty.value === undefined
                                || currentProperty.value === null
                                || currentProperty.value.length === 0) {
                                currentProperty.noValue = true;
                            }

                            selectedItem.properties.push(currentProperty);
                        }
                    }

                    // Need to wrap this in an $apply block, see http://jimhoskins.com/2012/12/17/angularjs-and-apply.html
                    $scope.safeApply(function () {
                        $scope.selectedItem = selectedItem;
                        $scope.selectedShape = selectedShape;
                    });

                } else {
                    $scope.safeApply(function () {
                        $scope.selectedItem = {};
                        $scope.selectedShape = null;
                    });
                }
            });

            //hide hidden properties
            $scope.isHiddenProperty = function (propertyId) {
                let hiddenProperties = ["ownedbywho", "owner", "actioninputstatus", "actionoutputstatus",
                    "resourceline", "workercontains", "entityspecificproperties", "traceablescenes",
                    "traceableactions", "gatewaycompany", "contain_resource", "animation", "startevent", "animate_direction", "aciton_type"];
                return hiddenProperties.includes(propertyId);
            }

            $scope.editor.registerOnEvent(ORYX.CONFIG.EVENT_SELECTION_CHANGED, function (event) {
                KISBPM.eventBus.dispatch(KISBPM.eventBus.EVENT_TYPE_HIDE_SHAPE_BUTTONS);
                var shapes = event.elements;

                if (shapes && shapes.length === 1) {

                    var selectedShape = shapes.first();

                    var a = $scope.editor.getCanvas().node.getScreenCTM();

                    var absoluteXY = selectedShape.absoluteXY();

                    absoluteXY.x *= a.a;
                    absoluteXY.y *= a.d;

                    var additionalIEZoom = 1;
                    if (!isNaN(screen.logicalXDPI) && !isNaN(screen.systemXDPI)) {
                        var ua = navigator.userAgent;
                        if (ua.indexOf('MSIE') >= 0) {
                            //IE 10 and below
                            var zoom = Math.round((screen.deviceXDPI / screen.logicalXDPI) * 100);
                            if (zoom !== 100) {
                                additionalIEZoom = zoom / 100
                            }
                        }
                    }

                    if (additionalIEZoom === 1) {
                        absoluteXY.y = absoluteXY.y - jQuery("#canvasSection").offset().top + 5;
                        absoluteXY.x = absoluteXY.x - jQuery("#canvasSection").offset().left;

                    } else {
                        var canvasOffsetLeft = jQuery("#canvasSection").offset().left;
                        var canvasScrollLeft = jQuery("#canvasSection").scrollLeft();
                        var canvasScrollTop = jQuery("#canvasSection").scrollTop();

                        var offset = a.e - (canvasOffsetLeft * additionalIEZoom);
                        var additionaloffset = 0;
                        if (offset > 10) {
                            additionaloffset = (offset / additionalIEZoom) - offset;
                        }
                        absoluteXY.y = absoluteXY.y - (jQuery("#canvasSection").offset().top * additionalIEZoom) + 5 + ((canvasScrollTop * additionalIEZoom) - canvasScrollTop);
                        absoluteXY.x = absoluteXY.x - (canvasOffsetLeft * additionalIEZoom) + additionaloffset + ((canvasScrollLeft * additionalIEZoom) - canvasScrollLeft);
                    }

                    var bounds = new ORYX.Core.Bounds(a.e + absoluteXY.x, a.f + absoluteXY.y, a.e + absoluteXY.x + a.a * selectedShape.bounds.width(), a.f + absoluteXY.y + a.d * selectedShape.bounds.height());
                    var shapeXY = bounds.upperLeft();

                    var stencilItem = $scope.getStencilItemById(selectedShape.getStencil().idWithoutNs());
                    var morphShapes = [];
                    if (stencilItem && stencilItem.morphRole) {
                        for (var i = 0; i < $scope.morphRoles.length; i++) {
                            if ($scope.morphRoles[i].role === stencilItem.morphRole) {
                                morphShapes = $scope.morphRoles[i].morphOptions;
                            }
                        }
                    }

                    var x = shapeXY.x;
                    if (bounds.width() < 48) {
                        x -= 24;
                    }

                    // 如果没有Shapes就不显示切换Shapes按钮
                    if (morphShapes && morphShapes.length > 0) {
                        // In case the element is not wide enough, start the 2 bottom-buttons more to the left
                        // to prevent overflow in the right-menu
                        var morphButton = document.getElementById('morph-button');
                        morphButton.style.display = "block";
                        morphButton.style.left = x + 24 + 'px';
                        morphButton.style.top = (shapeXY.y + bounds.height() + 2) + 'px';
                    }

                    var deleteButton = document.getElementById('delete-button');
                    deleteButton.style.display = "block";
                    deleteButton.style.left = x + 'px';
                    deleteButton.style.top = (shapeXY.y + bounds.height() + 2) + 'px';

                    if (stencilItem && (stencilItem.canConnect || stencilItem.canConnectAssociation)) {
                        var quickButtonCounter = 0;
                        var quickButtonX = shapeXY.x + bounds.width() + 5;
                        var quickButtonY = shapeXY.y;
                        jQuery('.Oryx_button').each(function (i, obj) {
                            // 如果是Action则过滤掉服务、事件等。即显示delete-button，morph-button，play-button和SequenceFlow
                            // 如果是资源则过滤掉箭头和morph-button。即显示delete-button，service-button，event-button
                            // 如果是ExitPoint和EntryPoint，不显示其他，只显示连线
                            // 如果是Scene，不显示其他，只显示连线
                            //console.log($scope.selectedItem.title);
                            let whichItem = $scope.selectedItem;
                            for (let i = 0; i < whichItem.properties.length; i++) {
                                if (whichItem.properties[i].key === "oryx-activityelement" || whichItem.properties[i].key === "oryx-startevent") return;
                            }

                            if ((stencilItem.id === 'ExitPoint') || (stencilItem.id === 'EntryPoint' && obj.id !== 'resource-line-button')) {
                                return;
                            }
                            if (stencilItem.id === 'scene' && obj.id !== 'resource-line-button') {
                                return;
                            }

                            if (obj.id !== 'morph-button' && obj.id !== 'delete-button') {

                                quickButtonCounter++;
                                if (quickButtonCounter > 3) {
                                    quickButtonX = shapeXY.x + bounds.width() + 5;
                                    quickButtonY += 24;
                                    quickButtonCounter = 1;

                                } else if (quickButtonCounter > 1) {
                                    quickButtonX += 24;
                                }
                                obj.style.display = "block";
                                obj.style.left = quickButtonX + 'px';
                                obj.style.top = quickButtonY + 'px';
                            }
                        });
                    }
                }
            });

            //add listener to do operations for dbClick to change scene name
            $scope.editor.registerOnEvent(ORYX.CONFIG.EVENT_PROPERTY_CHANGED, function (event) {
                let shape = event.elements[0];
                let selectedShape = $scope.editor.getSelection()[0];
                if (shape !== undefined && selectedShape !== undefined && shape.id === selectedShape.id) {
                    //update scene's name in scenes
                    if (shape._stencil._jsonStencil.title === "scene" && event.name === "oryx-name") {
                        $rootScope.scenes.forEach((scene) => {
                            if (scene.id === shape.id) {
                                $scope.safeApply(
                                    function () {
                                        scene.name = event.value;
                                    }
                                );
                            }
                        });
                    }
                    //update value to ensure showing the latest property value
                    $scope.safeApply(function () {
                        if ($scope.selectedItem !== undefined && $scope.selectedItem !== null) {
                            if (event.name === "oryx-name") {
                                $scope.selectedItem.title = event.value;
                            }
                            if ($scope.selectedItem.properties && $scope.selectedItem.properties.length > 0) {
                                $scope.selectedItem.properties.forEach((property) => {
                                    if (property.key === event.name) {
                                        property.value = event.value;
                                        property.noValue = (event.value === undefined
                                            || event.value === null
                                            || event.value.length === 0);
                                    }
                                });
                            }
                        }
                    });
                }
            });

            if (!$rootScope.stencilInitialized) {
                KISBPM.eventBus.addListener(KISBPM.eventBus.EVENT_TYPE_HIDE_SHAPE_BUTTONS, function (event) {
                    jQuery('.Oryx_button').each(function (i, obj) {
                        obj.style.display = "none";
                    });
                });

                /*
                 * Listen to property updates and act upon them
                 */
                KISBPM.eventBus.addListener(KISBPM.eventBus.EVENT_TYPE_PROPERTY_VALUE_CHANGED, function (event) {
                    if (event.property && event.property.key) {

                        // Update "no value" flag
                        event.property.noValue = (event.property.value === undefined
                            || event.property.value === null
                            || event.property.value.length === 0);

                        // If the name property is been updated, we also need to change the title of the currently selected item
                        if (event.property.key === 'oryx-name' && $scope.selectedItem !== undefined && $scope.selectedItem !== null) {
                            $scope.selectedItem.title = event.newValue;
                        }
                        if ($scope.selectedItem !== undefined && $scope.selectedItem !== null
                            && $scope.selectedItem.properties && $scope.selectedItem.properties.length > 0) {
                            $scope.selectedItem.properties.forEach((property) => {
                                if (property.key === event.property.key) {
                                    property.value = event.newValue;
                                    property.noValue = event.property.noValue;
                                }
                            });
                        }

                    }
                });

                KISBPM.eventBus.addListener(KISBPM.eventBus.EVENT_TYPE_EDITOR_READY, function (event) {
                    debugger;
                    console.log(event);
                });

                $rootScope.stencilInitialized = true;
            }

            /* Click handler for clicking an Action */


            $scope.morphShape = function () {
                $scope.safeApply(function () {
                    var shapes = $rootScope.editor.getSelection();
                    if (shapes && shapes.length === 1) {
                        $rootScope.currentSelectedShape = shapes.first();
                        var stencilItem = $scope.getStencilItemById($rootScope.currentSelectedShape.getStencil().idWithoutNs());
                        var morphShapes = [];
                        for (var i = 0; i < $scope.morphRoles.length; i++) {
                            if ($scope.morphRoles[i].role === stencilItem.morphRole) {
                                morphShapes = $scope.morphRoles[i].morphOptions.slice();
                            }
                        }

                        // Method to open shape select dialog (used later on)
                        var showSelectShapeDialog = function () {
                            $rootScope.morphShapes = morphShapes;
                            $modal({
                                backdrop: false,
                                keyboard: true,
                                template: 'editor-app/popups/select-shape.html?version=' + Date.now()
                            });
                        };

                        showSelectShapeDialog();
                    }
                });
            };

            // $scope.addResource = function () {
            //     var opts = {
            //         template: 'editor-app/configuration/properties/input-popup.html?version=' + Date.now(),
            //         scope: $scope
            //     };
            //     $modal(opts);
            // };

            // $scope.delResource = function () {
            //     var opts = {
            //         template: 'editor-app/configuration/properties/input-popup.html?version=' + Date.now(),
            //         scope: $scope
            //     };
            //     $modal(opts);
            // };

            $scope.getShapeById = function (id) {
                var shapes = [$scope.editor.getCanvas()][0].children;
                for (var i = 0; i < shapes.length; i++) {
                    if (id === shapes[i].id)
                        return shapes[i];
                }
                return undefined;
            };

            $scope.getHighlightedShape = function () {
                return $scope.getShapeById($scope.lastHighlightedId);
            };

            $scope.getHighlightedShapeId = function () {
                return $scope.lastHighlightedId;
            };

            $scope.setHighlightedShape = function (newId) {
                if (newId !== undefined && newId !== "") {
                    $scope.lastHighlightedId = newId;
                    $scope.HighlightedItem = $scope.getShapeById(newId);
                }

            };

            $scope.deleteShape = function () {
                var shapes = [$scope.editor.getCanvas()][0].children;
                var shapeToRemove = undefined;
                for (var i = 0; i < shapes.length; i++) {
                    if (shapes[i].properties["oryx-activityelement"] && shapes[i].properties["oryx-activityelement"].id === $scope.editor.getSelection()[0].id) {
                        shapeToRemove = shapes[i];
                        $scope.editor.deleteShape(shapeToRemove);
                    }
                }

                let shape = $scope.editor.getSelection()[0];
                if (shape.properties["oryx-type"] === "场景" || shape.properties["oryx-type"] === "scene") {
                    $scope.deleteScene(shape);
                } else if ($scope.isGateway(shape)) {
                    $scope.deleteGateway(shape);
                } else if ($scope.isAction(shape)) {
                    $scope.deleteAction(shape);
                }
                KISBPM.TOOLBAR.ACTIONS.deleteItem({'$scope': $scope});

                if ($rootScope.selectedSceneIndex > -1) {
                    $rootScope.scenes[$rootScope.selectedSceneIndex].childShapes = $scope.editor.getJSON().childShapes;
                } else if ($rootScope.selectedSceneIndex === -1) {
                    $rootScope.scenesRelations.childShapes = $scope.editor.getJSON().childShapes;
                }

                // $scope.editor.deleteShape(shapeToRemove);
                // KISBPM.TOOLBAR.ACTIONS.deleteItem({'$scope': $scope});
            };

            $scope.deleteAction = function (action) {
                let sceneId = $rootScope.scenes[$rootScope.selectedSceneIndex].id;
                $scope.deleteParametersInAction(sceneId, action.id);
                $scope.editor.deleteShape(action);
            }

            $scope.deleteGateway = function (shape) {
                while (shape.incoming.length > 0) {
                    $scope.editor.deleteShape(shape.incoming[0]);
                }
                while (shape.outgoing.length > 0) {
                    $scope.editor.deleteShape(shape.outgoing[0]);
                }

                let companyId = shape.properties["oryx-gatewaycompany"];
                if (companyId !== undefined && companyId !== "") {
                    let company = $scope.getShapeById(companyId);
                    if (company !== undefined) {
                        if ($scope.isStartGateway(shape)) {
                            $scope.deleteGateway(company);
                            $scope.editor.deleteShape(company);
                        } else {
                            company.setProperty("oryx-gatewaycompany", "");
                        }
                    }
                }
                $rootScope.scenesRelations.childShapes = $scope.editor.getJSON().childShapes;
                $rootScope.scenesRelations.sceneTree = $scope.getSceneTree();
                $scope.adjustTraceableScenes();
            }

            $scope.deleteScene = function (shape) {
                while (shape.incoming.length > 0) {
                    $scope.editor.deleteShape(shape.incoming[0]);
                }
                while (shape.outgoing.length > 0) {
                    $scope.editor.deleteShape(shape.outgoing[0]);
                }
                for (let i = 0; i < $rootScope.scenes.length; i++) {
                    let scene = $rootScope.scenes[i];
                    if (scene.id === shape.id) {
                        $rootScope.scenes.splice(i, 1);
                        break;
                    }
                }
                $scope.deleteParametersInScene(shape.id);
                $rootScope.scenesRelations.childShapes = $scope.editor.getJSON().childShapes;
                $rootScope.scenesRelations.sceneTree = $scope.getSceneTree();
                $scope.adjustTraceableScenes();
            }

            $scope.adjustTraceableScenes = function () {
                let shapes = [$scope.editor.getCanvas()][0];
                for (let i = 0; i < shapes.length; i++) {
                    if (shapes[i].properties['oryx-type'] === "场景" || shapes[i].properties['oryx-type'] === "scene") {
                        let traceableScenes = $scope.findTraceableScenes(shapes[i]);
                        traceableScenes.splice(traceableScenes.indexOf(shapes[i].id), 1);
                        shapes[i].setProperty("oryx-traceablescenes", traceableScenes);
                    }
                }
            }

            $scope.quickAddItem = function (newItemId) {
                $scope.safeApply(function () {

                    var shapes = $rootScope.editor.getSelection();
                    if (shapes && shapes.length == 1) {
                        $rootScope.currentSelectedShape = shapes.first();

                        var containedStencil = undefined;
                        var stencilSets = $scope.editor.getStencilSets().values();
                        for (var i = 0; i < stencilSets.length; i++) {
                            var stencilSet = stencilSets[i];
                            var nodes = stencilSet.nodes();
                            for (var j = 0; j < nodes.length; j++) {
                                if (nodes[j].idWithoutNs() === newItemId) {
                                    containedStencil = nodes[j];
                                    break;
                                }
                            }
                        }

                        if (!containedStencil) return;

                        var option = {
                            type: $scope.currentSelectedShape.getStencil().namespace() + newItemId,
                            namespace: $scope.currentSelectedShape.getStencil().namespace()
                        };
                        option['connectedShape'] = $rootScope.currentSelectedShape;
                        option['parent'] = $rootScope.currentSelectedShape.parent;
                        option['containedStencil'] = containedStencil;

                        var args = {sourceShape: $rootScope.currentSelectedShape, targetStencil: containedStencil};
                        var targetStencil = $scope.editor.getRules().connectMorph(args);
                        if (!targetStencil) {
                            return;
                        }// Check if there can be a target shape
                        option['connectingType'] = targetStencil.id();

                        var command = new KISBPM.CreateCommand(option, undefined, undefined, $scope.editor);

                        $scope.editor.executeCommands([command]);
                    }
                });
            };

            // 资源堆，保存除高亮Action之外的其他Action中的资源
            var resourceHeap = {};

            var getResourceIdbyType = function (type) {
                for (var i = 0; i < constTypeOfResource.length; i++) {
                    if (type === constTypeOfResource[i].name) {
                        return constTypeOfResource[i].type;
                    }
                }

                return "";
            };
            var getResource = function () {
                // 获取资源
                // 遍历页面上的资源元素
                var shapes = $scope.editor.getCanvas();
                var resources = {};
                var k = 0;
                for (var i = 0; i < shapes.nodes.length; i++) {
                    if (shapes.nodes[i].properties["oryx-startevent"] === undefined && shapes.nodes[i].properties["oryx-activityelement"] === undefined) {
                        // 如果确实是资源，则保存shape
                        resources[k] = {
                            shape: shapes.nodes[i],
                            resourceId: getResourceIdbyType(shapes.nodes[i].properties["oryx-type"])
                        };
                        k++;
                    }
                }

                return resources;
            };

            var setResource = function (shapes) {
                // 设置资源
                var resources = getResource();
                createResource($scope, resources[0].shape, resources[0].resourceId);
            };

            var createResource = function ($scope, shape, resourceId) {
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
                    shape: shape,
                    type: shape.getStencil().namespace() + resourceId,
                    namespace: shape.getStencil().namespace(),
                    parent: shape.parent,
                    containedStencil: resource,
                    positionController: resourceOption
                };

                var command = new KISBPM.CreateCommand(option, undefined, undefined, $scope.editor);
                $scope.editor.executeCommands([command]);
            };


        }); // end of $scope.editorFactory.promise block

        var basePosY = 0;
        $scope.clickLine = function (event) {
            let splitLine = jQuery('#splitLine');
            let wrappers = jQuery("#wrappers");
            let paletteHelpWrapper = jQuery('#paletteSection');
            let propertiesHelpWrapper = jQuery('#propertySection');
            basePosY = event.clientY;
            let anchor = splitLine[0].offsetTop - 60;

            wrappers.bind("mousemove", function (event) {
                let posY = event.clientY;
                let offsetY = (posY - basePosY);

                paletteHelpWrapper.css("height", anchor + offsetY + "px");
                // splitLine.css("top", anchor + offsetY+ "px");
                propertiesHelpWrapper.css("height", anchor - offsetY + "px");

            });

            wrappers.bind("mouseup", function (event) {
                wrappers.unbind("mousemove");
            });
        }


        /* Click handler for clicking a property */
        $scope.propertyClicked = function (index) {
            if (!$scope.selectedItem.properties[index].hidden) {
                $scope.selectedItem.properties[index].mode = "write";
            }
        };

        /* Helper method to retrieve the template url for a property */
        $scope.getPropertyTemplateUrl = function (index) {
            return $scope.selectedItem.properties[index].templateUrl;
        };

        $scope.getPropertyReadModeTemplateUrl = function (index) {
            return $scope.selectedItem.properties[index].readModeTemplateUrl;
        };
        $scope.getPropertyWriteModeTemplateUrl = function (index) {
            return $scope.selectedItem.properties[index].writeModeTemplateUrl;
        };
        /* Method available to all sub controllers (for property controllers) to update the internal Oryx model */
        $scope.updatePropertyInModel = function (property, shapeId) {

            var shape = $scope.selectedShape;
            // Some updates may happen when selected shape is already changed, so when an additional
            // shapeId is supplied, we need to make sure the correct shape is updated (current or previous)
            if (shapeId) {
                if (shape.id !== shapeId && $scope.previousSelectedShape && $scope.previousSelectedShape.id === shapeId) {
                    shape = $scope.previousSelectedShape;
                } else if (shapeId === $scope.getHighlightedShapeId()) {
                    shape = $scope.getHighlightedShape();
                } else {
                    shape = null;
                }
            }

            if (!shape) {
                // When no shape is selected, or no shape is found for the alternative
                // shape ID, do nothing
                return;
            }
            var key = property.key;
            var newValue = property.value;
            var oldValue = shape.properties[key];

            if (newValue != oldValue) {
                var commandClass = ORYX.Core.Command.extend({
                    construct: function () {
                        this.key = key;
                        this.oldValue = oldValue;
                        this.newValue = newValue;
                        this.shape = shape;
                        this.facade = $scope.editor;
                    },
                    execute: function () {
                        //debugger;
                        this.shape.setProperty(this.key, this.newValue);
                        this.facade.getCanvas().update();
                        this.facade.updateSelection();
                    },
                    rollback: function () {
                        this.shape.setProperty(this.key, this.oldValue);
                        this.facade.getCanvas().update();
                        this.facade.updateSelection();
                    }
                });
                // Instantiate the class
                var command = new commandClass();

                // Execute the command
                $scope.editor.executeCommands([command]);
                $scope.editor.handleEvents({
                    type: ORYX.CONFIG.EVENT_PROPWINDOW_PROP_CHANGED,
                    elements: [shape],
                    key: key
                });

                // Switch the property back to read mode, now the update is done
                property.mode = 'read';

                // Fire event to all who is interested
                // Fire event to all who want to know about this
                var event = {
                    type: KISBPM.eventBus.EVENT_TYPE_PROPERTY_VALUE_CHANGED,
                    property: property,
                    oldValue: oldValue,
                    newValue: newValue
                };
                KISBPM.eventBus.dispatch(event.type, event);
            } else {
                // Switch the property back to read mode, no update was needed
                property.mode = 'read';
            }

        };

        /**
         * Helper method that searches a group for an item with the given id.
         * If not found, will return undefined.
         */
        $scope.findStencilItemInGroup = function (stencilItemId, group) {

            var item;

            // Check all items directly in this group
            for (var j = 0; j < group.items.length; j++) {
                item = group.items[j];
                if (item.id === stencilItemId) {
                    return item;
                }
            }

            // Check the child groups
            if (group.groups && group.groups.length > 0) {
                for (var k = 0; k < group.groups.length; k++) {
                    item = $scope.findStencilItemInGroup(stencilItemId, group.groups[k]);
                    if (item) {
                        return item;
                    }
                }
            }

            return undefined;
        };

        /**
         * Helper method to find a stencil item.
         */
        $scope.getStencilItemById = function (stencilItemId) {
            for (var i = 0; i < $scope.stencilItemGroups.length; i++) {
                var element = $scope.stencilItemGroups[i];

                // Real group
                if (element.items !== null && element.items !== undefined) {
                    var item = $scope.findStencilItemInGroup(stencilItemId, element);
                    if (item) {
                        return item;
                    }
                } else { // Root stencil item
                    if (element.id === stencilItemId) {
                        return element;
                    }
                }
            }
            return undefined;
        };

        $scope.findGroupNameByStencilItem = function (stencilItemId) {
            for (var i = 0; i < $scope.stencilItemGroups.length; i++) {
                var group = $scope.stencilItemGroups[i];
                var item = $scope.findStencilItemInGroup(stencilItemId, group);
                if (item !== undefined)
                    return group;
            }
            return undefined;
        };

        $scope.getPropertybyKey = function (propertylist, key) {
            console.log(propertylist);
            if (propertylist[0] === undefined) {
                return propertylist[key];
            }
            for (var i = 0; i < propertylist.length; i++) {
                if (propertylist[i].key === key) {
                    return propertylist[i].value;
                }
            }

            return undefined;
        };

        $scope.getPositionbyselector = function (selector) {
            if (selector.length === 0) {
                return undefined;
            }
            var p = {x: 0, y: 0};
            var p_str = selector.attr("transform");// p_str="translate(315.5, 151.999995)"
            var regX = "(?<=\\()(.+?)(?=\,)";
            var regY = "(?<=\,)(.+?)(?=\\))";

            var resltX = p_str.match(regX);// ["303.5, 124.999995", "303.5, 124.999995", index: 10, input: "translate(303.5, 124.999995)", groups: undefined]
            var resltY = p_str.match(regY);

            if (resltX && resltY) {
                p.x = Math.round(resltX[0].trim());
                p.y = Math.round(resltY[0].trim());
            }

            console.log(p);
            return p;
        };

        angular.module('activitiModeler').AnimationClass($rootScope, $scope);

        angular.module('activitiModeler').DragDropClass($rootScope, $scope);

        new Promise(function (resolve, reject) {
            setTimeout(function () {
                resolve('200 OK');
            }, 5000);
        }).then(function (result) {
            let selectionOverrideIds;
            let lastHighlightedActionId;
            if ($rootScope.selectedSceneIndex > -1) {
                selectionOverrideIds = $rootScope.scenes[$rootScope.selectedSceneIndex].lastselectionOverrideIds;
                lastHighlightedActionId = $rootScope.scenes[$rootScope.selectedSceneIndex].lastHighlightedActionId;
            }

            if (selectionOverrideIds && selectionOverrideIds.length >= 1) {
                let selection = [];
                for (let i = 0; i < selectionOverrideIds.length; i++) {
                    selection[selection.length] = $scope.getShapeById(selectionOverrideIds[i]);
                }
                $scope.editor.setSelection(selection);
                $scope.editor.getCanvas().update();
            }
            if (lastHighlightedActionId) {
                $scope.HighlightedItem = $scope.getShapeById($rootScope.scenes[$rootScope.selectedSceneIndex].lastHighlightedActionId);
                if ($scope.HighlightedItem) {
                    $scope.lastHighlightedId = $scope.HighlightedItem.id;
                    jQuery('#' + $scope.lastHighlightedId + 'bg_frame').attr({"fill": "#04FF8E"});
                }
            }
        });

// $scope.addScene = function () {
//     var opts = {
//         template: 'editor-app/popups/scene-create.html?version=' + Date.now(),
//         scope: $scope
//     };
//     $modal(opts);
// }

        $scope.setSelectedSceneIndex = function (index) {
            $scope.selectedSceneIndex = index;
        };

        $scope.getSelectedSceneIndex = function () {
            return $scope.selectedSceneIndex;
        };

        $scope.getShapeByOverrideId = function (overrideId) {
            var shapes = [$scope.editor.getCanvas()][0].children;
            for (let i = 0; i < shapes.length; i++) {
                if (shapes[i].properties['oryx-overrideid'] === overrideId) {
                    return shapes[i];
                }
            }
            return null;
        };

        $scope.takeScreenshot = function (index) {
            try {
                html2canvas(document.getElementById("canvasHelpWrapper"), {
                    onclone: function (html) {
                        const rects = jQuery(html).find('rect');
                        const rectStyles = ['stroke-width', 'stroke', 'z-index', 'fill'];
                        rects.each(function () {
                            const style = window.getComputedStyle(this);
                            rectStyles.forEach(item => {
                                const value = style.getPropertyValue(item);
                                jQuery(this).css(item, value);
                            });
                            // let display = rect.parentElement.getAttribute('style').match(/display:(.*?);/)
                            // if(display.length > 0){
                            //     let type = display[1].trim(); // block 或 none
                            //
                            // }
                        });
                    }
                }).then(function (screenshot) {
                    if (index > -1)
                        $rootScope.scenes[index].img = screenshot.toDataURL("image/jpeg");
                    else {
                        $rootScope.scenesRelations.img = screenshot.toDataURL("image/jpeg");
                    }
                });
            } catch (e) {
                console.log(e);
            }

        }

        angular.module('activitiModeler').SceneClass($rootScope, $scope);
        angular.module('activitiModeler').ActionSeqClass($rootScope, $scope, $timeout);

    }])
;


var KISBPM = KISBPM || {};
//create command for undo/redo
KISBPM.CreateCommand = ORYX.Core.Command.extend({
    construct: function (option, currentReference, position, facade) {
        this.option = option;
        this.currentReference = currentReference;
        this.position = position;
        this.facade = facade;
        this.shape;
        this.edge;
        this.targetRefPos;
        this.sourceRefPos;
        /*
         * clone options parameters
         */
        this.connectedShape = option.connectedShape;
        this.connectingType = option.connectingType;
        this.namespace = option.namespace;
        this.type = option.type;
        this.containedStencil = option.containedStencil;
        this.parent = option.parent;
        this.positionController = option.positionController;
        this.shape = option.shape;
        this.shapeOptions = option.shapeOptions;
    },
    execute: function () {
        //debugger;
        if (this.shape) {
            if (this.shape instanceof ORYX.Core.Node) {
                this.parent.add(this.shape);
                if (this.edge) {
                    this.facade.getCanvas().add(this.edge);
                    this.edge.dockers.first().setDockedShape(this.connectedShape);
                    this.edge.dockers.first().setReferencePoint(this.sourceRefPos);
                    this.edge.dockers.last().setDockedShape(this.shape);
                    this.edge.dockers.last().setReferencePoint(this.targetRefPos);
                }

                this.facade.setSelection([this.shape]);

            } else if (this.shape instanceof ORYX.Core.Edge) {
                this.facade.getCanvas().add(this.shape);
                this.shape.dockers.first().setDockedShape(this.connectedShape);
                this.shape.dockers.first().setReferencePoint(this.sourceRefPos);
            }
        } else {
            this.shape = this.facade.createShape(this.option);
            this.edge = (!(this.shape instanceof ORYX.Core.Edge)) ? this.shape.getIncomingShapes().first() : undefined;
        }

        if (this.currentReference && this.position) {

            if (this.shape instanceof ORYX.Core.Edge) {

                if (!(this.currentReference instanceof ORYX.Core.Canvas)) {
                    this.shape.dockers.last().setDockedShape(this.currentReference);

                    if (this.currentReference.getStencil().idWithoutNs() === 'TextAnnotation') {
                        var midpoint = {};
                        midpoint.x = 0;
                        midpoint.y = this.currentReference.bounds.height() / 2;
                        this.shape.dockers.last().setReferencePoint(midpoint);
                    } else {
                        this.shape.dockers.last().setReferencePoint(this.currentReference.bounds.midPoint());
                    }
                } else {
                    this.shape.dockers.last().bounds.centerMoveTo(this.position);
                }
                this.sourceRefPos = this.shape.dockers.first().referencePoint;
                this.targetRefPos = this.shape.dockers.last().referencePoint;

            } else if (this.edge) {
                this.sourceRefPos = this.edge.dockers.first().referencePoint;
                this.targetRefPos = this.edge.dockers.last().referencePoint;
            }
        } else {
            var pos;
            var bs = this.shape.bounds;
            if (this.connectedShape) {
                var containedStencil = this.containedStencil;
                var connectedShape = this.connectedShape;
                var bc = connectedShape.bounds;

                pos = bc.center();
                if (containedStencil.defaultAlign() === "north") {
                    pos.y -= (bc.height() / 2) + ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET + (bs.height() / 2);
                } else if (containedStencil.defaultAlign() === "northeast") {
                    pos.x += (bc.width() / 2) + ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER + (bs.width() / 2);
                    pos.y -= (bc.height() / 2) + ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER + (bs.height() / 2);
                } else if (containedStencil.defaultAlign() === "southeast") {
                    pos.x += (bc.width() / 2) + ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER + (bs.width() / 2);
                    pos.y += (bc.height() / 2) + ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER + (bs.height() / 2);
                } else if (containedStencil.defaultAlign() === "south") {
                    pos.y += (bc.height() / 2) + ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET + (bs.height() / 2);
                } else if (containedStencil.defaultAlign() === "southwest") {
                    pos.x -= (bc.width() / 2) + ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER + (bs.width() / 2);
                    pos.y += (bc.height() / 2) + ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER + (bs.height() / 2);
                } else if (containedStencil.defaultAlign() === "west") {
                    pos.x -= (bc.width() / 2) + ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET + (bs.width() / 2);
                } else if (containedStencil.defaultAlign() === "northwest") {
                    pos.x -= (bc.width() / 2) + ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER + (bs.width() / 2);
                    pos.y -= (bc.height() / 2) + ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER + (bs.height() / 2);
                } else {
                    pos.x += (bc.width() / 2) + ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET + (bs.width() / 2);
                }
            } else {
                pos = {x: this.positionController.x, y: this.positionController.y};//this.positionController.type==='set'
                if (this.positionController.type === 'offsetY') {
                    pos.x = ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER + (bs.width() / 2);
                    pos.y += ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET + (bs.height() / 2);
                } else if (this.positionController.type === 'offsetX') {
                    pos.x += ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER + (bs.width() / 2);
                    pos.y = ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET + (bs.height() / 2);
                } else if (this.positionController.type === 'offset') {
                    pos.x += ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER + (bs.width() / 2);
                    pos.y += ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET + (bs.height() / 2);
                }
            }

            // Move shape to the new position
            this.shape.bounds.centerMoveTo(pos);

            // Move all dockers of a node to the position
            if (this.shape instanceof ORYX.Core.Node) {
                (this.shape.dockers || []).each(function (docker) {
                    docker.bounds.centerMoveTo(pos);
                });
            }

            //this.shape.update();
            this.position = pos;

            if (this.edge) {
                this.sourceRefPos = this.edge.dockers.first().referencePoint;
                this.targetRefPos = this.edge.dockers.last().referencePoint;
            }
        }

        this.facade.getCanvas().update();
        this.facade.updateSelection();

    },
    rollback: function () {
        this.facade.deleteShape(this.shape);
        if (this.edge) {
            this.facade.deleteShape(this.edge);
        }
        //this.currentParent.update();
        this.facade.setSelection(this.facade.getSelection().without(this.shape, this.edge));
    }
});
