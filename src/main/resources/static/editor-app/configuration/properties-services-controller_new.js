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
var selectedShapeActionType = undefined;

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

var paramParser = function (rawParam){
    // 测试字符串 [{"mode":"","level":"","num":"","action":""}]
    let str = "";
    let oldStr = "";
    let keyList = [];
    
    rawParam = JSON.stringify(rawParam);
    if(rawParam[0] === '{'){
        str = rawParam.substring(1,rawParam.length-1);
    }else{
        str = rawParam;
    }



    if(str === ""){return "";}

    oldStr = str.trim();

    let splitedList = oldStr.split(',');
    // let matchedStrList = oldStr.match(/\w+\{([^\{\}]+)\}/g);
    // console.log(matchedStrList);
    splitedList.forEach(function (value) {
        // value == "mode":""
        let key_value  = value.split(':');
        let key = key_value[0];
        if (key[0]=== '\"' || key[0]=== '\''){
            key = key.substring(1, key.length -1);
        }
        
        keyList.push(key);
    });

    // console.log(str);
    return keyList;


};

var ServicesPopupCtrl = ['$rootScope', '$scope', '$http', function ($rootScope, $scope, $http) {
    var ActivityElement;
    var shape = $scope.selectedShape;

    $scope.serviceParams = [];
    $scope.selectedFunction = "";
    $scope.modelInput = [];

    // 资源执行主体所拥有的功能，数据从知识图谱中获得
    $scope.resourceFunctions = [
        // {name: "获取水杯", type: "SocialAction"},
        // {name: "获取咖啡", type: "SocialAction"},
        // {name: "递交物品", type: "SocialAction"},
        // {name: "制作咖啡", type: "PhysicalAction"},
        // {name: "点咖啡服务", type: "CyberAction"},
        // {name: "准备订单", type: "PhysicalAction"},
        //
        // {name: "烧水", type: "PhysicalAction"},
        // {name: "开启空气净化", type: "PhysicalAction"},
        // {name: "获取当前空气状态", type: "PhysicalAction"},
        // {name: "获取体重数据", type: "PhysicalAction"},
        // {name: "播放语音通知", type: "PhysicalAction"},
        //
        // {name: "获取头条新闻", type: "CyberAction"},
        // {name: "获取推荐菜", type: "CyberAction"},
        // {name: "获取股票列表", type: "CyberAction"},
        // {name: "播放锻炼视频", type: "CyberAction"}
    ];

    // 当前资源服务所有的输入，数据从知识图谱中获得
    $scope.resourceInputs = [];

    // 当前资源服务所有的输出，数据从知识图谱中获得
    $scope.resourceOutputs = [];

    // 当前资源的输出，决定是否有资源图标生成，数据从知识图谱中获得
    $scope.output = [];

    $scope.input = [];

    $scope.servicesDetails = [];

    // 资源与人机物三种Action的对应（固定不变）
    $scope.constTypeOfResource = [
        {name: "设备", type: "PhysicalAction"},
        {name: "物品", type: "PhysicalAction"},
        {name: "机器人", type: "PhysicalAction"},
        {name: "用户", type: "SocialAction"},
        {name: "工人", type: "SocialAction"},
        {name: "组织", type: "SocialAction"},
        {name: "云应用", type: "CyberAction"},
        {name: "移动应用", type: "CyberAction"},
        {name: "嵌入式应用", type: "CyberAction"},
        {name: "信息对象", type: "CyberAction"}
    ];

    var selectedShapeActionType = undefined;

    $scope.functions = [];

    // 判断连线源头是否为worker，如果是worker则另外处理
    var prop = $scope.latestfromto["from"].properties["oryx-type"];
    if (prop && prop === "工人"){
        let res_entity = $scope.latestfromto["from"].properties["oryx-name"];
        let functionType = $scope.latestfromto["from"].properties["oryx-type"];
        for (let i = 0; i < $scope.constTypeOfResource.length; i++) {
            if ($scope.constTypeOfResource[i].name === functionType) {
                selectedShapeActionType = $scope.constTypeOfResource[i].type;
            }
        }
        $http({method: 'GET', url: KISBPM.URL.getResourceDetails(res_entity)}).success(function (data, status, headers, config) {
            console.log(JSON.stringify(data));

            // 解析得到functions，包括其中的参数
            for(let i=0;i<data.service.length;i++){
                // 获取函数名
                $scope.resourceFunctions[i] = {name:data.service[i].Capability, type:functionType, input:data.service[i].input, output:data.service[i].output};
                $scope.functions[$scope.functions.length] = {id:$scope.functions.length, name: $scope.resourceFunctions[i].name}; // 加入下拉框中

                // 获取函数的参数
                $scope.resourceInputs[i] = paramParser(data.service[i].inputParameter[0]);
                $scope.resourceOutputs[i] = paramParser(data.service[i].outputParameter[0]);

                // 设置output参数，output决定是否有输出
                $scope.output[i] = data.service[i].output;

                // 设置input参数，
                $scope.input[i] = data.service[i].input;

                // 获取函数，包含所有参数
                $scope.servicesDetails[i] = data.service[i];
            }

            //console.log($scope.resourceOutputs);

        }).error(function (data, status, headers, config) {
            console.log('Something went wrong when fetching Resources:' + JSON.stringify(data));
        });
    }else{
        let res_entity = $scope.latestfromto["to"].properties["oryx-name"];
        let functionType = $scope.latestfromto["to"].properties["oryx-type"];
        for (let i = 0; i < $scope.constTypeOfResource.length; i++) {
            if ($scope.constTypeOfResource[i].name === functionType) {
                selectedShapeActionType = $scope.constTypeOfResource[i].type;
            }
        }
        $http({method: 'GET', url: KISBPM.URL.getResourceDetails(res_entity)}).success(function (data, status, headers, config) {
            console.log(JSON.stringify(data));

            // 解析得到functions，包括其中的参数
            for(let i=0;i<data.service.length;i++){
                // 获取函数名
                $scope.resourceFunctions[i] = {name:data.service[i].Capability, type:functionType, input:data.service[i].input, output:data.service[i].output};
                $scope.functions[$scope.functions.length] = {id:$scope.functions.length, name: $scope.resourceFunctions[i].name}; // 加入下拉框中

                // 获取函数的参数
                $scope.resourceInputs[i] = paramParser(data.service[i].inputParameter[0]);
                $scope.resourceOutputs[i] = paramParser(data.service[i].outputParameter[0]);

                // 设置output参数，output决定是否有输出
                $scope.output[i] = data.service[i].output;

                // 设置input参数，
                $scope.input[i] = data.service[i].input;

                // 获取函数，包含所有参数
                $scope.servicesDetails[i] = data.service[i];
            }

            //console.log($scope.resourceOutputs);

        }).error(function (data, status, headers, config) {
            console.log('Something went wrong when fetching Resources:' + JSON.stringify(data));
        });

    }

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

    $scope.changeFunction = function (selectedFunction){
        let func = JSON.parse(selectedFunction);
        let id = func.id;
        $scope.selectedFunction = func.name;
        if(id !== undefined){
            $scope.serviceParams = $scope.resourceInputs[id];
        }else{
            $scope.serviceParams = [];
        }
    };

    // // Click handler for + button after enum value
    // $scope.addServiceValue = function (index) {
    //     $scope.entity.Services.splice(index + 1, 0, {value: ''});
    // };
    //
    // // Click handler for - button after enum value
    // $scope.removeServiceValue = function (index) {
    //     $scope.entity.Services.splice(index, 1);
    // };

    $scope.save = function(){
        // console.log($scope.selectedFunction);
        // console.log($scope.modelInput);
        // console.log(selectedShapeActionType);

        // 更新Action名称和类型
        $scope.modifyAction($scope, $scope.selectedFunction, selectedShapeActionType);

        if ($scope.property.value === undefined || !$scope.property.value) {
            $scope.property.value = [{"id": "", "function": ""}];
        }

        let functions = [];
        let ids = [];
        if ($scope.property.value) {
            for (let i = 0; i < $scope.property.value.length; i++) {
                functions[functions.length] = {value: $scope.property.value[i].function};
                ids[ids.length] = {id: $scope.property.value[i].id};
            }
        } else {
            $scope.property.value = [];
        }

        $scope.property.value[$scope.property.value.length] = {
            id: $scope.editor.getSelection()[0].id, function: $scope.selectedFunction
        };

        // 给Action设置属性值(service及参数)
        $scope.setActionProperty($scope, $scope.selectedFunction, $scope.resourceInputs[i], $scope.resourceOutputs[i]);

        // // 服务有Output时，需要自动生成的资源
        // $scope.AutoGenerateResource($scope, $scope.servicesDetails[i].description, $scope.output[i], $scope.resourceOutputs[i]);

        // 将工人与物品、水杯这些物理Item绑定
        // 当选择获取水杯服务时，调用工人获取资源方法
        // 当选择递交物品服务时，调用工人释放资源方法
        // if ($scope.entity.Services[i].value === '获取水杯') {
        //     $scope.workerGetResource($scope.getHighlightedShape(), $scope.latestLine.incoming[0], $scope.latestLine.outgoing[0]);
        // } else if ($scope.entity.Services[i].value === '递交物品') {
        //     $scope.workerResourceEmpty($scope.getHighlightedShape(), shape);
        // }

        $scope.close();
    };

    angular.module('activitiModeler').ResActionClass($rootScope, $scope);

    // Close button handler
    $scope.close = function () {
        //handleEntityInput($scope);
        // $scope.property.mode = 'read';
        $scope.$hide();
    };

    // $scope.oldsave = function () {
    //     handleEntityInput($scope);
    //     if ($scope.property.value === undefined || !$scope.property.value) {
    //         $scope.property.value = [{"id": "", "function": ""}];
    //     }
    //
    //     ActivityElement = $scope.editor.getSelection()[0];
    //     var functions = [];
    //     var ids = [];
    //     if ($scope.property.value) {
    //         for (var i = 0; i < $scope.property.value.length; i++) {
    //             functions[functions.length] = {value: $scope.property.value[i].function};
    //             ids[ids.length] = {id: $scope.property.value[i].id};
    //         }
    //     } else {
    //         $scope.property.value = [];
    //     }
    //
    //     var indexToRemove = [];
    //     var hasRemoveNum = 0;
    //     for (var i = 0; i < functions.length; i++) {
    //         var index = -1;
    //         if ($scope.entity.Services === undefined || $scope.entity.Services.length === 0) {
    //             $scope.entity.Services = [{value: ''}];
    //         }
    //         for (var j = 0; j < $scope.entity.Services.length; j++) {
    //             if (functions[i].value === $scope.entity.Services[j].value) {
    //                 index = j;
    //             }
    //         }
    //         if (index < 0) {
    //             indexToRemove[indexToRemove.length] = i;
    //         }
    //     }
    //     for (var i = 0; i < indexToRemove.length; i++) {
    //         var index = indexToRemove[i];
    //         var shapeToRemove = $scope.getShapeById(ids[index].id);
    //         $scope.editor.deleteShape(shapeToRemove);
    //         functions.splice(index - hasRemoveNum, 1);
    //         $scope.property.value.splice(index - hasRemoveNum, 1);
    //         hasRemoveNum++;
    //     }
    //
    //     // $scope.entity.Services是一个Action对应的服务，通过“+”号增加，通过“-”号减少
    //     // 2个以上的服务对应2个以上select下拉选择框，因此需要用for循环处理
    //     for (var i = 0; i < $scope.entity.Services.length; i++) {
    //         index = -1;
    //         for (var j = 0; j < functions.length; j++) {
    //             if (functions[j].value === $scope.entity.Services[i].value) {
    //                 index = j;
    //             }
    //         }
    //         // 如果是初次设置Services值
    //         if (index < 0) {
    //             var currentService = $scope.entity.Services[i];
    //
    //             // 替换当前Action的图标，从泛型到社会、网络、物理特定的类型
    //             $scope.modifyAction($scope, currentService.value, selectedShapeActionType);
    //
    //             $scope.property.value[$scope.property.value.length] = {
    //                 id: $scope.editor.getSelection()[0].id, function: currentService.value
    //             };
    //
    //             // 给Action设置属性值( service 以及子参数)
    //             //$scope.setActionProperty($scope, currentService);
    //             $scope.setActionProperty($scope, currentService.value, $scope.resourceInputs[i], $scope.resourceOutputs[i]);
    //
    //             // 服务有Output时，需要自动生成的资源
    //             $scope.AutoGenerateResource($scope, $scope.servicesDetails[i].description, $scope.output[i], $scope.resourceOutputs[i]);
    //
    //             // 将工人与物品、水杯这些物理Item绑定
    //             // 当选择获取水杯服务时，调用工人获取资源方法
    //             // 当选择递交物品服务时，调用工人释放资源方法
    //             if ($scope.entity.Services[i].value === '获取水杯') {
    //                 $scope.workerGetResource($scope.getHighlightedShape(), $scope.latestLine.incoming[0], $scope.latestLine.outgoing[0]);
    //             } else if ($scope.entity.Services[i].value === '递交物品') {
    //                 $scope.workerResourceEmpty($scope.getHighlightedShape(), shape);
    //             }
    //         }
    //     }
    //     $scope.close();
    //
    //     // 播放动画
    //     $scope.newPlayShape();
    // };

}];
// 结合律
// mode{aaa, bbb, ccc} -> mode.aaa, mode.bbb, mode.ccc
// var associative = function(s){
//     var l = s.indexOf('{');
//     var r = s.indexOf('}');
//     var newList=[];
//
//     var outside = s.substring(0, l);   // mode
//     var inside  = s.substring(l+1, r); // aaa, bbb, ccc
//
//     var insideList = inside.split(', ');
//     for(var i=0;i<insideList.length;i++){
//         newList[i] = outside + '.' + insideList[i];
//     }
//
//     return newList.toString().replace(/,/g, ', ');
// };
//
// var paramParser_old = function(rawParam){
//     // 将[{state, data{action, mode, level, num}}]，解析为
//     // resource_param——[state, data.action, data.mode, data.level, data.num]
//     /* service_param——[state, action, mode, level, num] (service_param是下一个service的输入参数)*/
//
//     // 测试字符串 [{state, data{action, mode{aaa, bbb{dddd, eeee}, ccc}, level, num{xxx, yyy}}}]
//     var str = "";
//     var oldStr = "";
//
//     rawParam = rawParam.toString();
//     if(rawParam[0] === '['){
//         str = rawParam.substring(1,rawParam.length-1);
//     }else{
//         str = rawParam;
//     }
//
//     if(str === ""){return "";}
//
//     do{
//         oldStr = str;
//         var matchedStrList = oldStr.match(/\w+\{([^\{\}]+)\}/g);
//         for(var i=0; matchedStrList!==null && i < matchedStrList.length; i++){
//             str = oldStr.replace(matchedStrList[i], associative(matchedStrList[i].trim()));
//         }
//
//     }while(oldStr !== str);
//
//     if(str[0] === "{"){
//         str = str.substring(1,str.length-1);
//     }
//     // console.log(str);
//     return str;
//
// };
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
            && shape.getStencil().property("oryx-bgcolor").value().toUpperCase()=== shape.properties["oryx-bgcolor"].toUpperCase()){
            if(newShape.getStencil().property("oryx-bgcolor")){
                newShape.setProperty("oryx-bgcolor", newShape.getStencil().property("oryx-bgcolor").value());
            }
        }
        if(changedBounds !== null) {
            newShape.bounds.set(changedBounds);
        }

        if(newShape.getStencil().type()==="edge" || (newShape.dockers.length===0 || !newShape.dockers[0].getDockedShape())) {
            newShape.bounds.centerMoveTo(oPos);
        }

        if(newShape.getStencil().type()==="node" && (newShape.dockers.length===0 || !newShape.dockers[0].getDockedShape())) {
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
                        if (docker.getDockedShape() === shape) {
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
