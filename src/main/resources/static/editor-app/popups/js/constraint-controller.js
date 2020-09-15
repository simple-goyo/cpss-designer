var ConstraintController = ['$scope','$rootScope', function ($scope,$rootScope) {
    $scope.init = function (){
        var parent = jQuery('.constraintViewer');
        var div = ORYX.Editor.graft("http://www.w3.org/1999/xhtml", parent, ['div']);
        div.addClassName("HAHAHAHAHA");
    }

    $scope.close = function (){
        $scope.$hide();
    }
}];
