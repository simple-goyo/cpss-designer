'use strict';
angular.module('activitiModeler')
    .AnimationClass = function ($rootScope, $scope){

    $scope.createCSSRulefromTemplate = function (type, direction) {
        var ruleFunction;
        switch (type) {
            // A -> B
            // 直线移动，从A点移动到B点
            case "linear":
                if (direction === "0") {
                    ruleFunction = function (from, to, ruleName) {
                        return "@keyframes " + ruleName + " {   0% { opacity: 0; transform: translate(" + from.x + "px, " + from.y + "px); }  100% { opacity: 1; transform: translate(" + to.x + "px, " + to.y + "px); }}";
                    };
                } else {
                    ruleFunction = function (from, to, ruleName) {
                        return "@keyframes " + ruleName + " {   0% { opacity: 0; transform: translate(" + to.x + "px, " + to.y + "px); }   100% { opacity: 1; transform: translate(" + from.x + "px, " + from.y + "px); }}";
                    };
                }
                break;
            case "flash":
                ruleFunction = function (ruleName) {
                    //return "@keyframes "+ruleName+" {  0% {    opacity: 0;    -webkit-transform: scale3d(0.3, 0.3, 0.3);    transform: scale3d(0.3, 0.3, 0.3);  }  50% {    opacity: 1;   }}"
                    return "@keyframes " + ruleName + " {  from,  50%,  to {    opacity: 1;  }  25%,  75% {    opacity: 0;  }}";
                };
                break;
            default:
                console.log("No such type!");
                break;
        }
        return ruleFunction;
    };

    $scope.buildCSSRule = function (p_stable, p_animate, type, direction, ruleName) {
        var ruleFunc;
        var r;
        if (ruleName === "") {
            ruleName = type;
        }
        switch (type) {
            case "linear":
                var offsetX = p_stable.x - Math.round(0.2 * (p_stable.x - p_animate.x));
                var offsetY = p_stable.y - Math.round(0.2 * (p_stable.y - p_animate.y));
                var distance = {x: offsetX, y: offsetY};

                ruleFunc = $scope.createCSSRulefromTemplate(type, direction);
                r = ruleFunc(p_animate, distance, ruleName);
                break;
            case "flash":
                ruleFunc = $scope.createCSSRulefromTemplate(type, direction);
                r = ruleFunc(ruleName);
                break;
            case "linear2":
                var offsetX = p_stable.x - Math.round(0.2 * (p_stable.x - p_animate.x));
                var offsetY = p_stable.y - Math.round(0.2 * (p_stable.y - p_animate.y));
                var distance = {x: offsetX, y: offsetY};

                ruleFunc = $scope.createCSSRulefromTemplate("linear", direction);
                r = ruleFunc(p_animate, distance, ruleName);
                break;
            default:
                console.log("No such type!");
                break;
        }
        console.log(r);
        return r;
    };

    $scope.playAnimation = function (selector, type, direction, pos_stable, pos_animation) {
        var style = document.styleSheets[7]; // 7==animate.css
        if (type === "" || type === undefined) {
            type = "linear";
        }
        var cssRuleName = type + Date.now() + parseInt(Math.random() * 100);

        var CSSKeyframeRule = $scope.buildCSSRule(pos_stable, pos_animation, type, direction, cssRuleName);
        var CSSStyleRule = "." + cssRuleName + " { -webkit-animation-name: " + cssRuleName + "; animation-name: " + cssRuleName + "; }";
        style.insertRule(CSSKeyframeRule);
        style.insertRule(CSSStyleRule);

        selector.attr("class", "stencils animated slow " + cssRuleName + " infinite");

        return cssRuleName;
    };

    $scope.stopAnimation = function (selector, delay, cssRuleName) {
        var style = document.styleSheets[7]; // 7==animate.css
        setTimeout(function () {
            selector.attr("class", "stencils");
            var index = 99999999;
            for (var i = 0; i < style.cssRules.length; i++) {
                if (style.cssRules[i].name === cssRuleName) {
                    index = i;
                    break;
                }
            }
            if (index < style.cssRules.length) {
                style.removeRule(index);
            }
            index = 99999999;
            for (i = 0; i < style.cssRules.length; i++) {
                if (style.cssRules[i].selectorText === "." + cssRuleName) {
                    index = i;
                    break;
                }
            }
            if (index < style.cssRules.length) {
                style.removeRule(index);
            }

        }, delay);
    };

    $scope.playShape = function () {
        setResource();
        return;

        // ----new----
        // get res from prop
        var propertylist = $scope.selectedItem.properties;

        var inputProp = $scope.getPropertybyKey(propertylist, "oryx-input");
        var outputProp = $scope.getPropertybyKey(propertylist, "oryx-output");
        var AEProp = $scope.getPropertybyKey(propertylist, "oryx-activityelement");
        var direction = $scope.getPropertybyKey(propertylist, "oryx-animate_direction");

        // create jquery selector
        var inputPropSel = jQuery("#" + inputProp.id).parent().parent();
        var outputPropSel = jQuery("#" + outputProp.id).parent().parent();
        var AEPropSel = jQuery("#" + AEProp.id).parent().parent();

        // get animation resource position
        var pos_input = $scope.getPositionbyselector(inputPropSel);
        var pos_output = $scope.getPositionbyselector(outputPropSel);
        var pos_AE = $scope.getPositionbyselector(AEPropSel);
        var cssRuleName;
        // play
        // ----new----
        var playTime = 0;
        if (AEProp.type !== "工人") {
            for (var i = 0; i < 10; i++) {

                if (inputPropSel.length !== 0) {
                    setTimeout(function () {
                        cssRuleName = $scope.playAnimation(inputPropSel, "linear", "0", pos_AE, pos_input);
                        $scope.stopAnimation(inputPropSel, 1500, cssRuleName);
                    }, playTime);
                    playTime += 1000;
                }
                setTimeout(function () {
                    cssRuleName = $scope.playAnimation(AEPropSel, "flash", "0", pos_AE, pos_AE);
                    $scope.stopAnimation(inputPropSel, 1500, cssRuleName);
                }, playTime);
                playTime += 1500;
                if (outputPropSel.length !== 0) {
                    setTimeout(function () {
                        cssRuleName = $scope.playAnimation(outputPropSel, "linear", "1", pos_AE, pos_output);
                        $scope.stopAnimation(inputPropSel, 1500, cssRuleName);
                    }, playTime);

                }

            }
        } else {
            if (direction === "0") {
                // 众包取东西
                // 0.订单输入？,1.人闪两下,2.人前往目标位置，3.人取东西；4.人携带东西回到原来位置
                // AE: 人；    input：指令；    output： 取的东西
                // step0
                cssRuleName = $scope.playAnimation(inputPropSel, "linear", "0", pos_AE, pos_input);
                $scope.stopAnimation(inputPropSel, 1500);
                // step1
                cssRuleName = $scope.playAnimation(AEPropSel, "flash", "0", pos_AE, pos_AE);
                $scope.stopAnimation(AEPropSel, 1500);
                // step2
                setTimeout(function () {
                    cssRuleName = $scope.playAnimation(AEPropSel, "linear2", "0", pos_output, pos_AE);
                    $scope.stopAnimation(AEPropSel, 1500);
                }, 2000);

                // step3
                setTimeout(function () {
                    cssRuleName = $scope.playAnimation(outputPropSel, "flash", "0", pos_output, pos_output);
                    $scope.stopAnimation(outputPropSel, 1500);
                }, 3000);

                // step4
                setTimeout(function () {
                    var obj_pos_output = {x: pos_output.x, y: pos_output.y};
                    var obj_pos_AE = {x: pos_AE.x, y: pos_AE.y};
                    if (pos_output.x - 40 > 0) {
                        obj_pos_output.x -= 40;
                        obj_pos_AE.x -= 40;
                    }
                    var cssRuleName1 = $scope.playAnimation(AEPropSel, "linear", "1", pos_output, pos_AE);
                    var cssRuleName2 = $scope.playAnimation(outputPropSel, "linear", "1", obj_pos_output, obj_pos_AE);

                    $scope.stopAnimation(AEPropSel, 2000, cssRuleName1);
                    $scope.stopAnimation(outputPropSel, 2000, cssRuleName2);
                }, 5500);
            } else {
                // 众包送东西
                // 1. 人闪两下；2.人携带东西到目标位置
                // step1
                setTimeout(function () {
                    cssRuleName = $scope.playAnimation(AEPropSel, "flash", "0", pos_AE, pos_AE);
                    $scope.stopAnimation(AEPropSel, 1500, cssRuleName);
                }, playTime);
                playTime += 2000;

                // step2
                setTimeout(function () {
                    cssRuleName = $scope.playAnimation(AEPropSel, "linear2", "0", pos_output, pos_AE);
                    $scope.stopAnimation(AEPropSel, 1500, cssRuleName);
                }, playTime);

            }


        }

        //隐藏与动作无关的其他内容
        var selectItemId = $scope.editor.getSelection()[0].id;
        var shapes = [$scope.editor.getCanvas()][0].children;
        for (var i = 0; i < shapes.length; i++) {
            var shapeId = shapes[i].id;
            if (shapeId !== selectItemId
                && shapeId !== inputProp.id
                && shapeId !== outputProp.id
                && shapeId !== AEProp.id) {
                jQuery('#' + shapeId).parent().parent().attr("display", "none");
            }
        }

        //让内容全部显示
        setTimeout(function () {
            for (var i = 0; i < shapes.length; i++) {
                jQuery('#' + shapes[i].id).parent().parent().attr("display", "");
            }
        }, 9000);

    };

    $scope.newPlayShape = function () {
        // var propertylist = $scope.selectedItem.properties;
        var propertylist = $scope.getHighlightedShape().properties;
        var AEProp = $scope.getPropertybyKey(propertylist, "oryx-activityelement");
        var AEPropSel = jQuery("#" + AEProp.id).parent().parent();

        var pos_AE = $scope.getPositionbyselector(AEPropSel);
        setTimeout(function () {
            var cssRuleName = $scope.playAnimation(AEPropSel, "flash", "0", pos_AE, pos_AE);
            $scope.stopAnimation(AEPropSel, 1500, cssRuleName);
        }, 100);
    };
};
