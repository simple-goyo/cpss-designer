angular.module("myApp")
    .controller("ActionDisplayController",["$scope","$interval","ActionDisplayService",function ($scope,$interval,ActionDisplayService) {
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
                                res.data.la+= Math.random() * 0.001;
                                res.data.lo+= Math.random() * 0.001;
                                $scope.states.set(res.data.id,res.data)
                            })
                        // console.log("getEntityState"+$scope.entitys[i]+res.data)
                    }
                });



        }, 10000)
    }]);