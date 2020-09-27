'use strict';
angular.module('activitiModeler')
    .ActionSeqClass = function ($rootScope, $scope, $timeout) {

    const PhysicalAction = "PhysicalAction";
    const CyberAction = "CyberAction";
    const SocialAction = "SocialAction";

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

    $scope.justStartNoneEvent = function () {
        let shapes = [$scope.editor.getCanvas()][0].children;
        for (let i = 0; i < shapes.length; i++) {
            let shape = shapes[i];
            if (shape._stencil._jsonStencil.id === shape._stencil._namespace + "StartNoneEvent") {
                let nextAction = $scope.getNextAction(shape);
                if (nextAction) {
                    return null;
                } else {
                    return shape;
                }
            }
        }
        return null;
    }

    $scope.getAllAction = function () {
        let actions = [];
        let shapes = [$scope.editor.getCanvas()][0].children;
        for (let i = 0; i < shapes.length; i++) {
            let shape = shapes[i];
            if (shape._stencil._jsonStencil.id === shape._stencil._namespace + "StartNoneEvent") {
                while (shape) {
                    actions.push(shape);
                    shape = $scope.getNextAction(shape);
                }
            }
        }
        return actions;
    }

    // 获取模板，getStentil名称已使用，改为fetchStentil
    $scope.fetchStentil = function (stencilId) {
        let stencil;
        let stencilSets = $scope.editor.getStencilSets().values();
        for (let i = 0; i < stencilSets.length; i++) {
            let stencilSet = stencilSets[i];
            let nodes = stencilSet.nodes();
            for (let j = 0; j < nodes.length; j++) {
                if (nodes[j].idWithoutNs() === stencilId) {
                    stencil = nodes[j];
                    break;
                }
            }
        }

        return stencil;
    }

    $scope._createAction = function ($rootScope, $scope, ItemId) {
        if (ItemId === "UndefinedAction") {
            return $scope.__createNormalAction($rootScope, $scope);
        } else if (ItemId === "StartNoneEvent") {
            $scope.__createStartNode($rootScope, $scope);
            $scope.__createEntryNode($rootScope, $scope);
            $scope.__createExitNode($rootScope, $scope);
        }
    };

    $scope.__createEntryNode = function ($rootScope, $scope) {
        let itemId = "EntryPoint";
        let positionOffset = {x: 44, y: 200};//初始节点的位置

        positionOffset.y = jQuery('#canvasSection').height() * 0.34;

        let namespace = ORYX.CONFIG.NAMESPACE_STENCILSET;
        if ($scope.editor === undefined) return;
        let containedStencil = $scope.fetchStentil(itemId);
        if (!containedStencil) return;

        var option = {
            type: namespace + itemId,
            namespace: namespace,

            positionController: positionOffset,
            containedStencil: containedStencil
        };
        var command = new KISBPM.CreateCommand(option, undefined, undefined, $scope.editor);
        $scope.editor.executeCommands([command]);
        // $scope.editor.getSelection()[0].properties['oryx-overrideid'] = $scope.editor.getSelection()[0].id;//为创建的初始化节点提供id
        let id = $scope.editor.getSelection()[0].id;
        let idProperty = {
            key: 'oryx-overrideid',
            value: id
        }
        $scope.updatePropertyInModel(idProperty);
        idProperty = {
            key: 'oryx-type',
            value: '入口节点'
        }
        $scope.updatePropertyInModel(idProperty);
    };

    $scope.__createExitNode = function ($rootScope, $scope) {
        let itemId = "ExitPoint";
        let positionOffset = {x: 1150, y: 300};//初始节点的位置

        positionOffset.y = jQuery('#canvasSection').height() * 0.34;

        let namespace = ORYX.CONFIG.NAMESPACE_STENCILSET;
        if ($scope.editor === undefined) return;
        let containedStencil = $scope.fetchStentil(itemId);
        if (!containedStencil) return;

        var option = {
            type: namespace + itemId,
            namespace: namespace,

            positionController: positionOffset,
            containedStencil: containedStencil
        };
        var command = new KISBPM.CreateCommand(option, undefined, undefined, $scope.editor);
        $scope.editor.executeCommands([command]);
        // $scope.editor.getSelection()[0].properties['oryx-overrideid'] = $scope.editor.getSelection()[0].id;//为创建的初始化节点提供id
        let id = $scope.editor.getSelection()[0].id;
        let idProperty = {
            key: 'oryx-overrideid',
            value: id
        }
        $scope.updatePropertyInModel(idProperty);
        idProperty = {
            key: 'oryx-type',
            value: '出口节点'
        }
        $scope.updatePropertyInModel(idProperty);
    };

    $scope.__createStartNode = function ($rootScope, $scope) {
        let itemId = "StartNoneEvent";
        let namespace = ORYX.CONFIG.NAMESPACE_STENCILSET;

        if ($scope.editor === undefined) return;

        let containedStencil = $scope.fetchStentil(itemId);
        if (!containedStencil) return;

        let positionOffset = {x: 80, y: 600};//初始节点的位置

        positionOffset.y = jQuery('#canvasSection').height() * 0.88;

        var option = {
            type: namespace + itemId,
            namespace: namespace,

            positionController: positionOffset,
            containedStencil: containedStencil
        };
        var command = new KISBPM.CreateCommand(option, undefined, undefined, $scope.editor);
        $scope.editor.executeCommands([command]);
        // $scope.editor.getSelection()[0].properties['oryx-overrideid'] = $scope.editor.getSelection()[0].id;//为创建的初始化节点提供id
        let id = $scope.editor.getSelection()[0].id;
        let idProperty = {
            key: 'oryx-overrideid',
            value: id
        }
        $scope.updatePropertyInModel(idProperty);
    };

    $scope.__createNormalAction = function ($rootScope, $scope) {
        let itemId = "UndefinedAction";

        let shape = $scope.getHighlightedShape();
        let startNoneEvent = $scope.justStartNoneEvent();
        if (startNoneEvent !== null) {
            shape = startNoneEvent;
        }
        if (shape) {
            $rootScope.currentSelectedShape = shape;

            let containedStencil = $scope.fetchStentil(itemId);

            if (!containedStencil) return;

            var positionOffset = {type: 'offsetY', x: 0, y: 0};
            var node = $rootScope.currentSelectedShape;
            if (node.properties["oryx-activityelement"] || node.properties["oryx-startevent"] !== undefined) {
                if (positionOffset.y < node.bounds.center().y) {
                    positionOffset.y = node.bounds.center().y;
                }
            }

            containedStencil._jsonStencil.defaultAlign = "east";//设置动作生成方向为右
            var option = {
                type: $scope.currentSelectedShape.getStencil().namespace() + itemId,
                namespace: $scope.currentSelectedShape.getStencil().namespace(),
                positionController: positionOffset,
                connectedShape: $rootScope.currentSelectedShape,
                parent: $rootScope.currentSelectedShape.parent,
                containedStencil: containedStencil
            };
            // option['connectedShape'] = $rootScope.currentSelectedShape;
            // option['parent'] = $rootScope.currentSelectedShape.parent;
            // option['containedStencil'] = containedStencil;

            var args = {sourceShape: $rootScope.currentSelectedShape, targetStencil: containedStencil};
            var targetStencil = $scope.editor.getRules().connectMorph(args);
            if (!targetStencil) {
                return;
            }// Check if there can be a target shape
            option['connectingType'] = targetStencil.id();

            var command = new KISBPM.CreateCommand(option, undefined, undefined, $rootScope.editor);
            $scope.editor.executeCommands([command]);

            // // 取消之前的高亮
            // var oldShapeId = $scope.getHighlightedShapeId();
            // if (oldShapeId !== undefined) {
            //     jQuery('#' + oldShapeId + 'bg_frame').attr({"fill": "#f9f9f9"}); //取消高亮显示
            // }

            // var lastSelectedAction = $scope.getHighlightedShape();
            // if (lastSelectedAction && lastSelectedAction.id !== undefined) {
            //     jQuery('#' + lastSelectedAction.id + 'bg_frame').attr({"fill": "#f9f9f9"}); //取消高亮显示
            // }
            //
            // // 高亮
            // var newShapeId = $scope.editor.getSelection()[0].id;
            // $scope.setHighlightedShape(newShapeId);
            // jQuery('#' + newShapeId + 'bg_frame').attr({"fill": "#04FF8E"}); //高亮显示

            // $scope.toDoAboutResourceLineAfterChangingAction(lastSelectedAction);


            // $scope.editor.getSelection()[0].properties['oryx-overrideid'] = $scope.editor.getSelection()[0].id;//为创建的未定义的动作提供id
            let id = $scope.editor.getSelection()[0].id;
            let idProperty = {
                key: 'oryx-overrideid',
                value: id
            }
            $scope.updatePropertyInModel(idProperty);
        }
    };
    $scope.getTraceableActions = function (action) {
        let actions = [];
        if ($scope.isAction(action)) {
            actions.push(action.id);
        }
        for (let i = 0; i < action.incoming.length; i++) {
            let nodes = $scope.getTraceableActions(action.incoming[i]);
            actions = actions.concat(nodes);
        }
        let result = [];
        for (let i = 0; i < actions.length; i++) {
            if (!result.includes(actions[i])) {
                result.push(actions[i]);
            }
        }
        return result;
    }

    $scope.isAction = function (shape) {
        let id = shape._stencil._jsonStencil.id;
        let namespace = shape._stencil._namespace;
        return id === namespace + PhysicalAction || id === namespace + CyberAction || id === namespace + SocialAction;
    }
}
;
