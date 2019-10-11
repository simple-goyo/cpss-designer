angular.module('myApp')
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $stateProvider.state('editor', {
            url: '/editor/:lnglat',
            templateUrl: '/index'
        }).state('amap', {
            url: '/amap',
            templateUrl: 'tpl/amap.html',
            controller: 'ActionDisplayController',
        }).state('page3', {
            url: '/page3',
            templateUrl: 'tpl/amap.html'
        }).state('page4', {
            url: '/page4',
            templateUrl: 'tpl/amap.html'
        })
        $urlRouterProvider.otherwise('/editor');
    }]);