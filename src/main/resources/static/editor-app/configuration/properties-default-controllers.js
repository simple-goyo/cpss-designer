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
 * String controller
 */

var KisBpmStringPropertyCtrl = [ '$scope', function ($scope) {

	$scope.shapeId = $scope.selectedShape.id;
	$scope.valueFlushed = false;
    /** Handler called when input field is blurred */
    $scope.inputBlurred = function() {
    	$scope.valueFlushed = true;
    	if ($scope.property.value) {
    		$scope.property.value = $scope.property.value.replace(/(<([^>]+)>)/ig,"");
    	}
        $scope.updatePropertyInModel($scope.property);
    };

    $scope.enterPressed = function(keyEvent) {
    	if (keyEvent && keyEvent.which === 13) {
    		keyEvent.preventDefault();
	        $scope.inputBlurred(); // we want to do the same as if the user would blur the input field
    	}
    };
    
    $scope.$on('$destroy', function controllerDestroyed() {
    	if(!$scope.valueFlushed) {
    		if ($scope.property.value) {
        		$scope.property.value = $scope.property.value.replace(/(<([^>]+)>)/ig,"");
        	}
    		$scope.updatePropertyInModel($scope.property, $scope.shapeId);
    	}
    });

}];

/*
 * Boolean controller
 */

var KisBpmBooleanPropertyCtrl = ['$scope', function ($scope) {

    $scope.changeValue = function() {
        if ($scope.property.key === 'oryx-defaultflow' && $scope.property.value) {
            var selectedShape = $scope.selectedShape;
            if (selectedShape) {
                var incomingNodes = selectedShape.getIncomingShapes();
                if (incomingNodes && incomingNodes.length > 0) {
                    // get first node, since there can be only one for a sequence flow
                    var rootNode = incomingNodes[0];
                    var flows = rootNode.getOutgoingShapes();
                    if (flows && flows.length > 1) {
                        // in case there are more flows, check if another flow is already defined as default
                        for (var i = 0; i < flows.length; i++) {
                            if (flows[i].resourceId != selectedShape.resourceId) {
                                var defaultFlowProp = flows[i].properties['oryx-defaultflow'];
                                if (defaultFlowProp) {
                                    flows[i].setProperty('oryx-defaultflow', false, true);
                                }
                            }
                        }
                    }
                }
            }
        }
        $scope.updatePropertyInModel($scope.property);
    };

}];

/*
 * Text controller
 */

var KisBpmTextPropertyCtrl = [ '$scope', '$modal', function($scope, $modal) {

    var opts = {
        template:  'editor-app/configuration/properties/text-popup.html?version=' + Date.now(),
        scope: $scope
    };

    // Open the dialog
    $modal(opts);
}];

var KisBpmTextPropertyPopupCtrl = ['$scope', function($scope) {
    
    $scope.save = function() {
        $scope.updatePropertyInModel($scope.property);
        $scope.close();
    };

    $scope.close = function() {
        $scope.property.mode = 'read';
        $scope.$hide();
    };
}];
var propertyInitPopupController= [ '$scope', '$modal', function($scope, $modal) {
    // 设置是否弹窗
    console.log($scope.nameProperty);
    var opts = {
        template:  'editor-app/configuration/properties/propertyInitPopup.html?version=' + Date.now(),
        scope: $scope
    };

    // Open the dialog
    $modal(opts);
}];

var propertyInitController = ['$scope', '$http', function ($scope ,$http) {
    $scope.resources = []; // 界面显示的资源列表
    //$scope.isRefencedResource = true; //被引用的资源
    // $scope.ResourceType = 'blue';

    let selectedResourceEntity = $scope.selectedShape;

    // 资源与人机物三种Action的对应（固定不变）
    // 资源与人机物三种Action的对应（固定不变）
    // $scope.constTypeOfResource = [
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

    $scope.constTypeOfResource = [
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

    // 获取当前资源的类型：Cyber、Physical or Social
    var selectedShapeFunctionType = undefined;
    for (let i = 0; i < $scope.constTypeOfResource.length; i++) {
        if ($scope.constTypeOfResource[i].name === selectedResourceEntity.properties["oryx-type"]) {
            selectedShapeFunctionType = $scope.constTypeOfResource[i].type;
        }
    }

    // 社会资源的名称在不在知识图谱中，需要手动自定义
    // 还有CyberObject和Item也需要手动自定义
    $scope.isSettingbyKG = !(selectedShapeFunctionType === "SocialAction"
        || selectedResourceEntity.properties["oryx-type"] === "信息对象"
        || selectedResourceEntity.properties["oryx-type"] === "物品"
        || selectedResourceEntity.properties["oryx-type"] === "入口节点"
        || selectedResourceEntity.properties["oryx-type"] === "房间"
        || selectedResourceEntity.properties["oryx-type"] === "出口节点"
        || selectedResourceEntity.properties["oryx-type"] === "CyberObject"
        || selectedResourceEntity.properties["oryx-type"] === "PhysicalItem"
        || selectedResourceEntity.properties["oryx-type"] === "Entry"
        || selectedResourceEntity.properties["oryx-type"] === "Room"
        || selectedResourceEntity.properties["oryx-type"] === "Exit"
    );

    // 请求知识图谱，获取对应的资源，如下单应用、咖啡机等
    $http({method: 'GET', url: KISBPM.URL.getResources()}).success(function (data, status, headers, config) {
        let k=0;
        for(let i=0; i< data.length;i++){
            if(data[i].type === selectedShapeFunctionType){
                $scope.resources[k] = data[i];
                k++;
            }
        }
        // console.log(JSON.stringify($scope.resources));
    }).error(function (data, status, headers, config) {
        console.log('Something went wrong when fetching Resources:' + JSON.stringify(data));
    });


    $scope.save = function () {
        // 提供一个下拉框，提供开发者选择
        // console.log($scope.selectedRes);
        // 社会资源的名称在不在知识图谱中，需要手动自定义
        console.log($scope.ResourceType);
        if($scope.isSettingbyKG){
            $scope.nameProperty.value = $scope.selectedRes;        //$scope.selectedRes表示选中的资源
        }
        $scope.updatePropertyInModel($scope.nameProperty);
        $scope.close();
    };

    $scope.close = function () {
        // $scope.nameProperty.mode = 'read';
        $scope.$hide();
    };
}];
