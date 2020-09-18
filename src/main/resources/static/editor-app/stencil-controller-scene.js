'use strict';
angular.module('activitiModeler')
    .SceneClass = function($rootScope, $scope){

    $scope.getScenes = function () {
        // id: "sid-0ABA3F8C-7725-4D35-8E22-D0CD74494EBC"
        // lastselectionOverrideIds: [""]
        // name: "会议室"
        // properties: {location: "2"}
        // sceneJson: {resourceId: "382501", properties: {…}, stencil: {…}, childShapes: Array(1), bounds: {…}, …}
        let currentscene = $scope.getSelectedSceneIndex();
        $scope.changeScene(currentscene); // 保存画布上的元素到当前scene中

        return $scope.scenes;
    };

    $scope.changeScene = function (index) {
        let shapes = [$scope.editor.getCanvas()][0].children;
        if ($rootScope.selectedSceneIndex > -1) {
            $rootScope.scenes[$rootScope.selectedSceneIndex].childShapes = $scope.editor.getJSON().childShapes;
            let highlightedShape = $scope.getShapeById($scope.lastHighlightedId);
            if (highlightedShape) {
                $rootScope.scenes[$rootScope.selectedSceneIndex].lastHighlightedActionId = highlightedShape.id;
            }
            let selection = $scope.editor.getSelection();
            if (selection && selection.length >= 1) {
                $rootScope.scenes[$rootScope.selectedSceneIndex].lastselectionOverrideIds = [];
                for (let i = 0; i < selection.length; i++) {
                    $rootScope.scenes[$rootScope.selectedSceneIndex].lastselectionOverrideIds
                        [$rootScope.scenes[$rootScope.selectedSceneIndex].lastselectionOverrideIds.length] = selection[i].id;
                }
            }
        }
        if (index !== $rootScope.selectedSceneIndex) {
            if ($rootScope.selectedSceneIndex > -1) {
                $scope.takeScreenshot($rootScope.selectedSceneIndex);
            }
            for (let i = 0; i < shapes.length; i++) {
                $scope.editor.deleteShape(shapes[i]);
            }

            $rootScope.selectedSceneIndex = index;

            let childShapes = $rootScope.scenes[$rootScope.selectedSceneIndex].childShapes;
            if (childShapes) {
                let serializedJson = $scope.editor.getJSON();
                serializedJson.childShapes = childShapes;
                $scope.editor.loadSerialized(serializedJson);
                $scope.editor.getCanvas().update();
                shapes = childShapes;
                if (!shapes || shapes.length === 0) {
                    _createAction($rootScope, $scope, "StartNoneEvent");
                }
            } else _createAction($rootScope, $scope, "StartNoneEvent");

            let selectionOverrideIds = $rootScope.scenes[$rootScope.selectedSceneIndex].lastselectionOverrideIds;
            if (selectionOverrideIds && selectionOverrideIds.length >= 1) {
                let selection = [];
                for (let i = 0; i < selectionOverrideIds.length; i++) {
                    selection[selection.length] = $scope.getShapeById(selectionOverrideIds[i]);
                }
                $scope.editor.setSelection(selection);
                $scope.editor.getCanvas().update();
            }
            if ($rootScope.scenes[$rootScope.selectedSceneIndex].lastHighlightedActionId) {
                $scope.HighlightedItem = $scope.getShapeById($rootScope.scenes[$rootScope.selectedSceneIndex].lastHighlightedActionId);
                if ($scope.HighlightedItem) {
                    $scope.lastHighlightedId = $scope.HighlightedItem.id;
                    jQuery('#' + $scope.lastHighlightedId + 'bg_frame').attr({"fill": "#b8ffd8"});
                }
            }
        }
    };

    $scope.isSelectedScene = function (index) {
        if (index === $rootScope.selectedSceneIndex) {
            return "sceneHighlighted";
        }
    };
};
