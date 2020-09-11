/**
 * @author martin.czuchra
 */
if(!ORYX) var ORYX = {};

if(!ORYX.CONFIG) ORYX.CONFIG = {};

//This is usually the name of the war file!
//ORYX.CONFIG.ROOT_PATH =					"/oryx/";
// ORYX.CONFIG.ROOT_PATH =					"/editor/";
// ORYX.CONFIG.WEB_URL = "http://oryx-project.org";
//
// ORYX.CONFIG.VERSION_URL =				ORYX.CONFIG.ROOT_PATH + "VERSION";
// ORYX.CONFIG.LICENSE_URL =				ORYX.CONFIG.ROOT_PATH + "LICENSE";
//
// ORYX.CONFIG.SERVER_HANDLER_ROOT = 		"service";
//
// ORYX.CONFIG.STENCILSET_HANDLER = 		ORYX.CONFIG.SERVER_HANDLER_ROOT + "";
//
// 	/* Editor-Mode */
// ORYX.CONFIG.MODE_READONLY =				"readonly";
// ORYX.CONFIG.MODE_FULLSCREEN =			"fullscreen";
//
//
// 	/* Show grid line while dragging */
// ORYX.CONFIG.SHOW_GRIDLINE = true;
// ORYX.CONFIG.DISABLE_GRADIENT = true;
//
// 	/* Plugins */
// ORYX.CONFIG.PLUGINS_ENABLED =			true;
// ORYX.CONFIG.PLUGINS_CONFIG =			ORYX.CONFIG.ROOT_PATH + "plugins.xml";
// ORYX.CONFIG.PROFILE_PATH =				ORYX.CONFIG.ROOT_PATH + "profiles/";
// ORYX.CONFIG.PLUGINS_FOLDER =			"Plugins/";
// ORYX.CONFIG.PDF_EXPORT_URL =			ORYX.CONFIG.ROOT_PATH + "pdf";
// ORYX.CONFIG.PNML_EXPORT_URL =			ORYX.CONFIG.ROOT_PATH + "pnml";
// ORYX.CONFIG.SIMPLE_PNML_EXPORT_URL =	ORYX.CONFIG.ROOT_PATH + "simplepnmlexporter";
// ORYX.CONFIG.DESYNCHRONIZABILITY_URL =	ORYX.CONFIG.ROOT_PATH + "desynchronizability";
// ORYX.CONFIG.IBPMN2BPMN_URL =			ORYX.CONFIG.ROOT_PATH + "ibpmn2bpmn";
// ORYX.CONFIG.QUERYEVAL_URL =             ORYX.CONFIG.ROOT_PATH + "query";
// ORYX.CONFIG.SYNTAXCHECKER_URL =			ORYX.CONFIG.ROOT_PATH + "syntaxchecker";
// ORYX.CONFIG.VALIDATOR_URL =				ORYX.CONFIG.ROOT_PATH + "validator";
// ORYX.CONFIG.AUTO_LAYOUTER_URL =			ORYX.CONFIG.ROOT_PATH + "layouter";
// ORYX.CONFIG.SS_EXTENSIONS_FOLDER =		ORYX.CONFIG.ROOT_PATH + "stencilsets/extensions/";
// ORYX.CONFIG.SS_EXTENSIONS_CONFIG =		ORYX.CONFIG.ROOT_PATH + "stencilsets/extensions/extensions.json";
// ORYX.CONFIG.ORYX_NEW_URL =				"/new";
// ORYX.CONFIG.STEP_THROUGH =				ORYX.CONFIG.ROOT_PATH + "stepthrough";
// ORYX.CONFIG.STEP_THROUGH_CHECKER =		ORYX.CONFIG.ROOT_PATH + "stepthroughchecker";
// ORYX.CONFIG.XFORMS_EXPORT_URL =			ORYX.CONFIG.ROOT_PATH + "xformsexport";
// ORYX.CONFIG.XFORMS_EXPORT_ORBEON_URL =	ORYX.CONFIG.ROOT_PATH + "xformsexport-orbeon";
// ORYX.CONFIG.XFORMS_IMPORT_URL =			ORYX.CONFIG.ROOT_PATH + "xformsimport";
// ORYX.CONFIG.BPEL_EXPORT_URL =			ORYX.CONFIG.ROOT_PATH + "bpelexporter";
// ORYX.CONFIG.BPEL4CHOR_EXPORT_URL =		ORYX.CONFIG.ROOT_PATH + "bpel4chorexporter";
// ORYX.CONFIG.BPEL4CHOR2BPEL_EXPORT_URL =	ORYX.CONFIG.ROOT_PATH + "bpel4chor2bpelexporter";
// ORYX.CONFIG.TREEGRAPH_SUPPORT =			ORYX.CONFIG.ROOT_PATH + "treegraphsupport";
// ORYX.CONFIG.XPDL4CHOR2BPEL4CHOR_TRANSFORMATION_URL = ORYX.CONFIG.ROOT_PATH + "xpdl4chor2bpel4chor";
// ORYX.CONFIG.RESOURCE_LIST =				ORYX.CONFIG.ROOT_PATH + "resourceList";
// ORYX.CONFIG.BPMN_LAYOUTER =				ORYX.CONFIG.ROOT_PATH + "bpmnlayouter";
// ORYX.CONFIG.EPC_LAYOUTER =				ORYX.CONFIG.ROOT_PATH + "epclayouter";
// ORYX.CONFIG.BPMN2MIGRATION =			ORYX.CONFIG.ROOT_PATH + "bpmn2migration";
// ORYX.CONFIG.BPMN20_SCHEMA_VALIDATION_ON = true;
// ORYX.CONFIG.JPDLIMPORTURL =				ORYX.CONFIG.ROOT_PATH + "jpdlimporter";
// ORYX.CONFIG.JPDLEXPORTURL =				ORYX.CONFIG.ROOT_PATH + "jpdlexporter";
// ORYX.CONFIG.CPNTOOLSEXPORTER = 			ORYX.CONFIG.ROOT_PATH + "cpntoolsexporter";
// ORYX.CONFIG.CPNTOOLSIMPORTER = 			ORYX.CONFIG.ROOT_PATH + "cpntoolsimporter";
// ORYX.CONFIG.BPMN2XPDLPATH =				ORYX.CONFIG.ROOT_PATH + "bpmn2xpdl";
// ORYX.CONFIG.TBPMIMPORT =				ORYX.CONFIG.ROOT_PATH + "tbpmimport";
//
//
// 	/* Namespaces */
// ORYX.CONFIG.NAMESPACE_ORYX =			"http://www.b3mn.org/oryx";
// ORYX.CONFIG.NAMESPACE_SVG =				"http://www.w3.org/2000/svg";
//
// 	/* UI */
// ORYX.CONFIG.CANVAS_WIDTH =				1485;
// ORYX.CONFIG.CANVAS_HEIGHT =				1050;
// ORYX.CONFIG.CANVAS_RESIZE_INTERVAL =	300;
// ORYX.CONFIG.SELECTED_AREA_PADDING =		4;
// ORYX.CONFIG.CANVAS_BACKGROUND_COLOR =	"none";
// ORYX.CONFIG.GRID_DISTANCE =				30;
// ORYX.CONFIG.GRID_ENABLED =				true;
// ORYX.CONFIG.ZOOM_OFFSET =				0.1;
// ORYX.CONFIG.DEFAULT_SHAPE_MARGIN =		60;
// ORYX.CONFIG.SCALERS_SIZE =				7;
// ORYX.CONFIG.MINIMUM_SIZE =				20;
// ORYX.CONFIG.MAXIMUM_SIZE =				10000;
// ORYX.CONFIG.OFFSET_MAGNET =				15;
// ORYX.CONFIG.OFFSET_EDGE_LABEL_TOP =		14;
// ORYX.CONFIG.OFFSET_EDGE_LABEL_BOTTOM =	12;
// ORYX.CONFIG.OFFSET_EDGE_BOUNDS =		5;
// ORYX.CONFIG.COPY_MOVE_OFFSET =			30;
// ORYX.CONFIG.SHOW_GRIDLINE =             true;
//
// ORYX.CONFIG.BORDER_OFFSET =				14;
//
// ORYX.CONFIG.MAX_NUM_SHAPES_NO_GROUP	=	13;
//
// ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER = 30;
// ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET = 45;
//
// 	/* Shape-Menu Align */
// ORYX.CONFIG.SHAPEMENU_RIGHT =			"Oryx_Right";
// ORYX.CONFIG.SHAPEMENU_BOTTOM =			"Oryx_Bottom";
// ORYX.CONFIG.SHAPEMENU_LEFT =			"Oryx_Left";
// ORYX.CONFIG.SHAPEMENU_TOP =				"Oryx_Top";
//
// 	/* Morph-Menu Item */
// ORYX.CONFIG.MORPHITEM_DISABLED =		"Oryx_MorphItem_disabled";
//
// 	/* Property type names */
// ORYX.CONFIG.TYPE_STRING =				"string";
// ORYX.CONFIG.TYPE_BOOLEAN =				"boolean";
// ORYX.CONFIG.TYPE_INTEGER =				"integer";
// ORYX.CONFIG.TYPE_FLOAT =				"float";
// ORYX.CONFIG.TYPE_COLOR =				"color";
// ORYX.CONFIG.TYPE_DATE =					"date";
// ORYX.CONFIG.TYPE_CHOICE =				"choice";
// ORYX.CONFIG.TYPE_URL =					"url";
// ORYX.CONFIG.TYPE_DIAGRAM_LINK =			"diagramlink";
// ORYX.CONFIG.TYPE_COMPLEX =				"complex";
// ORYX.CONFIG.TYPE_TEXT =					"text";
//
// 	/* Vertical line distance of multiline labels */
// ORYX.CONFIG.LABEL_LINE_DISTANCE =		2;
// ORYX.CONFIG.LABEL_DEFAULT_LINE_HEIGHT =	12;
//
// ORYX.CONFIG.ENABLE_MORPHMENU_BY_HOVER = true;
//
// 	/* Editor constants come here */
// ORYX.CONFIG.EDITOR_ALIGN_BOTTOM =		0x01;
// ORYX.CONFIG.EDITOR_ALIGN_MIDDLE =		0x02;
// ORYX.CONFIG.EDITOR_ALIGN_TOP =			0x04;
// ORYX.CONFIG.EDITOR_ALIGN_LEFT =			0x08;
// ORYX.CONFIG.EDITOR_ALIGN_CENTER =		0x10;
// ORYX.CONFIG.EDITOR_ALIGN_RIGHT =		0x20;
// ORYX.CONFIG.EDITOR_ALIGN_SIZE =			0x30;
//
// 	/* Event types */
// ORYX.CONFIG.EVENT_MOUSEDOWN =			"mousedown";
// ORYX.CONFIG.EVENT_MOUSEUP =				"mouseup";
// ORYX.CONFIG.EVENT_MOUSEOVER =			"mouseover";
// ORYX.CONFIG.EVENT_MOUSEOUT =			"mouseout";
// ORYX.CONFIG.EVENT_MOUSEMOVE =			"mousemove";
// ORYX.CONFIG.EVENT_DBLCLICK =			"dblclick";
// ORYX.CONFIG.EVENT_KEYDOWN =				"keydown";
// ORYX.CONFIG.EVENT_KEYUP =				"keyup";
//
// ORYX.CONFIG.EVENT_LOADED =				"editorloaded";
//
// ORYX.CONFIG.EVENT_EXECUTE_COMMANDS =		"executeCommands";
// ORYX.CONFIG.EVENT_STENCIL_SET_LOADED =		"stencilSetLoaded";
// ORYX.CONFIG.EVENT_SELECTION_CHANGED =		"selectionchanged";
// ORYX.CONFIG.EVENT_SHAPEADDED =				"shapeadded";
// ORYX.CONFIG.EVENT_PROPERTY_CHANGED =		"propertyChanged";
// ORYX.CONFIG.EVENT_DRAGDROP_START =			"dragdrop.start";
// ORYX.CONFIG.EVENT_SHAPE_MENU_CLOSE =		"shape.menu.close";
// ORYX.CONFIG.EVENT_DRAGDROP_END =			"dragdrop.end";
// ORYX.CONFIG.EVENT_RESIZE_START =			"resize.start";
// ORYX.CONFIG.EVENT_RESIZE_END =				"resize.end";
// ORYX.CONFIG.EVENT_DRAGDOCKER_DOCKED =		"dragDocker.docked";
// ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW =			"highlight.showHighlight";
// ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE =			"highlight.hideHighlight";
// ORYX.CONFIG.EVENT_LOADING_ENABLE =			"loading.enable";
// ORYX.CONFIG.EVENT_LOADING_DISABLE =			"loading.disable";
// ORYX.CONFIG.EVENT_LOADING_STATUS =			"loading.status";
// ORYX.CONFIG.EVENT_OVERLAY_SHOW =			"overlay.show";
// ORYX.CONFIG.EVENT_OVERLAY_HIDE =			"overlay.hide";
// ORYX.CONFIG.EVENT_ARRANGEMENT_TOP =			"arrangement.setToTop";
// ORYX.CONFIG.EVENT_ARRANGEMENT_BACK =		"arrangement.setToBack";
// ORYX.CONFIG.EVENT_ARRANGEMENT_FORWARD =		"arrangement.setForward";
// ORYX.CONFIG.EVENT_ARRANGEMENT_BACKWARD =	"arrangement.setBackward";
// ORYX.CONFIG.EVENT_PROPWINDOW_PROP_CHANGED =	"propertyWindow.propertyChanged";
// ORYX.CONFIG.EVENT_LAYOUT_ROWS =				"layout.rows";
// ORYX.CONFIG.EVENT_LAYOUT_BPEL =				"layout.BPEL";
// ORYX.CONFIG.EVENT_LAYOUT_BPEL_VERTICAL =    "layout.BPEL.vertical";
// ORYX.CONFIG.EVENT_LAYOUT_BPEL_HORIZONTAL =  "layout.BPEL.horizontal";
// ORYX.CONFIG.EVENT_LAYOUT_BPEL_SINGLECHILD = "layout.BPEL.singlechild";
// ORYX.CONFIG.EVENT_LAYOUT_BPEL_AUTORESIZE =	"layout.BPEL.autoresize";
// ORYX.CONFIG.EVENT_AUTOLAYOUT_LAYOUT =		"autolayout.layout";
// ORYX.CONFIG.EVENT_UNDO_EXECUTE =			"undo.execute";
// ORYX.CONFIG.EVENT_UNDO_ROLLBACK =			"undo.rollback";
// ORYX.CONFIG.EVENT_BUTTON_UPDATE =           "toolbar.button.update";
// ORYX.CONFIG.EVENT_LAYOUT = 					"layout.dolayout";
// ORYX.CONFIG.EVENT_COLOR_CHANGE = 			"color.change";
//
// ORYX.CONFIG.EVENT_SHOW_PROPERTYWINDOW =		"propertywindow.show";
//
// 	/* Selection Shapes Highlights */
// ORYX.CONFIG.SELECTION_HIGHLIGHT_SIZE =				5;
// ORYX.CONFIG.SELECTION_HIGHLIGHT_COLOR =				"#4444FF";
// ORYX.CONFIG.SELECTION_HIGHLIGHT_COLOR2 =			"#9999FF";
//
// ORYX.CONFIG.SELECTION_HIGHLIGHT_STYLE_CORNER = 		"corner";
// ORYX.CONFIG.SELECTION_HIGHLIGHT_STYLE_RECTANGLE = 	"rectangle";
//
// ORYX.CONFIG.SELECTION_VALID_COLOR =					"#00FF00";
// ORYX.CONFIG.SELECTION_INVALID_COLOR =				"#FF0000";
//
//
// ORYX.CONFIG.DOCKER_DOCKED_COLOR =		"#00FF00";
// ORYX.CONFIG.DOCKER_UNDOCKED_COLOR =		"#FF0000";
// ORYX.CONFIG.DOCKER_SNAP_OFFSET =		10;
//
// 	/* Copy & Paste */
// ORYX.CONFIG.EDIT_OFFSET_PASTE =			10;
//
// 	/* Key-Codes */
// ORYX.CONFIG.KEY_CODE_X = 				88;
// ORYX.CONFIG.KEY_CODE_C = 				67;
// ORYX.CONFIG.KEY_CODE_V = 				86;
// ORYX.CONFIG.KEY_CODE_DELETE = 			46;
// ORYX.CONFIG.KEY_CODE_META =				224;
// ORYX.CONFIG.KEY_CODE_BACKSPACE =		8;
// ORYX.CONFIG.KEY_CODE_LEFT =				37;
// ORYX.CONFIG.KEY_CODE_RIGHT =			39;
// ORYX.CONFIG.KEY_CODE_UP =				38;
// ORYX.CONFIG.KEY_CODE_DOWN =				40;
//
// 	// TODO Determine where the lowercase constants are still used and remove them from here.
// ORYX.CONFIG.KEY_Code_enter =			12;
// ORYX.CONFIG.KEY_Code_left =				37;
// ORYX.CONFIG.KEY_Code_right =			39;
// ORYX.CONFIG.KEY_Code_top =				38;
// ORYX.CONFIG.KEY_Code_bottom =			40;
//
// /* Supported Meta Keys */
//
// ORYX.CONFIG.META_KEY_META_CTRL = 		"metactrl";
// ORYX.CONFIG.META_KEY_ALT = 				"alt";
// ORYX.CONFIG.META_KEY_SHIFT = 			"shift";
//
// /* Key Actions */
//
// ORYX.CONFIG.KEY_ACTION_DOWN = 			"down";
// ORYX.CONFIG.KEY_ACTION_UP = 			"up";


