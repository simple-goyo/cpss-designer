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
		var command = new MorphToEvent(HighlightedShape, stencil, $scope.editor);
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

var MorphToEvent = ORYX.Core.Command.extend({
	construct: function(shape, stencil, facade){
		this.shape = shape;
		this.stencil = stencil;
		this.facade = facade;
		this.newEdge;
	},
	execute: function(){
		var shape = this.shape;
		var stencil = this.stencil;
		var resourceId = shape.resourceId;

		// Serialize all attributes
		var serialized = shape.serialize();
		stencil.properties().each((function(prop) {
			if(prop.readonly()) {
				serialized = serialized.reject(function(serProp) {
					return serProp.name === prop.id();
				});
			}
		}).bind(this));

		// 修改线型
		var oldedge = this.shape.getIncomingShapes().first();
		var serializededge = oldedge.serialize();

		var newEdge = this.facade.createShape({
		 	type: "http://b3mn.org/stencilset/bpmn2.0#SequenceEventFlow",
		 	namespace: "http://b3mn.org/stencilset/bpmn2.0",
		 	resourceId: oldedge.resourceId,
			connectedShape: oldedge.incoming[0],
			connectingType: stencil.id(),
			containedStencil: stencil
		});
		serializededge[0].value = "http://b3mn.org/stencilset/bpmn2.0#SequenceEventFlow";

		newEdge.deserialize(serializededge);

		var heighte = oldedge.bounds.height();
		var widthe  = oldedge.bounds.width();

		var changededgeBounds = {
			a : {
				x: oldedge.bounds.a.x,
				y: oldedge.bounds.a.y
			},
			b : {
				x: oldedge.bounds.a.x + widthe,
				y: oldedge.bounds.a.y + heighte
			}
		};
		newEdge.bounds.set(changededgeBounds);
		this.facade.setSelection([newEdge]);
		this.facade.getCanvas().update();
		// newEdge.bounds.set(changededgeBounds);
		// this.facade.getCanvas().update();
		// Delete the old shape
		this.facade.deleteShape(oldedge);

		// Set selection
		this.facade.setSelection([newEdge]);
		this.facade.getCanvas().update();
		this.facade.updateSelection();
		this.newEdge = newEdge;


		// Get shape if already created, otherwise create a new shape
		if (this.newShape){
			newShape = this.newShape;
			this.facade.getCanvas().add(newShape);
		} else {
			newShape = this.facade.createShape({
				type: stencil.id(),
				namespace: stencil.namespace(),
				resourceId: resourceId
			});
		}

		// calculate new bounds using old shape's upperLeft and new shape's width/height
		var boundsObj = serialized.find(function(serProp){
			return (serProp.prefix === "oryx" && serProp.name === "bounds");
		});

		var changedBounds = null;

		if (!this.facade.getRules().preserveBounds(shape.getStencil())) {

			var bounds = boundsObj.value.split(",");
			if (parseInt(bounds[0], 10) > parseInt(bounds[2], 10)) { // if lowerRight comes first, swap array items
				var tmp = bounds[0];
				bounds[0] = bounds[2];
				bounds[2] = tmp;
				tmp = bounds[1];
				bounds[1] = bounds[3];
				bounds[3] = tmp;
			}
			bounds[2] = parseInt(bounds[0], 10) + newShape.bounds.width();
			bounds[3] = parseInt(bounds[1], 10) + newShape.bounds.height();
			boundsObj.value = bounds.join(",");

		}  else {

			var height = shape.bounds.height();
			var width  = shape.bounds.width();

			// consider the minimum and maximum size of
			// the new shape

			if (newShape.minimumSize) {
				if (shape.bounds.height() < newShape.minimumSize.height) {
					height = newShape.minimumSize.height;
				}


				if (shape.bounds.width() < newShape.minimumSize.width) {
					width = newShape.minimumSize.width;
				}
			}

			if(newShape.maximumSize) {
				if(shape.bounds.height() > newShape.maximumSize.height) {
					height = newShape.maximumSize.height;
				}

				if(shape.bounds.width() > newShape.maximumSize.width) {
					width = newShape.maximumSize.width;
				}
			}

			changedBounds = {
				a : {
					x: shape.bounds.a.x,
					y: shape.bounds.a.y
				},
				b : {
					x: shape.bounds.a.x + width,
					y: shape.bounds.a.y + height
				}
			};

		}

		var oPos = shape.bounds.center();
		if(changedBounds !== null) {
			newShape.bounds.set(changedBounds);
		}

		// Set all related dockers
		this.setRelatedDockers(shape, newShape);

		// store DOM position of old shape
		var parentNode = shape.node.parentNode;
		var nextSibling = shape.node.nextSibling;

		// Delete the old shape
		this.facade.deleteShape(shape);

		// Deserialize the new shape - Set all attributes
		newShape.deserialize(serialized);
		/*
         * Change color to default if unchanged
         * 23.04.2010
         */
		if(shape.getStencil().property("oryx-bgcolor")
			&& shape.properties["oryx-bgcolor"]
			&& shape.getStencil().property("oryx-bgcolor").value().toUpperCase()== shape.properties["oryx-bgcolor"].toUpperCase()){
			if(newShape.getStencil().property("oryx-bgcolor")){
				newShape.setProperty("oryx-bgcolor", newShape.getStencil().property("oryx-bgcolor").value());
			}
		}
		if(changedBounds !== null) {
			newShape.bounds.set(changedBounds);
		}

		if(newShape.getStencil().type()==="edge" || (newShape.dockers.length==0 || !newShape.dockers[0].getDockedShape())) {
			newShape.bounds.centerMoveTo(oPos);
		}

		if(newShape.getStencil().type()==="node" && (newShape.dockers.length==0 || !newShape.dockers[0].getDockedShape())) {
			this.setRelatedDockers(newShape, newShape);

		}

		// place at the DOM position of the old shape
		if(nextSibling) parentNode.insertBefore(newShape.node, nextSibling);
		else parentNode.appendChild(newShape.node);

		// Set selection
		this.facade.setSelection([newShape]);
		this.facade.getCanvas().update();
		this.facade.updateSelection();
		this.newShape = newShape;

	},
	rollback: function(){

		if (!this.shape || !this.newShape || !this.newShape.parent) {return;}

		// Append shape to the parent
		this.newShape.parent.add(this.shape);
		// Set dockers
		this.setRelatedDockers(this.newShape, this.shape);
		// Delete new shape
		this.facade.deleteShape(this.newShape);
		// Set selection
		this.facade.setSelection([this.shape]);
		// Update
		this.facade.getCanvas().update();
		this.facade.updateSelection();
	},

	/**
	 * Set all incoming and outgoing edges from the shape to the new shape
	 * @param {Shape} shape
	 * @param {Shape} newShape
	 */
	setRelatedDockers: function(shape, newShape){
		if(shape.getStencil().type()==="node") {
			(shape.incoming||[]).concat(shape.outgoing||[])
				.each(function(i) {
					i.dockers.each(function(docker) {
						if (docker.getDockedShape() == shape) {
							var rPoint = Object.clone(docker.referencePoint);
							// Move reference point per percent

							var rPointNew = {
								x: rPoint.x*newShape.bounds.width()/shape.bounds.width(),
								y: rPoint.y*newShape.bounds.height()/shape.bounds.height()
							};

							docker.setDockedShape(newShape);
							// Set reference point and center to new position
							docker.setReferencePoint(rPointNew);
							if(i instanceof ORYX.Core.Edge) {
								docker.bounds.centerMoveTo(rPointNew);
							} else {
								var absXY = shape.absoluteXY();
								docker.bounds.centerMoveTo({x:rPointNew.x+absXY.x, y:rPointNew.y+absXY.y});
								//docker.bounds.moveBy({x:rPointNew.x-rPoint.x, y:rPointNew.y-rPoint.y});
							}
						}
					});
				});

			// for attached events
			if(shape.dockers.length>0&&shape.dockers.first().getDockedShape()) {
				newShape.dockers.first().setDockedShape(shape.dockers.first().getDockedShape());
				newShape.dockers.first().setReferencePoint(Object.clone(shape.dockers.first().referencePoint));
			}

		} else { // is edge
			newShape.dockers.first().setDockedShape(shape.dockers.first().getDockedShape());
			newShape.dockers.first().setReferencePoint(shape.dockers.first().referencePoint);
			newShape.dockers.last().setDockedShape(shape.dockers.last().getDockedShape());
			newShape.dockers.last().setReferencePoint(shape.dockers.last().referencePoint);
		}
	}
});