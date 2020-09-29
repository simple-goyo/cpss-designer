'use strict';
angular.module('activitiModeler')
    .ModalClass = function ($rootScope, $scope, $modal) {
    $scope.setService = function () {
        var opts = {
            template: 'editor-app/configuration/properties/services-popup_new.html?version=' + Date.now(),
            scope: $scope
        };
        $modal(opts);
    };

    $scope.setEvent = function () {
        var opts = {
            template: 'editor-app/configuration/properties/events-popup.html?version=' + Date.now(),
            scope: $scope
        };
        $modal(opts);
    };

    $scope.selectControlNodeType = function (from,edge) {
        $scope.sceneFrom = from;
        $scope.sceneEdge = edge;
        var opts = {
            template: 'editor-app/popups/select-control-node-type.html?version=' + Date.now(),
            scope: $scope,
        };

        $modal(opts);
    };

    $scope.sceneLineNodeConditionInitial = function (setConditionsEdges) {
        $scope.setConditionsEdges = setConditionsEdges;
        var opts = {
            template: 'editor-app/popups/scene-line-node-condition-initial.html?version=' + Date.now(),
            scope: $scope,
        };

        $modal(opts);
    };

    $scope.popupThingGetOrLeave = function () {
        var opts = {
            template: "editor-app/configuration/properties/thing-get-or-leave-popup.html",
            scope: $scope
        };
        $modal(opts);
    }

    $scope.setShapeName= function () {
        var opts = {
            template:  'editor-app/configuration/properties/propertyInitPopup.html?version=' + Date.now(),
            scope: $scope
        };
        $modal(opts);
    };
}