ORYX.CONFIG.ROOT_PATH =					"editor/"; //TODO: Remove last slash!!
ORYX.CONFIG.EXPLORER_PATH =				"explorer";
ORYX.CONFIG.LIBS_PATH =					"libs";

/**
 * Regular Config
 */
ORYX.CONFIG.SERVER_HANDLER_ROOT = 			"service";
ORYX.CONFIG.SERVER_EDITOR_HANDLER =			ORYX.CONFIG.SERVER_HANDLER_ROOT + "/editor";
ORYX.CONFIG.SERVER_MODEL_HANDLER =			ORYX.CONFIG.SERVER_HANDLER_ROOT + "/model";
ORYX.CONFIG.STENCILSET_HANDLER = 			ORYX.CONFIG.SERVER_HANDLER_ROOT + "/editor/stencilset?embedsvg=true&url=true&namespace=";
ORYX.CONFIG.STENCIL_SETS_URL = 				ORYX.CONFIG.SERVER_HANDLER_ROOT + "/editor/stencilset";

ORYX.CONFIG.PLUGINS_CONFIG =				"editor-app/plugins.xml";
ORYX.CONFIG.SYNTAXCHECKER_URL =				ORYX.CONFIG.SERVER_HANDLER_ROOT + "/syntaxchecker";
ORYX.CONFIG.DEPLOY_URL = 					ORYX.CONFIG.SERVER_HANDLER_ROOT + "/model/deploy";
ORYX.CONFIG.MODEL_LIST_URL = 				ORYX.CONFIG.SERVER_HANDLER_ROOT + "/models";
ORYX.CONFIG.FORM_FLOW_LIST_URL = 			ORYX.CONFIG.SERVER_HANDLER_ROOT + "/formflows";
ORYX.CONFIG.FORM_FLOW_IMAGE_URL = 			ORYX.CONFIG.SERVER_HANDLER_ROOT + "/formflow";
ORYX.CONFIG.FORM_LIST_URL = 				ORYX.CONFIG.SERVER_HANDLER_ROOT + "/forms";
ORYX.CONFIG.FORM_IMAGE_URL = 				ORYX.CONFIG.SERVER_HANDLER_ROOT + "/form";
ORYX.CONFIG.SUB_PROCESS_LIST_URL = 			ORYX.CONFIG.SERVER_HANDLER_ROOT + "/subprocesses";
ORYX.CONFIG.SUB_PROCESS_IMAGE_URL = 		ORYX.CONFIG.SERVER_HANDLER_ROOT + "/subprocess";
ORYX.CONFIG.TEST_SERVICE_URL = 				ORYX.CONFIG.SERVER_HANDLER_ROOT + "/service/";

