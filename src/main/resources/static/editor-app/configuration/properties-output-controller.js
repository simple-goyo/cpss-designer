var OutputWriteCtrl = ['$scope', '$modal', '$timeout', '$translate', function ($scope, $modal, $timeout, $translate) {

    // Config for the modal window
    var opts = {
        template: 'editor-app/configuration/properties/output-popup.html?version=' + Date.now(),
        scope: $scope
    };

    // Open the dialog
    $modal(opts);
}];

var OutputPopupController = ['$scope', function ($scope) {
    var temp = [$scope.editor.getCanvas()][0].children;
    $scope.entities = [];
    $scope.entities[0] = {"id": "none", "name": "请选择输出实体"};
    for (var i = 0; i < temp.length; i++) {
        if (temp[i].properties["oryx-type"] === "物理实体")
            $scope.entities[$scope.entities.length] = {"id": temp[i].id, "name": temp[i].properties["oryx-name"]};
    }

    $scope.save = function () {

        if ($scope.property.output.name === "请选择输出实体") {
            $scope.property.value = "";
        } else
            $scope.property.value = $scope.property.output;

        $scope.updatePropertyInModel($scope.property);

        $scope.close();
    };

// Close button handler
    $scope.close = function () {
        $scope.property.mode = 'read';
        $scope.$hide();
    };
}];
var OutputDisplayController = ['$scope', function ($scope) {
    if ($scope.property.value.id) {
        var shape = $scope.getShapeById($scope.property.value.id);
        if (!shape) {
            $scope.property.value = {};
        }else {
            $scope.property.value.name = shape.properties["oryx-name"];
        }
        $scope.updatePropertyInModel($scope.property);
    }
}];