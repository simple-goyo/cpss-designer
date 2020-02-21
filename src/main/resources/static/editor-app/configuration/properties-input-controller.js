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

    // entities：存放列表中显示的资源
    $scope.entities = [];
    $scope.entities[0] = {"id": "none", "name": "请选择输入实体", "type": "none"};

    $scope.selectedItems=[];
    $scope.res_input = [];
    $scope.res_output = [];

    // 遍历画布，如果发现是资源加入 entities
    for (var i = 0; i < temp.length; i++) {
        if (temp[i].properties["oryx-type"]){
            $scope.entities[$scope.entities.length] = {
                "id": temp[i].id,
                "name": temp[i].properties["oryx-name"],
                "type": temp[i].properties["oryx-type"]
            };
            $scope.res_input[$scope.res_input.length] = {
                "id": temp[i].properties["oryx-overrideid"],
                "name": temp[i].properties["oryx-name"],
                "type": temp[i].properties["oryx-type"],
                "resName": temp[i].properties["oryx-resName"],
                "ServName": temp[i].properties["oryx-ServiceName"],
                "in_out":"in"
            };
            $scope.res_output[$scope.res_output.length] = {
                "id": temp[i].properties["oryx-overrideid"],
                "name": temp[i].properties["oryx-name"],
                "type": temp[i].properties["oryx-type"],
                "objName":  temp[i].properties["oryx-objName"],
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
            $scope.updateAction();
        }else{
            $scope.property.value = "";
        }
        // $scope.updatePropertyInModel($scope.property);
        $scope.close();

    };

    $scope.updateAction = function(){
        if(HighlightedShape === undefined) return;// 如果没有高亮，直接返回

        var actionActivity = HighlightedShape;//$scope.editor.getSelection()[0];
        if(actionActivity.properties["oryx-input"] !== undefined && actionActivity.properties["oryx-output"] !== undefined){
            var stringSelItems = $scope.selectedItems;
            var jsonSelItems = [];
            for(var i=0;i<stringSelItems.length;i++){
                jsonSelItems[i] = jQuery.parseJSON(stringSelItems[i]);
            }

            var in_value  = [];
            var out_value = [];

            for(var i=0;i<stringSelItems.length;i++){
                if(jsonSelItems[i].in_out === "in"){
                    // input  资源加入
                    in_value[in_value.length] = jsonSelItems[i];
                }else if(jsonSelItems[i].in_out === "out"){
                    // output 资源加入
                    out_value[out_value.length] = jsonSelItems[i];
                }
            }

            var property_in_pattern  = {"key":"oryx-input",  "value":in_value};
            var property_out_pattern = {"key":"oryx-output", "value":out_value};

            $scope.updatePropertyInModel(property_in_pattern);
            $scope.updatePropertyInModel(property_out_pattern);
        }
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