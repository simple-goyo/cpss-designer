var navigation = angular.module('navigation', ['ui.router']);
navigation.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
    // $routeProvider
    //     .when('/', {controller: 'DemoCtrl'})
    //     .otherwise({redirectTo: '/'});
    // $locationProvider.html5Mode(true);
    $stateProvider.state('editor',{
            url: 'editor',
            templateUrl: '/index'
        }).state('amap',{
        url: '/amap',
        templateUrl: 'tpl/amap.html'
    }).state('page3',{
        url: '/page3',
        templateUrl: 'tpl/amap.html'
    }).state('page4',{
        url: '/page4',
        templateUrl: 'tpl/amap.html'
    })
    $urlRouterProvider.when("amap1","/tpl/amap.html").otherwise('amap');
}]);
navigation.controller('NavbarCtrl', function ($scope,$http) {
    $http.get("/js/nav.json").success(function(json){
        $scope.navbar = json;
    });
});

navigation.directive('gaodeMap', [function () {
    return {
        restrict: 'E',
        replace:true,
        template: '<div id="container"></div>',
        scope: {
            options:'='
        },
        link: function ($scope, elem, attr) {
            var map = new AMap.Map("container", {
                resizeEnable : true,
                zoom : 17
            });
            var marker = new AMap.Marker({
                map : map,
                bubble : true ,
                content: '<div class="marker-route marker-marker-bus-from"></div>'  //自定义点标记覆盖物内容,
            })
            marker.setLabel({
                offset: new AMap.Pixel(20, 0),
                content: "我在这里"
            });
            $scope.$watch("options", function (newValue, oldValue) {
                if ($scope.options && $scope.options.lng && $scope.options.lat){
                    map.setCenter([$scope.options.lng ,$scope.options.lat]);
                    marker.setPosition([$scope.options.lng ,$scope.options.lat]);
                }
            },true);
        }
    }
}]);