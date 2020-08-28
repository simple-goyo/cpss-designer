var ReferenceEntityWriteCtrl = ['$scope', '$modal', '$timeout', '$translate', function ($scope, $modal, $timeout, $translate) {

    // Config for the modal window
    var opts = {
        template: 'editor-app/configuration/properties/reference-entity-popup.html?version=' + Date.now(),
        scope: $scope
    };

    // Open the dialog
    $modal(opts);
}];

var ReferenceEntityPopupController = ['$scope', '$modal', function ($scope) {
    let scenes = $scope.scenes;
    let selectedSceneIndex = $scope.selectedSceneIndex;
    $scope.canReferenceEntities = [];
    let nowShape = $scope.editor.getSelection()[0];
    for (let i = 0; i < scenes.length; i++) {
        if (i !== selectedSceneIndex) {
            let childrenShapes = scenes[i].sceneJson.childShapes;
            for (let j = 0; j < childrenShapes.length; j++) {
                let shape = childrenShapes[j];
                if (nowShape.properties['oryx-type'] === shape.properties['type'] && shape.properties['referenceentity'] === "") {
                    $scope.canReferenceEntities[$scope.canReferenceEntities.length] = {
                        name: shape.properties['name'],
                        id: shape.properties['overrideid']
                    }
                }
            }
        }
    }


    $scope.save = function () {
        if ($scope.canReferenceEntities.length > 0) {
            $scope.property.value = document.getElementById("referenceEntitySelect").value;
            $scope.updatePropertyInModel($scope.property);
        }
        $scope.close();
    };


    $scope.close = function () {
        $scope.property.mode = 'read';
        $scope.$hide();
    };
}];


var ReferenceEntityDisplayController = ['$scope', function ($scope) {
    $scope.referenceEntityShow = " 未引用实体";
    let id = $scope.property.value;
    if (!id || id === "")
        return;
    let scenes = $scope.scenes;
    let selectedSceneIndex = $scope.selectedSceneIndex;
    for (let i = 0; i < scenes.length; i++) {
        if (i !== selectedSceneIndex) {
            let childrenShapes = scenes[i].sceneJson.childShapes;
            for (let j = 0; j < childrenShapes.length; j++) {
                if (id === childrenShapes[j].properties['overrideid']) {
                    let name = childrenShapes[j].properties['name'];
                    if (!name || name === "") {
                        $scope.referenceEntityShow = id;
                    } else
                        $scope.referenceEntityShow = name + ":" + id;
                    return;
                }
            }
        }
    }
}];