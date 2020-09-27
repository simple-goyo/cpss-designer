var NodeConditionWriteCtrl = ['$scope', '$modal', '$timeout', '$translate', function ($scope, $modal, $timeout, $translate) {

    let edge = $scope.editor.getSelection()[0];
    let shapeIn = edge.incoming[0];
    if ($scope.isStartExclusiveGateway(shapeIn)) {
        $scope.connectedScene = edge.outgoing[0];
        // Config for the modal window
        var opts = {
            template: 'editor-app/configuration/properties/node-condition-popup.html?version=' + Date.now(),
            scope: $scope
        };

        // Open the dialog
        $modal(opts);
    } else {
        $scope.property.mode = 'read';
    }
}];

var NodeConditionPopupController = ['$scope', '$modal', function ($scope) {
    $scope.properties = $scope.getVisibleParameters("", $scope.connectedScene.properties['oryx-traceablescenes'], []);
    $scope.conditions = ["==", "!="];
    $scope.combinations = ["AND", "OR"];
    $scope.nodeConditions = $scope.property.value.nodeConditions;
    if (!$scope.nodeConditions) {
        $scope.nodeConditions = [];
        $scope.nodeConditions[$scope.nodeConditions.length] = {
            property: "",
            condition: "",
            value: "",
            combination: ""
        };
    }
    // $scope.$watch('$viewContentLoaded', function () {
    //     $scope.conditionInitial = document.getElementById("conditionInitial");
    //     if (!nodeConditions) {
    //         $scope.addEmptyCondition();
    //     } else {
    //         for (let i = 0; i < nodeConditions.length; i++) {
    //             $scope.addCondition(nodeConditions[i].combination, nodeConditions[i].property, nodeConditions[i].condition, nodeConditions[i].value);
    //         }
    //     }
    // });

    $scope.addEmptyCondition = function () {
        // $scope.addCondition("", "", "", "");
        $scope.nodeConditions[$scope.nodeConditions.length] = {
            property: "",
            condition: "",
            value: "",
            combination: ""
        };

    }
    // $scope.addCondition = function (combination, property, condition, value) {
    //     let div = document.createElement("div");
    //     div.classList.add("row");
    //
    //     if ($scope.conditionInitial.childElementCount > 0) {
    //         let combinationSelect = document.createElement("select");
    //         combinationSelect.setAttribute("id", "combination" + index);
    //         combinationSelect.options[0] = new Option("请选择逻辑符号", "", true);
    //         for (let i = 0; i < combinations.length; i++) {
    //             if (combination === combinations[i])
    //                 combinationSelect.options[i + 1] = new Option(combinations[i], combinations[i], false, true);
    //             else combinationSelect.options[i + 1] = new Option(combinations[i], combinations[i]);
    //         }
    //         combinationSelect.setAttribute("style", "width:15%;margin-right:3%");
    //         div.appendChild(combinationSelect);
    //     }
    //     let propertyLabel = document.createElement("label");
    //     propertyLabel.setAttribute("for", "property" + index);
    //     propertyLabel.innerText = "属性" + index + ":";
    //     propertyLabel.setAttribute("style", "width:10%");
    //
    //     let propertySelect = document.createElement("select");
    //     propertySelect.setAttribute("id", "property" + index);
    //     propertySelect.options[0] = new Option("请选择属性", "", true);
    //     for (let i = 0; i < properties.length; i++) {
    //         if (property === properties[i])
    //             propertySelect.options[i + 1] = new Option(properties[i], properties[i], false, true);
    //         else propertySelect.options[i + 1] = new Option(properties[i], properties[i]);
    //     }
    //     propertySelect.setAttribute("style", "width:15%;margin-right:2%");
    //
    //     div.appendChild(propertyLabel);
    //     div.appendChild(propertySelect);
    //
    //     let conditionLabel = document.createElement("label");
    //     conditionLabel.setAttribute("for", "condition" + index);
    //     conditionLabel.innerText = "条件:";
    //     conditionLabel.setAttribute("style", "width:10%");
    //
    //     let conditionSelect = document.createElement("select");
    //     conditionSelect.setAttribute("id", "condition" + index);
    //     conditionSelect.options[0] = new Option("请选择条件", "", true);
    //     for (let i = 0; i < conditions.length; i++) {
    //         if (condition === conditions[i])
    //             conditionSelect.options[i + 1] = new Option(conditions[i], conditions[i], false, true);
    //         else conditionSelect.options[i + 1] = new Option(conditions[i], conditions[i]);
    //     }
    //     conditionSelect.setAttribute("style", "width:15%;margin-right:2%");
    //
    //     div.appendChild(conditionLabel);
    //     div.appendChild(conditionSelect);
    //
    //     let valueLabel = document.createElement("label");
    //     valueLabel.setAttribute("for", "value" + index);
    //     valueLabel.innerText = "属性值:";
    //     valueLabel.setAttribute("style", "width:10%");
    //
    //     let input = document.createElement("input");
    //     if (value === "") {
    //         input.setAttribute("placeholder", "请输入属性值")
    //     }
    //     input.setAttribute("value", value);
    //     input.setAttribute("id", "value" + index);
    //     input.setAttribute("style",
    //         "border-top-left-radius: 5px;border-top-right-radius: 5px;border-bottom-right-radius: 5px;border-bottom-left-radius: 5px;width:15%");
    //
    //     div.appendChild(valueLabel);
    //     div.appendChild(input);
    //
    //     if ($scope.conditionInitial.childElementCount > 0) {
    //         let hr = document.createElement("hr");
    //         hr.setAttribute("style", "border:1px dashed #eee");
    //         $scope.conditionInitial.appendChild(hr);
    //     }
    //     $scope.conditionInitial.appendChild(div);
    //     index++;
    // };

    $scope.save = function () {
        $scope.property.value = {};
        $scope.property.value.nodeConditions = [];
        let count = 0;
        for (let i = 1; i <= $scope.nodeConditions.length; i++) {
            let propertyId = "property" + i;
            let conditionId = "condition" + i;
            let valueId = "value" + i;
            let combinationId = "combination" + i;
            let property = document.getElementById(propertyId).value;
            let condition = document.getElementById(conditionId).value;
            let value = document.getElementById(valueId).value;
            let combination = document.getElementById(combinationId) == null ? "" : document.getElementById(combinationId).value;
            if (property !== "" && condition !== "" && value !== "" && (i === 1 || (i > 1 && combination !== ""))) {
                $scope.property.value.nodeConditions[count] = {
                    property: property,
                    condition: condition,
                    value: value,
                    combination: combination
                };
                count++;
            }
        }
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
        $scope.property.value.nodeConditions.length) {
        for (let i = 0; i < $scope.property.value.nodeConditions.length; i++) {
            if ($scope.nodeConditionDisplay !== "")
                $scope.nodeConditionDisplay += " " + $scope.property.value.nodeConditions[i].combination + " " + $scope.property.value.nodeConditions[i].property + $scope.property.value.nodeConditions[i].condition + $scope.property.value.nodeConditions[i].value;
            else
                $scope.nodeConditionDisplay = $scope.property.value.nodeConditions[i].property + $scope.property.value.nodeConditions[i].condition + $scope.property.value.nodeConditions[i].value;

        }
    }
}];