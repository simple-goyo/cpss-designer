'use strict';
angular.module('activitiModeler')
    .ParameterPoolClass = function ($rootScope, $scope) {

    /**
     * {
     *     sceneId:{
     *         actionId:[
     *             {name}
     *         ]
     *     }
     * }
     * */
    $scope.parameterPool = new Map();

    $scope.getParameters = function (sceneId, actionId) {
        let actionsInScene = $scope.parameterPool.get(sceneId);
        return actionsInScene.get(actionId);
    }

    $scope.deleteParametersInAction = function (sceneId, actionId) {
        let actionsInScene = $scope.parameterPool.get(sceneId);
        actionsInScene.delete(actionId);
        $scope.parameterPool.set(sceneId, actionsInScene)
    }

    $scope.deleteParametersInScene = function (sceneId) {
        $scope.parameterPool.delete(sceneId);
    }

    $scope.insertParameters = function (sceneId, actionId, parameters) {
        let actionsInScene = $scope.parameterPool.get(sceneId);
        if (actionsInScene === undefined) {
            actionsInScene = new Map();
        }
        let temp = [];
        for (let i = 0; i < parameters.length; i++) {
            temp.push({name: parameters[i]})
        }
        actionsInScene.set(actionId, temp);
        $scope.parameterPool.set(sceneId, actionsInScene);
    }

    $scope.getVisibleParameters = function (nowSceneId, traceableScenes, traceableActions) {
        let parameters = [];
        let actionsInScene = $scope.parameterPool.get(nowSceneId);
        if (actionsInScene !== undefined) {
            for (let i = 0; i < traceableActions.length; i++) {
                parameters = parameters.concat(actionsInScene.get(traceableActions[i]));
            }
        }
        if (traceableScenes !== undefined && traceableScenes !== "") {
            for (let i = 0; i < traceableScenes.length; i++) {
                actionsInScene = $scope.parameterPool.get(traceableScenes[i]);
                if (actionsInScene !== undefined) {
                    actionsInScene.forEach(function (value) {
                        parameters = parameters.concat(value);
                    });
                }
            }
        }
        return parameters;
    }

    $rootScope.initializeParameterPool = function () {
        $scope.parameterPool = new Map();
        let actionPattern = /(.*?)Action/;
        let eventPattern = /^(.*?)Event$/;
        if ($rootScope.scenes !== undefined && $rootScope.scenes.length > 0) {
            $rootScope.scenes.forEach((scene) => {
                if (scene.childShapes !== undefined && scene.childShapes.length > 0) {
                    scene.childShapes.forEach((shape) => {
                        if (shape.stencil.id !== "UndefinedAction" && actionPattern.test(shape.stencil.id)) {
                            $scope.insertParameters(scene.id, shape.properties['overrideid'], shape.properties['actionoutputstatus'])
                        } else if (shape.stencil.id !== "StartNoneEvent" && eventPattern.test(shape.stencil.id)) {
                            $scope.insertParameters(scene.id, shape.properties['overrideid'], shape.properties['actionoutputstatus'])
                        }
                    });
                }
            });
        }
    }
}