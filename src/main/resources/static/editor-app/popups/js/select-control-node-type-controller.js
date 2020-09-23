var SelectControlNodeTypeController = ['$scope', function ($scope) {
    $scope.controlNodeType = []
    $scope.controlNodeType.push({id: "ParallelControlNode", name: "ParallelControlNode"})
    $scope.controlNodeType.push({id: "ExclusiveControlNode", name: "ExclusiveControlNode"})
    for (let i = 0; i < $scope.sceneFrom.outgoing.length; i++) {
        let shape = $scope.sceneFrom.outgoing[i].outgoing[0];
        if ($scope.isStartGateway(shape)) {
            $scope.controlNodeType.push({id: shape.id, name: shape.properties["oryx-name"]});
        }
    }

    $scope.selectedControlNodeId = "ParallelControlNode";
    $scope.save = function () {
        if ($scope.selectedControlNodeId === "ParallelControlNode") {
            $scope.handleControlNodeDispatch($scope.sceneFrom, "StartParallelGateway");
        } else if ($scope.selectedControlNodeId === "ExclusiveControlNode") {
            $scope.handleControlNodeDispatch($scope.sceneFrom, "StartExclusiveGateway");
        } else {
            $scope.reconnectScenes(
                [],
                [{
                    shape: $scope.sceneEdge.outgoing[0],
                    removedEdge: $scope.sceneEdge
                }], $scope.getShapeById($scope.selectedControlNodeId));
        }
        $scope.$hide();
    }

}]