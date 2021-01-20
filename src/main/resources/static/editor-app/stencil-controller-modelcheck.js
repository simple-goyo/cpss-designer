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

    $scope.getChildrenSceneNode = function (nodeList, sceneNode){
        let children;
        if(sceneNode.children !== undefined && sceneNode.children.length > 0){
            children = sceneNode.children;
        }else{
            nodeList.push(sceneNode.id);
            return nodeList;
        }

        for(let i=0;i<children.length;i++){
            let child_nodeList = $scope.getChildrenSceneNode(nodeList, children[i]);
            nodeList = child_nodeList;
        }

        return nodeList;

    }

    $scope.getLastScenesId = function (){
        let sceneTree = $scope.getSceneTree();
        let nodeList = [];
        return $scope.getChildrenSceneNode(nodeList, sceneTree);
    }

    $scope.inLastScene = function (shape){
        // 判断是否为最后一个Scene，如果是则不需要连线
        let lastScenesId = $scope.getLastScenesId();
        for(let i=0;i<lastScenesId.length;i++){
            let result = $scope.isShapeInScene(shape, lastScenesId[i]);
            if(result)return true;
        }

        return false;
    }


    $scope.checkExitPoint = function(currentSceneIndex){
        if(currentSceneIndex === -1) return true; // 关系页面不做检查
        console.log("currentSceneIndex: "+currentSceneIndex);
        let childShapes = $rootScope.scenes[currentSceneIndex].childShapes;

        // 获取出口节点信息
        for(let i=0;i<childShapes.length;i++){
            //console.log(childShapes[i]);
            // 如果节点中最后一个Action对应的资源是worker, 则允许不连接出口节点
            if(childShapes[i].stencil.id === "SocialAction" && childShapes[i].outgoing.length === 0){
                if(childShapes[i].properties["activityelement"].type !== undefined && childShapes[i].properties["activityelement"].type === "Worker"){
                    return true;
                }
            }

            if(childShapes[i].stencil.id === "MessageFlow" && childShapes[i].outgoing.length > 0){
                // 查看是否连接ExitPoint
                let resId = childShapes[i].outgoing[0].resourceId;
                let shape = $scope.getShapebyId_multiScene(resId,currentSceneIndex);
                if(shape !== undefined && shape.stencil.id ==="ExitPoint"){
                    return true;
                }else if($scope.inLastScene(shape)){
                    return true;
                }
            }
        }

        return false;
    }

    $scope.checkEntryPoint = function(currentSceneIndex){
        if(currentSceneIndex === -1) return true; // 关系页面不做检查
        console.log("currentSceneIndex: "+currentSceneIndex);
        let childShapes = $rootScope.scenes[currentSceneIndex].childShapes;

        // 获取出口节点信息
        for(let i=0;i<childShapes.length;i++){
            //console.log(childShapes[i]);
            if(childShapes[i].stencil.id === "EntryPoint"){
                return childShapes[i].outgoing.length > 0;
            }
            // if(childShapes[i].stencil.id === "MessageFlow"){
            //     // 查看是否连接EntryPoint
            //     let resId = childShapes[i].outgoing[0].resourceId;
            //     let shape = $scope.getShapebyId_multiScene(resId,currentSceneIndex);
            //     if(shape !== undefined && shape.stencil.id ==="EntryPoint"){
            //         return true;
            //     }else if($scope.inLastScene(shape)){
            //         return true;
            //     }
            // }
        }

        return false;
    }

    $scope.checkScene = function(currentSceneIndex){
        let chck_result = $scope.checkExitPoint(currentSceneIndex);
        if(!chck_result){
            //index = $rootScope.selectedSceneIndex;
            alert("Please connect to ExitPoint before switching the scene.")
            return false;
        }

        $scope.checkEntryPoint(currentSceneIndex);
        if(!chck_result){
            //index = $rootScope.selectedSceneIndex;
            alert("Please connect to EntryPoint before switching the scene.")
            return false;
        }

        return true;

    }

}
