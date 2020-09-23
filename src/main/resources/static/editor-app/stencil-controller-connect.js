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
        if (edge.getStencil()._jsonStencil["id"] !== nameSpace + "MessageFlow"
            && edge.getStencil()._jsonStencil["id"] !== nameSpace + "MessageSceneFlow")
            return;

        var from = edge.incoming[0];
        var to = edge.outgoing[0];
        if (from && to) {
            if (from.properties['oryx-type'] === "场景" && to.properties['oryx-type'] === "场景") {
                $scope.connectScene(from, edge, to);
                return
            }
            if (from.properties['oryx-type'] === "工人") {
                $scope.editor.setSelection(from);
            } else
                $scope.editor.setSelection(to);
            $scope.editor.getCanvas().update();
            $scope.latestLine = edge;
            $scope.latestfromto['from'] = from;
            $scope.latestfromto['to'] = to;

            let actions = [];
            var shape = $scope.getNextAction($scope.getHighlightedShape());
            while (shape != null) {
                $scope.editor.deleteShape(shape.incoming[0]);
                var position = shape.bounds.center();
                position.x += 145;
                shape.bounds.centerMoveTo(position);
                actions.push(shape);
                shape = $scope.getNextAction(shape);
            }

            _createAction($rootScope, $scope, "UndefinedAction");

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

            var action = $scope.getHighlightedShape();
            if (action) {
                action.setProperty("oryx-resourceline", resourceConnect);
            }

            $scope.toDoAboutResourceLineAfterChangingAction(lastSelectedAction);
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
        KISBPM.TOOLBAR.ACTIONS.deleteItem({'$scope': $scope});
        $scope.editor.setSelection(connectedShape);
        $scope.editor.getCanvas().update();
    };

    /**
     * 获取当前动作的被连线的资源
     * **/
    $scope.getResourceConnect = function () {
        let connectedLines = $scope.getConnectedLines();
        var resourceConnect = [];
        for (var i = 0; i < connectedLines.length; i++) {
            let edge = connectedLines[i];
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
                resourceConnect[resourceConnect.length] = {
                    from: from,
                    fromBounds: fromBounds,
                    to: to,
                    toBounds: toBounds
                };

            }
        }
        return resourceConnect;
    };

    /**
     * 在Action切换后，更新对应的资源连线————删除上一个Action的资源连线，创建当前Action的资源连线
     * */
    $scope.toDoAboutResourceLineAfterChangingAction = function (lastSelectedAction) {
        var action = $scope.getHighlightedShape();
        if (action === lastSelectedAction || !lastSelectedAction)
            return;
        $scope.deleteConnectedLines();
        var resourceConnect = action.properties['oryx-resourceline'];
        if (resourceConnect) {
            $scope.createConnectedLines(resourceConnect);
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
            if (from && from.properties['oryx-type'] && from.properties['oryx-type'] === "工人") {
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
                if (from.properties['oryx-type'] && from.properties['oryx-type'] === "工人") {
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
     * 获取指定动作的上一个动作，只有一个动作指向该动作的时候保证正确性，对于多个动作指向该动作，取第一个动作指向该动作的动作
     * */
    $scope.getLastAction = function (nowAction) {
        if (!nowAction)
            return;
        var edge = nowAction.incoming[0];
        if (edge) {
            return edge.incoming[0];
        }
        return null;
    };
    /**
     * 获取指定动作的下一个动作，只有该动作指向一个动作的时候保证正确性，对于多个动作指向该动作，取该动作指向的第一个的动作
     * */
    $scope.getNextAction = function (nowAction) {
        if (!nowAction)
            return;
        var edge = nowAction.outgoing[0];
        if (edge) {
            return edge.outgoing[0];
        }
        return null;
    };

    /**
     * 用于切换action时生成对应Action的资源连线
     * */
    $scope.createConnectedLines = function (resourceConnect) {
        for (var i = 0; i < resourceConnect.length; i++) {
            var line = resourceConnect[i];
            var from = $scope.getShapeById(line['from']);
            var to = $scope.getShapeById(line['to']);
            $scope.connectResourceByMessageFlow(from, to);
        }
    };

    /**
     * 用于切换action时删除上一个Action的资源连线
     * */
    $scope.deleteConnectedLines = function () {
        let shapes = [$scope.editor.getCanvas()][0].children;
        for (let i = 0; i < shapes.length; i++) {
            let flag = shapes[i]._stencil._namespace + "MessageFlow";
            if (flag === shapes[i]._stencil._jsonStencil.id) {
                $scope.editor.deleteShape(shapes[i]);
            }
        }
    };

    /**
     * 获取当前action中的资源连线
     * */
    $scope.getConnectedLines = function () {
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

};
