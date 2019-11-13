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
        var lastHighlightedId = "";
        var HilghlightedItem;

        // Property window toggle state
        $scope.propertyWindowState = {'collapsed': true};

        // Add reference to global header-config
        $scope.headerConfig = KISBPM.HEADER_CONFIG;

        $scope.propertyWindowState.toggle = function () {
            $scope.propertyWindowState.collapsed = !$scope.propertyWindowState.collapsed;
            $timeout(function () {
                jQuery(window).trigger('resize');
            });
        };

        // Code that is dependent on an initialised Editor is wrapped in a promise for the editor
        $scope.editorFactory.promise.then(function () {

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
                var quickMenuDefinition = ['SequenceFlow'];
                var ignoreForPaletteDefinition = ['SequenceFlow', 'MessageFlow', 'Association', 'DataAssociation', 'DataStore', 'SendTask'];
                var quickMenuItems = [];

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
                        if (stencilRole === 'sequence_start') {
                            stencilItem.canConnect = true;
                        } else if (stencilRole === 'sequence_end') {
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

                for (var i = 0; i < stencilItemGroups.length; i++) {
                    if (stencilItemGroups[i].paletteItems && stencilItemGroups[i].paletteItems.length == 0) {
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

            // $scope.editor.registerOnEvent(ORYX.CONFIG.EVENT_DBLCLICK, function (event) {
            //     // 双击高亮
            //     // 两个阶段的要求
            //     // 1.选中的Action，高亮(被选中元素高亮，未选中元素取消高亮)
            //     // 2.选中的Action，显示当前画布
            //     // 阶段1
            //     if($scope.selectedItem){
            //         var itemId = $scope.selectedItem.properties[0].value;
            //         var lastId = lastHighlightedId;
            //         // 取消上次高亮
            //         if(lastId !== ""){
            //             jQuery('#' + lastId + 'bg_frame').attr({"fill":"#f9f9f9"});
            //         }
            //
            //         // 只有Action才会被高亮
            //         if(($scope.selectedItem.properties["oryx-activityelement"] !== undefined)){
            //             // 高亮
            //             jQuery('#' + itemId + 'bg_frame').attr({"fill":"#04FF8E8F"});
            //             console.log(itemId);
            //
            //             lastHighlightedId = itemId;
            //             HilghlightedItem = $scope.selectedItem;
            //         }
            //     }
            // });
            
            $scope.editor.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEUP, function (event) {
                // 选都没选中，直接返回
                if ($scope.selectedItem.auditData !== undefined) {
                    if(lastHighlightedId !== "" && event.clientX < document.documentElement.clientWidth*0.2745 ){ //375
                        // 取消高亮
                        // 只有鼠标在中间的时候,才取消高亮
                        jQuery('#' + lastHighlightedId + 'bg_frame').attr({"fill":"#f9f9f9"});
                        lastHighlightedId = "";
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
                        if ($scope.inputStatus[i].type === "工人" || $scope.inputStatus[i].type === "用户") {
                            userShape = shape;
                            userOriginPosition = $scope.inputStatus[i].position;
                        }
                        console.log(shape);
                        $scope.outputStatus[$scope.outputStatus.length] = {
                            id: id,
                            type: shape.properties["oryx-type"],
                            name: shape.properties["oryx-name"],
                            position: shape.bounds.center()
                        }
                    }
                    //  && (shape.properties["oryx-activityelement"]===undefined)
                    if (userShape){
                        var position = userShape.bounds.center();

                        if (userOriginPosition.x !== position.x || userOriginPosition.y !== position.y){
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
                            if ($scope.neibor && $scope.neibor.length !== 0){
                                var opts = {
                                    template: "editor-app/configuration/properties/thing-get-or-leave-popup.html",
                                    scope: $scope
                                };
                                $modal(opts);
                            }
                        }

                    } else {
                        $scope.outputStatus = [];
                        // 两个阶段的要求
                        // 1.选中的Action，高亮(被选中元素高亮，未选中元素取消高亮)
                        // 2.选中的Action，显示当前画布
                        // 1
                        shape = $scope.selectedItem;
                        for(i = shape.properties.length; i>0; i--){
                            if(shape.properties[i-1].key === "oryx-activityelement") break;
                        }

                        if(shape && i>0){
                            var itemId = id;
                            var lastId = lastHighlightedId;
                            // 取消上次高亮
                            if(lastId !== ""){
                                jQuery('#' + lastId + 'bg_frame').attr({"fill":"#f9f9f9"});
                            }

                            // 高亮
                            jQuery('#' + itemId + 'bg_frame').attr({"fill":"#04FF8E"});
                            console.log(itemId);

                            lastHighlightedId = id;
                            HilghlightedItem = shape;
                        }
                    }
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

                            if (KISBPM.CONFIG.showRemovedProperties == false && property.isHidden()) {
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
                            if (propertyConfig.writeModeTemplateUrl !== null && propertyConfig.writeModeTemplateUrl !== null) {
                                currentProperty.writeModeTemplateUrl = propertyConfig.writeModeTemplateUrl + '?version=' + $rootScope.staticIncludeVersion;
                            }

                            if (propertyConfig.templateUrl !== undefined && propertyConfig.templateUrl !== null) {
                                currentProperty.templateUrl = propertyConfig.templateUrl + '?version=' + $rootScope.staticIncludeVersion;
                                currentProperty.hasReadWriteMode = false;
                            }
                            else {
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
                            //
                            //console.log($scope.selectedItem.title);
                            var whichItem = $scope.selectedItem;
                            for(var i=0;i<whichItem.properties.length;i++){
                                if (whichItem.properties[i].key === "oryx-activityelement" || whichItem.properties[i].key === "oryx-startevent") return;
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
                        // If the name property is been updated, we also need to change the title of the currently selected item
                        if (event.property.key === 'oryx-name' && $scope.selectedItem !== undefined && $scope.selectedItem !== null) {
                            $scope.selectedItem.title = event.newValue;
                        }

                        // Update "no value" flag
                        event.property.noValue = (event.property.value === undefined
                            || event.property.value === null
                            || event.property.value.length == 0);
                    }
                });

                KISBPM.eventBus.addListener(KISBPM.eventBus.EVENT_TYPE_EDITOR_READY,function(event){
                    debugger;
                    console.log(event);
                });

                $rootScope.stencilInitialized = true;
            }

            /* Click handler for clicking an Action */
            $scope.playShape = function () {
                setResource();
                return;

                // ----new----
                // get res from prop
                var propertylist = $scope.selectedItem.properties;

                var inputProp = $scope.getPropertybyKey(propertylist, "oryx-input");
                var outputProp = $scope.getPropertybyKey(propertylist, "oryx-output");
                var AEProp = $scope.getPropertybyKey(propertylist, "oryx-activityelement");
                var direction = $scope.getPropertybyKey(propertylist, "oryx-animate_direction");

                // create jquery selector
                var inputPropSel = jQuery("#" + inputProp.id).parent().parent();
                var outputPropSel = jQuery("#" + outputProp.id).parent().parent();
                var AEPropSel = jQuery("#" + AEProp.id).parent().parent();

                // get animation resource position
                var pos_input = $scope.getPositionbyselector(inputPropSel);
                var pos_output = $scope.getPositionbyselector(outputPropSel);
                var pos_AE = $scope.getPositionbyselector(AEPropSel);

                // play
                // ----new----
                var playTime = 0;
                if (AEProp.type !== "工人") {
                    for (var i = 0; i < 10; i++) {

                        if (inputPropSel.length !== 0) {
                            setTimeout(function () {
                                $scope.playAnimation(inputPropSel, "linear", "0", pos_AE, pos_input);
                                $scope.stopAnimation(inputPropSel, 1500);
                            }, playTime);
                            playTime += 1000;
                        }
                        setTimeout(function () {
                            $scope.playAnimation(AEPropSel, "flash", "0", pos_AE, pos_AE);
                            $scope.stopAnimation(AEPropSel, 1500);
                        }, playTime);
                        playTime += 1500;
                        if (outputPropSel.length !== 0) {
                            setTimeout(function () {
                                $scope.playAnimation(outputPropSel, "linear", "1", pos_AE, pos_output);
                                $scope.stopAnimation(outputPropSel, 1500);
                            }, playTime);

                        }

                    }
                } else {
                    if (direction === "0") {
                        // 众包取东西
                        // 0.订单输入？,1.人闪两下,2.人前往目标位置，3.人取东西；4.人携带东西回到原来位置
                        // AE: 人；    input：指令；    output： 取的东西
                        // step0
                        $scope.playAnimation(inputPropSel, "linear", "0", pos_AE, pos_input);
                        $scope.stopAnimation(inputPropSel, 1500);
                        // step1
                        $scope.playAnimation(AEPropSel, "flash", "0", pos_AE, pos_AE);
                        $scope.stopAnimation(AEPropSel, 1500);
                        // step2
                        setTimeout(function () {
                            $scope.playAnimation(AEPropSel, "linear2", "0", pos_output, pos_AE);
                            $scope.stopAnimation(AEPropSel, 1500);
                        }, 2000);

                        // step3
                        setTimeout(function () {
                            $scope.playAnimation(outputPropSel, "flash", "0", pos_output, pos_output);
                            $scope.stopAnimation(outputPropSel, 1500);
                        }, 3000);

                        // step4
                        setTimeout(function () {
                            var obj_pos_output = {x: pos_output.x, y: pos_output.y};
                            var obj_pos_AE = {x: pos_AE.x, y: pos_AE.y};
                            if (pos_output.x - 40 > 0) {
                                obj_pos_output.x -= 40;
                                obj_pos_AE.x -= 40;
                            }
                            $scope.playAnimation(AEPropSel, "linear", "1", pos_output, pos_AE);
                            $scope.playAnimation(outputPropSel, "linear", "1", obj_pos_output, obj_pos_AE);

                            $scope.stopAnimation(AEPropSel, 2000);
                            $scope.stopAnimation(outputPropSel, 2000);
                        }, 5500);
                    } else {
                        // 众包送东西
                        // 1. 人闪两下；2.人携带东西到目标位置
                        // step1
                        setTimeout(function () {
                            $scope.playAnimation(AEPropSel, "flash", "0", pos_AE, pos_AE);
                            $scope.stopAnimation(AEPropSel, 1500);
                        }, playTime);
                        playTime += 2000;

                        // step2
                        setTimeout(function () {
                            $scope.playAnimation(AEPropSel, "linear2", "0", pos_output, pos_AE);
                            $scope.stopAnimation(AEPropSel, 1500);
                        }, playTime);

                    }


                }

                //隐藏与动作无关的其他内容
                var selectItemId = $scope.editor.getSelection()[0].id;
                var shapes = [$scope.editor.getCanvas()][0].children;
                for (var i = 0; i < shapes.length; i++) {
                    var shapeId = shapes[i].id;
                    if (shapeId !== selectItemId
                        && shapeId !== inputProp.id
                        && shapeId !== outputProp.id
                        && shapeId !== AEProp.id) {
                        jQuery('#' + shapeId).parent().parent().attr("display", "none");
                    }
                }

                //让内容全部显示
                setTimeout(function () {
                    for (var i = 0; i < shapes.length; i++) {
                        jQuery('#' + shapes[i].id).parent().parent().attr("display", "");
                    }
                }, 9000);

            };
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

            $scope.setService = function () {
                var opts = {
                    template: 'editor-app/configuration/properties/services-popup_new.html?version=' + Date.now(),
                    scope: $scope
                };
                $modal(opts);
            };

            $scope.setEvent = function () {
                var opts = {
                    template: 'editor-app/configuration/properties/events-popup.html?version=' + Date.now(),
                    scope: $scope
                };
                $modal(opts);
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

            $scope.getHighlightedShape = function(){
                return $scope.getShapeById(lastHighlightedId);
            };

            $scope.getHighlightedShapeId = function(){
                return lastHighlightedId;
            };

            $scope.setHighlightedShape = function(newId){
                if(newId !== undefined && newId !== ""){
                    lastHighlightedId = newId;
                    HilghlightedItem = $scope.getShapeById(newId);
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
                KISBPM.TOOLBAR.ACTIONS.deleteItem({'$scope': $scope});
                // $scope.editor.deleteShape(shapeToRemove);
                // KISBPM.TOOLBAR.ACTIONS.deleteItem({'$scope': $scope});
            };

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

            var getResourceIdbyType = function(type){
                var resourceToFunctionType = [
                    {name: "设备", type: "PhysicalAction"},
                    {name: "物品", type: "PhysicalAction"},
                    {name: "机器人", type: "PhysicalAction"},
                    {name: "用户", type: "SocialAction"},
                    {name: "工人", type: "SocialAction"},
                    {name: "云应用", type: "CyberAction"},
                    {name: "移动应用", type: "CyberAction"},
                    {name: "嵌入式应用", type: "CyberAction"},
                    {name: "信息对象", type: "CyberAction"}
                ];

                for(var i=0;i<resourceToFunctionType.length;i++){
                    if(type === resourceToFunctionType[i].name){
                        return resourceToFunctionType[i].type;
                    }
                }

                return "";
            };
            var getResource = function(){
                // 获取资源
                // 遍历页面上的资源元素
                var shapes = $scope.editor.getCanvas();
                var resources = {};
                var k=0;
                for(var i=0; i < shapes.nodes.length; i++){
                    if(shapes.nodes[i].properties["oryx-startevent"] === undefined && shapes.nodes[i].properties["oryx-activityelement"] === undefined){
                        // 如果确实是资源，则保存shape
                        resources[k] = {shape:shapes.nodes[i], resourceId:getResourceIdbyType(shapes.nodes[i].properties["oryx-type"])};
                        k++;
                    }
                }

                return resources;
            };

            var setResource = function(shapes){
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
                    shape:shape,
                    type: shape.getStencil().namespace() + resourceId,
                    namespace: shape.getStencil().namespace(),
                    parent: shape.parent,
                    containedStencil: resource,
                    positionController: resourceOption
                };

                var command = new KISBPM.CreateCommand(option, undefined, undefined, $scope.editor);
                $scope.editor.executeCommands([command]);
            };

            $scope.switchScene = function(oldShapeId, newShapeId){
                // 切换场景
                // 从旧场景切换到新场景：
                // 1.如果新场景是UndefinedAction，则只需要保存当前页面资源；
                // 2.如果新场景是其他Action，除了需要保存当前资源之外，还需要从资源堆中取出其他Action的资源
                // to do


            };

        }); // end of $scope.editorFactory.promise block

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
            for (var i = 0; i < propertylist.length; i++) {
                if (propertylist[i].key == key) {
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

        $scope.createCSSRulefromTemplate = function (type, direction) {
            var ruleFunction;
            switch (type) {
                // A -> B
                // 直线移动，从A点移动到B点
                case "linear":
                    if (direction === "0") {
                        ruleFunction = function (from, to, ruleName) {
                            return "@keyframes " + ruleName + " {   0% { opacity: 0; transform: translate(" + from.x + "px, " + from.y + "px); }  100% { opacity: 1; transform: translate(" + to.x + "px, " + to.y + "px); }}";
                        };
                    }
                    else {
                        ruleFunction = function (from, to, ruleName) {
                            return "@keyframes " + ruleName + " {   0% { opacity: 0; transform: translate(" + to.x + "px, " + to.y + "px); }   100% { opacity: 1; transform: translate(" + from.x + "px, " + from.y + "px); }}";
                        };
                    }
                    break;
                case "flash":
                    ruleFunction = function (ruleName) {
                        //return "@keyframes "+ruleName+" {  0% {    opacity: 0;    -webkit-transform: scale3d(0.3, 0.3, 0.3);    transform: scale3d(0.3, 0.3, 0.3);  }  50% {    opacity: 1;   }}"
                        return "@keyframes " + ruleName + " {  from,  50%,  to {    opacity: 1;  }  25%,  75% {    opacity: 0;  }}";
                    };
                    break;
                default:
                    console.log("No such type!");
                    break;
            }
            return ruleFunction;
        };

        $scope.buildCSSRule = function (p_stable, p_animate, type, direction, ruleName) {
            var ruleFunc;
            var r;
            if (ruleName === "") {
                ruleName = type;
            }
            switch (type) {
                case "linear":
                    var offsetX = p_stable.x - Math.round(0.2 * (p_stable.x - p_animate.x));
                    var offsetY = p_stable.y - Math.round(0.2 * (p_stable.y - p_animate.y));
                    var distance = {x: offsetX, y: offsetY};

                    ruleFunc = $scope.createCSSRulefromTemplate(type, direction);
                    r = ruleFunc(p_animate, distance, ruleName);
                    break;
                case "flash":
                    ruleFunc = $scope.createCSSRulefromTemplate(type, direction);
                    r = ruleFunc(ruleName);
                    break;
                case "linear2":
                    var offsetX = p_stable.x - Math.round(0.2 * (p_stable.x - p_animate.x));
                    var offsetY = p_stable.y - Math.round(0.2 * (p_stable.y - p_animate.y));
                    var distance = {x: offsetX, y: offsetY};

                    ruleFunc = $scope.createCSSRulefromTemplate("linear", direction);
                    r = ruleFunc(p_animate, distance, ruleName);
                    break;
                default:
                    console.log("No such type!");
                    break;
            }
            console.log(r);
            return r;
        };

        $scope.playAnimation = function (selector, type, direction, pos_stable, pos_animation) {
            var style = document.styleSheets[7]; // 7==animate.css
            if (type === "" || type === undefined) {
                type = "linear";
            }
            var cssRuleName = type + Date.now() + parseInt(Math.random() * 100);

            var CSSKeyframeRule = $scope.buildCSSRule(pos_stable, pos_animation, type, direction, cssRuleName);
            var CSSStyleRule = "." + cssRuleName + " { -webkit-animation-name: " + cssRuleName + "; animation-name: " + cssRuleName + "; }";
            style.insertRule(CSSKeyframeRule);
            style.insertRule(CSSStyleRule);

            selector.attr("class", "stencils animated slow " + cssRuleName + " infinite");
        };

        $scope.stopAnimation = function (selector, delay) {
            var style = document.styleSheets[7]; // 7==animate.css
            setTimeout(function () {
                selector.attr("class", "stencils");
                var index = 99999999;
                for (var i = 0; i < style.cssRules.length; i++) {
                    if (style.cssRules[i].name === cssRuleName) {
                        index = i;
                        break;
                    }
                }
                if (index < style.cssRules.length) {
                    style.removeRule(index);
                }
                index = 99999999;
                for (i = 0; i < style.cssRules.length; i++) {
                    if (style.cssRules[i].selectorText === "." + cssRuleName) {
                        index = i;
                        break;
                    }
                }
                if (index < style.cssRules.length) {
                    style.removeRule(index);
                }

            }, delay);
        };


        /*
         * DRAG AND DROP FUNCTIONALITY
         */

        $scope.dropCallback = function (event, ui) {

            $scope.editor.handleEvents({
                type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,
                highlightId: "shapeRepo.attached"
            });
            $scope.editor.handleEvents({
                type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,
                highlightId: "shapeRepo.added"
            });

            $scope.editor.handleEvents({
                type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,
                highlightId: "shapeMenu"
            });

            KISBPM.eventBus.dispatch(KISBPM.eventBus.EVENT_TYPE_HIDE_SHAPE_BUTTONS);

            // var setting = false;
            if ($scope.dragCanContain) {

                var item = $scope.getStencilItemById(ui.draggable[0].id);
                // var group = $scope.findGroupNameByStencilItem(ui.draggable[0].id);
                // if (group.name === "物理实体") {
                //     setting = true;
                // }
                // setting = true;

                var pos = {x: event.pageX, y: event.pageY};

                var additionalIEZoom = 1;
                if (!isNaN(screen.logicalXDPI) && !isNaN(screen.systemXDPI)) {
                    var ua = navigator.userAgent;
                    if (ua.indexOf('MSIE') >= 0) {
                        //IE 10 and below
                        var zoom = Math.round((screen.deviceXDPI / screen.logicalXDPI) * 100);
                        if (zoom !== 100) {
                            additionalIEZoom = zoom / 100;
                        }
                    }
                }

                var screenCTM = $scope.editor.getCanvas().node.getScreenCTM();

                // Correcting the UpperLeft-Offset
                pos.x -= (screenCTM.e / additionalIEZoom);
                pos.y -= (screenCTM.f / additionalIEZoom);
                // Correcting the Zoom-Factor
                pos.x /= screenCTM.a;
                pos.y /= screenCTM.d;

                // Correcting the ScrollOffset
                pos.x -= document.documentElement.scrollLeft;
                pos.y -= document.documentElement.scrollTop;

                var parentAbs = $scope.dragCurrentParent.absoluteXY();
                pos.x -= parentAbs.x;
                pos.y -= parentAbs.y;

                var containedStencil = undefined;
                var stencilSets = $scope.editor.getStencilSets().values();
                for (var i = 0; i < stencilSets.length; i++) {
                    var stencilSet = stencilSets[i];
                    var nodes = stencilSet.nodes();
                    for (var j = 0; j < nodes.length; j++) {
                        if (nodes[j].idWithoutNs() === ui.draggable[0].id) {
                            containedStencil = nodes[j];
                            break;
                        }
                    }

                    if (!containedStencil) {
                        var edges = stencilSet.edges();
                        for (var j = 0; j < edges.length; j++) {
                            if (edges[j].idWithoutNs() === ui.draggable[0].id) {
                                containedStencil = edges[j];
                                break;
                            }
                        }
                    }
                }

                if (!containedStencil) return;

                if ($scope.quickMenu) {
                    var shapes = $scope.editor.getSelection();
                    if (shapes && shapes.length == 1) {
                        var currentSelectedShape = shapes.first();

                        var option = {};
                        option.type = currentSelectedShape.getStencil().namespace() + ui.draggable[0].id;
                        option.namespace = currentSelectedShape.getStencil().namespace();
                        option.connectedShape = currentSelectedShape;
                        option.parent = $scope.dragCurrentParent;
                        option.containedStencil = containedStencil;

                        // If the ctrl key is not pressed,
                        // snapp the new shape to the center
                        // if it is near to the center of the other shape
                        if (!event.ctrlKey) {
                            // Get the center of the shape
                            var cShape = currentSelectedShape.bounds.center();
                            // Snapp +-20 Pixel horizontal to the center
                            if (20 > Math.abs(cShape.x - pos.x)) {
                                pos.x = cShape.x;
                            }
                            // Snapp +-20 Pixel vertical to the center
                            if (20 > Math.abs(cShape.y - pos.y)) {
                                pos.y = cShape.y;
                            }
                        }

                        option.position = pos;

                        if (containedStencil.idWithoutNs() !== 'SequenceFlow' && containedStencil.idWithoutNs() !== 'Association' &&
                            containedStencil.idWithoutNs() !== 'MessageFlow' && containedStencil.idWithoutNs() !== 'DataAssociation') {
                            var args = {sourceShape: currentSelectedShape, targetStencil: containedStencil};
                            var targetStencil = $scope.editor.getRules().connectMorph(args);
                            if (!targetStencil) {
                                return;
                            }// Check if there can be a target shape
                            option.connectingType = targetStencil.id();
                        }

                        var command = new KISBPM.CreateCommand(option, $scope.dropTargetElement, pos, $scope.editor);

                        $scope.editor.executeCommands([command]);
                    }
                }
                else {
                    var canAttach = false;
                    if (containedStencil.idWithoutNs() === 'BoundaryErrorEvent' || containedStencil.idWithoutNs() === 'BoundaryTimerEvent' ||
                        containedStencil.idWithoutNs() === 'BoundarySignalEvent' || containedStencil.idWithoutNs() === 'BoundaryMessageEvent' ||
                        containedStencil.idWithoutNs() === 'BoundaryCancelEvent' || containedStencil.idWithoutNs() === 'BoundaryCompensationEvent') {
                        // Modify position, otherwise boundary event will get position related to left corner of the canvas instead of the container
                        pos = $scope.editor.eventCoordinates(event);
                        canAttach = true;
                    }

                    var option = {};
                    option['type'] = $scope.modelData.model.stencilset.namespace + item.id;
                    option['namespace'] = $scope.modelData.model.stencilset.namespace;
                    option['position'] = pos;
                    option['parent'] = $scope.dragCurrentParent;

                    var commandClass = ORYX.Core.Command.extend({
                        construct: function (option, dockedShape, canAttach, position, facade) {
                            this.option = option;
                            this.docker = null;
                            this.dockedShape = dockedShape;
                            this.dockedShapeParent = dockedShape.parent || facade.getCanvas();
                            this.position = position;
                            this.facade = facade;
                            this.selection = this.facade.getSelection();
                            this.shape = null;
                            this.parent = null;
                            this.canAttach = canAttach;
                        },
                        execute: function () {
                            //debugger;
                            if (!this.shape) {
                                this.shape = this.facade.createShape(option);
                                this.parent = this.shape.parent;
                            } else if (this.parent) {
                                this.parent.add(this.shape);
                            }

                            if (this.canAttach && this.shape.dockers && this.shape.dockers.length) {
                                this.docker = this.shape.dockers[0];

                                this.dockedShapeParent.add(this.docker.parent);

                                // Set the Docker to the new Shape
                                this.docker.setDockedShape(undefined);
                                this.docker.bounds.centerMoveTo(this.position);
                                if (this.dockedShape !== this.facade.getCanvas()) {
                                    this.docker.setDockedShape(this.dockedShape);
                                }
                                this.facade.setSelection([this.docker.parent]);
                            }

                            this.facade.getCanvas().update();
                            this.facade.updateSelection();

                        },
                        rollback: function () {
                            if (this.shape) {
                                this.facade.setSelection(this.selection.without(this.shape));
                                this.facade.deleteShape(this.shape);
                            }
                            if (this.canAttach && this.docker) {
                                this.docker.setDockedShape(undefined);
                            }
                            this.facade.getCanvas().update();
                            this.facade.updateSelection();

                        }
                    });

                    // Update canvas
                    var command = new commandClass(option, $scope.dragCurrentParent, canAttach, pos, $scope.editor);
                    $scope.editor.executeCommands([command]);

                    // Fire event to all who want to know about this
                    var dropEvent = {
                        type: KISBPM.eventBus.EVENT_TYPE_ITEM_DROPPED,
                        droppedItem: item,
                        position: pos
                    };
                    KISBPM.eventBus.dispatch(dropEvent.type, dropEvent);
                }
            }

            $scope.dragCurrentParent = undefined;
            $scope.dragCurrentParentId = undefined;
            $scope.dragCurrentParentStencil = undefined;
            $scope.dragCanContain = undefined;
            $scope.quickMenu = undefined;
            $scope.dropTargetElement = undefined;
            for (var index = 0; index < $scope.selectedItem.properties.length; index++) {
                var property = $scope.selectedItem.properties[index];
                if (property.title === "名称") {
                    $scope.nameProperty = property;
                } else if (property.title === "Id") {
                    var entities = [$scope.editor.getCanvas()][0].children;
                    property.value = entities[entities.length - 1].id;
                    $scope.updatePropertyInModel(property);
                } else if (property.title === "类型") {
                    property.value = item.name;
                    $scope.updatePropertyInModel(property);
                }
            }

            //set mode to set is to judge whether the item is dragged to canvas firstly.
            if (!$scope.nameProperty.hidden) {
                $scope.nameProperty.mode = 'set';
            }
        };


        $scope.overCallback = function (event, ui) {
            $scope.dragModeOver = true;
        };

        $scope.outCallback = function (event, ui) {
            $scope.dragModeOver = false;
        };

        $scope.startDragCallback = function (event, ui) {
            $scope.dragModeOver = false;
            $scope.quickMenu = false;
            if (!ui.helper.hasClass('stencil-item-dragged')) {
                ui.helper.addClass('stencil-item-dragged');
            }
        };

        $scope.startDragCallbackQuickMenu = function (event, ui) {
            $scope.dragModeOver = false;
            $scope.quickMenu = true;
        };

        $scope.dragCallback = function (event, ui) {

            if ($scope.dragModeOver != false) {

                var coord = $scope.editor.eventCoordinatesXY(event.pageX, event.pageY);

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

                if (additionalIEZoom !== 1) {
                    coord.x = coord.x / additionalIEZoom;
                    coord.y = coord.y / additionalIEZoom;
                }

                var aShapes = $scope.editor.getCanvas().getAbstractShapesAtPosition(coord);

                if (aShapes.length <= 0) {
                    if (event.helper) {
                        $scope.dragCanContain = false;
                        return false;
                    }
                }

                if (aShapes[0] instanceof ORYX.Core.Canvas) {
                    $scope.editor.getCanvas().setHightlightStateBasedOnX(coord.x);
                }

                if (aShapes.length == 1 && aShapes[0] instanceof ORYX.Core.Canvas) {
                    var parentCandidate = aShapes[0];

                    $scope.dragCanContain = true;
                    $scope.dragCurrentParent = parentCandidate;
                    $scope.dragCurrentParentId = parentCandidate.id;

                    $scope.editor.handleEvents({
                        type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,
                        highlightId: "shapeRepo.attached"
                    });
                    $scope.editor.handleEvents({
                        type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,
                        highlightId: "shapeRepo.added"
                    });
                    return false;
                }
                else {
                    var item = $scope.getStencilItemById(event.target.id);

                    var parentCandidate = aShapes.reverse().find(function (candidate) {
                        return (candidate instanceof ORYX.Core.Canvas
                            || candidate instanceof ORYX.Core.Node
                            || candidate instanceof ORYX.Core.Edge);
                    });

                    if (!parentCandidate) {
                        $scope.dragCanContain = false;
                        return false;
                    }

                    if (item.type === "node") {

                        // check if the draggable is a boundary event and the parent an Activity
                        var _canContain = false;
                        var parentStencilId = parentCandidate.getStencil().id();

                        if ($scope.dragCurrentParentId && $scope.dragCurrentParentId === parentCandidate.id) {
                            return false;
                        }

                        var parentItem = $scope.getStencilItemById(parentCandidate.getStencil().idWithoutNs());
                        if (parentItem.roles.indexOf("Activity") > -1) {
                            if (item.roles.indexOf("IntermediateEventOnActivityBoundary") > -1) {
                                _canContain = true;
                            }
                        }
                        else if (parentCandidate.getStencil().idWithoutNs() === 'Pool') {
                            if (item.id === 'Lane') {
                                _canContain = true;
                            }
                        }

                        if (_canContain) {
                            $scope.editor.handleEvents({
                                type: ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,
                                highlightId: "shapeRepo.attached",
                                elements: [parentCandidate],
                                style: ORYX.CONFIG.SELECTION_HIGHLIGHT_STYLE_RECTANGLE,
                                color: ORYX.CONFIG.SELECTION_VALID_COLOR
                            });

                            $scope.editor.handleEvents({
                                type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,
                                highlightId: "shapeRepo.added"
                            });
                        }
                        else {
                            for (var i = 0; i < $scope.containmentRules.length; i++) {
                                var rule = $scope.containmentRules[i];
                                if (rule.role === parentItem.id) {
                                    for (var j = 0; j < rule.contains.length; j++) {
                                        if (item.roles.indexOf(rule.contains[j]) > -1) {
                                            _canContain = true;
                                            break;
                                        }
                                    }

                                    if (_canContain) {
                                        break;
                                    }
                                }
                            }

                            // Show Highlight
                            $scope.editor.handleEvents({
                                type: ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,
                                highlightId: 'shapeRepo.added',
                                elements: [parentCandidate],
                                color: _canContain ? ORYX.CONFIG.SELECTION_VALID_COLOR : ORYX.CONFIG.SELECTION_INVALID_COLOR
                            });

                            $scope.editor.handleEvents({
                                type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,
                                highlightId: "shapeRepo.attached"
                            });
                        }

                        $scope.dragCurrentParent = parentCandidate;
                        $scope.dragCurrentParentId = parentCandidate.id;
                        $scope.dragCurrentParentStencil = parentStencilId;
                        $scope.dragCanContain = _canContain;

                    } else {
                        var canvasCandidate = $scope.editor.getCanvas();
                        var canConnect = false;

                        var targetStencil = $scope.getStencilItemById(parentCandidate.getStencil().idWithoutNs());
                        if (targetStencil) {
                            var associationConnect = false;
                            if (stencil.idWithoutNs() === 'Association' && (curCan.getStencil().idWithoutNs() === 'TextAnnotation' || curCan.getStencil().idWithoutNs() === 'BoundaryCompensationEvent')) {
                                associationConnect = true;
                            } else if (stencil.idWithoutNs() === 'DataAssociation' && curCan.getStencil().idWithoutNs() === 'DataStore') {
                                associationConnect = true;
                            }

                            if (targetStencil.canConnectTo || associationConnect) {
                                canConnect = true;
                            }
                        }

                        //Edge
                        $scope.dragCurrentParent = canvasCandidate;
                        $scope.dragCurrentParentId = canvasCandidate.id;
                        $scope.dragCurrentParentStencil = canvasCandidate.getStencil().id();
                        $scope.dragCanContain = canConnect;

                        // Show Highlight
                        $scope.editor.handleEvents({
                            type: ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,
                            highlightId: 'shapeRepo.added',
                            elements: [canvasCandidate],
                            color: ORYX.CONFIG.SELECTION_VALID_COLOR
                        });

                        $scope.editor.handleEvents({
                            type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,
                            highlightId: "shapeRepo.attached"
                        });
                    }
                }
            }
        };

        $scope.dragCallbackQuickMenu = function (event, ui) {

            if ($scope.dragModeOver != false) {
                var coord = $scope.editor.eventCoordinatesXY(event.pageX, event.pageY);

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

                if (additionalIEZoom !== 1) {
                    coord.x = coord.x / additionalIEZoom;
                    coord.y = coord.y / additionalIEZoom;
                }

                var aShapes = $scope.editor.getCanvas().getAbstractShapesAtPosition(coord);

                if (aShapes.length <= 0) {
                    if (event.helper) {
                        $scope.dragCanContain = false;
                        return false;
                    }
                }

                if (aShapes[0] instanceof ORYX.Core.Canvas) {
                    $scope.editor.getCanvas().setHightlightStateBasedOnX(coord.x);
                }

                var stencil = undefined;
                var stencilSets = $scope.editor.getStencilSets().values();
                for (var i = 0; i < stencilSets.length; i++) {
                    var stencilSet = stencilSets[i];
                    var nodes = stencilSet.nodes();
                    for (var j = 0; j < nodes.length; j++) {
                        if (nodes[j].idWithoutNs() === event.target.id) {
                            stencil = nodes[j];
                            break;
                        }
                    }

                    if (!stencil) {
                        var edges = stencilSet.edges();
                        for (var j = 0; j < edges.length; j++) {
                            if (edges[j].idWithoutNs() === event.target.id) {
                                stencil = edges[j];
                                break;
                            }
                        }
                    }
                }

                var candidate = aShapes.last();

                var isValid = false;
                if (stencil.type() === "node") {
                    //check containment rules
                    var canContain = $scope.editor.getRules().canContain({
                        containingShape: candidate,
                        containedStencil: stencil
                    });

                    var parentCandidate = aShapes.reverse().find(function (candidate) {
                        return (candidate instanceof ORYX.Core.Canvas
                            || candidate instanceof ORYX.Core.Node
                            || candidate instanceof ORYX.Core.Edge);
                    });

                    if (!parentCandidate) {
                        $scope.dragCanContain = false;
                        return false;
                    }

                    $scope.dragCurrentParent = parentCandidate;
                    $scope.dragCurrentParentId = parentCandidate.id;
                    $scope.dragCurrentParentStencil = parentCandidate.getStencil().id();
                    $scope.dragCanContain = canContain;
                    $scope.dropTargetElement = parentCandidate;
                    isValid = canContain;

                } else { //Edge

                    var shapes = $scope.editor.getSelection();
                    if (shapes && shapes.length == 1) {
                        var currentSelectedShape = shapes.first();
                        var curCan = candidate;
                        var canConnect = false;

                        var targetStencil = $scope.getStencilItemById(curCan.getStencil().idWithoutNs());
                        if (targetStencil) {
                            var associationConnect = false;
                            if (stencil.idWithoutNs() === 'Association' && (curCan.getStencil().idWithoutNs() === 'TextAnnotation' || curCan.getStencil().idWithoutNs() === 'BoundaryCompensationEvent')) {
                                associationConnect = true;
                            }
                            else if (stencil.idWithoutNs() === 'DataAssociation' && curCan.getStencil().idWithoutNs() === 'DataStore') {
                                associationConnect = true;
                            }

                            if (targetStencil.canConnectTo || associationConnect) {
                                while (!canConnect && curCan && !(curCan instanceof ORYX.Core.Canvas)) {
                                    candidate = curCan;
                                    //check connection rules
                                    canConnect = $scope.editor.getRules().canConnect({
                                        sourceShape: currentSelectedShape,
                                        edgeStencil: stencil,
                                        targetShape: curCan
                                    });
                                    curCan = curCan.parent;
                                }
                            }
                        }
                        var parentCandidate = $scope.editor.getCanvas();

                        isValid = canConnect;
                        $scope.dragCurrentParent = parentCandidate;
                        $scope.dragCurrentParentId = parentCandidate.id;
                        $scope.dragCurrentParentStencil = parentCandidate.getStencil().id();
                        $scope.dragCanContain = canConnect;
                        $scope.dropTargetElement = candidate;
                    }

                }

                $scope.editor.handleEvents({
                    type: ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,
                    highlightId: 'shapeMenu',
                    elements: [candidate],
                    color: isValid ? ORYX.CONFIG.SELECTION_VALID_COLOR : ORYX.CONFIG.SELECTION_INVALID_COLOR
                });

            }
        };

        new Promise(function (resolve, reject) {
            setTimeout(function () {
                resolve('200 OK');
            }, 1800);
        }).then(function (result) {
            console.log(window._loadContentFinished);
            // 初始化完成,自动生成开始按钮
            // console.log("StartNoneEvent");
            // 注意：只有在加载完流程之后并且界面上没有StartNoneEvent时，才会生成。
            var hasStartEventShape = function(){
                //debugger;
                var shapes = $scope.editor.getCanvas().nodes;
                for(var i=0;i<shapes.length;i++){
                    if(shapes[i].properties["oryx-startevent"] !== undefined){
                        return true;
                    }
                }
                return false;
            };

            if(!hasStartEventShape()){
                _createAction($rootScope, $scope, "StartNoneEvent");
            }
        });

    }]);


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
        }
        else {
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
                    }
                    else {
                        this.shape.dockers.last().setReferencePoint(this.currentReference.bounds.midPoint());
                    }
                }
                else {
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
