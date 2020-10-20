<!doctype html>
<!--[if lt IE 7]>
<html class="no-js lt-ie9 lt-ie8 lt-ie7"> <![endif]-->
<!--[if IE 7]>
<html class="no-js lt-ie9 lt-ie8"> <![endif]-->
<!--[if IE 8]>
<html class="no-js lt-ie9"> <![endif]-->
<!--[if gt IE 8]><!-->
<html class="no-js"> <!--<![endif]-->
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>CPSS Application Modeling Tool</title>
    <meta name="description" content="">
    <meta name="viewport"
          content="initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, width=device-width">
    <!-- Place favicon.ico and apple-touch-icon.png in the root directory -->

    <link rel="Stylesheet" media="screen" href="editor-app/libs/ng-grid-2.0.7.min.css" type="text/css"/>
    <link rel="stylesheet" href="editor-app/libs/bootstrap_3.1.1/css/bootstrap.min.css"/>

    <link rel="Stylesheet" media="screen" href="editor-app/editor/css/editor.css" type="text/css"/>
    <link rel="stylesheet" href="editor-app/css/style.css" type="text/css"/>

    <link rel="stylesheet" href="editor-app/css/style-common.css">
    <link rel="stylesheet" href="editor-app/css/style-editor.css">
    <link rel="stylesheet" href="editor-app/css/bootstrap-select.min.css" type="text/css"/>
    <link rel="stylesheet" href="editor-app/css/animate.css" type="text/css"/>

    <#--    约束视图-->
    <link rel="stylesheet" href="constraint-viewer/css/font-awesome.min.css">
    <link rel="stylesheet" href="constraint-viewer/css/neo4jd3.min.css?v=0.0.1">
</head>
<body>

<div class="navbar navbar-fixed-top navbar-inverse" role="navigation" id="main-header">
    <div class="navbar-header">
        <a href="" ng-click="backToLanding()" class="navbar-brand">
            <span style="margin-left: 50px;">CPSS Application Modeling Tool</span></a>
    </div>
</div>

<!--[if lt IE 9]>
<div class="unsupported-browser">
    <p class="alert error">You are using an unsupported browser. Please upgrade your browser in order to use the
        editor.</p>
</div>
<![endif]-->

<div class="alert-wrapper" ng-cloak>
    <div class="alert fadein {{alerts.current.type}}" ng-show="alerts.current" ng-click="dismissAlert()">
        <i class="glyphicon"
           ng-class="{'glyphicon-ok': alerts.current.type == 'info', 'glyphicon-remove': alerts.current.type == 'error'}"></i>
        <span>{{alerts.current.message}}</span>

        <div class="pull-right" ng-show="alerts.queue.length > 0">
            <span class="badge">{{alerts.queue.length + 1}}</span>
        </div>
    </div>
</div>

<div id="main" class="wrapper full clearfix" ng-style="{height: window.height + 'px'}" ng-app="activitiModeler"
     ng-include="'editor-app/editor.html'">
</div>

<!--[if lt IE 9]>
<script src="editor-app/libs/es5-shim-15.3.4.5/es5-shim.js"></script>
<script src="editor-app/libs/json3_3.2.6/lib/json3.min.js"></script>
<![endif]-->

<script src="editor-app/libs/jquery_1.11.0/jquery.min.js"></script>
<script src="editor-app/libs/jquery-ui-1.10.3.custom.min.js"></script>

<script src="editor-app/libs/angular_1.2.13/angular.min.js"></script>
<script src="editor-app/libs/angular_1.2.13/angular-animate.min.js"></script>
<script src="editor-app/libs/bootstrap_3.1.1/js/bootstrap.min.js"></script>
<script src="editor-app/libs/angular-resource_1.2.13/angular-resource.min.js"></script>
<script src="editor-app/libs/angular-cookies_1.2.13/angular-cookies.min.js"></script>
<script src="editor-app/libs/angular-sanitize_1.2.13/angular-sanitize.min.js"></script>
<script src="editor-app/libs/angular-route_1.2.13/angular-route.min.js"></script>
<script src="editor-app/libs/angular-translate_2.4.2/angular-translate.min.js"></script>
<script src="editor-app/libs/angular-translate-storage-cookie/angular-translate-storage-cookie.js"></script>
<script src="editor-app/libs/angular-translate-loader-static-files/angular-translate-loader-static-files.js"></script>
<script src="editor-app/libs/angular-strap_2.0.5/angular-strap.min.js"></script>
<script src="editor-app/libs/angular-strap_2.0.5/angular-strap.tpl.min.js"></script>
<script src="editor-app/libs/momentjs_2.5.1/momentjs.min.js"></script>

