angular.module("myApp")
    .controller("ActionDisplayController",["$scope","$interval","ActionDisplayService",function ($scope,$interval,ActionDisplayService) {
        //实体更新
        $scope.entitys=[];
        $scope.states=new Map();
        $scope.timer = $interval(function () {
            ActionDisplayService.getActionEntity()
                .then(function (res) {
                    $scope.entitys=res.data;
                    console.log("getActionEntity"+$scope.entitys);
                    for (var i = 0; i < $scope.entitys.length; i++) {
                        ActionDisplayService.getEntityState($scope.entitys[i])
                            .then(function (res) {
                                $scope.states.set(res.data.id,res.data)
                            })
                        // console.log("getEntityState"+$scope.entitys[i]+res.data)
                    }
                });
        }, 10000)
        //界面显示设置
        $scope.adaptiveDisplay=true;//跟踪显示资源
        $scope.showStateInfo=true;//显示资源状态信息
        $scope.indoorOutdoor=false;//室内外自动切换

    }]);