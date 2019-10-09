angular.module("myApp")
    .directive('gaodeMap', [function () {
        return {
            restrict: 'EA',
            replace: true,
            template: '<div id="container"></div>',
            scope: {
                entitys: '=',
                states: '=',
            },
            link: function ($scope, ele, attrs) {
                $scope.$watch("entitys", function (newValue, oldValue) {
                    //当前需要显示的资源变更
                    // if (typeof $scope.oldEntitys == "undefined") {
                    //     //界面上没有图标显示
                    //     $scope.oldEntitys = $scope.entitys;
                    //     //显示所有图标
                    //     for (var i = 0; i < $scope.entitys.length; i++) {
                    //         //显示新的标记
                    //         $scope.addNewMaker($scope.entitys[i]);
                    //     }
                    // } else {
                    $.each($scope.markers, function (key, marker) {
                        if ($scope.entitys.indexOf(key) >= 0) {
                            //标记依旧存在，不做任何操作
                        } else {
                            // 标记不存在，删除老标记
                            $scope.markers.get(key).setMap(null);
                        }
                    });
                    $.each($scope.entitys, function (index, entityId) {
                        if ($scope.markers.get(entityId) != null) {
                            //标记已存在，不做任何操作
                        } else {
                            // 标记不存在，需要新增
                            $scope.addNewMaker(entityId);
                        }
                    });
                    // for (var i = 0; i < $scope.entitys.length; i++) {
                    //     if ($scope.markers.get($scope.entitys) >= 0) {
                    //         //标记已存在，不做任何操作
                    //     } else {
                    //         // 标记不存在，需要新增
                    //         $scope.addNewMaker($scope.entitys[i]);
                    //     }
                    // }
                    // for (var i = 0; i < $scope.oldEntitys.length; i++) {
                    //     if ($scope.entitys.indexOf($scope.oldEntitys[i]) >= 0) {
                    //         //标记依旧存在，不做任何操作
                    //     } else {
                    //         // 标记不存在，删除老标记
                    //         $scope.markers.get($scope.oldEntitys[i]).setMap(null);
                    //     }
                    // }

                    // $scope.oldEntitys = $scope.entitys;

                    //显示状态变更
                    $scope.states.forEach(function (state, key, map) {
                        // var state = $scope.states.get(key);
                        var marker = $scope.markers.get(key);
                        //移动
                        marker.moveTo([state.lo, state.la], $scope.timeout);
                        //改状态（改图标）
                        marker.setIcon(state.action)
                    });
                    // $.each($scope.states, function (key, state) {
                    //     // var state = $scope.states.get(key);
                    //     var marker = $scope.markers.get(key);
                    //     //移动
                    //     marker.moveTo([state.lo, state.la], $scope.timeout);
                    //     //改状态（改图标）
                    //     marker.setIcon(new AMap.Icon({
                    //         // size: new AMap.Size(200, 200),
                    //         image: $scope.state.action,
                    //         // imageSize: new AMap.Size(200, 200)
                    //     }))
                    // })
                    // for (var key in $scope.states) {
                    //     var state = $scope.states.get(key);
                    //     var marker = $scope.markers.get(key);
                    //     //移动
                    //     marker.moveTo([state.lo, state.la], $scope.timeout);
                    //     //改状态（改图标）
                    //     marker.setIcon(new AMap.Icon({
                    //         // size: new AMap.Size(200, 200),
                    //         image: $scope.state.action,
                    //         // imageSize: new AMap.Size(200, 200)
                    //     }))
                    // }
                });
            },
            controller: function ($scope,$state) {

                $scope.AMapId = 'container'; //高德地图的存放容器
                $scope.mapObj; //获得的初始化高德地图对象
                $scope.markers = new Map();

                $scope.timeout = 50;
                $scope.lat = 31.1903363811;
                $scope.lng = 121.5982675552;
                $scope.bmove = false;
                $scope.markerClickListener; //点击界面添加标记监听器

                // $scope.oldEntitys; //获得的初始化高德地图对象

                $scope.initAMap = function () {
                    var position = new AMap.LngLat($scope.lng, $scope.lat); //初始化默认坐标
                    $scope.mapObj = new AMap.Map($scope.AMapId, {
                        view: new AMap.View2D({
                            center: position,
                            zoom: 20,
                            rotation: 0
                        }),
                        layers: [
                            // new AMap.TileLayer.Satellite(),
                            new AMap.TileLayer(),//高德默认标准图层
                            // 楼块图层
                            new AMap.Buildings({
                                zooms: [16, 18],
                                zIndex: 10,
                                heightFactor: 2//2倍于默认高度，3D下有效
                            })
                        ],
                        lang: 'zh_cn'
                    });
                };

                $scope.jump = function (buildingId) {
                    console.log(buildingId);
                    $state.go("editor",{
                        buildingId:buildingId
                    });
                }

                $scope.ListenClick = function () {
                    $scope.markerClickListener = AMap.event.addListener($scope.mapObj, 'dblclick', function (e) {
                        var lnglat = e.lnglat;
                        //判断点击在哪个建筑物上
                        var buildingId=1;
                        //如果有就跳转
                        if(buildingId !=null){
                            $scope.jump(buildingId);
                        }

                        // var marker = new AMap.Marker({
                        //     map: $scope.mapObj,
                        //     position: e.lnglat,
                        //     offset: new AMap.Pixel(-10, -34),
                        //     icon: new AMap.Icon({
                        //         size: new AMap.Size(200, 200),
                        //         image: "/img/gif-test4.gif",
                        //         imageSize: new AMap.Size(200, 200)
                        //     }),
                        // });

                        // $scope.mapObj.setCenter(lnglat);

                        // if ($scope.bmove) {
                        //     markerPerson.moveTo(e.lnglat, $scope.timeout);//开始动画
                        //     $scope.bmove = false;
                        // } else {
                        //     markerPerson.stopMove();//结束动画
                        //     $scope.bmove = true;
                        // }

                    });
                };

                $scope.removeMarkerListener = function () {
                    AMap.event.removeListener($scope.markerClickListener); //移除事件
                };

                $scope.addNewMaker = function (entityId) {
                    var state = $scope.states.get(entityId);
                    if (typeof state == "undefined") {
                        return;
                    }
                    var marker = new AMap.Marker({
                        map: $scope.mapObj,
                        position: [state.lo, state.la],
                        offset: new AMap.Pixel(-60, -120),
                        icon: "/img/2.png",
                        autoRotation: true
                    });
                    $scope.markers.set(entityId, marker)
                }

                $scope.initAMap();
                $scope.ListenClick();


                // var lineArr = $scope.path();
                //
                // //给lineArr设置默认值
                // if (typeof lineArr == 'undefined') {
                //     var lngX = $scope.lng;
                //     var latY = $scope.lat;
                //     var lineArr = [];
                //     lineArr.push([lngX, latY]);
                //     for (var i = 1; i < 3; i++) {
                //         lngX = lngX + Math.random() * 0.05;
                //         if (i % 2) {
                //             latY = latY + Math.random() * 0.0001;
                //         } else {
                //             latY = latY + Math.random() * 0.06;
                //         }
                //         lineArr.push([lngX, latY]);
                //     }
                // }

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
                    label: "worker",
                    offset: new AMap.Pixel(-60, -120),
                    autoRotation: true
                });

                //根据actionEntity读取每个entity的状态
                // $scope.timer = $interval(function () {
                //     for (var i = 0; i < $scope.actionEntity.length; i++) {
                //         ActionDisplayService.getEntityState($scope.actionEntity[i])
                //             .then(function (res) {
                //                 $scope.entityState=res.data;
                //                 // $scope.allScreenMarkers.get()
                //                 //修改位置
                //
                //                 //修改状态（图标)
                //             })
                //         console.log("getEntityState"+$scope.actionEntity[i]+$scope.actionEntity)
                //     }
                // }, 1000)
            }
        }
    }]);