ORYX.CONFIG.SERVICE_LIST_URL = 				ORYX.CONFIG.SERVER_HANDLER_ROOT + "/services";
ORYX.CONFIG.CONDITION_ELEMENT_LIST_URL = 	ORYX.CONFIG.SERVER_HANDLER_ROOT + "/conditionelements";
ORYX.CONFIG.VARIABLEDEF_ELEMENT_LIST_URL = 	ORYX.CONFIG.SERVER_HANDLER_ROOT + "/variabledefinitionelements";
ORYX.CONFIG.VALIDATOR_LIST_URL = 			ORYX.CONFIG.SERVER_HANDLER_ROOT + "/validators";

ORYX.CONFIG.SS_EXTENSIONS_FOLDER =			ORYX.CONFIG.ROOT_PATH + "stencilsets/extensions/";
ORYX.CONFIG.SS_EXTENSIONS_CONFIG =			ORYX.CONFIG.SERVER_HANDLER_ROOT + "/editor_ssextensions";
ORYX.CONFIG.ORYX_NEW_URL =					"/new";
ORYX.CONFIG.BPMN_LAYOUTER =					ORYX.CONFIG.ROOT_PATH + "bpmnlayouter";

ORYX.CONFIG.EXPRESSION_METADATA_URL = 			ORYX.CONFIG.SERVER_HANDLER_ROOT + "/expression-metadata";
ORYX.CONFIG.DATASOURCE_METADATA_URL = 			ORYX.CONFIG.SERVER_HANDLER_ROOT + "/datasource-metadata";
ORYX.CONFIG.BACKEND_SWITCH 		= 		true;
ORYX.CONFIG.PANEL_LEFT_WIDTH 	= 		250;
ORYX.CONFIG.PANEL_RIGHT_COLLAPSED 	= 	true;
ORYX.CONFIG.PANEL_RIGHT_WIDTH	= 		300;
ORYX.CONFIG.APPNAME = 					'KISBPM';
ORYX.CONFIG.WEB_URL = 					".";

