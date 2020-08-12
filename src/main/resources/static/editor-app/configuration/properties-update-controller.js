var updateWriteCtrl = ['$scope', '$modal', '$timeout', '$translate', function ($scope, $modal, $timeout, $translate) {
    // Config for the modal window
    var opts = {
        template: 'editor-app/configuration/properties/update-popup.html?version=' + Date.now(),
        scope: $scope
    };
    // Open the dialog
    $modal(opts);
}];

var updatePopupController = ['$scope', '$modal', function ($scope, $modal) {

    $scope.save = function () {
        // $scope.updatePropertyInModel($scope.property);
        $scope.close();
    };

    // Close button handler
    $scope.close = function () {
        //$scope.property.mode = 'read';
        $scope.$hide();
    };
}];

var updateDisplayController = ['$scope', function ($scope) {

}];