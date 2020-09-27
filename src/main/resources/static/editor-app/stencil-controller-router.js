'use strict';
angular.module('activitiModeler')
    .RouterClass = function ($rootScope, $scope) {

    const StartParallelGateway = "StartParallelGateway";
    const EndParallelGateway = "EndParallelGateway";
    const StartExclusiveGateway = "StartExclusiveGateway";
    const EndExclusiveGateway = "EndExclusiveGateway";

    //场景单入单出  start控制节点单入多出  end控制节点多进单出
    $scope.dispatchPath = function (from, edge) {
        $scope.selectControlNodeType(from, edge);
    }

    $scope.joinPath = function (to) {
        let edge1 = to.incoming[0];
        let edge2 = to.incoming[1];
        let nodeCondition1 = edge1.properties['oryx-nodecondition'];
        let nodeCondition2 = edge2.properties['oryx-nodecondition'];
        let shape1 = edge1.incoming[0];
        let shape2 = edge2.incoming[0];
        let controlNodes1 = $scope.findMaxStartControlNodesInPath(shape1);
        let controlNodes2 = $scope.findMaxStartControlNodesInPath(shape2);
        let indexPair = $scope.findCommonStartControlNode(controlNodes1, controlNodes2);
        if (indexPair) {
            let edges1 = $scope.createControlNodePair(shape1, controlNodes1, indexPair.index1);
            let edges2 = $scope.createControlNodePair(shape2, controlNodes2, indexPair.index2);
            edges1[0].setProperty("oryx-nodecondition", nodeCondition1);
            edges2[0].setProperty("oryx-nodecondition", nodeCondition2);
            $scope.editor.deleteShape(edge1);
            $scope.editor.deleteShape(edge2);
            let commonEndNode = $scope.getShapeById(controlNodes1[indexPair.index1].properties['oryx-gatewaycompany']);
            while (commonEndNode.outgoing[0]) {
                commonEndNode = commonEndNode.outgoing[0];
            }
            if (commonEndNode.id !== to.id) {
                $scope.connectResourceByMessageSceneFlow(commonEndNode, to);
            }
        } else {
            $scope.handleControlNodeDispatch(to, EndParallelGateway);
        }
    }

    $scope.createControlNodePair = function (shape, controlNodes, index) {
        let edges = [];
        for (let i = 0; i <= index; i++) {
            let controlNode;
            if (controlNodes[i].properties['oryx-gatewaycompany'] !== undefined
                && controlNodes[i].properties['oryx-gatewaycompany'] !== "") {
                controlNode = $scope.getShapeById(controlNodes[i].properties['oryx-gatewaycompany']);
            } else {
                if ($scope.isStartParallelGateway(controlNodes[i])) {
                    // $scope.createControlNode(shape, "EndParallelGateway");
                    $scope.createControlNode(shape, EndParallelGateway);
                } else if ($scope.isStartExclusiveGateway(controlNodes[i])) {
                    // $scope.createControlNode(shape, "EndExclusiveGateway");
                    $scope.createControlNode(shape, EndExclusiveGateway);
                } else break;
                controlNode = $scope.editor.getSelection()[0];
                controlNode.setProperty("oryx-name", controlNodes[i].properties['oryx-name']);
                controlNodes[i].setProperty("oryx-gatewaycompany", controlNode.id);
                controlNode.setProperty("oryx-gatewaycompany", controlNodes[i].id);
            }
            let edge = $scope.containsLine(shape, controlNode);
            if (edge === null) {
                edge = $scope.containsLine(controlNode, shape);
                if (edge === null)
                    edge = $scope.connectResourceByMessageSceneFlow(shape, controlNode);
            }
            edges.push(edge);
            shape = controlNode;
        }
        return edges;
    }

    $scope.handleControlNodeDispatch = function (scene, itemId) {
        $scope.createControlNode(scene, itemId);
        let controlNode = $scope.editor.getSelection()[0];
        let type = $scope.getGatewayType(controlNode);
        let name = type + $scope.countGateway(type);
        controlNode.setProperty("oryx-name", name);
        $scope.handleReconnectScenes(scene, controlNode);
    }

    $scope.createControlNode = function (shape, itemId) {
        let reverse;
        if (itemId.startsWith("Start")) {
            reverse = false;
        } else if (itemId.startsWith("End")) {
            reverse = true;
        } else return;
        let positionOffset = $scope.getControlNodePosition(shape, reverse);
        $scope.createShape(itemId, positionOffset);
    }

    $scope.createShape = function (itemId, positionOffset) {
        let containedStencil = undefined;
        let stencilSets = $scope.editor.getStencilSets().values();
        for (let i = 0; i < stencilSets.length; i++) {
            let stencilSet = stencilSets[i];
            let nodes = stencilSet.nodes();
            for (let j = 0; j < nodes.length; j++) {
                if (nodes[j].idWithoutNs() === itemId) {
                    containedStencil = nodes[j];
                    break;
                }
            }
        }

        if (!containedStencil) return;

        let option = {
            type: containedStencil._jsonStencil.id,
            namespace: containedStencil._namespace,
            positionController: positionOffset,
            parent: $rootScope.editor.getCanvas(),
            containedStencil: containedStencil
        };

        let command = new KISBPM.CreateCommand(option, undefined, undefined, $rootScope.editor);
        $rootScope.editor.executeCommands([command]);
        let id = $scope.editor.getSelection()[0].id;
        let idProperty = {
            key: 'oryx-overrideid',
            value: id
        }
        $scope.updatePropertyInModel(idProperty);
    }

    $scope.handleReconnectScenes = function (scene, controlNode) {
        let starts = [];
        let ends = [];
        let reverse;
        if ($scope.isStartExclusiveGateway(controlNode) || $scope.isStartParallelGateway(controlNode)) {
            reverse = false;
        } else if ($scope.isEndExclusiveGateway(controlNode) || $scope.isEndParallelGateway(controlNode)) {
            reverse = true;
        } else return;
        if (!reverse) {
            starts.push({shape: scene, removedEdge: null});
            for (let i = 0; i < scene.outgoing.length; i++) {
                let end = {
                    shape: scene.outgoing[i].outgoing[0],
                    removedEdge: scene.outgoing[i]
                }
                ends.push(end);
            }
        } else {
            for (let i = 0; i < scene.incoming.length; i++) {
                let start = {
                    shape: scene.incoming[i].incoming[0],
                    removedEdge: scene.incoming[i]
                }
                starts.push(start);
            }
            ends.push({shape: scene, removedEdge: null});
        }
        $scope.reconnectScenes(starts, ends, controlNode);
    }

    $scope.getControlNodePosition = function (shape, reverse) {
        let shapeXY = shape.bounds.center();
        if (!reverse)
            return {x: shapeXY.x + 100, y: shapeXY.y}
        else return {x: shapeXY.x - 100, y: shapeXY.y}
    }

    $scope.reconnectScenes = function (starts, ends, controlNode) {
        // let setConditionsEdges = [];
        $scope.reconnect(starts, controlNode, false);
        $scope.reconnect(ends, controlNode, true);
        // if ($scope.isStartExclusiveGateway(controlNode)) {
        //     for (let i = 0; i < controlNode.outgoing.length; i++) {
        //         let edge = controlNode.outgoing[i];
        //         if (edge.properties['oryx-nodecondition'] === "") {
        //             let from = controlNode.incoming[0].incoming[0].properties['oryx-name'];
        //             let to = edge.outgoing[0].properties['oryx-name'];
        //             let label = from + " to " + to;
        //             setConditionsEdges.push({edge: edge, label: label});
        //         }
        //     }
        // }
        // if (setConditionsEdges.length > 0) {
        //     $scope.sceneLineNodeConditionInitial(setConditionsEdges);
        // }
    }

    $scope.reconnect = function (nodes, controlNode, reverse) {
        for (let i = 0; i < nodes.length; i++) {
            let shape = nodes[i].shape;
            let removedEdge = nodes[i].removedEdge;
            if ($scope.containsLine(shape, controlNode) === null) {
                let edge;
                if (!reverse) {
                    edge = $scope.connectResourceByMessageSceneFlow(shape, controlNode);
                } else {
                    edge = $scope.connectResourceByMessageSceneFlow(controlNode, shape);
                }
                if (removedEdge) {
                    let nodeCondition = removedEdge.properties['oryx-nodecondition']
                    if (nodeCondition) {
                        edge.setProperty("oryx-nodecondition", nodeCondition);
                    }
                    $scope.editor.deleteShape(removedEdge);
                }
            }
        }
    }

    $scope.containsLine = function (shapeIn, shapeOut) {
        for (let i = 0; i < shapeIn.outgoing.length; i++) {
            let edge = shapeIn.outgoing[i];
            let shape = edge.outgoing[0];
            if (shape.id === shapeOut.id) {
                return edge;
            }
        }
        return null;
    }

    $scope.isStartExclusiveGateway = function (shape) {
        return shape._stencil._jsonStencil.id === shape._stencil._namespace + StartExclusiveGateway;
    }

    $scope.isEndExclusiveGateway = function (shape) {
        return shape._stencil._jsonStencil.id === shape._stencil._namespace + EndExclusiveGateway;
    }

    $scope.isStartParallelGateway = function (shape) {
        return shape._stencil._jsonStencil.id === shape._stencil._namespace + StartParallelGateway;
    }

    $scope.isEndParallelGateway = function (shape) {
        return shape._stencil._jsonStencil.id === shape._stencil._namespace + EndParallelGateway;
    }

    $scope.getGatewayType = function (shape) {
        if ($scope.isStartExclusiveGateway(shape) || $scope.isEndExclusiveGateway(shape)) {
            return "ExclusiveGateway";
        } else {
            return "ParallelGateway";
        }
    }

    $scope.isStartGateway = function (shape) {
        return $scope.isStartParallelGateway(shape) ||
            $scope.isStartExclusiveGateway(shape)
    }

    $scope.isGateway = function (shape) {
        return $scope.isStartParallelGateway(shape) ||
            $scope.isStartExclusiveGateway(shape) ||
            $scope.isEndExclusiveGateway(shape) ||
            $scope.isEndParallelGateway(shape)
    }

    $scope.countGateway = function (type) {
        let count = 0;
        let shapes = [$scope.editor.getCanvas()][0];
        for (let i = 0; i < shapes.length; i++) {
            let shape = shapes[i];
            let companyId = shape.properties['oryx-gatewaycompany'];
            if (type === "ExclusiveGateway") {
                if ($scope.isStartExclusiveGateway(shape)) {
                    count++;
                } else if ($scope.isEndParallelGateway(shape)) {
                    if (companyId === undefined
                        || companyId === "") {
                        count++;
                    }
                }
            } else {
                if ($scope.isStartParallelGateway(shape)) {
                    count++;
                } else if ($scope.isEndParallelGateway(shape)) {
                    if (companyId === undefined
                        || companyId === "") {
                        count++;
                    }
                }
            }
        }
        return count;
    }


    //包含最多的节点
    $scope.findMaxStartControlNodesInPath = function (shape) {
        let controlNodes = [];
        if ($scope.isStartGateway(shape)) {
            controlNodes.push(shape);
        }
        let max = [];
        for (let i = 0; i < shape.incoming.length; i++) {
            let nodes = $scope.findMaxStartControlNodesInPath(shape.incoming[i]);
            if (max.length <= nodes.length) {
                max = nodes;
            }
        }
        controlNodes = controlNodes.concat(max);
        return controlNodes;
    }

    $scope.findTraceableScenes = function (shape) {
        let traceableScenes = [];
        if (shape.properties['oryx-type'] === "场景") {
            traceableScenes.push(shape.id);
        }
        for (let i = 0; i < shape.incoming.length; i++) {
            let nodes = $scope.findTraceableScenes(shape.incoming[i]);
            traceableScenes = traceableScenes.concat(nodes);
        }

        let result = [];
        for (let i = 0; i < traceableScenes.length; i++) {
            if (!result.includes(traceableScenes[i])) {
                result.push(traceableScenes[i]);
            }
        }
        return result;
    }

    $scope.findCommonStartControlNode = function (conditionsNodes1, conditionNodes2) {
        for (let i = 0; i < conditionsNodes1.length; i++) {
            let node1 = conditionsNodes1[i];
            for (let j = 0; j < conditionNodes2.length; j++) {
                let node2 = conditionNodes2[j];
                if (node1.id === node2.id) {
                    return {index1: i, index2: j}
                }
            }
        }
    }
}

