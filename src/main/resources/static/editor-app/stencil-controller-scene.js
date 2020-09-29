'use strict';
angular.module('activitiModeler')
    .SceneClass = function ($rootScope, $scope) {
    //场景列表
    $rootScope.scenes = [];

    $rootScope.selectedSceneIndex = -1;

    $rootScope.scenesRelations = {};

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
    
    $scope.getSceneRelations = function (){
        return $scope.scenesRelations;
    };

    $scope.storeSceneInfo = function () {
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

    $scope.restoreScene = function (index) {
        let childShapes = $rootScope.scenes[$rootScope.selectedSceneIndex].childShapes;
        if (childShapes) {
            let serializedJson = $scope.editor.getJSON();
            serializedJson.childShapes = childShapes;
            $scope.editor.loadSerialized(serializedJson);
            $scope.editor.getCanvas().update();
            let shapes = childShapes;
            if (!shapes || shapes.length === 0) {
                $scope._createAction($rootScope, $scope, "StartNoneEvent");
            }
        } else $scope._createAction($rootScope, $scope, "StartNoneEvent");

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

    $scope.changeScene = function (index) {
        if ($rootScope.selectedSceneIndex === -1 && index !== -1)
            $scope.hideScenesRelations();

        let shapes = [$scope.editor.getCanvas()][0].children;
        if ($rootScope.selectedSceneIndex > -1) {
            $scope.storeSceneInfo();
        }
        if (index !== $rootScope.selectedSceneIndex) {
            $scope.takeScreenshot($rootScope.selectedSceneIndex);
            for (let i = 0; i < shapes.length; i++) {
                $scope.editor.deleteShape(shapes[i]);
            }
            $rootScope.selectedSceneIndex = index;
            if (index === -1) {
                $scope.showScenesRelations();
            } else {
                $scope.restoreScene(index);
            }
        }
    };

    $scope.isSelectedScene = function (index) {
        if (index === $rootScope.selectedSceneIndex) {
            return "sceneHighlighted";
        }
    };

    $scope.createScene = function () {
        var itemId = "scene";

        var containedStencil = undefined;
        var stencilSets = $scope.editor.getStencilSets().values();
        for (var i = 0; i < stencilSets.length; i++) {
            var stencilSet = stencilSets[i];
            var nodes = stencilSet.nodes();
            for (var j = 0; j < nodes.length; j++) {
                if (nodes[j].idWithoutNs() === itemId) {
                    containedStencil = nodes[j];
                    break;
                }
            }
        }

        if (!containedStencil) return;

        var positionOffset = {x: 80 + 100 * $scope.scenes.length, y: 160};//节点的位置
        var option = {
            type: containedStencil._jsonStencil.id,
            namespace: containedStencil._namespace,
            positionController: positionOffset,
            parent: $rootScope.editor.getCanvas(),
            containedStencil: containedStencil
        };

        var command = new KISBPM.CreateCommand(option, undefined, undefined, $rootScope.editor);
        $rootScope.editor.executeCommands([command]);
        let scene = $scope.editor.getSelection()[0];
        scene.setProperty("oryx-overrideid", scene.id);
        scene.setProperty("oryx-type", "场景");
    }

    $scope.hideScenesRelations = function () {
        let show = jQuery('#scenesRelationsShow').css('display');
        if (show !== 'none') {
            jQuery('#scenesRelationsShow').css('display', 'none');
            jQuery('#underlay-container').css('display', 'block');
            $rootScope.scenesRelations.childShapes = $scope.editor.getJSON().childShapes;
        }
    }

    $scope.showScenesRelations = function () {
        let show = jQuery('#scenesRelationsShow').css('display');
        if (show === 'none') {
            jQuery('#scenesRelationsShow').css('display', 'block');
            jQuery('#underlay-container').css('display', 'none');
            let serializedJson = $scope.editor.getJSON();
            serializedJson.childShapes = $rootScope.scenesRelations.childShapes;
            $scope.editor.loadSerialized(serializedJson);
            $scope.editor.getCanvas().update();
        }
    }

    $scope.connectScene = function (from, edge, to) {
        let traceableScenes = $scope.findTraceableScenes(to);
        traceableScenes.splice(traceableScenes.indexOf(to.id), 1);
        to.setProperty("oryx-traceablescenes", traceableScenes);
        if (from.outgoing.length === 1 && to.incoming.length === 1) {
            return;
        }
        if (from.outgoing.length === 2) {
            $scope.dispatchPath(from, edge);
        }
        if (to.incoming.length === 2) {
            $scope.joinPath(to);
        }
    }

    $scope.getTraceableScenes = function (sceneId) {
        for (let i = 0; i < $rootScope.scenesRelations.childShapes.length; i++) {
            if ($scope.scenesRelations.childShapes[i].properties['overrideid'] === sceneId) {
                return $scope.scenesRelations.childShapes[i].properties['traceablescenes'];
            }
        }
        return undefined;
    }


};
