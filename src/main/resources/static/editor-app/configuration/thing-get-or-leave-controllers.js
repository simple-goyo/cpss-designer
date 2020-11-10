var ThingGetOrLeaveController = ['$scope', '$modal', function ($scope, $modal) {
    $scope.wayToDo = 'get';
    $scope.selectedElements = [];
    $scope.thingCanLeave = [];
    var userShape = undefined;
    for (var i = 0; i < $scope.outputStatus.length; i++) {
        if ($scope.outputStatus[i].type !== "用户" && $scope.outputStatus[i].type !== "工人"||
            $scope.outputStatus[i].type !== "User" && $scope.outputStatus[i].type !== "Worker") {
            $scope.thingCanLeave[$scope.thingCanLeave.length] = $scope.outputStatus[i];
            if ($scope.thingCanLeave[$scope.thingCanLeave.length - 1].name === '咖啡机'){
                $scope.thingCanLeave[$scope.thingCanLeave.length - 1].name = '咖啡';
            }else if($scope.thingCanLeave[$scope.thingCanLeave.length - 1].name === 'CoffeeMaker') {
                $scope.thingCanLeave[$scope.thingCanLeave.length - 1].name = 'coffee';
            }
        } else {
            userShape = $scope.getShapeById($scope.outputStatus[i].id);
        }
    }

    $scope.thingCanGet = [];
    for (var i = 0; i < $scope.neibor.length; i++) {
        if ($scope.outputStatus[i].type !== "用户" && $scope.outputStatus[i].type !== "工人"||
            $scope.outputStatus[i].type !== "User" && $scope.outputStatus[i].type !== "Worker") {
            $scope.thingCanGet[$scope.thingCanGet.length] = $scope.neibor[i];
            if ($scope.thingCanGet[$scope.thingCanGet.length - 1].name === '咖啡机') {
                $scope.thingCanGet[$scope.thingCanGet.length - 1].name = '咖啡';
            }else if($scope.thingCanGet[$scope.thingCanGet.length - 1].name === 'CoffeeMaker'){
                $scope.thingCanGet[$scope.thingCanGet.length - 1].name = 'coffee';
            }
        }
    }

    $scope.updateSelectedElements = function () {
        $scope.selectedElements = [];
    };

    $scope.updateSelection = function ($event, id) {
        var checkbox = $event.target;
        var action = (checkbox.checked ? 'add' : 'remove');
        var element = {id: id};
        if (action === 'add' && $scope.selectedElements.indexOf(element) === -1) $scope.selectedElements.push(element);
        if (action === 'remove' && $scope.selectedElements.indexOf(element) !== -1) $scope.selectedElements.splice($scope.selectedElements.indexOf(element), 1);
    };

    $scope.isSelected = function (id) {
        return $scope.selectedElements.indexOf({id: id}) >= 0;
    };


    $scope.save = function () {
        if ($scope.selectedElements.length > 0) {
            if ($scope.wayToDo === 'get') {
                for (var i = 0; i < $scope.selectedElements.length; i++) {
                    var selectedShapeToGet = $scope.getShapeById($scope.selectedElements[i].id);
                    selectedShapeToGet.setProperty("oryx-ownedbywho", {id: userShape.id});
                    if (userShape.properties["oryx-owner"]) {
                        owners = userShape.properties["oryx-owner"];
                    } else {
                        owners = [];
                    }
                    owners[owners.length] = {id: selectedShapeToGet.id};
                    userShape.setProperty("oryx-owner", owners);
                    // $scope.outputStatus[$scope.outputStatus.length] = {
                    //     id: selectedShapeToGet.id,
                    //     type: selectedShapeToGet.properties["oryx-type"],
                    //     name: selectedShapeToGet.properties["oryx-name"],
                    //     position: selectedShapeToGet.bounds.center()
                    // };
                }
            } else if (userShape && userShape.properties["oryx-owner"]) {
                for (var i = 0; i < $scope.selectedElements.length; i++) {
                    var selectedShapeToLeave = $scope.getShapeById($scope.selectedElements[i].id);
                    selectedShapeToLeave.setProperty("oryx-ownedbywho", "");
                    var owners = userShape.properties["oryx-owner"];
                    var index = owners.indexOf({id: selectedShapeToLeave.id});
                    owners.splice(index, 1);
                    userShape.setProperty("oryx-owner", owners);
                    // $scope.outputStatus.splice(index, 1);
                }
            }
        }
        $scope.close();
    };

    $scope.close = function () {
        $scope.selectedShape = userShape;
        if(userShape !== undefined){
            if (!userShape.properties["oryx-services"]) {
                $scope.property = {
                    key: "oryx-services",
                    value: []
                };
            } else {
                $scope.property = {
                    key: "oryx-services",
                    value: userShape.properties["oryx-services"]
                }
            }
            var opts = {
                template: "editor-app/configuration/properties/services-popup_new.html",
                scope: $scope
            };
            $modal(opts);
        }

        $scope.$hide();
    };
}];
