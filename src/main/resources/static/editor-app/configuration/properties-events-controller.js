/*
 * Activiti Modeler component part of the Activiti project
 * Copyright 2005-2014 Alfresco Software, Ltd. All rights reserved.
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.

 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 */

/*
 * Assignment
 */
var KisBPMEventsCtrl = [ '$scope', '$modal', function($scope, $modal) {

    // Config for the modal window
    var opts = {
        template:  'editor-app/configuration/properties/events-popup.html?version=' + Date.now(),
        scope: $scope
    };

    // Open the dialog
    $modal(opts);
}];

var EventsPopupCtrl = [ '$scope', function($scope) {
	var ActivityElement;
	var shape = $scope.selectedShape;
	var HighlightedShape = $scope.getHighlightedShape();

	var selectedShapeFunctionType = "DefaultEvent";


	// Put json representing entity on scope
	if ($scope.property !== undefined && $scope.property.value !== undefined && $scope.property.value !== null
		&& $scope.property.value.length > 0)
	{
		for(var i=0 ; i<$scope.property.value.length ; i++){
			$scope.entity.listeners[i].value = $scope.property.value[i].listener;
		}

	} else {
		$scope.entity = {};
		$scope.property = {};
	}

    if ($scope.entity.listeners === undefined || $scope.entity.listeners.length === 0)
    {
    	$scope.entity.listeners = [{value: ''}];
    }
    
    // Click handler for + button after enum value
    $scope.addListenerValue = function(index) {
        $scope.entity.listeners.splice(index + 1, 0, {value: ''});
    };

    // Click handler for - button after enum value
    $scope.removeListenerValue = function(index) {
        $scope.entity.listeners.splice(index, 1);
    };

    $scope.save = function() {
		if ($scope.property.value === undefined || !$scope.property.value) {
			$scope.property.value = [{"id": "", "event": ""}];
		}

		ActivityElement = $scope.editor.getSelection()[0];

		var events = [];
		var ids = [];
		if ($scope.property.value) {
			for (var i = 0; i < $scope.property.value.length; i++) {
				events[events.length] = {value: $scope.property.value[i].event};
				ids[ids.length] = {id: $scope.property.value[i].id};
			}
		} else {
			$scope.property.value = [];
		}

		// if (!$scope.entity.listeners) {
		// 	$scope.entity.listeners = [{value: $scope.selectedFunc}];
		// } else {
		// 	$scope.entity.listeners[$scope.entity.listeners.length] = {value: $scope.selectedFunc};
		// }

		var indexToRemove = [];
		var hasRemoveNum = 0;
		for (var i = 0; i < events.length; i++) {
			var index = -1;
			for (var j = 0; j < $scope.entity.listeners.length; j++) {
				if (events[i].value === $scope.entity.listeners[j].value) {
					index = j;
				}
			}
			if (index < 0) {
				indexToRemove[indexToRemove.length] = i;
			}
		}
		for ( i = 0; i < indexToRemove.length; i++) {
			index = indexToRemove[i];
			var shapeToRemove = $scope.getShapeById(ids[index].id);
			$scope.editor.deleteShape(shapeToRemove);
			events.splice(index - hasRemoveNum, 1);
			$scope.property.value.splice(index - hasRemoveNum, 1);
			hasRemoveNum++;
		}


		for( i=0 ; i<$scope.entity.listeners.length ; i++){
			index = -1;
			for (var j = 0; j < events.length; j++) {
				if (events[j].value === $scope.entity.listeners[i].value) {
					index = j;
				}
			}

			if (index < 0) {
				//$scope.createEvent($scope, $scope.entity.listeners[i].value);
				$scope.replaceAction($scope, $scope.entity.listeners[i].value, selectedShapeFunctionType);
				$scope.property.value[$scope.property.value.length] = {
					id: $scope.editor.getSelection()[0].id, event: $scope.entity.listeners[i].value
				};
				shape.setProperty("oryx-events", $scope.property.value, true);
				$scope.editor.getCanvas().update();
				$scope.editor.updateSelection();
			}

			// $scope.property.value[i].events = $scope.entity.listeners[i].value;
			//
			// $scope.updatePropertyInModel($scope.property);
			// $scope.close();
			//
			// $scope.createEvent($scope, $scope.entity.listeners[i].value);
			// $scope.property.value[i].id = ActivityElement.id

		}
		$scope.close();

		// 播放动画
		$scope.newPlayShape();
    };

	$scope.createEvent = function ($scope, eventName) {
		var selectItem = ActivityElement;//$scope.editor.getSelection()[0];
		var itemId = "DefaultEvent"; // DefaultEvent 图标用来表示事件
		var action = undefined;
		var stencilSets = $scope.editor.getStencilSets().values();
		for (var i = 0; i < stencilSets.length; i++) {
			var stencilSet = stencilSets[i];
			var nodes = stencilSet.nodes();
			for (var j = 0; j < nodes.length; j++) {
				if (nodes[j].idWithoutNs() === itemId) {
					action = nodes[j];
					break;
				}
			}
		}
		if (!action) return;

		var nodes = [$scope.editor.getCanvas()][0].children;
		var positionOffset = {type: 'offsetY', x: 0, y: 0};
		for (var i = 0; i < nodes.length; i++) {
			if (nodes[i].properties["oryx-activityelement"]) {
				if (positionOffset.y < nodes[i].bounds.center().y) {
					positionOffset.y = nodes[i].bounds.center().y;
				}
			}
		}

		var option = {
			type: selectItem.getStencil().namespace() + itemId,
			namespace: selectItem.getStencil().namespace(),
			parent: selectItem.parent,
			containedStencil: action,
			positionController: positionOffset
		};

		var command = new KISBPM.CreateCommand(option, undefined, undefined, $scope.editor);

		$scope.editor.executeCommands([command]);

		//console.log($scope.editor.getSelection()[0].bounds);

		var actionActivity = $scope.selectedItem;
		for (var i = 0; i < actionActivity.properties.length; i++) {
			var property = actionActivity.properties[i];
			if (property.title === "Id") {
				property.value = $scope.editor.getSelection()[0].id;
				$scope.updatePropertyInModel(property);
			} else if (property.title === "名称") {
				//property.value = selectItem.properties["oryx-events"].events;
				property.value = eventName;
				$scope.updatePropertyInModel(property);
			} else if (property.title === "活动元素") {
				property.value = {
					"id": selectItem.properties["oryx-overrideid"],
					"name": selectItem.properties["oryx-name"],
					"type": selectItem.properties["oryx-type"]
				};
				$scope.updatePropertyInModel(property);
			}else if(property.title === "输入"){
				console.log("此处设置输入参数");
			}else if(property.title === "输出"){
				console.log("此处设置输出参数");
			}

			// else if (property.title === "输入") {
			// 	property.mode = 'set';
			// }
		}
	};

	// 替换Action
	$scope.replaceAction = function($scope, actionName, FunctionType) {
		if(HighlightedShape === undefined) return;// 如果没有高亮，直接返回

		var selectItem = $scope.editor.getSelection()[0];
		var stencil = undefined;
		var stencilSets = $scope.editor.getStencilSets().values();
		var stencilId = FunctionType;
		var newShapeId = "";

		for (var i = 0; i < stencilSets.length; i++)
		{
			var stencilSet = stencilSets[i];
			var nodes = stencilSet.nodes();
			for (var j = 0; j < nodes.length; j++)
			{
				if (nodes[j].idWithoutNs() === stencilId)
				{
					stencil = nodes[j];
					break;
				}
			}
		}

		if (!stencil) return;

		// Create and execute command (for undo/redo)
		var command = new MorphTo(HighlightedShape, stencil, $scope.editor);
		$scope.editor.executeCommands([command]);

		var actionActivity = $scope.selectedItem;
		for (var i = 0; i < actionActivity.properties.length; i++) {
			var property = actionActivity.properties[i];
			if (property.title === "Id") {
				property.value = $scope.editor.getSelection()[0].id;
				newShapeId = property.value;
				$scope.updatePropertyInModel(property);
			} else if (property.title === "名称") {
				property.value = actionName;
				$scope.updatePropertyInModel(property);
			} else if (property.title === "活动元素") {
				property.value = {
					"id": selectItem.properties["oryx-overrideid"],
					"name": selectItem.properties["oryx-name"],
					"type": selectItem.properties["oryx-type"]
				};
				$scope.updatePropertyInModel(property);
			} else if (property.title === "动作输入状态") {
				property.value = $scope.inputStatus;
				$scope.inputStatus = [];
				$scope.updatePropertyInModel(property);
			} else if (property.title === "动作输出状态") {
				property.value = $scope.outputStatus;
				$scope.outputStatus = [];
				$scope.updatePropertyInModel(property);
			}
		}
		$scope.setHighlightedShape(newShapeId);
		jQuery('#' + newShapeId + 'bg_frame').attr({"fill":"#04FF8E"}); //高亮显示

		//$scope.close();
	};

	// Close button handler
    $scope.close = function() {
    	handleAssignmentInput($scope);
    	$scope.property.mode = 'read';
    	$scope.$hide();
    };
    
    var handleAssignmentInput = function($scope) {
    	if ($scope.entity.listeners)
    	{
	    	var emptyUsers = true;
	    	var toRemoveIndexes = [];
	        for (var i = 0; i < $scope.entity.listeners.length; i++)
	        {
	        	if ($scope.entity.listeners[i].value != '')
	        	{
	        		emptyUsers = false;
	        	}
	        	else
	        	{
	        		toRemoveIndexes[toRemoveIndexes.length] = i;
	        	}
	        }
	        
	        for (var i = 0; i < toRemoveIndexes.length; i++)
	        {
	        	$scope.entity.listeners.splice(toRemoveIndexes[i], 1);
	        }
	        
	        if (emptyUsers)
	        {
	        	$scope.entity.listeners = undefined;
	        }
    	}
        
    	if ($scope.entity.listeners)
    	{
	        var emptyGroups = true;
	        var toRemoveIndexes = [];
	        for (var i = 0; i < $scope.entity.listeners.length; i++)
	        {
	        	if ($scope.entity.listeners[i].value != '')
	        	{
	        		emptyGroups = false;
	        	}
	        	else
	        	{
	        		toRemoveIndexes[toRemoveIndexes.length] = i;
	        	}
	        }
	        
	        for (var i = 0; i < toRemoveIndexes.length; i++)
	        {
	        	$scope.entity.listeners.splice(toRemoveIndexes[i], 1);
	        }
	        
	        if (emptyGroups)
	        {
	        	$scope.entity.listeners = undefined;
	        }
    	}
    };
}];

var EventsDisplayedCtrl = ['$scope', function ($scope) {
	if ($scope.property.value) {
		var shape = $scope.getShapeById($scope.property.value[0].id);
		if (!shape) {
			$scope.property.value = {};
		} else {
			//$scope.property.value[i].events = shape.properties["oryx-name"];
		}
		$scope.updatePropertyInModel($scope.property);
	}
}];