ORYX.CONFIG.BLANK_IMAGE = ORYX.CONFIG.LIBS_PATH + '/ext-2.0.2/resources/images/default/s.gif';

/* Specify offset of header */
ORYX.CONFIG.OFFSET_HEADER = 61;

/* Show grid line while dragging */
ORYX.CONFIG.SHOW_GRIDLINE = 			true;

/* Editor-Mode */
ORYX.CONFIG.MODE_READONLY =				"readonly";
ORYX.CONFIG.MODE_FULLSCREEN =			"fullscreen";
ORYX.CONFIG.WINDOW_HEIGHT = 			800;
ORYX.CONFIG.PREVENT_LOADINGMASK_AT_READY = false;

/* Plugins */
ORYX.CONFIG.PLUGINS_ENABLED =			true;
ORYX.CONFIG.PLUGINS_FOLDER =			"Plugins/";

ORYX.CONFIG.BPMN20_SCHEMA_VALIDATION_ON = true;

/* Namespaces */
ORYX.CONFIG.NAMESPACE_ORYX =			"http://www.b3mn.org/oryx";
ORYX.CONFIG.NAMESPACE_SVG =				"http://www.w3.org/2000/svg";
ORYX.CONFIG.NAMESPACE_STENCILSET =  	"http://b3mn.org/stencilset/bpmn2.0#";

