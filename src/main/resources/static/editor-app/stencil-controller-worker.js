'use strict';
angular.module('activitiModeler')
    .WorkerClass = function($rootScope, $scope){

    /**
     * 工人携带指定的资源
     * */
    $scope.workerGetResource = function (action, worker, resource) {
        if (action && worker && resource) {
            var contains = worker.properties['oryx-workercontains'];
            if (!contains)
                contains = {};
            var actionResource = contains[action.id];
            if (!actionResource)
                actionResource = [];
            var bounds = resource.bounds;
            var resourceBounds = {a: {x: bounds.a.x, y: bounds.a.y}, b: {x: bounds.b.x, y: bounds.b.y}};
            actionResource[actionResource.length] = {
                resourceId: resource.id,
                resourceBounds: resourceBounds,
                status: "toBeGot"
            };
            contains[action.id] = actionResource;
            worker.setProperty('oryx-workercontains', contains);
        }
    };
    /**
     * 工人移动时，其携带的资源一同移动
     * */
    $scope.workerResourceMove = function (lastAction, worker) {
        var workerContains = worker.properties['oryx-workercontains'];
        if (!workerContains)
            return;
        var lastActionId = lastAction.id;
        var workerResource = workerContains[lastActionId];
        if (!workerResource)
            return;
        var workerBounds = worker.bounds;
        var width = Math.abs(workerBounds.a.x - workerBounds.b.x);
        var offset = 0;
        var padding = 30;
        for (var i = 0; i < workerResource.length; i++) {
            var element = workerResource[i];
            var resource = $scope.getShapeById(element.resourceId);
            if (resource) {
                var position;
                if (element.status !== "toBeGot" && element.status !== "putDown") {

                    position = {
                        x: (workerBounds.a.x + workerBounds.b.x) / 2.0 + width / 2 + padding,
                        y: (workerBounds.a.y + workerBounds.b.y) / 2.0 + offset
                    };
                    offset += 30;
                } else {
                    var bounds = element.resourceBounds;
                    position = {
                        x: (bounds.a.x + bounds.b.x) / 2.0,
                        y: (bounds.a.y + bounds.b.y) / 2.0
                    };
                }
                resource.bounds.centerMoveTo(position);
                $scope.editor.getCanvas().update();
            }
        }
    };

    /**
     * 确定当前场景下，工人携带的物品
     */
    $scope.workerResourceCheck = function (lastAction, worker) {
        var workerContains = worker.properties['oryx-workercontains'];
        if (!workerContains)
            return;
        var lastActionId = lastAction.id;
        var workerResource = workerContains[lastActionId];
        var nowActionId = $scope.getHighlightedShapeId();
        if (!workerResource) {
            return;
        }
        var nowWorkResource = workerContains[nowActionId];
        var nowWorkResourceMap = {};
        if (nowWorkResource) {
            for (var j = 0; j < nowWorkResource.length; j++) {
                nowWorkResourceMap[nowWorkResource[j].resourceId] = nowWorkResource[j].status;
            }
        }
        var newNowWorkerResource = [];
        for (var i = 0; i < workerResource.length; i++) {
            var element = workerResource[i];
            if (!nowWorkResourceMap[element.resourceId]
                || nowWorkResourceMap[element.resourceId].indexOf("to") === -1) {
                if (element.status === "toBePutDown") {
                    nowWorkResourceMap[element.resourceId] = "putDown";
                } else if (element.status === "toBeGot") {
                    nowWorkResourceMap[element.resourceId] = "got";
                } else if (element.status === "got") {
                    nowWorkResourceMap[element.resourceId] = "got";
                } else if (element.status === "putDown") {
                    nowWorkResourceMap[element.resourceId] = "putDown";
                }
            }
        }
        for (var resourceId in nowWorkResourceMap) {
            var resource = $scope.getShapeById(resourceId);
            if (resource) {
                var bounds = resource.bounds;
                var resourceBounds = {a: {x: bounds.a.x, y: bounds.a.y}, b: {x: bounds.b.x, y: bounds.b.y}};
                newNowWorkerResource[newNowWorkerResource.length] = {
                    resourceId: resource.id,
                    resourceBounds: resourceBounds,
                    status: nowWorkResourceMap[resourceId]
                };
            }
        }


        workerContains[nowActionId] = newNowWorkerResource;
        worker.setProperty('oryx-workercontains', workerContains);
    };

    /**
     * 将工人位置还原为未发生移动之前的位置
     * */
    $scope.workerRestore = function (nowAction, lastSelectedAction) {
        if ($scope.containsWorkerLine(nowAction)) {
            var lastAction = $scope.getLastAction(nowAction);
            if ($scope.containsWorkerLine(lastAction)) {
                $scope.workerRestore(lastAction, lastSelectedAction);
            } else {
                var resourceConnect = nowAction.properties['oryx-resourceline'];
                for (var i = 0; i < resourceConnect.length; i++) {
                    var line = resourceConnect[i];
                    var from = $scope.getShapeById(line['from']);
                    if (from && from.properties['oryx-type'] && from.properties['oryx-type'] === "工人") {
                        var fromBounds = line['fromBounds'];
                        var position = {
                            x: (fromBounds.a.x + fromBounds.b.x) / 2.0,
                            y: (fromBounds.a.y + fromBounds.b.y) / 2.0
                        };
                        from.bounds.centerMoveTo(position);
                        $scope.editor.getCanvas().update();
                        $scope.resourceRestore(lastSelectedAction, from);
                    }
                }
            }
        } else {
            var nextAction = $scope.getNextAction(nowAction);
            if (nextAction)
                $scope.workerRestore(nextAction, lastSelectedAction);
        }
    };

    /**
     * 将工人所携带的资源自当前动作逐一往前回退
     * */
    $scope.resourceRestore = function (lastSelectedAction, worker) {
        if (!worker)
            return;
        var contains = worker.properties['oryx-workercontains'];
        if (!contains)
            return;
        if (!lastSelectedAction)
            return;
        var resources = contains[lastSelectedAction.id];
        if (resources) {
            for (var i = 0; i < resources.length; i++) {
                var resource = $scope.getShapeById(resources[i].resourceId);
                if (resource) {
                    var bounds = resources[i].resourceBounds;
                    var position = {
                        x: (bounds.a.x + bounds.b.x) / 2.0,
                        y: (bounds.a.y + bounds.b.y) / 2.0
                    };
                    resource.bounds.centerMoveTo(position);
                    $scope.editor.getCanvas().update();
                }
            }
        }
        $scope.resourceRestore($scope.getLastAction(lastSelectedAction), worker);
    };

    /**
     *工人放下指定资源
     */
    $scope.workerPutDownResource = function (action, worker, resourceId) {
        if (action && worker && resourceId) {
            var contains = worker.properties['oryx-workercontains'];
            if (!contains) {
                contains = {};
                contains[action.id] = [];
                worker.setProperty('oryx-workercontains', contains);
                return;
            }
            var actionResource = contains[action.id];
            if (!actionResource) {
                contains[action.id] = [];
                worker.setProperty('oryx-workercontains', contains);
                return;
            }
            for (var i = 0; i < actionResource.length; i++) {
                var id = actionResource[i].resourceId;
                if (id === resourceId) {
                    actionResource[i].status = "toBePutDown";
                }
            }
            contains[action.id] = actionResource;
            worker.setProperty('oryx-workercontains', contains);
        }
    };

    /**
     * 工人递交物品
     * */
    $scope.workerResourceEmpty = function (action, worker) {
        if (action && worker) {
            var contains = worker.properties['oryx-workercontains'];
            if (!contains) {
                contains = {};
                contains[action.id] = [];
                worker.setProperty('oryx-workercontains', contains);
                return;
            }
            var actionResource = contains[action.id];
            if (!actionResource) {
                contains[action.id] = [];
                worker.setProperty('oryx-workercontains', contains);
                return;
            }
            for (var i = 0; i < actionResource.length; i++) {
                if (actionResource[i].status === "got")
                    actionResource[i].status = "toBePutDown";
            }
            worker.setProperty('oryx-workercontains', contains);
        }
    };

    /**
     * 更新workerContains中对应的Action的Id
     * */

    $scope.workerContainsActionIdUpdate = function (oldActionId, newActionId) {
        var shapes = $scope.editor.getCanvas();
        for (var i = 0; i < shapes.nodes.length; i++) {
            if (shapes.nodes[i].properties["oryx-workercontains"]) {
                var worker = shapes.nodes[i];
                var contains = worker.properties['oryx-workercontains'];
                var newContains = {};
                for (var actionId in contains) {
                    if (actionId !== oldActionId) {
                        newContains[actionId] = contains[actionId];
                    } else {
                        newContains[newActionId] = contains[oldActionId];
                    }
                }
                worker.setProperty('oryx-workercontains', newContains);
            }
        }
    };
};
