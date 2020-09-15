var ConstraintController = ['$scope','$rootScope', function ($scope,$rootScope) {
    $scope.entities = [];

    $scope.entities.push({id:"0",name:"11",description:"aa",icon:"socialentity/person.png"});

    $scope.init = function (){
        // var parent = jQuery('.constraintViewer');
        // var div = ORYX.Editor.graft("http://www.w3.org/1999/xhtml", parent, ['div']);
        // div.addClassName("HAHAHAHAHA");
        var command = new VIEWER.CreateCanvas();
        $scope.editor.executeCommands([command]);
    };

    $scope.close = function (){
        $scope.$hide();
    }
}];

var VIEWER = VIEWER || {};

VIEWER.CreateCanvas = ORYX.Editor.extend({
    construct: function (){
        let v = this.getStencilSets().values();
        console.log(v);
        // this._createCanvas(null, null);
    }
})
