'use strict';
angular.module('activitiModeler')
    .SceneClass = function ($rootScope, $scope) {
    //场景列表
    $rootScope.scenes = [];

    $rootScope.selectedSceneIndex = -1;

    $rootScope.scenesRelations = {};

    const MessageSceneFlow = "MessageSceneFlow";
    const StartParallelGateway = "StartParallelGateway";
    const EndParallelGateway = "EndParallelGateway";
    const StartExclusiveGateway = "StartExclusiveGateway";
    const EndExclusiveGateway = "EndExclusiveGateway";

    // 返回scene的总数
    $scope.getNumberOfScene = function () {
        return $rootScope.scenes.length;
    };

    $scope.getSceneIndexByAction = function (actionid) {//actionshapeid
        let scene_index = -1;

        $scope.scenes.each(function (scene, index) {
            if (scene.childShapes) {
                let len = scene.childShapes.length;
                if (len) {
                    for (let i = 0; i < len; i++) {
                        if (scene.childShapes[i].resourceId === actionid) {
                            scene_index = index;
                            return scene_index;
                        }
                    }
                }
            }
        });

        return scene_index;
    };


    $scope.getScenes = function () {
        // id: "sid-0ABA3F8C-7725-4D35-8E22-D0CD74494EBC"
        // lastselectionOverrideIds: [""]
        // name: "会议室"
        // properties: {location: "2"}
        // sceneJson: {resourceId: "382501", properties: {…}, stencil: {…}, childShapes: Array(1), bounds: {…}, …}
        let currentscene = $scope.getSelectedSceneIndex();
        $scope.changeScene(currentscene); // 保存画布上的元素到当前scene中

        return $rootScope.scenes;
    };


    $scope.getSceneRelations = function () {
        return $rootScope.scenesRelations;
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
            let result = $scope.checkScene($rootScope.selectedSceneIndex);
            if(!result){
                return false;
            }
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
        return true;
    };

    $scope.isSelectedScene = function (index) {
        if (index === $rootScope.selectedSceneIndex) {
            return "sceneHighlighted";
        }
    };

    $scope.isShapeInScene = function (shape, sceneId) {
        for(let i=0;i<$rootScope.scenes.length;i++){
            if($rootScope.scenes[i].id === sceneId){
                let childShapes = $rootScope.scenes[i].childShapes;
                for(let j=0;j<childShapes.length;j++){
                    if(childShapes[j] === shape){return true;}
                }
            }
        }
        return false;
    };


    $scope.createScene = function () {
        var itemId = "scene";
        let result = $scope.checkScene($rootScope.selectedSceneIndex);
        if(!result){
            return false;
        }
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

        return true;
    }

    $scope.hideScenesRelations = function () {
        let show = jQuery('#scenesRelationsShow').css('display');
        if (show !== 'none') {
            jQuery('#scenesRelationsShow').css('display', 'none');
            jQuery('#underlay-container').css('display', 'block');
            $rootScope.scenesRelations.childShapes = $scope.editor.getJSON().childShapes;
            $rootScope.scenesRelations.sceneTree = $scope.getSceneTree();
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

    /**
     * tree:
     * {
     *     id:"sceneTreeRoot",
     *     children:[
     *         {
     *            id:"scene1Id",
     *            children:[scene1IdNode]
     *         },
     *         {
     *              id:"scene2Id",
     *            children:[scene2IdNode]
     *         }
     *     ]
     * }
     *
     * node: {
     *      id:overrideid,
     *      children:[]
     * }
     *
     * */

    $scope.getSceneTree = function () {
        if ($scope.scenesRelations.childShapes && $scope.scenesRelations.childShapes.length > 0) {
            let shapeMap = new Map();
            let tree = {id: "sceneTreeRoot", children: [], childrenIds: []};
            for (let i = 0; i < $scope.scenesRelations.childShapes.length; i++) {
                let shape = $scope.scenesRelations.childShapes[i];
                shapeMap.set(shape.resourceId, shape);
                if (shape.stencil.id === "scene") {
                    tree.childrenIds.push(shape.properties['overrideid']);
                }
            }
            let treeNodes = new Map();
            shapeMap.forEach((shape) => {
                if (shape.stencil.id === "scene") {
                    let children = $scope.getChildren(shapeMap, shape);
                    let id = shape.properties['overrideid'];
                    let node = treeNodes.get(id);
                    if (node === undefined) {
                        node = {id: id, children: []};
                    }

                    for (let i = 0; i < children.length; i++) {
                        let childId = children[i].id;
                        let index = tree.childrenIds.indexOf(childId);
                        if (index !== -1) {
                            tree.childrenIds.splice(index, 1);
                        }
                        let childNode = treeNodes.get(childId);
                        if (childNode === undefined) {
                            childNode = {id: childId, children: []}
                        }
                        node.children.push(childNode);
                        treeNodes.set(childId, childNode);
                    }
                    treeNodes.set(id, node);
                }
            });
            tree.childrenIds.forEach((id) => {
                let node = treeNodes.get(id);
                if (node !== undefined)
                    tree.children.push(node);
            });
            delete tree.childrenIds;
            return tree;
        }
    }

    $scope.getChildren = function (shapeMap, shape) {
        let children = [];
        for (let i = 0; i < shape.outgoing.length; i++) {
            let child = shapeMap.get(shape.outgoing[i].resourceId);
            if (child !== undefined && child.stencil.id === MessageSceneFlow) {
                children = children.concat($scope.getChildren(shapeMap, child));
            } else if (child !== undefined &&
                (child.stencil.id === StartParallelGateway || child.stencil.id === EndParallelGateway ||
                    child.stencil.id === StartExclusiveGateway || child.stencil.id === EndExclusiveGateway)) {
                children = children.concat($scope.getChildren(shapeMap, child));
            } else if (child !== undefined && child.stencil.id === "scene") {
                children.push({id: child.properties['overrideid']});
            }
        }
        return children;
    }

    $scope.deleteScene = function (shape) {
        while (shape.incoming.length > 0) {
            $scope.editor.deleteShape(shape.incoming[0]);
        }
        while (shape.outgoing.length > 0) {
            $scope.editor.deleteShape(shape.outgoing[0]);
        }
        for (let i = 0; i < $rootScope.scenes.length; i++) {
            let scene = $rootScope.scenes[i];
            if (scene.id === shape.id) {
                $rootScope.scenes.splice(i, 1);
                break;
            }
        }
        $scope.deleteParametersInScene(shape.id);
        $rootScope.scenesRelations.childShapes = $scope.editor.getJSON().childShapes;
        $rootScope.scenesRelations.sceneTree = $scope.getSceneTree();
    }

    $scope.adjustTraceableScenes = function () {
        let shapes = [$scope.editor.getCanvas()][0];
        for (let i = 0; i < shapes.length; i++) {
            if (shapes[i].properties['oryx-type'] === "场景" || shapes[i].properties['oryx-type'] === "scene") {
                let traceableScenes = $scope.findTraceableScenes(shapes[i]);
                traceableScenes.splice(traceableScenes.indexOf(shapes[i].id), 1);
                shapes[i].setProperty("oryx-traceablescenes", traceableScenes);
            }
        }
    }

    $scope.deleteGateway = function (shape) {
        while (shape.incoming.length > 0) {
            $scope.editor.deleteShape(shape.incoming[0]);
        }
        while (shape.outgoing.length > 0) {
            $scope.editor.deleteShape(shape.outgoing[0]);
        }

        let companyId = shape.properties["oryx-gatewaycompany"];
        if (companyId !== undefined && companyId !== "") {
            let company = $scope.getShapeById(companyId);
            if (company !== undefined) {
                if ($scope.isStartGateway(shape)) {
                    $scope.deleteGateway(company);
                    $scope.editor.deleteShape(company);
                } else {
                    company.setProperty("oryx-gatewaycompany", "");
                }
            }
        }
        $rootScope.scenesRelations.childShapes = $scope.editor.getJSON().childShapes;
        $rootScope.scenesRelations.sceneTree = $scope.getSceneTree();
    }

};
