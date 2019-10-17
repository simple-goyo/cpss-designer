var ThingGetOrLeaveController = ['$scope', '$modal', function ($scope, $modal) {
    $scope.wayToDo = 'get';

    $scope.thingCanLeave = [];
    var userShape = undefined;
    for (var i = 0; i < $scope.outputStatus.length; i++) {
        if ($scope.outputStatus[i].type !== "用户" && $scope.outputStatus[i].type !== "工人") {
            $scope.thingCanLeave[$scope.thingCanLeave.length] = $scope.outputStatus[i];
        } else {
            userShape = $scope.getShapeById($scope.outputStatus[i].id);
        }
    }

    $scope.save = function () {
        if ($scope.selectedElements.length > 0) {
            if ($scope.wayToDo === 'get') {
                for (var i = 0; i < $scope.selectedElements.length; i++) {
                    var selectedShapeToGet = $scope.getShapeById($scope.selectedElements[i].value);
                    selectedShapeToGet.setProperty("oryx-ownedbywho", {id: userShape.id});
                    var owners = userShape.properties["oryx-owner"];
                    owners[owners.length] = selectedShapeToGet.id;
                    userShape.setProperty("oryx-owner", owners);
                }
            } else {
                for (var i = 0; i < $scope.selectedElements.length; i++) {
                    var selectedShapeToLeave = $scope.getShapeById($scope.selectedElements[i].value);
                    selectedShapeToLeave.setProperty("oryx-ownedbywho", {id: ""});
                    var owners = [];
                    for (var j = 0; j < $scope.properties["oryx-owner"].length; j++) {
                        if ($scope.properties["oryx-owner"][j].id !== selectedShapeToLeave.id) {
                            owners[owners.length] = {id: $scope.properties["oryx-owner"][j].id}
                        }
                    }
                    userShape.setProperty("oryx-owner", owners);
                }
            }
        }
        var opts = {
            template: "editor-app/configuration/properties/services-popup.html",
            scope: $scope
        };
        $modal(opts);
        $scope.close();

    };

    $scope.close = function () {
        $scope.$hide();
    };
}];