/* UI */
ORYX.CONFIG.CANVAS_WIDTH =				1200;
ORYX.CONFIG.CANVAS_HEIGHT =				800;
ORYX.CONFIG.CANVAS_RESIZE_INTERVAL =	100;
ORYX.CONFIG.CANVAS_MIN_WIDTH =  800;
ORYX.CONFIG.CANVAS_MIN_HEIGHT =  300;
ORYX.CONFIG.SELECTED_AREA_PADDING =		4;
ORYX.CONFIG.CANVAS_BACKGROUND_COLOR =	"none";
ORYX.CONFIG.GRID_DISTANCE =				30;
ORYX.CONFIG.GRID_ENABLED =				true;
ORYX.CONFIG.ZOOM_OFFSET =				0.1;
ORYX.CONFIG.DEFAULT_SHAPE_MARGIN =		60;
ORYX.CONFIG.SCALERS_SIZE =				7;
ORYX.CONFIG.MINIMUM_SIZE =				20;
ORYX.CONFIG.MAXIMUM_SIZE =				10000;
ORYX.CONFIG.OFFSET_MAGNET =				15;
ORYX.CONFIG.OFFSET_EDGE_LABEL_TOP =		8;
ORYX.CONFIG.OFFSET_EDGE_LABEL_BOTTOM =	8;
ORYX.CONFIG.OFFSET_EDGE_BOUNDS =		5;
ORYX.CONFIG.COPY_MOVE_OFFSET =			30;

