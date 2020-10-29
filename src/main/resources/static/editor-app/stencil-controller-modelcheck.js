'use strict';
angular.module('activitiModeler')
    .CheckClass = function ($rootScope, $scope) {

    $scope.getShapebyId_multiScene = function (resourceId, currentSceneIndex){
        let childShapes = $rootScope.scenes[currentSceneIndex].childShapes;
        for(let i=0;i<childShapes.length;i++){
            if(childShapes[i].resourceId === resourceId){
                return childShapes[i];
            }
        }
        return undefined;
    }

    $scope.checkScene = function(index, currentSceneIndex){
        if(currentSceneIndex === -1) return true;
        console.log("index: "+index);
        console.log("currentSceneIndex: "+currentSceneIndex);
        let childShapes = $rootScope.scenes[currentSceneIndex].childShapes;

        // 获取出口节点信息
        for(let i=0;i<childShapes.length;i++){
            console.log(childShapes[i]);
            if(childShapes[i].stencil.id === "MessageFlow"){
                // 查看是否连接ExitPoint
                let resId = childShapes[i].outgoing[0].resourceId;
                let shape = $scope.getShapebyId_multiScene(resId,currentSceneIndex);
                if(shape !== undefined && shape.stencil.id ==="ExitPoint"){
                    return true;
                }
            }
        }

        return false;
    }
}