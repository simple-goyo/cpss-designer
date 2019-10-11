var ActivityElementtWriteCtrl = ['$scope', '$modal', '$timeout', '$translate', function ($scope, $modal, $timeout, $translate) {

    // Config for the modal window
    var opts = {
        template: 'editor-app/configuration/properties/activity-element-popup.html?version=' + Date.now(),
        scope: $scope
    };

    // Open the dialog
    $modal(opts);
}];

var ActivityElementPopupController = ['$scope', function ($scope) {
    var temp = [$scope.editor.getCanvas()][0].children;
    $scope.entities = [];
    $scope.entities[0] = {"id": "none", "name": "请选择活动实体"};
    for (var i = 0; i < temp.length; i++) {
        if (temp[i].properties["oryx-type"] === "物理实体")
            $scope.entities[$scope.entities.length] = {"id": temp[i].id, "name": temp[i].properties["oryx-name"]};
    }
    $scope.save = function () {
        if ($scope.property.activityElement.name !== "请选择活动实体")
            $scope.property.value = $scope.property.activityElement;
        else $scope.property.value = "";
        $scope.updatePropertyInModel($scope.property);
        $scope.close();
    };

    // Close button handler
    $scope.close = function () {
        $scope.property.mode = 'read';
        $scope.$hide();
    };
}];