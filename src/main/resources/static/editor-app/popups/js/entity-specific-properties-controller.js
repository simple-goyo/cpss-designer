var EntitySpecificPropertiesController = ['$scope', '$rootScope', '$http', function ($scope, $rootScope, $http) {
    let selectedShape = $scope.editor.getSelection()[0];
    $scope.resName = (selectedShape.properties["oryx-type"] === "房间" || selectedShape.properties["oryx-type"] === "Room") ? "Room" : selectedShape.properties['oryx-name'];
    // $scope.rules = ["靠近", "远离", "大于", "小于", "等于"];
    $scope.rules = ["Near", "Include", "LocatedIn"];
    $scope.getRelatedEntities = function () {
        let relatedEntities = [];
        let sceneId = $rootScope.scenes[$rootScope.selectedSceneIndex].id;
        let traceableScenes = $scope.getTraceableScenes(sceneId);
        if (traceableScenes !== undefined && traceableScenes !== "") {
            $rootScope.scenes.forEach((scene) => {
                let index = traceableScenes.indexOf(scene.id);
                if (index !== -1) {
                    let shapes = scene.childShapes;
                    if (shapes !== undefined && shapes.length > 0) {
                        shapes.forEach((shape) => {
                            let stencilId = shape.stencil.id;
                            if ($scope.isEntity(stencilId)) {
                                relatedEntities.push({
                                    name: shape.properties["name"],
                                    id: shape.properties["overrideid"]
                                });
                            }
                        });
                    }
                }
            });
        }
        $scope.editor.getJSON().childShapes.forEach((shape) => {
            if (shape.properties["overrideid"] !== selectedShape.properties["oryx-overrideid"]) {
                let stencilId = shape.stencil.id;
                if ($scope.isEntity(stencilId)) {
                    relatedEntities.push({
                        name: shape.properties["name"],
                        id: shape.properties["overrideid"]
                    });
                }
            }
        })
        return relatedEntities;
    }

    $scope.getData = function () {
        let sceneId = $rootScope.scenes[$rootScope.selectedSceneIndex].id;
        let traceableScenes = $scope.getTraceableScenes(sceneId);
        let action = $scope.getHighlightedShape();
        let traceableActions = []
        if (action !== undefined)
            traceableActions = $scope.getTraceableActions(action);
        return $scope.getVisibleParameters(sceneId, traceableScenes, traceableActions);
    }

    $scope.isEntity = function (stencilId) {
        return stencilId === "Person" || stencilId === "Person_Worker" || stencilId === "Group" || stencilId === "Organization"
            || stencilId === "PhysicalObject" || stencilId === "Robot" || stencilId === "Device"
            || stencilId === "CloudApp" || stencilId === "MobileApp" || stencilId === "EmbeddedApp" || stencilId === "CyberObject"
            || stencilId === "Room";
    }

    $scope.entities = $scope.getRelatedEntities();
    $scope.data = $scope.getData();
    let olderProperties = selectedShape.properties['oryx-entityspecificproperties'];
    if (olderProperties !== "" && olderProperties.bindDynamically !== undefined) {
        $scope.bindDynamically = olderProperties.bindDynamically;
    } else {
        $scope.bindDynamically = false;
    }
    $http({
        method: 'GET',
        url: KISBPM.URL.getEntitySpecificProperties($scope.resName)
    }).success(function (data, status, headers, config) {
        $scope.properties = {};
        if (data.properties !== undefined && data.properties.length > 0) {
            data.properties.forEach((property) => {
                if (olderProperties === "" || olderProperties.properties === undefined || olderProperties.properties[property] === undefined) {
                    $scope.properties[property] = {type: "entity", data: "", text: "", entity: "", rule: ""};
                } else
                    $scope.properties[property] = olderProperties.properties[property];
            });
        }
    }).error(function (data, status, headers, config) {
        console.log('Something went wrong when fetching entity specific properties:' + JSON.stringify(data));
    });

    $scope.save = function () {
        let entitySpecificProperties = {};
        entitySpecificProperties.bindDynamically = $scope.bindDynamically;
        for (let property in $scope.properties) {
            if ($scope.properties[property].entity !== "") {
                if ($scope.properties[property].entity.name === undefined)
                    $scope.properties[property].entity = JSON.parse($scope.properties[property].entity);
            }
        }
        entitySpecificProperties.properties = $scope.properties;
        selectedShape.setProperty("oryx-entityspecificproperties", entitySpecificProperties);
        $scope.close();
    }
    $scope.close = function () {
        $scope.$hide();
    }

}]
