'use strict';
angular.module('activitiModeler')
    .DragDropClass = function($rootScope, $scope){

    /*
     * DRAG AND DROP FUNCTIONALITY
     */

    $scope.dropCallback = function (event, ui) {

        $scope.editor.handleEvents({
            type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,
            highlightId: "shapeRepo.attached"
        });
        $scope.editor.handleEvents({
            type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,
            highlightId: "shapeRepo.added"
        });

        $scope.editor.handleEvents({
            type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,
            highlightId: "shapeMenu"
        });

        KISBPM.eventBus.dispatch(KISBPM.eventBus.EVENT_TYPE_HIDE_SHAPE_BUTTONS);

        // var setting = false;
        if ($scope.dragCanContain) {

            var item = $scope.getStencilItemById(ui.draggable[0].id);
            // var group = $scope.findGroupNameByStencilItem(ui.draggable[0].id);
            // if (group.name === "物理实体") {
            //     setting = true;
            // }
            // setting = true;

            var pos = {x: event.pageX, y: event.pageY};

            var additionalIEZoom = 1;
            // if (!isNaN(screen.logicalXDPI) && !isNaN(screen.systemXDPI)) {
            //     var ua = navigator.userAgent;
            //     if (ua.indexOf('MSIE') >= 0) {
            //         //IE 10 and below
            //         var zoom = Math.round((screen.deviceXDPI / screen.logicalXDPI) * 100);
            //         if (zoom !== 100) {
            //             additionalIEZoom = zoom / 100;
            //         }
            //     }
            // }

            var screenCTM = $scope.editor.getCanvas().node.getScreenCTM();

            // Correcting the UpperLeft-Offset
            pos.x -= (screenCTM.e / additionalIEZoom);
            pos.y -= (screenCTM.f / additionalIEZoom);
            // Correcting the Zoom-Factor
            pos.x /= screenCTM.a;
            pos.y /= screenCTM.d;

            // Correcting the ScrollOffset
            pos.x -= document.documentElement.scrollLeft;
            pos.y -= document.documentElement.scrollTop;

            var parentAbs = $scope.dragCurrentParent.absoluteXY();
            pos.x -= parentAbs.x;
            pos.y -= parentAbs.y;

            var containedStencil = undefined;
            var stencilSets = $scope.editor.getStencilSets().values();
            for (var i = 0; i < stencilSets.length; i++) {
                var stencilSet = stencilSets[i];
                var nodes = stencilSet.nodes();
                for (var j = 0; j < nodes.length; j++) {
                    if (nodes[j].idWithoutNs() === ui.draggable[0].id) {
                        containedStencil = nodes[j];
                        break;
                    }
                }

                if (!containedStencil) {
                    var edges = stencilSet.edges();
                    for (var j = 0; j < edges.length; j++) {
                        if (edges[j].idWithoutNs() === ui.draggable[0].id) {
                            containedStencil = edges[j];
                            break;
                        }
                    }
                }
            }

            if (!containedStencil) return;

            if ($scope.quickMenu) {
                var shapes = $scope.editor.getSelection();
                if (shapes && shapes.length === 1) {
                    var currentSelectedShape = shapes.first();

                    var option = {};
                    option.type = currentSelectedShape.getStencil().namespace() + ui.draggable[0].id;
                    option.namespace = currentSelectedShape.getStencil().namespace();
                    option.connectedShape = currentSelectedShape;
                    option.parent = $scope.dragCurrentParent;
                    option.containedStencil = containedStencil;

                    // If the ctrl key is not pressed,
                    // snapp the new shape to the center
                    // if it is near to the center of the other shape
                    if (!event.ctrlKey) {
                        // Get the center of the shape
                        var cShape = currentSelectedShape.bounds.center();
                        // Snapp +-20 Pixel horizontal to the center
                        if (20 > Math.abs(cShape.x - pos.x)) {
                            pos.x = cShape.x;
                        }
                        // Snapp +-20 Pixel vertical to the center
                        if (20 > Math.abs(cShape.y - pos.y)) {
                            pos.y = cShape.y;
                        }
                    }

                    option.position = pos;

                    if (containedStencil.idWithoutNs() !== 'SequenceFlow' && containedStencil.idWithoutNs() !== 'SequenceEventFlow' && containedStencil.idWithoutNs() !== 'Association' &&
                        containedStencil.idWithoutNs() !== 'MessageFlow' && containedStencil.idWithoutNs() !== 'DataAssociation') {
                        var args = {sourceShape: currentSelectedShape, targetStencil: containedStencil};
                        debugger;
                        var targetStencil = $scope.editor.getRules().connectMorph(args);
                        if (!targetStencil) {
                            return;
                        }// Check if there can be a target shape
                        option.connectingType = targetStencil.id();
                    }

                    var command = new KISBPM.CreateCommand(option, $scope.dropTargetElement, pos, $scope.editor);

                    $scope.editor.executeCommands([command]);
                }
            } else {
                var canAttach = false;
                if (containedStencil.idWithoutNs() === 'BoundaryErrorEvent' || containedStencil.idWithoutNs() === 'BoundaryTimerEvent' ||
                    containedStencil.idWithoutNs() === 'BoundarySignalEvent' || containedStencil.idWithoutNs() === 'BoundaryMessageEvent' ||
                    containedStencil.idWithoutNs() === 'BoundaryCancelEvent' || containedStencil.idWithoutNs() === 'BoundaryCompensationEvent') {
                    // Modify position, otherwise boundary event will get position related to left corner of the canvas instead of the container
                    pos = $scope.editor.eventCoordinates(event);
                    canAttach = true;
                }

                var option = {};
                option['type'] = $scope.modelData.model.stencilset.namespace + item.id;
                option['namespace'] = $scope.modelData.model.stencilset.namespace;
                option['position'] = pos;
                option['parent'] = $scope.dragCurrentParent;

                var commandClass = ORYX.Core.Command.extend({
                    construct: function (option, dockedShape, canAttach, position, facade) {
                        this.option = option;
                        this.docker = null;
                        this.dockedShape = dockedShape;
                        this.dockedShapeParent = dockedShape.parent || facade.getCanvas();
                        this.position = position;
                        this.facade = facade;
                        this.selection = this.facade.getSelection();
                        this.shape = null;
                        this.parent = null;
                        this.canAttach = canAttach;
                    },
                    execute: function () {
                        //debugger;
                        if (!this.shape) {
                            this.shape = this.facade.createShape(option);
                            this.parent = this.shape.parent;
                        } else if (this.parent) {
                            this.parent.add(this.shape);
                        }

                        if (this.canAttach && this.shape.dockers && this.shape.dockers.length) {
                            this.docker = this.shape.dockers[0];

                            this.dockedShapeParent.add(this.docker.parent);

                            // Set the Docker to the new Shape
                            this.docker.setDockedShape(undefined);
                            this.docker.bounds.centerMoveTo(this.position);
                            if (this.dockedShape !== this.facade.getCanvas()) {
                                this.docker.setDockedShape(this.dockedShape);
                            }
                            this.facade.setSelection([this.docker.parent]);
                        }

                        this.facade.getCanvas().update();
                        this.facade.updateSelection();

                    },
                    rollback: function () {
                        if (this.shape) {
                            this.facade.setSelection(this.selection.without(this.shape));
                            this.facade.deleteShape(this.shape);
                        }
                        if (this.canAttach && this.docker) {
                            this.docker.setDockedShape(undefined);
                        }
                        this.facade.getCanvas().update();
                        this.facade.updateSelection();

                    }
                });

                // Update canvas
                var command = new commandClass(option, $scope.dragCurrentParent, canAttach, pos, $scope.editor);
                $scope.editor.executeCommands([command]);

                // Fire event to all who want to know about this
                var dropEvent = {
                    type: KISBPM.eventBus.EVENT_TYPE_ITEM_DROPPED,
                    droppedItem: item,
                    position: pos
                };
                KISBPM.eventBus.dispatch(dropEvent.type, dropEvent);
            }
        }

        $scope.dragCurrentParent = undefined;
        $scope.dragCurrentParentId = undefined;
        $scope.dragCurrentParentStencil = undefined;
        $scope.dragCanContain = undefined;
        $scope.quickMenu = undefined;
        $scope.dropTargetElement = undefined;
        for (var index = 0; index < $scope.selectedItem.properties.length; index++) {
            var property = $scope.selectedItem.properties[index];
            if (property.title === "名称") {
                $scope.nameProperty = property;
            } else if (property.title === "Id") {
                var entities = [$scope.editor.getCanvas()][0].children;
                property.value = entities[entities.length - 1].id;
                $scope.updatePropertyInModel(property);
            } else if (property.title === "类型" && item.name !== undefined) {
                property.value = item.name;
                $scope.updatePropertyInModel(property);
            }
        }

        //set mode to set is to judge whether the item is dragged to canvas firstly.
        if (!$scope.nameProperty.hidden) {
            $scope.nameProperty.mode = 'set';
        }
    };


    $scope.overCallback = function (event, ui) {
        $scope.dragModeOver = true;
    };

    $scope.outCallback = function (event, ui) {
        $scope.dragModeOver = false;
    };

    $scope.startDragCallback = function (event, ui) {
        $scope.dragModeOver = false;
        $scope.quickMenu = false;
        if (!ui.helper.hasClass('stencil-item-dragged')) {
            ui.helper.addClass('stencil-item-dragged');
        }
    };

    $scope.startDragCallbackQuickMenu = function (event, ui) {
        $scope.dragModeOver = false;
        $scope.quickMenu = true;
    };

    $scope.dragCallback = function (event, ui) {

        if ($scope.dragModeOver !== false) {

            var coord = $scope.editor.eventCoordinatesXY(event.pageX, event.pageY);

            var additionalIEZoom = 1;
            // if (!isNaN(screen.logicalXDPI) && !isNaN(screen.systemXDPI)) {
            //     var ua = navigator.userAgent;
            //     if (ua.indexOf('MSIE') >= 0) {
            //         //IE 10 and below
            //         var zoom = Math.round((screen.deviceXDPI / screen.logicalXDPI) * 100);
            //         if (zoom !== 100) {
            //             additionalIEZoom = zoom / 100
            //         }
            //     }
            // }

            if (additionalIEZoom !== 1) {
                coord.x = coord.x / additionalIEZoom;
                coord.y = coord.y / additionalIEZoom;
            }

            var aShapes = $scope.editor.getCanvas().getAbstractShapesAtPosition(coord);

            if (aShapes.length <= 0) {
                if (event.helper) {
                    $scope.dragCanContain = false;
                    return false;
                }
            }

            if (aShapes[0] instanceof ORYX.Core.Canvas) {
                $scope.editor.getCanvas().setHightlightStateBasedOnX(coord.x);
            }

            if (aShapes.length == 1 && aShapes[0] instanceof ORYX.Core.Canvas) {
                var parentCandidate = aShapes[0];

                $scope.dragCanContain = true;
                $scope.dragCurrentParent = parentCandidate;
                $scope.dragCurrentParentId = parentCandidate.id;

                $scope.editor.handleEvents({
                    type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,
                    highlightId: "shapeRepo.attached"
                });
                $scope.editor.handleEvents({
                    type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,
                    highlightId: "shapeRepo.added"
                });
                return false;
            } else {
                var item = $scope.getStencilItemById(event.target.id);

                var parentCandidate = aShapes.reverse().find(function (candidate) {
                    return (candidate instanceof ORYX.Core.Canvas
                        || candidate instanceof ORYX.Core.Node
                        || candidate instanceof ORYX.Core.Edge);
                });

                if (!parentCandidate) {
                    $scope.dragCanContain = false;
                    return false;
                }

                if (item.type === "node") {

                    // check if the draggable is a boundary event and the parent an Activity
                    var _canContain = false;
                    var parentStencilId = parentCandidate.getStencil().id();

                    if ($scope.dragCurrentParentId && $scope.dragCurrentParentId === parentCandidate.id) {
                        return false;
                    }

                    var parentItem = $scope.getStencilItemById(parentCandidate.getStencil().idWithoutNs());
                    if (parentItem.roles.indexOf("Activity") > -1) {
                        if (item.roles.indexOf("IntermediateEventOnActivityBoundary") > -1) {
                            _canContain = true;
                        }
                    } else if (parentCandidate.getStencil().idWithoutNs() === 'Pool') {
                        if (item.id === 'Lane') {
                            _canContain = true;
                        }
                    }

                    if (_canContain) {
                        $scope.editor.handleEvents({
                            type: ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,
                            highlightId: "shapeRepo.attached",
                            elements: [parentCandidate],
                            style: ORYX.CONFIG.SELECTION_HIGHLIGHT_STYLE_RECTANGLE,
                            color: ORYX.CONFIG.SELECTION_VALID_COLOR
                        });

                        $scope.editor.handleEvents({
                            type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,
                            highlightId: "shapeRepo.added"
                        });
                    } else {
                        for (var i = 0; i < $scope.containmentRules.length; i++) {
                            var rule = $scope.containmentRules[i];
                            if (rule.role === parentItem.id) {
                                for (var j = 0; j < rule.contains.length; j++) {
                                    if (item.roles.indexOf(rule.contains[j]) > -1) {
                                        _canContain = true;
                                        break;
                                    }
                                }

                                if (_canContain) {
                                    break;
                                }
                            }
                        }

                        // Show Highlight
                        $scope.editor.handleEvents({
                            type: ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,
                            highlightId: 'shapeRepo.added',
                            elements: [parentCandidate],
                            color: _canContain ? ORYX.CONFIG.SELECTION_VALID_COLOR : ORYX.CONFIG.SELECTION_INVALID_COLOR
                        });

                        $scope.editor.handleEvents({
                            type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,
                            highlightId: "shapeRepo.attached"
                        });
                    }

                    $scope.dragCurrentParent = parentCandidate;
                    $scope.dragCurrentParentId = parentCandidate.id;
                    $scope.dragCurrentParentStencil = parentStencilId;
                    $scope.dragCanContain = _canContain;

                } else {
                    var canvasCandidate = $scope.editor.getCanvas();
                    var canConnect = false;

                    var targetStencil = $scope.getStencilItemById(parentCandidate.getStencil().idWithoutNs());
                    if (targetStencil) {
                        var associationConnect = false;
                        if (stencil.idWithoutNs() === 'Association' && (curCan.getStencil().idWithoutNs() === 'TextAnnotation' || curCan.getStencil().idWithoutNs() === 'BoundaryCompensationEvent')) {
                            associationConnect = true;
                        } else if (stencil.idWithoutNs() === 'DataAssociation' && curCan.getStencil().idWithoutNs() === 'DataStore') {
                            associationConnect = true;
                        }

                        if (targetStencil.canConnectTo || associationConnect) {
                            canConnect = true;
                        }
                    }

                    //Edge
                    $scope.dragCurrentParent = canvasCandidate;
                    $scope.dragCurrentParentId = canvasCandidate.id;
                    $scope.dragCurrentParentStencil = canvasCandidate.getStencil().id();
                    $scope.dragCanContain = canConnect;

                    // Show Highlight
                    $scope.editor.handleEvents({
                        type: ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,
                        highlightId: 'shapeRepo.added',
                        elements: [canvasCandidate],
                        color: ORYX.CONFIG.SELECTION_VALID_COLOR
                    });

                    $scope.editor.handleEvents({
                        type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,
                        highlightId: "shapeRepo.attached"
                    });
                }
            }
        }
    };

    $scope.dragCallbackQuickMenu = function (event, ui) {

        if ($scope.dragModeOver != false) {
            var coord = $scope.editor.eventCoordinatesXY(event.pageX, event.pageY);

            var additionalIEZoom = 1;
            if (!isNaN(screen.logicalXDPI) && !isNaN(screen.systemXDPI)) {
                var ua = navigator.userAgent;
                if (ua.indexOf('MSIE') >= 0) {
                    //IE 10 and below
                    var zoom = Math.round((screen.deviceXDPI / screen.logicalXDPI) * 100);
                    if (zoom !== 100) {
                        additionalIEZoom = zoom / 100
                    }
                }
            }

            if (additionalIEZoom !== 1) {
                coord.x = coord.x / additionalIEZoom;
                coord.y = coord.y / additionalIEZoom;
            }

            var aShapes = $scope.editor.getCanvas().getAbstractShapesAtPosition(coord);

            if (aShapes.length <= 0) {
                if (event.helper) {
                    $scope.dragCanContain = false;
                    return false;
                }
            }

            if (aShapes[0] instanceof ORYX.Core.Canvas) {
                $scope.editor.getCanvas().setHightlightStateBasedOnX(coord.x);
            }

            var stencil = undefined;
            var stencilSets = $scope.editor.getStencilSets().values();
            for (var i = 0; i < stencilSets.length; i++) {
                var stencilSet = stencilSets[i];
                var nodes = stencilSet.nodes();
                for (var j = 0; j < nodes.length; j++) {
                    if (nodes[j].idWithoutNs() === event.target.id) {
                        stencil = nodes[j];
                        break;
                    }
                }

                if (!stencil) {
                    var edges = stencilSet.edges();
                    for (var j = 0; j < edges.length; j++) {
                        if (edges[j].idWithoutNs() === event.target.id) {
                            stencil = edges[j];
                            break;
                        }
                    }
                }
            }

            var candidate = aShapes.last();

            var isValid = false;
            if (stencil.type() === "node") {
                //check containment rules
                var canContain = $scope.editor.getRules().canContain({
                    containingShape: candidate,
                    containedStencil: stencil
                });

                var parentCandidate = aShapes.reverse().find(function (candidate) {
                    return (candidate instanceof ORYX.Core.Canvas
                        || candidate instanceof ORYX.Core.Node
                        || candidate instanceof ORYX.Core.Edge);
                });

                if (!parentCandidate) {
                    $scope.dragCanContain = false;
                    return false;
                }

                $scope.dragCurrentParent = parentCandidate;
                $scope.dragCurrentParentId = parentCandidate.id;
                $scope.dragCurrentParentStencil = parentCandidate.getStencil().id();
                $scope.dragCanContain = canContain;
                $scope.dropTargetElement = parentCandidate;
                isValid = canContain;

            } else { //Edge

                var shapes = $scope.editor.getSelection();
                if (shapes && shapes.length == 1) {
                    var currentSelectedShape = shapes.first();
                    var curCan = candidate;
                    var canConnect = false;

                    var targetStencil = $scope.getStencilItemById(curCan.getStencil().idWithoutNs());
                    if (targetStencil) {
                        var associationConnect = false;
                        if (stencil.idWithoutNs() === 'Association' && (curCan.getStencil().idWithoutNs() === 'TextAnnotation' || curCan.getStencil().idWithoutNs() === 'BoundaryCompensationEvent')) {
                            associationConnect = true;
                        } else if (stencil.idWithoutNs() === 'DataAssociation' && curCan.getStencil().idWithoutNs() === 'DataStore') {
                            associationConnect = true;
                        }

                        if (targetStencil.canConnectTo || associationConnect) {
                            while (!canConnect && curCan && !(curCan instanceof ORYX.Core.Canvas)) {
                                candidate = curCan;
                                //check connection rules
                                canConnect = $scope.editor.getRules().canConnect({
                                    sourceShape: currentSelectedShape,
                                    edgeStencil: stencil,
                                    targetShape: curCan
                                });
                                curCan = curCan.parent;
                            }
                        }
                    }
                    var parentCandidate = $scope.editor.getCanvas();

                    isValid = canConnect;
                    $scope.dragCurrentParent = parentCandidate;
                    $scope.dragCurrentParentId = parentCandidate.id;
                    $scope.dragCurrentParentStencil = parentCandidate.getStencil().id();
                    $scope.dragCanContain = canConnect;
                    $scope.dropTargetElement = candidate;
                }

            }

            $scope.editor.handleEvents({
                type: ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,
                highlightId: 'shapeMenu',
                elements: [candidate],
                color: isValid ? ORYX.CONFIG.SELECTION_VALID_COLOR : ORYX.CONFIG.SELECTION_INVALID_COLOR
            });

        }
    };
};