ORYX.CONFIG.BORDER_OFFSET =				14;

ORYX.CONFIG.MAX_NUM_SHAPES_NO_GROUP	=	20; // Updated so the form editor shows all elements at once

ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER = 30;
ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET = 45;
ORYX.CONFIG.SHOW_ACTION_SPACE_WIDTH=160;

/* Shape-Menu Align */
ORYX.CONFIG.SHAPEMENU_RIGHT =			"Oryx_Right";
ORYX.CONFIG.SHAPEMENU_BOTTOM =			"Oryx_Bottom";
ORYX.CONFIG.SHAPEMENU_LEFT =			"Oryx_Left";
ORYX.CONFIG.SHAPEMENU_TOP =				"Oryx_Top";


/* Morph-Menu Item */
ORYX.CONFIG.MORPHITEM_DISABLED =		"Oryx_MorphItem_disabled";

/* Property type names */
ORYX.CONFIG.TYPE_STRING =				"string";
ORYX.CONFIG.TYPE_BOOLEAN =				"boolean";
ORYX.CONFIG.TYPE_INTEGER =				"integer";
ORYX.CONFIG.TYPE_FLOAT =				"float";
ORYX.CONFIG.TYPE_COLOR =				"color";
ORYX.CONFIG.TYPE_DATE =					"date";
ORYX.CONFIG.TYPE_CHOICE =				"choice";
ORYX.CONFIG.TYPE_URL =					"url";
ORYX.CONFIG.TYPE_DIAGRAM_LINK =			"diagramlink";
ORYX.CONFIG.TYPE_COMPLEX =				"complex";
ORYX.CONFIG.TYPE_MULTIPLECOMPLEX =		"multiplecomplex";
ORYX.CONFIG.TYPE_TEXT =					"text";
ORYX.CONFIG.TYPE_KISBPM_MULTIINSTANCE =	"kisbpm-multiinstance";
ORYX.CONFIG.TYPE_MODEL_LINK =			"modellink";
ORYX.CONFIG.TYPE_FORM_FLOW_LINK =		"formflowlink";
ORYX.CONFIG.TYPE_FORM_LINK =			"formlink";
ORYX.CONFIG.TYPE_SUB_PROCESS_LINK =		"subprocesslink";
ORYX.CONFIG.TYPE_SERVICE_LINK =			"servicelink";
ORYX.CONFIG.TYPE_CONDITIONS =			"conditions";
ORYX.CONFIG.TYPE_VARIABLES = 			"variables";
ORYX.CONFIG.TYPE_LISTENER =				"listener";
ORYX.CONFIG.TYPE_EPC_FREQ = 			"epcfrequency";
ORYX.CONFIG.TYPE_GLOSSARY_LINK =		"glossarylink";
ORYX.CONFIG.TYPE_EXPRESSION = 			"expression";
ORYX.CONFIG.TYPE_DATASOURCE = 			"datasource";
ORYX.CONFIG.TYPE_DATASOURCE_MINIMAL =	"datasource-minimal";
ORYX.CONFIG.TYPE_VALIDATORS =			"validators";


/* Vertical line distance of multiline labels */
ORYX.CONFIG.LABEL_LINE_DISTANCE =		2;
ORYX.CONFIG.LABEL_DEFAULT_LINE_HEIGHT =	12;

