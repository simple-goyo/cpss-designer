angular.module("myApp")
    .directive('gaodeMap', [function () {
        return {
            restrict: 'EA',
            replace: true,
            template: '<div id="container"></div>',
            link: function ($scope, ele, attrs) {
                $scope.$watch("entitys", function (newValue, oldValue) {
                    $scope.markers.forEach(function (marker, key, map) {
                        if ($scope.entitys.indexOf(parseInt(key)) >= 0) {
                            //标记依旧存在，不做任何操作
                        } else {
                            // 标记不存在，删除老标记
                            $scope.markers.get(key).setMap(null);
                        }
                    });
                    $.each($scope.entitys, function (index, entityId) {
                        if ($scope.markers.get(entityId+"") != null) {
                            //标记已存在，不做任何操作
                        } else {
                            // 标记不存在，需要新增
                            $scope.addNewMaker(entityId);
                        }
                    });

                    //显示状态变更
                    $scope.first=true;
                    $scope.states.forEach(function (state, key, map) {
                        // var state = $scope.states.get(key);
                        var marker = $scope.markers.get(key);
                        //移动
                        if($scope.first==true){
                            marker.moveTo([state.lo, state.la], $scope.timeout,function (k) {
                                if($scope.adaptiveDisplay){
                                    $scope.mapObj.setFitView();
                                }
                                return k;
                            });
                        }else {
                            marker.moveTo([state.lo, state.la], $scope.timeout);
                        }
                        //改状态（改图标）
                        if(state.bIndoor==false){
                            marker.setIcon(new AMap.Icon({
                                size: new AMap.Size(200, 200),
                                image: state.type,
                                imageSize: new AMap.Size(100, 100),
                                offset: new AMap.Pixel(-40, -80),
                            }));

                            if($scope.showStateInfo){
                                $scope.content=$scope.getOtherStateContent(state.otherState);
                                marker.setLabel({
                                    offset: new AMap.Pixel(-50,-10),  //设置文本标注偏移量
                                    content:$scope.content, //设置文本标注内容
                                    direction: 'top' //设置文本标注方位
                                });
                            }else {
                                marker.setLabel({
                                    offset: new AMap.Pixel(-50,-10),  //设置文本标注偏移量
                                    content: "worker", //设置文本标注内容
                                    direction: 'top' //设置文本标注方位
                                });
                            }

                        }else {
                            marker.setIcon(new AMap.Icon({
                                size: new AMap.Size(200, 200),
                                image: state.type,
                                imageSize: new AMap.Size(20, 20),
                                offset: new AMap.Pixel(-3, -6)
                            }));

                            if($scope.showStateInfo){
                                $scope.content=$scope.getOtherStateContent(state.otherState);
                                marker.setLabel({
                                    offset: new AMap.Pixel(-90,-20),  //设置文本标注偏移量
                                    content: $scope.content, //设置文本标注内容
                                    direction: 'top' //设置文本标注方位
                                });
                            }else {
                                marker.setLabel({
                                    offset: new AMap.Pixel(-90,-20),  //设置文本标注偏移量
                                    content: "worker", //设置文本标注内容
                                    direction: 'top' //设置文本标注方位
                                });
                            }
                        }
                        //已经不是第一个了
                        $scope.first=false;
                    });

                    //
                    // $scope.mapObj.setFitView();
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

                $scope.timeout = 200;
                $scope.lat = 31.1917000000;
                $scope.lng = 121.5990840000;
                $scope.bmove = false;
                $scope.markerClickListener; //点击界面添加标记监听器

                // $scope.oldEntitys; //获得的初始化高德地图对象

                $scope.initAMap = function () {
                    var position = new AMap.LngLat($scope.lng, $scope.lat); //初始化默认坐标
                    $scope.mapObj = new AMap.Map($scope.AMapId, {
                        view: new AMap.View2D({
                            center: position,
                            zoom: 15,
                            rotation: 0
                        }),
                        mapStyle: 'amap://styles/light',
                        layers: [
                            // new AMap.TileLayer.Satellite(),
                            new AMap.TileLayer(),//高德默认标准图层
                            // 楼块图层
                            new AMap.Buildings({
                                zooms: [16, 21],
                                zIndex: 100,
                                heightFactor: 2//2倍于默认高度，3D下有效
                            })
                        ],
                        lang: 'zh_cn',
                    });
                };

                $scope.jump = function (buildingId) {
                    console.log(buildingId);
                    $state.go("thing3d",{
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
                    var state = $scope.states.get(entityId+"");
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
                    $scope.markers.set(entityId+"", marker)
                }

                $scope.getOtherStateContent=function(otherState){
                    var thead="<div class='shadow bg-white rounded'><table class=\"table\">\n" +
                        "  <thead>\n" +
                        "    <tr>\n" +
                        "      <th scope=\"col\">状态名称</th>\n" +
                        "      <th scope=\"col\">状态数值</th>\n" +
                        "    </tr>\n" +
                        "  </thead>\n" +
                        "  <tbody>\n";
                    var tfooter=  "  </tbody>\n" +
                        "</table></div>";
                    var tbody="";
                    for (var key in otherState){
                        tbody+="    <tr>\n" +
                            "      <td>"+key+"</td>\n" +
                            "      <td>"+otherState[key]+"</td>\n" +
                            "    </tr>\n" ;
                    };
                    var table=thead+tbody+tfooter;
                    return table;
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

                // $scope.mapObj.setFitView();

                //
                // var markerPerson = new AMap.Marker({
                //     map: $scope.mapObj,
                //     position: [$scope.lng, $scope.lat],
                //     icon: new AMap.Icon({
                //         size: new AMap.Size(200, 200),
                //         image: "/img/1.png",
                //         imageSize: new AMap.Size(100, 100),
                //         title:"title"
                //     }),
                //     label: "worker",
                //     offset: new AMap.Pixel(-40, -80),
                //     autoRotation: true
                // });
                //
                // markerPerson.setLabel({
                //     offset: new AMap.Pixel(-50,-20),  //设置文本标注偏移量
                //     content: "<div class='info'>我是 大marker 的 label 标签我是 大marker 的 label 标签我是 大marker 的 label 标签</div>", //设置文本标注内容
                //     direction: 'top' //设置文本标注方位
                // });
                //
                // var marker = new AMap.Marker({
                //     map: $scope.mapObj,
                //     position: [$scope.lng, $scope.lat],
                //     icon: new AMap.Icon({
                //         size: new AMap.Size(200, 200),
                //         image: "/img/1.png",
                //         imageSize: new AMap.Size(20, 20),
                //         title:"title"
                //     }),
                //     offset: new AMap.Pixel(-3, -6)
                // });
                //
                // marker.setLabel({
                //     offset: new AMap.Pixel(-90,-20),  //设置文本标注偏移量
                //     content: "<div class='info'>m</div>", //设置文本标注内容
                //     direction: 'top' //设置文本标注方位
                // });


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