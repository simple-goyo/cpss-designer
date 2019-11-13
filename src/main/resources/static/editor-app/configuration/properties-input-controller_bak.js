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
    // entities：存放列表中显示的资源
    $scope.entities = [];
    $scope.entities[0] = {"id": "none", "name": "请选择输入实体", "type": "none"};

    $scope.selectedItems=[];
    $scope.res_input = [];
    $scope.res_outpfut = [];
    $scope.items = [{"id":"input_res", "name":"输入资源", "specialties":$scope.res_input},
        {"id":"output_res", "name":"输出资源", "specialties":$scope.res_outpfut}];

    // 遍历画布，如果发现是资源加入 entities
    for (var i = 0; i < temp.length; i++) {
        if (temp[i].properties["oryx-type"]){
            $scope.entities[$scope.entities.length] = {
                "id": temp[i].id,
                "name": temp[i].properties["oryx-name"],
                "type": temp[i].properties["oryx-type"]
            };
            $scope.res_input[$scope.res_input.length] = {
                "id": temp[i].id,
                "name": temp[i].properties["oryx-name"],
                "type": temp[i].properties["oryx-type"]
            }
        }
    }

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

    $scope.addResourceValue = function(index){
        $scope.entity.resources.splice(index + 1, 0, {value: ''});
    };

    $scope.removeResourceValue = function(index){
        $scope.entity.resources.splice(index, 1);
    };

    $scope.save = function () {
        console.log($scope.selectedItems);
        if ($scope.property.input.name === "请选择输入实体") {
            $scope.property.value = "";
        } else {
            $scope.property.value = $scope.property.input;
        }

        var openOutputPopup = false;

        if ($scope.property.mode === 'set') {
            openOutputPopup = true;
        }
        $scope.updatePropertyInModel($scope.property);

        $scope.close();

        if (openOutputPopup) {
            for (var i = 0; i < $scope.selectedItem.properties.length; i++) {
                if ($scope.selectedItem.properties[i].title === "输出") {
                    $scope.property = $scope.selectedItem.properties[i];
                }
            }
            // Config for the modal window

            var opts = {
                template: 'editor-app/configuration/properties/output-popup.html?version=' + Date.now(),
                scope: $scope
            };

            // Open the dialog
            $modal(opts);
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