/* Open Morph Menu with Hover */
ORYX.CONFIG.ENABLE_MORPHMENU_BY_HOVER = false;


/* Editor constants come here */
ORYX.CONFIG.EDITOR_ALIGN_BOTTOM =		0x01;
ORYX.CONFIG.EDITOR_ALIGN_MIDDLE =		0x02;
ORYX.CONFIG.EDITOR_ALIGN_TOP =			0x04;
ORYX.CONFIG.EDITOR_ALIGN_LEFT =			0x08;
ORYX.CONFIG.EDITOR_ALIGN_CENTER =		0x10;
ORYX.CONFIG.EDITOR_ALIGN_RIGHT =		0x20;
ORYX.CONFIG.EDITOR_ALIGN_SIZE =			0x30;

/* Event types */
ORYX.CONFIG.EVENT_MOUSEDOWN =			"mousedown";
ORYX.CONFIG.EVENT_MOUSEUP =				"mouseup";
ORYX.CONFIG.EVENT_MOUSEOVER =			"mouseover";
ORYX.CONFIG.EVENT_MOUSEOUT =			"mouseout";
ORYX.CONFIG.EVENT_MOUSEMOVE =			"mousemove";
ORYX.CONFIG.EVENT_DBLCLICK =			"dblclick";
ORYX.CONFIG.EVENT_KEYDOWN =				"keydown";
ORYX.CONFIG.EVENT_KEYUP =				"keyup";

ORYX.CONFIG.EVENT_LOADED =				"editorloaded";
ORYX.CONFIG.EVENT_SAVED =				"editorSaved";

ORYX.CONFIG.EVENT_EXECUTE_COMMANDS =		"executeCommands";
ORYX.CONFIG.EVENT_STENCIL_SET_LOADED =		"stencilSetLoaded";
ORYX.CONFIG.EVENT_SELECTION_CHANGED =		"selectionchanged";
ORYX.CONFIG.EVENT_SHAPEADDED =				"shapeadded";
ORYX.CONFIG.EVENT_SHAPEREMOVED =			"shaperemoved";
ORYX.CONFIG.EVENT_PROPERTY_CHANGED =		"propertyChanged";
ORYX.CONFIG.EVENT_DRAGDROP_START =			"dragdrop.start";
ORYX.CONFIG.EVENT_SHAPE_MENU_CLOSE =		"shape.menu.close";
ORYX.CONFIG.EVENT_DRAGDROP_END =			"dragdrop.end";
ORYX.CONFIG.EVENT_RESIZE_START =			"resize.start";
ORYX.CONFIG.EVENT_RESIZE_END =				"resize.end";
ORYX.CONFIG.EVENT_DRAGDOCKER_DOCKED =		"dragDocker.docked";
ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW =			"highlight.showHighlight";
ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE =			"highlight.hideHighlight";
ORYX.CONFIG.EVENT_LOADING_ENABLE =			"loading.enable";
ORYX.CONFIG.EVENT_LOADING_DISABLE =			"loading.disable";
ORYX.CONFIG.EVENT_LOADING_STATUS =			"loading.status";
ORYX.CONFIG.EVENT_OVERLAY_SHOW =			"overlay.show";
ORYX.CONFIG.EVENT_OVERLAY_HIDE =			"overlay.hide";
ORYX.CONFIG.EVENT_ARRANGEMENT_TOP =			"arrangement.setToTop";
ORYX.CONFIG.EVENT_ARRANGEMENT_BACK =		"arrangement.setToBack";
ORYX.CONFIG.EVENT_ARRANGEMENT_FORWARD =		"arrangement.setForward";
ORYX.CONFIG.EVENT_ARRANGEMENT_BACKWARD =	"arrangement.setBackward";
ORYX.CONFIG.EVENT_PROPWINDOW_PROP_CHANGED =	"propertyWindow.propertyChanged";
ORYX.CONFIG.EVENT_LAYOUT_ROWS =				"layout.rows";
ORYX.CONFIG.EVENT_LAYOUT_BPEL =				"layout.BPEL";
ORYX.CONFIG.EVENT_LAYOUT_BPEL_VERTICAL =    "layout.BPEL.vertical";
ORYX.CONFIG.EVENT_LAYOUT_BPEL_HORIZONTAL =  "layout.BPEL.horizontal";
ORYX.CONFIG.EVENT_LAYOUT_BPEL_SINGLECHILD = "layout.BPEL.singlechild";
ORYX.CONFIG.EVENT_LAYOUT_BPEL_AUTORESIZE =	"layout.BPEL.autoresize";
ORYX.CONFIG.EVENT_AUTOLAYOUT_LAYOUT =		"autolayout.layout";
ORYX.CONFIG.EVENT_UNDO_EXECUTE =			"undo.execute";
ORYX.CONFIG.EVENT_UNDO_ROLLBACK =			"undo.rollback";
ORYX.CONFIG.EVENT_BUTTON_UPDATE =           "toolbar.button.update";
ORYX.CONFIG.EVENT_LAYOUT = 					"layout.dolayout";
ORYX.CONFIG.EVENT_GLOSSARY_LINK_EDIT = 		"glossary.link.edit";
ORYX.CONFIG.EVENT_GLOSSARY_SHOW =			"glossary.show.info";
ORYX.CONFIG.EVENT_GLOSSARY_NEW =			"glossary.show.new";
ORYX.CONFIG.EVENT_DOCKERDRAG = 				"dragTheDocker";
ORYX.CONFIG.EVENT_CANVAS_SCROLL = 			"canvas.scroll";
ORYX.CONFIG.EVENT_CANVAS_SWITCH_SCENE = 	"canvas.switchscene";

