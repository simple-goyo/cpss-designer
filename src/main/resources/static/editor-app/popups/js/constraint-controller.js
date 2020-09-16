var ConstraintController = ['$scope','$rootScope','$http', function ($scope, $rootScope, $http) {
    $scope.entities = [];
    $scope.entities.push({id:"0",name:"User",icon:"socialentity/person.png"});

    $scope.close = function (){
        $scope.$hide();
    }

    // LOAD the content of the current editor instance
    window.setTimeout(function(){
        $scope.constraintViewer = new ORYX.Viewer();
    }.bind(this), 500);
}];

