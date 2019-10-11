angular.module("myApp")
    .service("ActionDisplayService",["$http",function ($http) {
        this.getActionEntity=function () {
            return $http.get("/js/action-entity.json")
        };
        this.getEntityState=function (entityId) {
            return $http.get("/js/entity-state.json")
        }
    }]);