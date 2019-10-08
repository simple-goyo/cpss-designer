var home = angular.module('home', ['ui.router']);
home.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
    $stateProvider.state('editor',{
            url: '/editor',
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
home.controller('NavbarCtrl', function ($scope,$http) {
    $http.get("/js/nav.json").success(function(json){
        $scope.navbar = json;
    });
    $scope.clickMenu=function () {
        var li = $('ul.sidebar-menu li.active');
        li.removeClass('active');
        $(this).addClass('active');
    }


    $scope.lng = 116.397428;
    $scope.lat = 39.90923;

    $scope.getPath = function() {
        var lngX = $scope.lng;
        var latY = $scope.lat;
        var lineArr = [];
        lineArr.push([lngX, latY]);
        for (var i = 1; i < 100; i++) {
            lngX = lngX + Math.random() * 0.05;
            if (i % 2) {
                latY = latY + Math.random() * 0.0001;
            } else {
                latY = latY + Math.random() * 0.06;
            }
            lineArr.push([lngX, latY]);
        }
        // return lineArr;
    };

    // $scope.clickItem=function (url) {
    //     // var url = $(this).attr('data');
    //     // $('#page-container').load(url);
    //     $scope.$apply(function () {
    //         $('#page-container').load(url);
    //     });
    // }
});

home.directive('gaodeMap', [function () {
    return {
        restrict: 'E',
        replace:true,
        template: '<div id="container" lng="lng" lat="lat" path="getPath()" timeout="2000"></div>',
        scope: {
            lng: '=', //纬线
            lat: '=', //经线
            path: '&', //运动轨迹
            timeout: '=' //轨迹运行速度
        },
        // link: function ($scope, elem, attr) {
        //     var map = new AMap.Map("container", {
        //         resizeEnable : true,
        //         zoom : 17
        //     });
        //     var marker = new AMap.Marker({
        //         map : map,
        //         bubble : true ,
        //         content: '<div class="marker-route marker-marker-bus-from"></div>'  //自定义点标记覆盖物内容,
        //     })
        //     marker.setLabel({
        //         offset: new AMap.Pixel(20, 0),
        //         content: "我在这里"
        //     });
        //     $scope.$watch("options", function (newValue, oldValue) {
        //         if ($scope.options && $scope.options.lng && $scope.options.lat){
        //             map.setCenter([$scope.options.lng ,$scope.options.lat]);
        //             marker.setPosition([$scope.options.lng ,$scope.options.lat]);
        //         }
        //     },true);
        // },
        controller: function($scope) {

            $scope.AMapId = 'container'; //高德地图的存放容器
            $scope.bmove=false;
            $scope.mapObj; //获得的初始化高德地图对象

            $scope.markerClickListener; //点击界面添加标记监听器

            if(typeof $scope.timeout == 'undefined') {
                $scope.timeout = 500;
            }

            $scope.initAMap = function() {

                if(typeof $scope.lng == 'undefined') {
                    $scope.lng = 121.5982675552;
                }

                if(typeof $scope.lat == 'undefined') {
                    $scope.lat = 31.1903363811;
                }

                var position = new AMap.LngLat($scope.lng,$scope.lat); //初始化默认坐标
                $scope.mapObj = new AMap.Map($scope.AMapId,{
                    view:new AMap.View2D({
                        center:position,
                        zoom:14,
                        rotation:0
                    }),
                    lang:'zh_cn'
                });
            };

            $scope.ListenClick = function() {
                $scope.markerClickListener=AMap.event.addListener($scope.mapObj,'click',function(e){
                    var lnglat=e.lnglat;
                    marker=new AMap.Marker({
                        map:$scope.mapObj,
                        position:e.lnglat,
                        icon:"/img/3.png",
                        offset:new AMap.Pixel(-10,-34)
                    });
                    $scope.mapObj.setCenter(lnglat);
                    if($scope.bmove){
                        markerPerson.moveTo(e.lnglat, $scope.timeout);//开始动画
                        $scope.bmove=false;
                    }else {
                        markerPerson.stopMove();//结束动画
                        $scope.bmove=true;

                    }
                });
            };

            $scope.removeMarkerListener = function() {
                AMap.event.removeListener($scope.markerClickListener); //移除事件
            };

            $scope.initAMap();
            $scope.ListenClick();

            var lineArr = $scope.path();

            //给lineArr设置默认值
            if(typeof lineArr == 'undefined') {
                var lngX = $scope.lng;
                var latY = $scope.lat;
                var lineArr = [];
                lineArr.push([lngX, latY]);
                for (var i = 1; i < 3; i++) {
                    lngX = lngX + Math.random() * 0.05;
                    if (i % 2) {
                        latY = latY + Math.random() * 0.0001;
                    } else {
                        latY = latY + Math.random() * 0.06;
                    }
                    lineArr.push([lngX, latY]);
                }
            }

            // // 绘制轨迹
            // var polyline = new AMap.Polyline({
            //     map: $scope.mapObj,
            //     path: lineArr,
            //     strokeColor: "#00A",  //线颜色
            //     strokeOpacity: 1,     //线透明度
            //     strokeWeight: 3,      //线宽
            //     strokeStyle: "solid"  //线样式
            // });

            $scope.mapObj.setFitView();

            var markerPerson = new AMap.Marker({
                map: $scope.mapObj,
                position: [$scope.lng, $scope.lat],
                icon: "/img/2.png",
                offset: new AMap.Pixel(-60, -120),
                autoRotation: true
            });

            $scope.startAnimation = function() {
                markerPerson.moveAlong(lineArr, $scope.timeout);//开始动画
            };

            $scope.stopAnimation = function() {
                markerPerson.stopMove();//结束动画
            };
        }
    }
}]);