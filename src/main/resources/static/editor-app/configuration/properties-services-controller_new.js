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
var selectedShapeFunctionType = undefined;

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

var ServicesPopupCtrl = ['$scope', '$http',function ($scope, $http) {
    var ActivityElement;
    var shape = $scope.selectedShape;
    var HighlightedShape = $scope.getHighlightedShape();

    // 资源执行主体所拥有的功能，数据从知识图谱中获得
    $scope.resourceFunctions = [];
    // $scope.resourceFunctions = [
    //     {name: "获取水杯", type: "SocialAction"},
    //     {name: "获取咖啡", type: "SocialAction"},
    //     {name: "递交物品", type: "SocialAction"},
    //     {name: "制作咖啡", type: "PhysicalAction"},
    //     {name: "点咖啡服务", type: "CyberAction"},
    //     {name: "准备订单", type: "PhysicalAction"},
    //
    //     {name: "烧水", type: "PhysicalAction"},
    //     {name: "开启空气净化", type: "PhysicalAction"},
    //     {name: "获取当前空气状态", type: "PhysicalAction"},
    //     {name: "获取体重数据", type: "PhysicalAction"},
    //     {name: "播放语音通知", type: "PhysicalAction"},
    //
    //     {name: "获取头条新闻", type: "CyberAction"},
    //     {name: "获取推荐菜", type: "CyberAction"},
    //     {name: "获取股票列表", type: "CyberAction"},
    //     {name: "播放锻炼视频", type: "CyberAction"}
    //
    // ];

    // 资源执行主体所有的输出，数据从知识图谱中获得
    $scope.resourceOutputs = [];

    // 资源与人机物三种Action的对应（固定不变）
    $scope.constTypeOfResource = [
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
    var selectedShapeFunctionType = undefined;
    for (var i = 0; i < $scope.constTypeOfResource.length; i++) {
        if ($scope.constTypeOfResource[i].name === shape.properties["oryx-type"]) {
            selectedShapeFunctionType = $scope.constTypeOfResource[i].type;
        }
    }

    $scope.functions = [];
    $http({method: 'GET', url: KISBPM.URL.getResources()}).success(function (data, status, headers, config) {
        // console.log(JSON.stringify(data));
        // 初始化$scope.constTypeOfResource和$scope.resourceFunctions
        // $scope.constTypeOfResource表示资源的人机物类别
        // $scope.resourceFunctions 表示动作对应的人机物类别
        $scope.resourceFunctions = data;

        if (selectedShapeFunctionType) {
            for (var i = 0; i < $scope.resourceFunctions.length; i++) {
                if ($scope.resourceFunctions[i].type === selectedShapeFunctionType) {
                    $scope.functions[$scope.functions.length] = {name: $scope.resourceFunctions[i].name};
                }
            }
        } else {
            $scope.functions = $scope.resourceFunctions;
        }


    }).error(function (data, status, headers, config) {
        console.log('Something went wrong when fetching Resources:' + JSON.stringify(data));
    });



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
            $scope.property.value = [{"id": "", "function": ""}];
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
                //$scope.createAction($scope, $scope.entity.Services[i].value, selectedShapeFunctionType);
                $scope.replaceAction($scope, $scope.entity.Services[i].value, selectedShapeFunctionType);
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
                    $scope.editor.getSelection()[0].setProperty("oryx-overrideid", ORYX.Editor.provideId());
                    $scope.editor.getSelection()[0].setProperty("oryx-name", "订单");
                    $scope.editor.getSelection()[0].setProperty("oryx-type", "信息对象");
                    $scope.editor.getCanvas().update();
                    $scope.editor.updateSelection();
                }else if ($scope.entity.Services[i].value === '获取水杯') {
                    $scope.workerGetResource($scope.getHighlightedShape(), $scope.latestLine.incoming[0], $scope.latestLine.outgoing[0]);
                } else if ($scope.entity.Services[i].value === '递交物品') {
                    $scope.workerResourceEmpty($scope.getHighlightedShape(), shape);
                }
            }
        }
        $scope.close();

        // 播放动画
        $scope.newPlayShape();
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

    $scope.createAction = function ($scope, actionName, FunctionType) {
        var selectItem = ActivityElement;//$scope.editor.getSelection()[0];
        //var itemId = "actionActivity";
        // 机的图标 对应 CyberAction，itemId==类型
        // var itemId = "SocialAction";
        // if ("点咖啡服务" === actionName) {
        //     itemId = "CyberAction";
        // } else if ("制作咖啡" === actionName) {
        //     itemId = "PhysicalAction";
        // } else {
        //     itemId = "SocialAction";
        // }
        var itemId = FunctionType;
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

    // 替换未定义Action
    $scope.replaceAction = function($scope, actionName, FunctionType) {
        if(HighlightedShape === undefined) return;// 如果没有高亮，直接返回

        var selectItem = $scope.editor.getSelection()[0];
        var stencil = undefined;
        var stencilSets = $scope.editor.getStencilSets().values();
        var stencilId = FunctionType;
        var newShapeId = "";

        for (var i = 0; i < stencilSets.length; i++)
        {
            var stencilSet = stencilSets[i];
            var nodes = stencilSet.nodes();
            for (var j = 0; j < nodes.length; j++)
            {
                if (nodes[j].idWithoutNs() === stencilId)
                {
                    stencil = nodes[j];
                    break;
                }
            }
        }

        if (!stencil) return;

        // Create and execute command (for undo/redo)
        var command = new MorphTo(HighlightedShape, stencil, $scope.editor);
        $scope.editor.executeCommands([command]);

        var actionActivity = $scope.selectedItem;
        for (var i = 0; i < actionActivity.properties.length; i++) {
            var property = actionActivity.properties[i];
            if (property.title === "Id") {
                property.value = $scope.editor.getSelection()[0].id;
                newShapeId = property.value;
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
            } else if (property.title === "动作输入状态") {
                property.value = $scope.inputStatus;
                $scope.inputStatus = [];
                $scope.updatePropertyInModel(property);
            } else if (property.title === "动作输出状态") {
                property.value = $scope.outputStatus;
                $scope.outputStatus = [];
                $scope.updatePropertyInModel(property);
            }
        }
        $scope.setHighlightedShape(newShapeId);
        jQuery('#' + newShapeId + 'bg_frame').attr({"fill":"#04FF8E"}); //高亮显示

        $scope.workerContainsActionIdUpdate(HighlightedShape.id, newShapeId);

        //$scope.close();
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
}];

