angular.module("myApp")
    .service("ActionDisplayService",["$http",function ($http) {
        this.getActionEntity=function () {
            return $http({
                url:"https://www.fastmock.site/mock/6d7390fcdf2371787e4606d0bbe4db1f/indoor/getEntityByFloorId",
                method:'GET',
                params:{
                    "floorId":1
                }
            })
            //     .success(function (response, status, headers, config) {
            //     /*成功信息*/
            //     return response;
            // }).error(function (response) {
            //     /*失败信息*/
            //     return response;
            // });
        };

        this.getEntityState=function (entityId) {
            return $http({
                url:"https://www.fastmock.site/mock/6d7390fcdf2371787e4606d0bbe4db1f/indoor/getEntityStateByEntityId",
                method:'GET',
                params:{
                    'entityId':entityId
                }
            })
        }
    }]);