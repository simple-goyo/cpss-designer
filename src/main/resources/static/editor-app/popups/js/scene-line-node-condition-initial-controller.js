var SceneLineNodeConditionInitialController = ['$scope', function ($scope) {
    $scope.index = 0;
    $scope.properties = ["a", "b", "c", "d", "e"];
    $scope.conditions = ["==", "!="];
    $scope.combinations = ["AND", "OR"];
    $scope.initNodeConditions = function () {
        let edgeNodeConditions = $scope.setConditionsEdges[$scope.index].edge.properties["oryx-nodecondition"];
        if (edgeNodeConditions === undefined || edgeNodeConditions === "" || edgeNodeConditions.nodeConditions.length === 0) {
            $scope.nodeConditions = [];
            $scope.nodeConditions.push({
                property: "",
                condition: "",
                value: "",
                combination: ""
            });
        } else {
            $scope.nodeConditions = edgeNodeConditions.nodeConditions;
        }

    }
    $scope.initNodeConditions();

    $scope.addEmptyCondition = function () {
        $scope.nodeConditions.push({
            property: "",
            condition: "",
            value: "",
            combination: ""
        });
    }

    $scope.save = function () {
        $scope.saveNodeConditions();
        for (let i = 0; i < $scope.setConditionsEdges.length; i++) {
            let edgeNodeConditions = $scope.setConditionsEdges[i].edge.properties["oryx-nodecondition"];
            if (edgeNodeConditions === undefined || edgeNodeConditions === "" || edgeNodeConditions.nodeConditions.length === 0) {
                return;
            }
        }
        $scope.$hide();
    };

    $scope.changeEdge = function (index) {
        $scope.saveNodeConditions();
        $scope.index = index;
        $scope.initNodeConditions();
    }

    $scope.isSelected = function (index) {
        if (index === $scope.index) {
            return "active";
        } else {
            return "";
        }
    }

    $scope.saveNodeConditions = function () {
        let nodeConditionsValue = {};
        nodeConditionsValue.nodeConditions = [];
        for (let i = 1; i <= $scope.nodeConditions.length; i++) {
            let propertyId = "property" + i;
            let conditionId = "condition" + i;
            let valueId = "value" + i;
            let combinationId = "combination" + i;
            let property = document.getElementById(propertyId).value;
            let condition = document.getElementById(conditionId).value;
            let value = document.getElementById(valueId).value;
            let combination = document.getElementById(combinationId) == null ? "" : document.getElementById(combinationId).value;
            if (property !== "" && condition !== "" && value !== "" && (i === 1 || (i > 1 && combination !== ""))) {
                nodeConditionsValue.nodeConditions.push({
                    property: property,
                    condition: condition,
                    value: value,
                    combination: combination
                });
            }
        }
        $scope.setConditionsEdges[$scope.index].edge.setProperty("oryx-nodecondition", nodeConditionsValue);
    }
}]