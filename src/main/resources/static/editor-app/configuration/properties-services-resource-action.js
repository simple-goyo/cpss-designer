angular.module('activitiModeler')
    .ResActionClass = function($rootScope, $scope) {
    let HighlightedShape = $scope.getHighlightedShape();
    let shape = $scope.selectedShape;
    let resProperties = {"oryx-overrideid":"sid-xxx", "oryx-name":"","oryx-type":"", "oryx-resName":"","oryx-ServiceName":"","oryx-objName":"","oryx-InParam":"","oryx-OutParam":""}; //资源属性模板

    // 有些信息服务能够自动生成信息对象
    $scope.AutoGenerateResource = function($scope, actionName, serviceOutput, serviceOutputDetials, selectedShape){
        if(selectedShape === undefined){
            selectedShape = shape;
        }
        // 服务的output中有值
        if( serviceOutput.length > 0){   // 当选择点咖啡服务时，会生成一个订单对象.length > 0){
            // 当选择点咖啡服务时，会生成一个订单对象
            if (actionName.toLowerCase() === 'capability') { // === 'order coffee online'
                if(selectedShape)
                    $scope.createResource($scope, selectedShape, "CyberObject");
                else{
                    $scope.createResource($scope, shape, "CyberObject");
                }

                let resTemp = resProperties;
                resTemp["oryx-type"] = "CyberObject";
                resTemp["oryx-InParam"] = serviceOutputDetials;
                resTemp["oryx-OutParam"] = serviceOutputDetials;
                $scope.setNewResourceProperty($scope, $scope.editor.getSelection()[0], serviceOutput, resTemp);
            }

            if (actionName === 'FinishMakingCoffee') {
                $scope.createResource($scope, selectedShape, "PhysicalObject");

                let resTemp = resProperties;
                resTemp["oryx-type"] = "PhysicalItem";
                $scope.setNewResourceProperty($scope, $scope.editor.getSelection()[0], serviceOutput, resTemp);
            }

            if (actionName === 'FinishPrinting') {
                $scope.createResource($scope, selectedShape, "PhysicalObject");

                let resTemp = resProperties;
                resTemp["oryx-type"] = "PhysicalItem";
                $scope.setNewResourceProperty($scope, $scope.editor.getSelection()[0], "file", resTemp);
            }

            if (actionName === 'MeetingReminder') {
                $scope.createResource($scope, selectedShape, "CyberObject");

                let resTemp = resProperties;
                resTemp["oryx-type"] = "CyberObject";
                $scope.setNewResourceProperty($scope, $scope.editor.getSelection()[0], "message", resTemp);
            }

            if (actionName === 'BodyMovement') {
                $scope.createResource($scope, selectedShape, "CyberObject");

                let resTemp = resProperties;
                resTemp["oryx-type"] = "CyberObject";
                $scope.setNewResourceProperty($scope, $scope.editor.getSelection()[0], "BodyMovement", resTemp);
            }

            if (actionName === 'HumanDetection') {
                $scope.createResource($scope, selectedShape, "CyberObject");

                let resTemp = resProperties;
                resTemp["oryx-type"] = "CyberObject";
                $scope.setNewResourceProperty($scope, $scope.editor.getSelection()[0], "HumanDetection", resTemp);
            }

            if (actionName === 'Notifications') {
                $scope.createResource($scope, selectedShape, "CyberObject");

                let resTemp = resProperties;
                resTemp["oryx-type"] = "CyberObject";
                $scope.setNewResourceProperty($scope, $scope.editor.getSelection()[0], "Notifications", resTemp);
            }

            if (actionName === 'WeightUpdated') {
                $scope.createResource($scope, selectedShape, "CyberObject");

                let resTemp = resProperties;
                resTemp["oryx-type"] = "CyberObject";
                $scope.setNewResourceProperty($scope, $scope.editor.getSelection()[0], "WeightUpdated", resTemp);
            }

            if (actionName === 'FinishBoiling') {
                $scope.createResource($scope, selectedShape, "CyberObject");

                let resTemp = resProperties;
                resTemp["oryx-type"] = "CyberObject";
                $scope.setNewResourceProperty($scope, $scope.editor.getSelection()[0], "FinishBoiling", resTemp);
            }

            if (actionName === 'FallDown') {
                $scope.createResource($scope, selectedShape, "CyberObject");

                let resTemp = resProperties;
                resTemp["oryx-type"] = "CyberObject";
                $scope.setNewResourceProperty($scope, $scope.editor.getSelection()[0], "FallDown", resTemp);
            }

            if (actionName === 'DoorOpen') {
                $scope.createResource($scope, selectedShape, "CyberObject");

                let resTemp = resProperties;
                resTemp["oryx-type"] = "CyberObject";
                $scope.setNewResourceProperty($scope, $scope.editor.getSelection()[0], "DoorOpen", resTemp);
            }

            if (actionName === 'FinishPunching') {
                $scope.createResource($scope, selectedShape, "CyberObject");

                let resTemp = resProperties;
                resTemp["oryx-type"] = "CyberObject";
                $scope.setNewResourceProperty($scope, $scope.editor.getSelection()[0], "FinishPunching", resTemp);
            }

            if (actionName === 'BookTickets') {
                $scope.createResource($scope, selectedShape, "CyberObject");

                let resTemp = resProperties;
                resTemp["oryx-type"] = "CyberObject";
                $scope.setNewResourceProperty($scope, $scope.editor.getSelection()[0], "Ticket", resTemp);
            }

            if (actionName === 'GetAirQuality') {
                $scope.createResource($scope, selectedShape, "CyberObject");

                let resTemp = resProperties;
                resTemp["oryx-type"] = "CyberObject";
                $scope.setNewResourceProperty($scope, $scope.editor.getSelection()[0], "AQI", resTemp);
            }

            if (actionName === 'ReceivedMsg') {
                $scope.createResource($scope, selectedShape, "CyberObject");

                let resTemp = resProperties;
                resTemp["oryx-type"] = "CyberObject";
                $scope.setNewResourceProperty($scope, $scope.editor.getSelection()[0], "Message", resTemp);
            }





            // else{
            //     $scope.createResource($scope, shape, "CyberObject");
            //
            //     let resTemp = resProperties;
            //     resTemp["oryx-type"] = "CyberObject";
            //     $scope.setNewResourceProperty($scope, $scope.editor.getSelection()[0], actionName, resTemp);
            // }



        }
    };

    $scope.setNewResourceProperty = function ($scope, selectionElement, serviceOutput, resProps) {
        // var resProps = {"oryx-overrideid":"sid-xxx", "oryx-name":"","oryx-type":"", "oryx-resName":"","oryx-ServiceName":"","oryx-objName":""};
        // selectionElement.setProperty("oryx-overrideid", ORYX.Editor.provideId());
        selectionElement.setProperty("oryx-overrideid", $scope.editor.getSelection()[0].id);
        selectionElement.setProperty("oryx-name", serviceOutput);
        selectionElement.setProperty("oryx-type", resProps["oryx-type"]);

        //selectionElement.setProperty("oryx-resName", resProps["oryx-resName"]);
        //selectionElement.setProperty("oryx-objName", resProps["oryx-objName"]);
        // selectionElement.setProperty("oryx-InParam", resProps["oryx-InParam"]);
        // selectionElement.setProperty("oryx-OutParam", resProps["oryx-OutParam"]);

        $scope.editor.getCanvas().update();
        $scope.editor.updateSelection();
    };

    $scope.createResource = function ($scope, shape, resourceId) {
        let resource = $scope.getStentil(resourceId);
        if (!resource)
            return undefined;

        let resourceOption = {type: 'set', x: shape.bounds.center().x + 50, y: shape.bounds.center().y};

        let option = {
            type: shape.getStencil().namespace() + resourceId,
            namespace: shape.getStencil().namespace(),
            parent: shape.parent,
            containedStencil: resource,
            positionController: resourceOption
        };

        let command = new KISBPM.CreateCommand(option, undefined, undefined, $scope.editor);

        $scope.editor.executeCommands([command]);
    };

    // 设置action的属性
    $scope.setActionProperty = function($scope, resourceEntity, serviceName, inputParam, outputParam){
        // 给Action设置属性，services是Action对应的资源服务。
        var serviceDetail = {"name":serviceName, "input": inputParam, "output":outputParam};
        shape.setProperty("oryx-services", serviceDetail);
        shape.setProperty("oryx-activityelement", resourceEntity);
        $scope.editor.getCanvas().update();
        $scope.editor.updateSelection();
    };

    $scope.getStentil = function(stencilId){
        let stencil;
        let stencilSets = $scope.editor.getStencilSets().values();
        for (let i = 0; i < stencilSets.length; i++)
        {
            let stencilSet = stencilSets[i];
            let nodes = stencilSet.nodes();
            for (let j = 0; j < nodes.length; j++)
            {
                if (nodes[j].idWithoutNs() === stencilId)
                {
                    stencil = nodes[j];
                    break;
                }
            }
        }

        return stencil;
    }

    $scope.updateActionProperty = function ($scope, res_entity, actionName, modelInput, Output){
        // 填写Action动作的属性
        let actionActivity = $scope.selectedItem;
        for (let i = 0; i < actionActivity.properties.length; i++) {
            let property = actionActivity.properties[i];
            switch (property.title){
                case "Id":
                    property.value = $scope.editor.getSelection()[0].id;
                    $scope.updatePropertyInModel(property);
                    break;
                case "name":
                case "名称":
                    property.value = actionName;
                    $scope.updatePropertyInModel(property);
                    break;
                case "activityelement":
                case "活动元素":
                    property.value = {
                        "id": res_entity.id,
                        "name": res_entity.name,
                        "type": res_entity.type
                    };
                    $scope.updatePropertyInModel(property);
                    break;
                case "actioninputstatus":
                case "动作输入状态":
                    property.value = modelInput;
                    $scope.inputStatus = [];
                    $scope.updatePropertyInModel(property);
                    break;
                case "actionoutputstatus":
                case "动作输出状态":
                    property.value = Output;
                    $scope.outputStatus = [];
                    $scope.updatePropertyInModel(property);
                    break;
                default:break;

            }
        }
    };
    // 替换未定义Action
    $scope.modifyAction = function($scope, actionName, FunctionType) {
        if(HighlightedShape === undefined) return;// 如果没有高亮，直接返回

        let selectItem = $scope.editor.getSelection()[0];
        let newShapeId = "";

        let stencil = $scope.getStentil(FunctionType);
        if (!stencil) return;

        // Create and execute command (for undo/redo)
        let command = new MorphTo(HighlightedShape, stencil, $scope.editor);
        $scope.editor.executeCommands([command]);

        // 填写Action动作的属性
        let actionActivity = $scope.selectedItem;
        for (let i = 0; i < actionActivity.properties.length; i++) {
            let property = actionActivity.properties[i];
            switch (property.title){
                case "Id":
                    property.value = $scope.editor.getSelection()[0].id;
                    newShapeId = property.value;
                    $scope.updatePropertyInModel(property);
                    break;
                case "name":
                case "名称":
                    property.value = actionName;
                    $scope.updatePropertyInModel(property);
                    break;
                case "activityelement":
                case "活动元素":
                    property.value = {
                        "id": selectItem.properties["oryx-overrideid"],
                        "name": selectItem.properties["oryx-name"],
                        "type": selectItem.properties["oryx-type"]
                    };
                    $scope.updatePropertyInModel(property);
                    break;
                case "actioninputstatus":
                case "动作输入状态":
                    property.value = $scope.inputStatus;
                    $scope.inputStatus = [];
                    $scope.updatePropertyInModel(property);
                    break;
                case "actionoutputstatus":
                case "动作输出状态":
                    property.value = $scope.outputStatus;
                    $scope.outputStatus = [];
                    $scope.updatePropertyInModel(property);
                    break;
                default:break;
            }
        }
        $scope.setHighlightedShape(newShapeId);
        jQuery('#' + newShapeId + 'bg_frame').attr({"fill":"#04FF8E"}); //高亮显示

        $scope.workerContainsActionIdUpdate(HighlightedShape.id, newShapeId);

    };

    // $scope.createAction = function ($scope, actionName, FunctionType) {
    //     var selectItem = ActivityElement;//$scope.editor.getSelection()[0];
    //     let itemId = FunctionType;
    //     let action;
    //     let stencilSets = $scope.editor.getStencilSets().values();
    //     for (let i = 0; i < stencilSets.length; i++) {
    //         let stencilSet = stencilSets[i];
    //         let nodes = stencilSet.nodes();
    //         for (let j = 0; j < nodes.length; j++) {
    //             if (nodes[j].idWithoutNs() === itemId) {
    //                 action = nodes[j];
    //                 break;
    //             }
    //         }
    //     }
    //     if (!action) return;
    //
    //     var nodes = [$scope.editor.getCanvas()][0].children;
    //     var positionOffset = {type: 'offsetY', x: 0, y: 0};
    //     for (var i = 0; i < nodes.length; i++) {
    //         if (nodes[i].properties["oryx-activityelement"]) {
    //             if (positionOffset.y < nodes[i].bounds.center().y) {
    //                 positionOffset.y = nodes[i].bounds.center().y;
    //             }
    //         }
    //     }
    //
    //     let option = {
    //         type: selectItem.getStencil().namespace() + itemId,
    //         namespace: selectItem.getStencil().namespace(),
    //         parent: selectItem.parent,
    //         containedStencil: action,
    //         positionController: positionOffset
    //     };
    //
    //     let command = new KISBPM.CreateCommand(option, undefined, undefined, $scope.editor);
    //
    //     $scope.editor.executeCommands([command]);
    //
    //     let actionActivity = $scope.selectedItem;
    //     for (let i = 0; i < actionActivity.properties.length; i++) {
    //         let property = actionActivity.properties[i];
    //         if (property.title === "Id") {
    //             property.value = $scope.editor.getSelection()[0].id;
    //             $scope.updatePropertyInModel(property);
    //         } else if (property.title === "名称") {
    //             property.value = actionName;
    //             $scope.updatePropertyInModel(property);
    //         } else if (property.title === "活动元素") {
    //             property.value = {
    //                 "id": selectItem.properties["oryx-overrideid"],
    //                 "name": selectItem.properties["oryx-name"],
    //                 "type": selectItem.properties["oryx-type"]
    //             };
    //             $scope.updatePropertyInModel(property);
    //         }
    //             // else if (property.title === "输入") {
    //             //     property.mode = 'set';
    //         // }
    //         else if (property.title === "动作输入状态") {
    //             property.value = $scope.inputStatus;
    //             $scope.inputStatus = [];
    //             $scope.updatePropertyInModel(property);
    //         } else if (property.title === "动作输出状态") {
    //             property.value = $scope.outputStatus;
    //             $scope.outputStatus = [];
    //             $scope.updatePropertyInModel(property);
    //         }
    //     }
    // };

}
