'use strict';
angular.module('activitiModeler')
    .ConnectClass = function ($rootScope, $scope) {
    /**
     * 监听资源连线成功事件
     * options: {
     *      type: ORYX.CONFIG.EVENT_DRAGDOCKER_DOCKED
     *      docker: docker
     *      parent: docker.parent  线
     *      target: lastUIObj 被连上的资源
     * }
     * */
    $scope.editor.registerOnEvent(ORYX.CONFIG.EVENT_DRAGDOCKER_DOCKED, function (options) {
        var edge = options['parent'];
        if (!edge)
            return;

        var nameSpace = edge.getStencil().namespace();
        if (edge.getStencil()._jsonStencil["id"] === nameSpace + "InteractionFlow") {
            $scope.HandleInteractionFlow(edge);
            return;
        }
        if (edge.getStencil()._jsonStencil["id"] !== nameSpace + "MessageFlow"
            && edge.getStencil()._jsonStencil["id"] !== nameSpace + "MessageSceneFlow")
            return;

        var from = edge.incoming[0];
        var to = edge.outgoing[0];
        if (from && to) {
            if ($scope.isGateway(from) || $scope.isGateway(to)) {
                return;
            }
            if (to.properties['oryx-type'] === "出口节点" || to.properties['oryx-type'] === "Exit") {
                return;
            }
            if (from.properties['oryx-type'] === "房间" || from.properties['oryx-type'] === "Room") {
                alert("Room cannot connect to other entity!")
                $scope.deleteConnectedLinebyEdge(edge);
                return;
            }
            if ((from.properties['oryx-type'] === "场景" && to.properties['oryx-type'] === "场景") ||
                (from.properties['oryx-type'] === "scene" && to.properties['oryx-type'] === "scene")
            ) {
                $scope.connectScene(from, edge, to);
                return;
            }
            if (from.properties['oryx-type'] === "工人" || from.properties['oryx-type'] === "Worker") {
                $scope.editor.setSelection(from);
            } else
                $scope.editor.setSelection(to);
            $scope.editor.getCanvas().update();
            $scope.latestLine = edge;
            $scope.latestLineParent = edge.parent;
            $scope.latestfromto['from'] = from;
            $scope.latestfromto['to'] = to;

            let actions = [];
            let shape = $scope.getNextAction($scope.getHighlightedShape());
            while (shape != null) {
                $scope.editor.deleteShape(shape.incoming[0]);
                let position = shape.bounds.center();
                position.x += 145;
                shape.bounds.centerMoveTo(position);
                actions.push(shape);
                shape = $scope.getNextAction(shape);
            }

            $scope._createAction($rootScope, $scope, "UndefinedAction");

            // 取消之前的高亮
            var lastSelectedAction = $scope.getHighlightedShape();
            if (lastSelectedAction && lastSelectedAction.id !== undefined) {
                jQuery('#' + lastSelectedAction.id + 'bg_frame').attr({"fill": "#f9f9f9"}); //取消高亮显示
            }

            // 高亮
            var newShapeId = $scope.editor.getSelection()[0].id;
            $scope.setHighlightedShape(newShapeId);
            jQuery('#' + newShapeId + 'bg_frame').attr({"fill": "#04FF8E"}); //高亮显示

            let count = 0;
            let lastAction = $scope.getHighlightedShape();
            while (count < actions.length) {
                let nowAction = actions[count];
                $scope.connectWithSequenceFlow(lastAction, nowAction);
                lastAction = nowAction;
                count++;
            }
            $scope.editor.getCanvas().update();
            let bounds = from.bounds;
            let fromBounds = {a: {x: bounds.a.x, y: bounds.a.y}, b: {x: bounds.b.x, y: bounds.b.y}}
            let resourceConnect = [{
                from: from.id,
                fromBounds: fromBounds,
                to: to.id,
                toBounds: to.bounds
            }];

            let action = $scope.getHighlightedShape();
            if (action) {
                action.setProperty("oryx-resourceline", resourceConnect);
            }

            $scope.makeFinishingTouchesOfChangingAction(lastSelectedAction);
            // 设置服务前，将连线的资源输入进去
            // 目前的输入默认是连线连进去的资源
            $scope.setService();
        }

        //
    });

    /**
     * 该方法是用于创建一个在选中的资源下方的messageFlow
     * 具体实现方式为：利用command创建一个与选中资源相同的临时资源，然后将选中资源与其连线，然后删除临时资源
     * */
    $scope.createConnectLine = function () {
        // var HighlightedShape = $scope.getHighlightedShape();
        // if (HighlightedShape === undefined) return;

        var connectedShape = $scope.editor.getSelection()[0];

        var stencil = connectedShape.getStencil();
        stencil._jsonStencil.defaultAlign = "south";//设置messageFlow在下方生成
        let lineId = "MessageFlow";
        if (stencil._jsonStencil.id === stencil._namespace + "scene") {
            lineId = "MessageSceneFlow";
        }
        var option = {
            type: stencil._jsonStencil["id"],
            namespace: stencil.namespace(),
            connectedShape: connectedShape,
            parent: connectedShape.parent,
            containedStencil: stencil,
            connectingType: stencil.namespace() + lineId
        };
        var command = new KISBPM.CreateCommand(option, undefined, undefined, $scope.editor);
        $scope.editor.executeCommands(command);
        let edge = $scope.editor.getSelection()[0].incoming[0];
        edge.setProperty('oryx-overrideid', edge.id);
        KISBPM.TOOLBAR.ACTIONS.deleteItem({'$scope': $scope});
        $scope.editor.setSelection(connectedShape);
        $scope.editor.getCanvas().update();
    };

    /*
    * 创建InteractionFlow
    * */
    $scope.createInteractionLine = function (selectedShape) {
        let connectedShape = selectedShape;
        if (!connectedShape) {
            connectedShape = $scope.editor.getSelection()[0];
        }
        if (!$scope.isWorker(connectedShape)) {
            return;
        }
        let stencil = connectedShape.getStencil();
        stencil._jsonStencil.defaultAlign = "south";//设置messageFlow在下方生成
        let lineId = "InteractionFlow";
        let option = {
            type: stencil._jsonStencil["id"],
            namespace: stencil.namespace(),
            connectedShape: connectedShape,
            parent: connectedShape.parent,
            containedStencil: stencil,
            connectingType: stencil.namespace() + lineId
        };
        let command = new KISBPM.CreateCommand(option, undefined, undefined, $scope.editor);
        $scope.editor.executeCommands(command);
        let edge = $scope.editor.getSelection()[0].incoming[0];
        edge.setProperty('oryx-overrideid', edge.id);
        KISBPM.TOOLBAR.ACTIONS.deleteItem({'$scope': $scope});
        $scope.editor.setSelection(connectedShape);
        $scope.editor.getCanvas().update();
    };

    /*
    * 处理InteractionFlow
    * */
    $scope.HandleInteractionFlow = function (edge) {
        let from = edge.incoming[0];
        let to = edge.outgoing[0];
        if (from && to) {
            // to————worker要去的地方，worker要和谁进行交互
            // from——要关联的worker

            // 往workertargetpackage中保存to的内容
            // let worker = from;
            // worker.setProperty("oryx-workertarget", to);

            let action = $scope.getHighlightedShape();
            if (action) {

                let bounds = from.bounds;
                let fromBounds = {a: {x: bounds.a.x, y: bounds.a.y}, b: {x: bounds.b.x, y: bounds.b.y}}
                let newInteractionFlowConnect = [{
                    from: from.id,
                    fromBounds: fromBounds,
                    to: to.id,
                    toBounds: to.bounds
                }];

                let interactionFlowConnects = action.properties['oryx-interactionline'];
                if (interactionFlowConnects) {
                    interactionFlowConnects[interactionFlowConnects.length] = newInteractionFlowConnect;
                } else {
                    action.setProperty("oryx-interactionline", newInteractionFlowConnect)
                }

                action.setProperty("oryx-workertarget", to);
            }
            $scope.editor.getCanvas().update();
            $scope.editor.updateSelection();

        }
        console.log(edge);
    };

    /**
     * 获取当前动作的被Message连线的资源
     * **/
    $scope.getResourceConnectedByMessageFlow = function () {
        let messageFlowConnectLines = $scope.getMessageFlowConnectLines();
        var MessageFlowConnect = [];
        for (var i = 0; i < messageFlowConnectLines.length; i++) {
            let edge = messageFlowConnectLines[i];
            if (edge) {
                var from = edge.incoming[0] ? edge.incoming[0].id : null;
                var to = edge.outgoing[0] ? edge.outgoing[0].id : null;
                var fromBounds = null;
                var toBounds = null;
                var bounds = null;
                if (from != null) {
                    bounds = $scope.getShapeById(from).bounds;
                    fromBounds = {a: {x: bounds.a.x, y: bounds.a.y}, b: {x: bounds.b.x, y: bounds.b.y}};
                }
                if (to != null) {
                    toBounds = $scope.getShapeById(to).bounds;
                }
                MessageFlowConnect[MessageFlowConnect.length] = {
                    from: from,
                    fromBounds: fromBounds,
                    to: to,
                    toBounds: toBounds
                };

            }
        }
        return MessageFlowConnect;
    };

    /**
     * 在Action切换后，更新对应的资源连线————删除上一个Action的资源连线，创建当前Action的资源连线
     * */
    $scope.makeFinishingTouchesOfChangingAction = function (lastSelectedAction) {
        var action = $scope.getHighlightedShape();
        if (action === lastSelectedAction || !lastSelectedAction)
            return;
        $scope.deleteConnectedLines();
        var messageFlowConnects = action.properties['oryx-resourceline'];

        if (messageFlowConnects) {
            $scope.createMessageFlowConnectedLines(messageFlowConnects);
        }

        let interactionFlowConnects = action.properties['oryx-interactionline'];

        if (interactionFlowConnects) {
            $scope.createInteractionFlowConnectedLines(interactionFlowConnects);
        }

        $scope.workerRestore(action, lastSelectedAction);
        var lastAction = $scope.getLastAction(action);
        if (lastAction)
            $scope.workerMove(lastAction);
    };


    /**
     * 判断动作中是否包含工人的连线
     * */
    $scope.containsWorkerLine = function (action) {
        if (!action)
            return false;
        var resourceConnect = action.properties['oryx-resourceline'];
        if (!resourceConnect)
            return false;
        for (var i = 0; i < resourceConnect.length; i++) {
            var line = resourceConnect[i];
            var from = $scope.getShapeById(line['from']);
            if (from && from.properties['oryx-type'] && (from.properties['oryx-type'] === "工人" || from.properties['oryx-type'] === "Worker")) {
                return true;
            }
        }
        return false;
    };

    /**
     * 将工人移动到连线指向的资源的右侧
     * */
    $scope.workerMove = function (lastAction) {
        var resourceConnect = lastAction.properties['oryx-resourceline'];
        if (!resourceConnect)
            return;
        for (var i = 0; i < resourceConnect.length; i++) {
            var line = resourceConnect[i];
            var from = $scope.getShapeById(line['from']);
            var to = $scope.getShapeById(line['to']);
            if (from != null && to != null) {
                var toBounds = line['toBounds'];
                if (from.properties['oryx-type'] && (from.properties['oryx-type'] === "工人" || from.properties['oryx-type'] === "Worker")) {
                    var width = Math.abs(toBounds.a.x - toBounds.b.x);
                    var padding = 20;
                    // var height = Math.abs(toBounds.a.y - toBounds.b.y);
                    var position = {
                        x: (toBounds.a.x + toBounds.b.x) / 2.0 + width / 2 + padding,
                        y: (toBounds.a.y + toBounds.b.y) / 2.0
                    };
                    from.bounds.centerMoveTo(position);
                    $scope.editor.getCanvas().update();
                    $scope.workerResourceMove(lastAction, from);
                    $scope.workerResourceCheck(lastAction, from);
                }
            }
        }
    };


    /**
     * 用于切换action时生成对应Action的资源连线
     * */
    $scope.createMessageFlowConnectedLines = function (messageFlowConnects) {
        for (var i = 0; i < messageFlowConnects.length; i++) {
            var line = messageFlowConnects[i];
            var from = $scope.getShapeById(line['from']);
            var to = $scope.getShapeById(line['to']);
            $scope.connectResourceByMessageFlow(from, to);
        }
    };

    $scope.createInteractionFlowConnectedLines = function (interactionFlowConnects) {
        for (var i = 0; i < interactionFlowConnects.length; i++) {
            var line = interactionFlowConnects[i];
            var from = $scope.getShapeById(line['from']);
            var to = $scope.getShapeById(line['to']);
            $scope.connectResourceWithInteractionFlow(from, to);
        }
    };

    $scope.deleteConnectedLinebyEdge = function (edge) {
        $scope.editor.deleteShape(edge);
    }

    /**
     * 用于切换action时删除上一个Action的资源连线
     * */
    $scope.deleteConnectedLines = function () {
        let shapes = [$scope.editor.getCanvas()][0].children;
        for (let i = 0; i < shapes.length; i++) {
            let messageFlow = shapes[i]._stencil._namespace + "MessageFlow";
            let interactionFlow = shapes[i]._stencil._namespace + "InteractionFlow";
            if (messageFlow === shapes[i]._stencil._jsonStencil.id || interactionFlow === shapes[i]._stencil._jsonStencil.id) {
                $scope.editor.deleteShape(shapes[i]);
            }
        }
    };

    /**
     * 获取当前action中的资源连线
     * */
    $scope.getMessageFlowConnectLines = function () {
        let connectedLines = [];
        let shapes = [$scope.editor.getCanvas()][0].children;
        for (let i = 0; i < shapes.length; i++) {
            let flag = shapes[i]._stencil._namespace + "MessageFlow";
            if (flag === shapes[i]._stencil._jsonStencil.id) {
                connectedLines[connectedLines.length] = shapes[i];
            }
        }
        return connectedLines;
    };

    /**
     * 根据给定的from和to创建连线
     * */
    $scope.connectResourceByMessageFlow = function (from, to) {
        $scope.connectResourceWithSpecificLine(from, to, "MessageFlow")
    };

    $scope.connectResourceByMessageSceneFlow = function (from, to) {
        return $scope.connectResourceWithSpecificLine(from, to, "MessageSceneFlow")
    };

    $scope.connectResourceWithInteractionFlow = function (from, to) {
        return $scope.connectResourceWithSpecificLine(from, to, "InteractionFlow")
    }

    $scope.connectResourceWithSpecificLine = function (from, to, lineId) {
        if (!from || !to)
            return;
        var sset = ORYX.Core.StencilSet.stencilSet(from.getStencil().namespace());

        var edge = new ORYX.Core.Edge({'eventHandlerCallback': $scope.editor.handleEvents.bind($scope.editor)},
            sset.stencil(from.getStencil().namespace() + lineId));
        edge.dockers.first().setDockedShape(from);

        var magnet = from.getDefaultMagnet();
        var cPoint = magnet ? magnet.bounds.center() : from.bounds.midPoint();
        edge.dockers.first().setReferencePoint(cPoint);
        edge.dockers.last().setDockedShape(to);
        edge.setProperty('oryx-overrideid', edge.id);
        magnet = to.getDefaultMagnet();
        var ePoint = magnet ? magnet.bounds.center() : to.bounds.midPoint();
        edge.dockers.last().setReferencePoint(ePoint);
        $scope.editor._canvas.add(edge);
        $scope.editor.getCanvas().update();
        return edge;
    }

    $scope.connectWithSequenceFlow = function (from, to) {
        $scope.connectResourceWithSpecificLine(from, to, "SequenceFlow");
    };

    $scope.isMessageFlow = function (shape) {
        return shape._stencil._namespace + "MessageFlow" === shape._stencil._jsonStencil.id;
    }

    $scope.isInteractionFlow = function (shape) {
        return shape._stencil._namespace + "InteractionFlow" === shape._stencil._jsonStencil.id;
    }

    $scope.deleteMessageFlow = function (messageFlow) {
        if (messageFlow.outgoing !== undefined && messageFlow.outgoing !== null
            && messageFlow.outgoing.length > 0
            && messageFlow.outgoing[0] !== undefined && messageFlow.outgoing[0] !== null) {
            let action = $scope.getHighlightedShape();

            $scope.editor.setSelection(action);
            $scope.editor.updateSelection();
            $scope.deleteShape();
        }
    }

    $scope.deleteInteractionFlow = function (interactionFlow) {
        if (interactionFlow.outgoing !== undefined && interactionFlow.outgoing !== null
            && interactionFlow.outgoing.length > 0
            && interactionFlow.outgoing[0] !== undefined && interactionFlow.outgoing[0] !== null) {
            let action = $scope.getHighlightedShape();
            if (action) {
                let interactionFlowConnects = action.properties['oryx-interactionline'];
                for (let i = 0; i < interactionFlowConnects.length; i++) {
                    let line = interactionFlowConnects[i];
                    let fromId = line['from'];
                    let toId = line['to'];
                    if (fromId === interactionFlow.incoming[0].id && toId === interactionFlow.outgoing[0].id) {
                        interactionFlowConnects.splice(i, 1);
                        break;
                    }
                }
                action.setProperty("oryx-interactionline", interactionFlowConnects);
            }
        }
    }

    $scope.isMessageSceneFlow = function (shape) {
        return shape._stencil._namespace + "MessageSceneFlow" === shape._stencil._jsonStencil.id;
    }

};
