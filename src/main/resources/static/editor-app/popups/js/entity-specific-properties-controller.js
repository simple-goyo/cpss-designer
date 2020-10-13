var EntitySpecificPropertiesController = ['$scope', '$rootScope', '$http', function ($scope, $rootScope, $http) {
    let selectedShape = $scope.editor.getSelection()[0];
    $scope.resName = selectedShape.properties["oryx-type"] === "房间" ? "Room" : selectedShape.properties['oryx-name'];

    let olderProperties = selectedShape.properties['oryx-entityspecificproperties'];
    $http({
        method: 'GET',
        url: KISBPM.URL.getEntitySpecificProperties($scope.resName)
    }).success(function (data, status, headers, config) {
        $scope.properties = {};
        if (data.properties !== undefined && data.properties.length > 0) {
            data.properties.forEach((property) => {
                if (olderProperties[property] === undefined) {
                    $scope.properties[property] = "";
                } else
                    $scope.properties[property] = olderProperties[property];
            });
        }
    }).error(function (data, status, headers, config) {
        console.log('Something went wrong when fetching entity specific properties:' + JSON.stringify(data));
    });

    $scope.save = function () {
        for (let property in $scope.properties) {
            $scope.properties[property] = document.getElementById(property).value;
        }
        selectedShape.setProperty("oryx-entityspecificproperties", $scope.properties);
        $scope.close();
    }
    $scope.close = function () {
        $scope.$hide();
    }

}]