angular.module('myApp')
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $stateProvider.state('editor', {
            url: '/editor',
            templateUrl: '/index'
        }).state('action-display', {
            url: '/action-display',
            templateUrl: 'tpl/action-display.html',
            controller: 'ActionDisplayController',
        }).state('action-display.resource', {
            url: '/action-display',
            templateUrl: 'tpl/select-resource.html',
            controller: 'TaskActionResourceController',
        }).state('action-display.setting', {
            url: '/action-display',
            templateUrl: 'tpl/display-setting.html',
            controller:["$scope",function ($scope) {
                // $scope.$parent.adaptiveDisplay=false;
                console.log($scope.$parent.adaptiveDisplay);
            }]
        }).state('thing3d', {
            url: '/3d',
            templateUrl: 'tpl/thing3d.html'
        }).state('page4', {
            url: '/page4',
            templateUrl: 'tpl/amap.html'
        })
        // $urlRouterProvider.otherwise('/editor');
    }]);