<script src="editor-app/libs/ui-utils.min-0.0.4.js" type="text/javascript"></script>
<script src="editor-app/libs/ng-grid-2.0.7-min.js" type="text/javascript"></script>
<script src="editor-app/libs/angular-dragdrop.min-1.0.3.js" type="text/javascript"></script>
<script src="editor-app/libs/mousetrap-1.4.5.min.js" type="text/javascript"></script>
<script src="editor-app/libs/jquery.autogrow-textarea.js" type="text/javascript"></script>

<script src="editor-app/libs/path_parser.js" type="text/javascript"></script>

<script src="editor-app/libs/angular-scroll_0.5.7/angular-scroll.min.js" type="text/javascript"></script>
<script src="editor-app/libs/bootstrap-select/bootstrap-select.min.js" type="text/javascript"></script>

<script src="editor-app/libs/prototype-1.5.1.js" type="text/javascript"></script>

<!-- Configuration -->
<script src="editor-app/app-cfg.js?v=1"></script>
<script src="editor-app/editor-config.js" type="text/javascript"></script>
<script src="editor-app/configuration/url-config.js" type="text/javascript"></script>

<script src="editor-app/editor/i18n/translation_en_us.js" type="text/javascript"></script>
<script src="editor-app/editor/i18n/translation_signavio_en_us.js" type="text/javascript"></script>
<#--	<script src="editor-app/editor/oryx.debug.js" type="text/javascript"></script>-->
<#--	oryx -->
<script src="editor-app/editor/scripts/kickstart.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/clazz.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/config.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/erdfparser.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/datamanager.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/utils.js" type="text/javascript"></script>

<script src="editor-app/editor/scripts/Core/uiobject.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Core/abstractPlugin.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Core/abstractLayouter.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Core/abstractshape.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Core/bounds.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Core/canvas.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Core/command.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Core/shape.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Core/edge.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Core/node.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Core/svgDrag.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Core/main.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Core/viewer.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/signavio.js" type="text/javascript"></script>

<script src="editor-app/editor/scripts/Core/Controls/control.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Core/Controls/docker.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Core/Controls/magnet.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Core/Math/math.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Core/StencilSet/complexpropertyitem.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Core/StencilSet/property.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Core/StencilSet/propertyitem.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Core/StencilSet/rules.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Core/StencilSet/stencil.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Core/StencilSet/stencilset.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Core/StencilSet/stencilsets.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Core/SVG/editpathhandler.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Core/SVG/label.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Core/SVG/minmaxpathhandler.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Core/SVG/svgmarker.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Core/SVG/svgshape.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Core/SVG/pointspathhandler.js" type="text/javascript"></script>

