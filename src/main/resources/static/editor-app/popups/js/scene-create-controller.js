var SceneCreateController = ['$scope', '$rootScope', function ($scope, $rootScope) {
    $scope.properties = [];
    // $scope.$watch('$viewContentLoaded', function () {
    //     $scope.sceneSettingDiv = document.getElementById("sceneSetting");
    //     for (let i = 0; i <$scope.properties.length; i++) {
    //         propertySettingAdd($scope.properties[i]);
    //     }
    // });
    //
    // var propertySettingAdd = function (property) {
    //     var container = document.createElement("div");
    //     container.classList.add("row");
    //     container.setAttribute("style", "margin-top:3%");
    //     var label = document.createElement("label");
    //     label.classList.add("col-xs-2");
    //     label.setAttribute("for", property);
    //     label.setAttribute("style", "float:left");
    //     label.innerText = property + ":";
    //     var input = document.createElement("input");
    //     input.setAttribute("id", property);
    //     input.setAttribute("placeholder", "请输入" + property);
    //     input.setAttribute("style", "border-radius: 5px;float:left");
    //     input.classList.add("col-xs-10");
    //     container.appendChild(label);
    //     container.appendChild(input);
    //     $scope.sceneSettingDiv.appendChild(container);
    // }
    $scope.save = function () {
        let newScene = {};
        var nameValue = document.getElementById("sceneName").value;
        if (!nameValue || nameValue === "") {
            return;
        }
        newScene.name = nameValue;
        newScene.properties = {};
        for (let i = 0; i < $scope.properties.length; i++) {
            var property = $scope.properties[i];
            var propertyValue = document.getElementById(property).value;
            if (!propertyValue || propertyValue === "")
                return;
            newScene.properties[property] = propertyValue;
        }
        if ($rootScope.scenes === undefined) {
            $rootScope.scenes = [];
        }
        $scope.changeScene(-1);
        $scope.createScene();

        let scene = $scope.editor.getSelection()[0];
        scene.setProperty("oryx-overrideid", scene.id);
        scene.setProperty("oryx-name", nameValue);
        newScene.id = scene.id;
        $rootScope.scenes[$rootScope.scenes.length] = newScene;

        $scope.$hide();
    }
    $scope.close = function () {
        $scope.$hide();
    }

}];
