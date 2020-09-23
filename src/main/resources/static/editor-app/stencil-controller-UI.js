'use strict';
angular.module('activitiModeler')
    .UIClass = function($rootScope, $scope,$timeout) {
    // Property window toggle state
    $scope.propertyWindowState = {'collapsed': false};

    // scene show toggle state
    $scope.sceneShowState = {'show': false};

    // entity info show toggle state
    $scope.entityInfoShowState = {'show': false};

    // Add reference to global header-config
    $scope.headerConfig = KISBPM.HEADER_CONFIG;

    $scope.propertyWindowState.toggle = function () {
        $scope.propertyWindowState.collapsed = !$scope.propertyWindowState.collapsed;
        $timeout(function () {
            jQuery(window).trigger('resize');
        });
    };

    $scope.sceneShowState.toggle = function () {
        $scope.sceneShowState.show = !$scope.sceneShowState.show;
        $scope.canvasShowChange();
        $timeout(function () {
            jQuery(window).trigger('resize');
        });
    }

    $scope.entityInfoShowState.toggle = function () {
        $scope.entityInfoShowState.show = !$scope.entityInfoShowState.show;
        $scope.canvasShowChange();
        $timeout(function () {
            jQuery(window).trigger('resize');
        });
    }

    $scope.canvasShowChange = function () {
        // var temp=this.editor.getSelection();
        // this.editor.setSelection(null);
        let canvasDiv = jQuery("#canvasHelpWrapper");

        canvasDiv.removeClass("col-xs-7");
        canvasDiv.removeClass("col-xs-9");
        canvasDiv.removeClass("col-xs-10");
        canvasDiv.removeClass("col-xs-12");

        if ($scope.sceneShowState.show && $scope.entityInfoShowState.show) {
            canvasDiv.addClass("col-xs-7"); // 2 + 7 + 3
        } else if (!$scope.sceneShowState.show && $scope.entityInfoShowState.show) {
            canvasDiv.addClass("col-xs-9"); // 9 + 3
        } else if ($scope.sceneShowState.show && !$scope.entityInfoShowState.show) {
            canvasDiv.addClass("col-xs-10");// 2 + 10
        } else
            canvasDiv.addClass("col-xs-12");// 12
        this.editor.updateSelection();

    }

};