<script src="editor-app/editor/scripts/Plugins/addDocker.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/addssextension.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/addstencilset.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/adHocCC.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/amlSupport.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/arrangement.js" type="text/javascript"></script>
<#--	<script src="editor-app/editor/scripts/Plugins/autoLayout.js" type="text/javascript"></script>-->
<script src="editor-app/editor/scripts/Plugins/bpel2bpmn.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/bpel4chor2bpelSupport.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/bpel4chorSupport.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/bpelLayout.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/bpelSupport.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/bpmn.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/bpmn11.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/bpmn2bpel.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/bpmn2dtrp-xmi.js" type="text/javascript"></script>
<#--	<script src="editor-app/editor/scripts/Plugins/bpmn2pn.js" type="text/javascript"></script>-->
<script src="editor-app/editor/scripts/Plugins/bpmn2xforms.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/bpmn2xhtml.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/bpmn2xpdl.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/bpmn2xpdl20.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/bpmnClearSodBodHighlights.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/bpmnLayouter.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/bpmnplus2bpel4chor.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/bpmnplusLayout.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/bpmnplusSerialization.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/bpmnResourceAssignment.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/bpmnResourcesBoDAdd.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/bpmnResourcesBoDShow.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/bpmnResourcesSoDAdd.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/bpmnResourcesSoDShow.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/canvasResize.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/cpnsupport.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/cpntoolsSupport.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/desynchronizabilityOverlay.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/dragDocker.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/dragdropresize.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/edit.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/enforceabilityOverlay.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/epc2bpmn.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/epcLayouter.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/epcSupport.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/erdfSupport.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/feedback.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/file.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/fileRepository.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/grouping.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/ibpmn2bpmn.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/jpdlSupport.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/jsonSupport.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/keysMove.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/loading.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/overlay.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/overlayexample.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/petrinet.js" type="text/javascript"></script>
<#--	<script src="editor-app/editor/scripts/Plugins/petriNetSoundnessChecker.js" type="text/javascript"></script>-->
<script src="editor-app/editor/scripts/Plugins/pluginLoader.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/pnmlexport.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/processLink.js" type="text/javascript"></script>
<#--	<script src="editor-app/editor/scripts/Plugins/propertywindow.js" type="text/javascript"></script>-->
<#--	<script src="editor-app/editor/scripts/Plugins/queryevaluator.js" type="text/javascript"></script>-->
<script src="editor-app/editor/scripts/Plugins/queryResultHighlighter.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/rdfExport.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/renameShapes.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/rowlayouting.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/selectionframe.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/selectssperspective.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/shapeHighlighting.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/shapemenu.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/shaperepository.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/simplepnmlexport.js" type="text/javascript"></script>
<#--	<script src="editor-app/editor/scripts/Plugins/stepThroughPlugin.js" type="text/javascript"></script>-->
<script src="editor-app/editor/scripts/Plugins/syntaxchecker.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/tbpmsupport.js" type="text/javascript"></script>
<#--	<script src="editor-app/editor/scripts/Plugins/toolbar.js" type="text/javascript"></script>-->
<script src="editor-app/editor/scripts/Plugins/transformationDownloadDialog.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/transformationDownloadDialogForBPEL4Chor.js"
        type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/treeGraphSupport.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/uml.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/undo.js" type="text/javascript"></script>
<#--	<script src="editor-app/editor/scripts/Plugins/validator.js" type="text/javascript"></script>-->
<script src="editor-app/editor/scripts/Plugins/view.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/workflownets.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/xforms.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/xformsexport.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/xformsexportorbeon.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/xformsimport.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/bpmn2.0/bpmn2.0.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/bpmn2.0/bpmn2.0choreography.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/bpmn2.0/bpmn2.0serialization.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/bpmn2.0/bpmn2conversation.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/general/feedbackPlugin.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/Layouter/containerLayouter.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/Plugins/Layouter/edgeLayouter.js" type="text/javascript"></script>
<script src="editor-app/editor/scripts/oryx.js" type="text/javascript"></script>
<#--	oryx -->

<script src="editor-app/app.js"></script>

<script src="editor-app/eventbus.js" type="text/javascript"></script>

<script src="editor-app/editor-controller.js" type="text/javascript"></script>
<script src="editor-app/stencil-controller-action-sequence.js" type="text/javascript"></script>
<script src="editor-app/stencil-controller-parameters-pool.js" type="text/javascript"></script>
<script src="editor-app/stencil-controller-connect.js" type="text/javascript"></script>
<script src="editor-app/stencil-controller-router.js" type="text/javascript"></script>
<script src="editor-app/stencil-controller-modal.js" type="text/javascript"></script>
<script src="editor-app/stencil-controller-UI.js" type="text/javascript"></script>
<script src="editor-app/stencil-controller-scene.js" type="text/javascript"></script>
<script src="editor-app/stencil-controller-worker.js" type="text/javascript"></script>
<script src="editor-app/stencil-controller-animation.js" type="text/javascript"></script>
<script src="editor-app/stencil-controller-dragdrop.js" type="text/javascript"></script>
<script src="editor-app/stencil-controller.js" type="text/javascript"></script>
<script src="editor-app/toolbar-controller.js" type="text/javascript"></script>
<script src="editor-app/header-controller.js" type="text/javascript"></script>
<script src="editor-app/select-shape-controller.js" type="text/javascript"></script>