var MorphTo = ORYX.Core.Command.extend({
    construct: function(shape, stencil, facade){
        this.shape = shape;
        this.stencil = stencil;
        this.facade = facade;
    },
    execute: function(){
        var shape = this.shape;
        var stencil = this.stencil;
        var resourceId = shape.resourceId;

        // Serialize all attributes
        var serialized = shape.serialize();
        stencil.properties().each((function(prop) {
            if(prop.readonly()) {
                serialized = serialized.reject(function(serProp) {
                    return serProp.name === prop.id();
                });
            }
        }).bind(this));

        // Get shape if already created, otherwise create a new shape
        if (this.newShape){
            newShape = this.newShape;
            this.facade.getCanvas().add(newShape);
        } else {
            newShape = this.facade.createShape({
                type: stencil.id(),
                namespace: stencil.namespace(),
                resourceId: resourceId
            });
        }

        // calculate new bounds using old shape's upperLeft and new shape's width/height
        var boundsObj = serialized.find(function(serProp){
            return (serProp.prefix === "oryx" && serProp.name === "bounds");
        });

        var changedBounds = null;

        if (!this.facade.getRules().preserveBounds(shape.getStencil())) {

            var bounds = boundsObj.value.split(",");
            if (parseInt(bounds[0], 10) > parseInt(bounds[2], 10)) { // if lowerRight comes first, swap array items
                var tmp = bounds[0];
                bounds[0] = bounds[2];
                bounds[2] = tmp;
                tmp = bounds[1];
                bounds[1] = bounds[3];
                bounds[3] = tmp;
            }
            bounds[2] = parseInt(bounds[0], 10) + newShape.bounds.width();
            bounds[3] = parseInt(bounds[1], 10) + newShape.bounds.height();
            boundsObj.value = bounds.join(",");

        }  else {

            var height = shape.bounds.height();
            var width  = shape.bounds.width();

            // consider the minimum and maximum size of
            // the new shape

            if (newShape.minimumSize) {
                if (shape.bounds.height() < newShape.minimumSize.height) {
                    height = newShape.minimumSize.height;
                }


                if (shape.bounds.width() < newShape.minimumSize.width) {
                    width = newShape.minimumSize.width;
                }
            }

            if(newShape.maximumSize) {
                if(shape.bounds.height() > newShape.maximumSize.height) {
                    height = newShape.maximumSize.height;
                }

                if(shape.bounds.width() > newShape.maximumSize.width) {
                    width = newShape.maximumSize.width;
                }
            }

            changedBounds = {
                a : {
                    x: shape.bounds.a.x,
                    y: shape.bounds.a.y
                },
                b : {
                    x: shape.bounds.a.x + width,
                    y: shape.bounds.a.y + height
                }
            };

        }

        var oPos = shape.bounds.center();
        if(changedBounds !== null) {
            newShape.bounds.set(changedBounds);
        }

        // Set all related dockers
        this.setRelatedDockers(shape, newShape);

        // store DOM position of old shape
        var parentNode = shape.node.parentNode;
        var nextSibling = shape.node.nextSibling;

        // Delete the old shape
        this.facade.deleteShape(shape);

        // Deserialize the new shape - Set all attributes
        newShape.deserialize(serialized);
        this.facade.setSelection([newShape]);
        /*
         * Change color to default if unchanged
         * 23.04.2010
         */
        if(shape.getStencil().property("oryx-bgcolor")
            && shape.properties["oryx-bgcolor"]
            && shape.getStencil().property("oryx-bgcolor").value().toUpperCase()== shape.properties["oryx-bgcolor"].toUpperCase()){
            if(newShape.getStencil().property("oryx-bgcolor")){
                newShape.setProperty("oryx-bgcolor", newShape.getStencil().property("oryx-bgcolor").value());
            }
        }
        if(changedBounds !== null) {
            newShape.bounds.set(changedBounds);
        }

        if(newShape.getStencil().type()==="edge" || (newShape.dockers.length==0 || !newShape.dockers[0].getDockedShape())) {
            newShape.bounds.centerMoveTo(oPos);
        }

        if(newShape.getStencil().type()==="node" && (newShape.dockers.length==0 || !newShape.dockers[0].getDockedShape())) {
            this.setRelatedDockers(newShape, newShape);

        }

        // place at the DOM position of the old shape
        if(nextSibling) parentNode.insertBefore(newShape.node, nextSibling);
        else parentNode.appendChild(newShape.node);

        // Set selection
        this.facade.setSelection([newShape]);
        this.facade.getCanvas().update();
        this.facade.updateSelection();
        this.newShape = newShape;

    },
    rollback: function(){

        if (!this.shape || !this.newShape || !this.newShape.parent) {return;}

        // Append shape to the parent
        this.newShape.parent.add(this.shape);
        // Set dockers
        this.setRelatedDockers(this.newShape, this.shape);
        // Delete new shape
        this.facade.deleteShape(this.newShape);
        // Set selection
        this.facade.setSelection([this.shape]);
        // Update
        this.facade.getCanvas().update();
        this.facade.updateSelection();
    },

    /**
     * Set all incoming and outgoing edges from the shape to the new shape
     * @param {Shape} shape
     * @param {Shape} newShape
     */
    setRelatedDockers: function(shape, newShape){
        if(shape.getStencil().type()==="node") {
            (shape.incoming||[]).concat(shape.outgoing||[])
                .each(function(i) {
                    i.dockers.each(function(docker) {
                        if (docker.getDockedShape() == shape) {
                            var rPoint = Object.clone(docker.referencePoint);
                            // Move reference point per percent

                            var rPointNew = {
                                x: rPoint.x*newShape.bounds.width()/shape.bounds.width(),
                                y: rPoint.y*newShape.bounds.height()/shape.bounds.height()
                            };

                            docker.setDockedShape(newShape);
                            // Set reference point and center to new position
                            docker.setReferencePoint(rPointNew);
                            if(i instanceof ORYX.Core.Edge) {
                                docker.bounds.centerMoveTo(rPointNew);
                            } else {
                                var absXY = shape.absoluteXY();
                                docker.bounds.centerMoveTo({x:rPointNew.x+absXY.x, y:rPointNew.y+absXY.y});
                                //docker.bounds.moveBy({x:rPointNew.x-rPoint.x, y:rPointNew.y-rPoint.y});
                            }
                        }
                    });
                });

            // for attached events
            if(shape.dockers.length>0&&shape.dockers.first().getDockedShape()) {
                newShape.dockers.first().setDockedShape(shape.dockers.first().getDockedShape());
                newShape.dockers.first().setReferencePoint(Object.clone(shape.dockers.first().referencePoint));
            }

        } else { // is edge
            newShape.dockers.first().setDockedShape(shape.dockers.first().getDockedShape());
            newShape.dockers.first().setReferencePoint(shape.dockers.first().referencePoint);
            newShape.dockers.last().setDockedShape(shape.dockers.last().getDockedShape());
            newShape.dockers.last().setReferencePoint(shape.dockers.last().referencePoint);
        }
    }
});