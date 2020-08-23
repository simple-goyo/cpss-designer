var NodeConditionWriteCtrl = ['$scope', '$modal', '$timeout', '$translate', function ($scope, $modal, $timeout, $translate) {

    // Config for the modal window
    var opts = {
        template: 'editor-app/configuration/properties/node-condition-popup.html?version=' + Date.now(),
        scope: $scope
    };

    // Open the dialog
    $modal(opts);
}];

var NodeConditionPopupController = ['$scope', '$modal', function ($scope) {
    var index = 1;
    var properties = ["a", "b", "c", "d", "e"];
    var conditions = ["==", "!="];
    var combineRules = ["AND", "OR"];
    var nodeConditionCombineRule = $scope.property.value.nodeConditionCombineRule;
    var nodeConditions = $scope.property.value.nodeConditions;
    $scope.$watch('$viewContentLoaded', function () {
        $scope.conditionInitial = document.getElementById("conditionInitial");
        if (!nodeConditions) {
            $scope.addEmptyCondition();
        } else {
            for (let i = 0; i < nodeConditions.length; i++) {
                $scope.addCondition(nodeConditions[i].property, nodeConditions[i].condition, nodeConditions[i].value);
            }
        }
        $scope.combineRuleSelect = document.getElementById("combineRuleSelect");
        $scope.combineRuleSelect.options[0] = new Option("请选择组合方式", "", true);
        for (let j = 0; j < combineRules.length; j++) {
            if (combineRules[j] === nodeConditionCombineRule) {
                $scope.combineRuleSelect.options[j + 1] = new Option(combineRules[j], combineRules[j], false, true);
            } else
                $scope.combineRuleSelect.options[j + 1] = new Option(combineRules[j], combineRules[j]);
        }
    });

    $scope.addEmptyCondition = function () {
        $scope.addCondition("", "", "");
    }
    $scope.addCondition = function (property, condition, value) {
        var div = document.createElement("div");
        div.classList.add("row");
        var propertyLabel = document.createElement("label");
        propertyLabel.setAttribute("for", "property" + index);
        propertyLabel.innerText = "属性" + index + ":";
        propertyLabel.setAttribute("style", "width:10%");

        var propertySelect = document.createElement("select");
        propertySelect.setAttribute("id", "property" + index);
        propertySelect.options[0] = new Option("请选择属性", "", true);
        for (let i = 0; i < properties.length; i++) {
            if (property === properties[i])
                propertySelect.options[i + 1] = new Option(properties[i], properties[i], false, true);
            else propertySelect.options[i + 1] = new Option(properties[i], properties[i]);
        }
        propertySelect.setAttribute("style", "width:20%;margin-right:3%");

        var conditionLabel = document.createElement("label");
        conditionLabel.setAttribute("for", "condition" + index);
        conditionLabel.innerText = "条件:";
        conditionLabel.setAttribute("style", "width:10%");

        var conditionSelect = document.createElement("select");
        conditionSelect.setAttribute("id", "condition" + index);
        conditionSelect.options[0] = new Option("请选择条件", "", true);
        for (let i = 0; i < conditions.length; i++) {
            if (condition === conditions[i])
                conditionSelect.options[i + 1] = new Option(conditions[i], conditions[i], false, true);
            else conditionSelect.options[i + 1] = new Option(conditions[i], conditions[i]);
        }
        conditionSelect.setAttribute("style", "width:20%;margin-right:3%");

        var valueLabel = document.createElement("label");
        valueLabel.setAttribute("for", "value" + index);
        valueLabel.innerText = "属性值:";
        valueLabel.setAttribute("style", "width:10%");

        var input = document.createElement("input");
        if (value === "") {
            input.setAttribute("placeholder", "请输入属性值")
        }
        input.setAttribute("value", value);
        input.setAttribute("id", "value" + index);
        input.setAttribute("style",
            "border-top-left-radius: 5px;" +
            "border-top-right-radius: 5px;" +
            "border-bottom-right-radius: 5px;" +
            "border-bottom-left-radius: 5px;" +
            "width:20%");

        div.appendChild(propertyLabel);
        div.appendChild(propertySelect);
        div.appendChild(conditionLabel);
        div.appendChild(conditionSelect);
        div.appendChild(valueLabel);
        div.appendChild(input);
        if ($scope.conditionInitial.childElementCount > 0) {
            var hr = document.createElement("hr");
            hr.setAttribute("style", "border:1px dashed #eee");
            $scope.conditionInitial.appendChild(hr);
        }
        $scope.conditionInitial.appendChild(div);
        index++;
    };

    $scope.save = function () {
        $scope.property.value = {};
        $scope.property.value.nodeConditions = [];
        var count = 0;
        for (let i = 1; i < index; i++) {
            var propertyId = "property" + i;
            var conditionId = "condition" + i;
            var valueId = "value" + i;
            var property = document.getElementById(propertyId).value;
            var condition = document.getElementById(conditionId).value;
            var value = document.getElementById(valueId).value;
            if (property !== "" && condition !== "" && value !== "") {
                $scope.property.value.nodeConditions[count] = {
                    property: property,
                    condition: condition,
                    value: value,
                };
                count++;
            }
        }
        $scope.property.value.nodeConditionCombineRule = document.getElementById("combineRuleSelect").value;
        $scope.updatePropertyInModel($scope.property);
        $scope.close();
    };


    $scope.close = function () {
        $scope.property.mode = 'read';
        $scope.$hide();
    };
}];


var NodeConditionDisplayController = ['$scope', function ($scope) {
    $scope.nodeConditionDisplay = "";
    if ($scope.property.value && $scope.property.value.nodeConditions &&
        $scope.property.value.nodeConditions.length && $scope.property.value.nodeConditionCombineRule) {
        for (let i = 0; i < $scope.property.value.nodeConditions.length; i++) {
            if ($scope.nodeConditionDisplay !== "")
                $scope.nodeConditionDisplay += " " + $scope.property.value.nodeConditionCombineRule + " " + $scope.property.value.nodeConditions[i].property + $scope.property.value.nodeConditions[i].condition + $scope.property.value.nodeConditions[i].value;
            else
                $scope.nodeConditionDisplay = $scope.property.value.nodeConditions[i].property + $scope.property.value.nodeConditions[i].condition + $scope.property.value.nodeConditions[i].value;

        }
    }
}];