<script src="editor-app/editor-utils.js" type="text/javascript"></script>
<script src="editor-app/configuration/toolbar-default-actions.js" type="text/javascript"></script>

<script src="editor-app/configuration/properties-default-controllers.js" type="text/javascript"></script>
<script src="editor-app/configuration/properties-execution-listeners-controller.js" type="text/javascript"></script>
<script src="editor-app/configuration/properties-event-listeners-controller.js" type="text/javascript"></script>
<script src="editor-app/configuration/properties-assignment-controller.js" type="text/javascript"></script>
<script src="editor-app/configuration/properties-fields-controller.js" type="text/javascript"></script>
<script src="editor-app/configuration/properties-form-properties-controller.js" type="text/javascript"></script>
<script src="editor-app/configuration/properties-in-parameters-controller.js" type="text/javascript"></script>
<script src="editor-app/configuration/properties-multiinstance-controller.js" type="text/javascript"></script>
<script src="editor-app/configuration/properties-out-parameters-controller.js" type="text/javascript"></script>
<script src="editor-app/configuration/properties-task-listeners-controller.js" type="text/javascript"></script>
<script src="editor-app/configuration/properties-sequenceflow-order-controller.js" type="text/javascript"></script>
<script src="editor-app/configuration/properties-condition-expression-controller.js" type="text/javascript"></script>
<script src="editor-app/configuration/properties-signal-definitions-controller.js" type="text/javascript"></script>
<script src="editor-app/configuration/properties-signal-scope-controller.js" type="text/javascript"></script>
<script src="editor-app/configuration/properties-message-definitions-controller.js" type="text/javascript"></script>
<script src="editor-app/configuration/properties-message-scope-controller.js" type="text/javascript"></script>
<script src="editor-app/configuration/properties-services-resource-action.js" type="text/javascript"></script>
<script src="editor-app/configuration/properties-services-controller_new.js" type="text/javascript"></script>
<script src="editor-app/configuration/properties-input-controller.js" type="text/javascript"></script>
<script src="editor-app/configuration/properties-output-controller.js" type="text/javascript"></script>
<script src="editor-app/configuration/properties-resources-controller.js" type="text/javascript"></script>
<script src="editor-app/configuration/properties-activity-element-controller.js" type="text/javascript"></script>
<script src="editor-app/configuration/properties-events-controller.js" type="text/javascript"></script>
<script src="editor-app/configuration/properties-update-controller.js" type="text/javascript"></script>
<script src="editor-app/configuration/toolbar.js" type="text/javascript"></script>
<script src="editor-app/configuration/toolbar-custom-actions.js" type="text/javascript"></script>

<script src="editor-app/configuration/properties.js" type="text/javascript"></script>
<script src="editor-app/configuration/properties-custom-controllers.js" type="text/javascript"></script>
<script src="editor-app/configuration/thing-get-or-leave-controllers.js" type="text/javascript"></script>
<script src="editor-app/configuration/properties-node-condition-controller.js" type="text/javascript"></script>
<script src="editor-app/popups/js/scene-create-controller.js" type="text/javascript"></script>
<script src="editor-app/popups/js/constraint-controller.js" type="text/javascript"></script>
<script src="editor-app/popups/js/entity-specific-properties-controller.js" type="text/javascript"></script>
<script src="editor-app/popups/js/select-control-node-type-controller.js" type="text/javascript"></script>
<script src="editor-app/popups/js/scene-line-node-condition-initial-controller.js" type="text/javascript"></script>
<script src="editor-app/configuration/properties-reference-entity-controller.js" type="text/javascript"></script>
<script src="editor-app/libs/html2canvas.js" type="text/javascript"></script>
<#--约束视图-->
<script src="constraint-viewer/js/d3.min.js"></script>
<script src="constraint-viewer/js/neo4jd3.js?v=0.0.1"></script>

<script type="text/javascript" src="https://unpkg.com/canvg@3.0.4/lib/umd.js"></script>
</body>
</html>
