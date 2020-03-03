var InputWriteCtrl = ['$scope', '$modal', '$timeout', '$translate', function ($scope, $modal, $timeout, $translate) {
    // Config for the modal window
    var opts = {
        template: 'editor-app/configuration/properties/input-popup.html?version=' + Date.now(),
        scope: $scope
    };
    // Open the dialog
    $modal(opts);
}];

var InputPopupController = ['$scope', '$modal', function ($scope, $modal) {
    //var temp = [$scope.editor.getCanvas()][0].children;
    var temp = $scope.editor.getCanvas().nodes;
    var HighlightedShape = $scope.getHighlightedShape();
    var stringSelItems = undefined; // 已选择的项
    var jsonSelItems = []; // Json 格式的已选择的项

    // entities：存放列表中显示的资源
    $scope.entities = [];
    $scope.entities[0] = {"id": "none", "name": "请绑定输入输出资源", "type": "none"};

    $scope.selectedItems=[];

    $scope.res_input = [];
    $scope.res_output = [];

    // 将画布上的资源（排除线条、Action框等）加入 entities
    for (var i = 0; i < temp.length; i++) {
        if (temp[i].properties["oryx-type"]){
            $scope.entities[$scope.entities.length] = {
                "id": temp[i].id,
                "name": temp[i].properties["oryx-name"],
                "type": temp[i].properties["oryx-type"],
                "events": temp[i].properties["oryx-events"],
                "services": temp[i].properties["oryx-services"] // {name: "order coffee online", input: "userId", output: "state, data.action, data.mode, data.level, data.num"}
            };

            $scope.res_input[$scope.res_input.length] = {
                "id": temp[i].properties["oryx-overrideid"],
                "name": temp[i].properties["oryx-name"],
                "type": temp[i].properties["oryx-type"],
                // "resName": temp[i].properties["oryx-resName"],
                // "ServName": temp[i].properties["oryx-ServiceName"],
                // "value": temp[i].properties["oryx-ServiceName"],
                "InParam": (typeof temp[i].properties["oryx-InParam"] === "undefined") ? "" : temp[i].properties["oryx-InParam"],
                "OutParam": (typeof temp[i].properties["oryx-OutParam"] === "undefined") ? "" : temp[i].properties["oryx-InParam"],
                "in_out":"in"
            };
            $scope.res_output[$scope.res_output.length] = {
                "id": temp[i].properties["oryx-overrideid"],
                "name": temp[i].properties["oryx-name"],
                "type": temp[i].properties["oryx-type"],
                // "objName":  temp[i].properties["oryx-objName"],
                // "value": temp[i].properties["oryx-ServiceName"],
                "InParam": (typeof temp[i].properties["oryx-InParam"] === "undefined") ? "" : temp[i].properties["oryx-InParam"],
                "OutParam": (typeof temp[i].properties["oryx-OutParam"] === "undefined") ? "" : temp[i].properties["oryx-InParam"],
                "in_out":"out"
            };
        }
    }

    $scope.items = [{"id":"input_res", "name":"输入资源", "specialties":$scope.res_input},
        {"id":"output_res", "name":"输出资源", "specialties":$scope.res_output}];

    // Put json representing entity on scope
    if ($scope.property !== undefined && $scope.property.value !== undefined && $scope.property.value !== null
        && $scope.property.value.length > 0)
    {
        for(var i=0 ; i<$scope.property.value.length ; i++){
            $scope.entity.resources[i].value = $scope.property.value[i].resource;
        }

    } else {
        $scope.entity = {};
        $scope.property = {};
    }

    if ($scope.entity.resources === undefined || $scope.entity.resources.length === 0)
    {
        $scope.entity.resources = [{value: ''}];
    }

    $scope.save = function () {
        console.log($scope.selectedItems);
        if($scope.selectedItems.length > 0){
            stringSelItems = $scope.selectedItems;

            for(var i=0;i<stringSelItems.length;i++){
                jsonSelItems[i] = jQuery.parseJSON(stringSelItems[i]);
            }
            $scope.updataResource();
            $scope.updateAction();
        }else{
            $scope.property.value = "";
        }
        // $scope.updatePropertyInModel($scope.property);
        $scope.close();

    };

    // 更新 Action ,添加绑定的输入输出
    $scope.updateAction = function(){
        if(HighlightedShape === undefined) return;// 如果没有高亮，直接返回

        var actionActivity = HighlightedShape;//$scope.editor.getSelection()[0];
        if(actionActivity.properties["oryx-input"] !== undefined && actionActivity.properties["oryx-output"] !== undefined){

            var in_value  = [];
            var out_value = [];

            // 0: "{"id":"sid-B5C3444A-6CA5-45F1-9012-61B0A226009A","name":"User","type":"用户","InParam":"","OutParam":"","in_out":"in"}"
            // 1: "{"id":"sid-1000718E-C1D0-44D1-AA14-FDAA224512E8","name":"[OnlineOrder]","type":"信息对象","InParam":"state, data.action, data.mode, data.level, data.num","OutParam":"state, data.action, data.mode, data.level, data.num","in_out":"out"}"
            for(var i=0; i<stringSelItems.length; i++){
                if(jsonSelItems[i].in_out === "in"){
                    // input  加入选中的资源
                    in_value[in_value.length] = jsonSelItems[i];
                }else if(jsonSelItems[i].in_out === "out"){
                    // output 加入选中的资源
                    out_value[out_value.length] = jsonSelItems[i];
                }
            }

            var property_in_pattern  = {"key":"oryx-input",  "value":in_value};
            var property_out_pattern = {"key":"oryx-output", "value":out_value};

            $scope.updatePropertyInModel(property_in_pattern, actionActivity.id);
            $scope.updatePropertyInModel(property_out_pattern, actionActivity.id);
        }
    };

    // 更新绑定的对象
    // 对象的input绑定实体服务的output
    // 对象的output绑定实体服务的input
    $scope.updataResource = function(){
        if(HighlightedShape === undefined) return;// 如果没有高亮，直接返回

        // 从高亮的Action中读取Input和Output，绑定对象
        var currentActionId = HighlightedShape.properties["oryx-activityelement"].id;
        var currentAction = $scope.getShapeById(currentActionId);

        debugger;
        for(var i=0; i<stringSelItems.length; i++){
            if(jsonSelItems[i].in_out === "out"){
                // CyberObject.InParam <-- Services.output
                var output = currentAction.properties["oryx-services"].output;
                jsonSelItems[i].InParam = output;
                var resourceId = jsonSelItems[i].id;
                var currentResource = $scope.getShapeById(resourceId);
                $scope.updateResourceProperty(currentResource, output, null);
            }else if(jsonSelItems[i].in_out === "in"){
                // CyberObject.OutParam <-- Services.input
                var input = currentAction.properties["oryx-services"].input;
                jsonSelItems[i].OutParam = input;
                var resourceId = jsonSelItems[i].id;
                var currentResource = $scope.getShapeById(resourceId);
                $scope.updateResourceProperty(currentResource, null, input);
            }

        }

    };

    $scope.updateResourceProperty = function (resourceShape, serviceOutput, serviceInput) {
        if(serviceInput !== null){
            resourceShape.setProperty("oryx-OutParam", serviceInput);
        }
        if(serviceOutput !== null){
            resourceShape.setProperty("oryx-InParam", serviceOutput);
        }

        $scope.editor.getCanvas().update();
        $scope.editor.updateSelection();
    };

    // Close button handler
    $scope.close = function () {
        //$scope.property.mode = 'read';
        $scope.$hide();
    };
}];

var InputDisplayController = ['$scope', function ($scope) {
    if ($scope.property.value.id) {
        var shape = $scope.getShapeById($scope.property.value.id);
        if (!shape) {
            $scope.property.value = {};
        } else {
            $scope.property.value.name = shape.properties["oryx-name"];
        }
        $scope.updatePropertyInModel($scope.property);
    }
}];