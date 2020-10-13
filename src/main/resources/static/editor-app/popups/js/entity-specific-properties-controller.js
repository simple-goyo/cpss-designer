var EntitySpecificPropertiesController = ['$scope', '$rootScope', '$http', function ($scope, $rootScope, $http) {
    let selectedShape = $scope.editor.getSelection()[0];
    let resName = selectedShape.properties["oryx-type"] === "房间" ? "Room" : selectedShape.properties['oryx-name'];
    $http({
        method: 'GET',
        url: KISBPM.URL.getEntitySpecificProperties(resName)
    }).success(function (data, status, headers, config) {
        $scope.properties = data;
    }).error(function (data, status, headers, config) {
        console.log('Something went wrong when fetching entity specific properties:' + JSON.stringify(data));
    });

}]