ORYX.CONFIG.EVENT_SHOW_PROPERTYWINDOW =		"propertywindow.show";
ORYX.CONFIG.EVENT_ABOUT_TO_SAVE = "file.aboutToSave";

/* Selection Shapes Highlights */
ORYX.CONFIG.SELECTION_HIGHLIGHT_SIZE =				5;
ORYX.CONFIG.SELECTION_HIGHLIGHT_COLOR =				"#4444FF";
ORYX.CONFIG.SELECTION_HIGHLIGHT_COLOR2 =			"#9999FF";

ORYX.CONFIG.SELECTION_HIGHLIGHT_STYLE_CORNER = 		"corner";
ORYX.CONFIG.SELECTION_HIGHLIGHT_STYLE_RECTANGLE = 	"rectangle";

ORYX.CONFIG.SELECTION_VALID_COLOR =					"#00FF00";
ORYX.CONFIG.SELECTION_INVALID_COLOR =				"#FF0000";


ORYX.CONFIG.DOCKER_DOCKED_COLOR =		"#00FF00";
ORYX.CONFIG.DOCKER_UNDOCKED_COLOR =		"#FF0000";
ORYX.CONFIG.DOCKER_SNAP_OFFSET =		10;

/* Copy & Paste */
ORYX.CONFIG.EDIT_OFFSET_PASTE =			10;

/* Key-Codes */
ORYX.CONFIG.KEY_CODE_X = 				88;
ORYX.CONFIG.KEY_CODE_C = 				67;
ORYX.CONFIG.KEY_CODE_V = 				86;
ORYX.CONFIG.KEY_CODE_DELETE = 			46;
ORYX.CONFIG.KEY_CODE_META =				224;
ORYX.CONFIG.KEY_CODE_BACKSPACE =		8;
ORYX.CONFIG.KEY_CODE_LEFT =				37;
ORYX.CONFIG.KEY_CODE_RIGHT =			39;
ORYX.CONFIG.KEY_CODE_UP =				38;
ORYX.CONFIG.KEY_CODE_DOWN =				40;

// TODO Determine where the lowercase constants are still used and remove them from here.
ORYX.CONFIG.KEY_Code_enter =			12;
ORYX.CONFIG.KEY_Code_left =				37;
ORYX.CONFIG.KEY_Code_right =			39;
ORYX.CONFIG.KEY_Code_top =				38;
ORYX.CONFIG.KEY_Code_bottom =			40;

/* Supported Meta Keys */

ORYX.CONFIG.META_KEY_META_CTRL = 		"metactrl";
ORYX.CONFIG.META_KEY_ALT = 				"alt";
ORYX.CONFIG.META_KEY_SHIFT = 			"shift";

/* Key Actions */

ORYX.CONFIG.KEY_ACTION_DOWN = 			"down";
ORYX.CONFIG.KEY_ACTION_UP = 			"up";


/* Form Rowlayouting */
ORYX.CONFIG.FORM_ROW_WIDTH =            0;
ORYX.CONFIG.FORM_GROUP_MARGIN =            5;
ORYX.CONFIG.FORM_GROUP_EMPTY_HEIGHT =   100;

/* Form element types */
ORYX.CONFIG.FORM_ELEMENT_ID_PREFIX = 				'http://b3mn.org/stencilset/xforms';
ORYX.CONFIG.FORM_ELEMENT_TYPE_ROOT = 				'http://b3mn.org/stencilset/xforms#XForm';
ORYX.CONFIG.FORM_ELEMENT_TYPE_GROUP = 				'http://b3mn.org/stencilset/xforms#Group';
ORYX.CONFIG.FORM_ELEMENT_TYPE_REPEATING_GROUP =		'http://b3mn.org/stencilset/xforms#RepeatingGroup';
ORYX.CONFIG.FORM_ELEMENT_TYPE_LABEL_FIELD = 		'http://b3mn.org/stencilset/xforms#LabelField';
