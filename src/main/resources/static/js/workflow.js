/**
 * Created by 11051 on 2018/8/17.
 */


var instanceId = "";
//专门为课题一写的，直接显示对应流程
var app_instance_id=getQueryVariable("app_instance_id");
var taskNodeList = new Array();
var taskEdgeList = new Array();
var taskNodeStateList = new Array();

//循环读取当前要显示什么应用实例，如果是新的应用实例，就更新
setInterval(function () {
    if (app_instance_id != ""&&(instanceId != app_instance_id)) {
        startWorkflow(app_instance_id)
    } else {
        var url = getAppBackEndServiceURL(APP_BACK_END_SERVICE.GET_APP_SHOW);
        $.ajax({
            type: "post",
            url: url,
            data: {
                "user_id": "1",
            },
            success: function (result) {
                var app_show_instance_id = result.app_show.instance_id;
                if (instanceId != app_show_instance_id) {
                    startWorkflow(app_show_instance_id)
                }
            },
            error: function (response) {
                alert(response);
            }
        });
    }

}, 3000);

function startWorkflow(id) {
    instanceId = id;
    if (instanceId == "") {
        $("#app-instance-title").text("请选择流程");
        return;
    }
    var url = getAppBackEndServiceURL(APP_BACK_END_SERVICE.GET_APP_CLASS_BY_INSTANCE_ID);
    $.ajax({
        type: "post",
        url: url,
        data: {"app_instance_id": instanceId},
        success: function (result) {
            if (result == "null") {
                return;
            }
            var app_class_name = result.app_class.app_class.properties.name;
            $("#app-instance-title").text(app_class_name);
            var childShapes = result.app_class.app_class.childShapes;
            getTaskNodeList(childShapes);
            getTaskEdgeList(childShapes);
            updateState();
        },
        error: function (response) {
            alert(response);
        }
    });
}

function getTaskNodeList(childShapes) {
    taskNodeList = []
    $.each(childShapes, function (i, item) {
        var type = item.stencil.id;
        if (type == "StartNoneEvent" || type == "DefaultEvent" || type == "SocialAction" || type == "PhysicalAction" || type == "CyberAction") {
            taskNodeList.push(item);
        }
    })
}

function getTaskEdgeList(childShapes) {
    taskEdgeList = []
    $.each(childShapes, function (i, item) {
        var type = item.stencil.id;
        if (type == "SequenceFlow") {
            taskEdgeList.push(item);
        }
    })
}

function stopWorkflow() {
    // instanceId = null;
    updateAppShowInstanceId("1", "");
    $("#ongoing_service_list").css("display", "");
    $("#ongoing_service_workflow").css("display", "none");
}

function updateState() {
    var url = getAppBackEndServiceURL(APP_BACK_END_SERVICE.GET_APP_INSTANCE_ACTION_STATE_BY_INSTANCE_ID);
    var interval = setInterval(function () {
        if (instanceId == null || instanceId == "") {
            clearInterval(interval);
            return;
        }
        $.ajax({
            type: "post",
            url: url,
            data: {"app_instance_id": instanceId},
            success: function (result) {
                taskNodeStateList = result.app_instance_action_state.action_state;
                removeGraph();
                showGraph();
            },
            error: function (response) {
                alert(response);
            }
        });
    }, 6000);
}


// Create the input graph
var g = new dagreD3.graphlib.Graph()
    .setGraph({})
    .setDefaultEdgeLabel(function () {
        return {};
    });
// Create the renderer
var render = new dagreD3.render();
// Add our custom shape (a house)
render.shapes().house = function (parent, bbox, node) {
    var w = bbox.width,
        h = bbox.height,
        points = [
            {x: 0, y: -h / 3},
            {x: w / 2, y: 0},
            {x: w, y: -h / 3},
            {x: w / 2, y: -h * 2 / 3},
        ];
    shapeSvg = parent.insert("polygon", ":first-child")
        .attr("points", points.map(function (d) {
            return d.x + "," + d.y;
        }).join(" "))
        .attr("transform", "translate(" + (-w / 2) + "," + (h / 3) + ")");

    node.intersect = function (point) {
        return dagreD3.intersect.polygon(node, points, point);
    };

    return shapeSvg;
};

// Set up an SVG group so that we can translate the final graph.
//    var svg = d3.select("svg"),
//        svgGroup = svg.append("g");
var svg = d3.select("svg"),
    inner = svg.select("g");


// Set up zoom support
var zoom = d3.zoom().on("zoom", function () {
    inner.attr("transform", d3.event.transform);
});
svg.call(zoom);

function showGraph() {
    var windowWidth = $(window).width();
    var windowHeight = $(window).height();
    svg.attr('width', windowWidth);
    svg.attr('height', windowHeight);
    // Here we"re setting nodeclass, which is used by our custom drawNodes function
    // below.
    $.each(taskNodeList, function (i, item) {
        var style = item.stencil.id;
        var className = style;
        var description = "";
        var nodeId = item.resourceId;
        var label = item.properties.name;
        var state = taskNodeStateList[nodeId];
        // var description = item.completeTime;
        if (state == undefined || state == 0) {
            // return true;
            description = "未完成";
        } else if (state == 1) {
            //未完成，并警告
            className += " warn";
        } else if (state == 2) {
            //完成
            className += " completed";
        }  else if (state == 3) {
            //完成
            className += " error";
        } else {
            description = "未完成";
        }

        if ((style == "StartNoneEvent") || (style == "EndEvent")) {
            g.setNode(nodeId, {shape: "circle", label: "  ", class: className, description: description});
        } else if (style == "ParallelGateway") {
            g.setNode(nodeId, {shape: "house", label: "+", class: className, description: description});
        } else if (style == "ExclusiveGateway") {
            g.setNode(nodeId, {shape: "house", label: "X", class: className, description: description});
        } else {
            g.setNode(nodeId, {shape: "rect", label: label, class: className, description: description});
        }
    });

    // Set up edges, no special attributes.
    $.each(taskEdgeList, function (i, item) {
        //自己id
        var selfId = item.resourceId;
        //找到parent
        var parent = "sid-25B07A6F-5FC8-4791-8C43-B38C1A5CB7EE";
        $.each(taskNodeList, function (j, taskNode) {
            var outgoings = taskNode.outgoing;
            $.each(outgoings, function (k, outgoing) {
                if (outgoing.resourceId == selfId) {
                    parent = taskNode.resourceId;
                    var child = item.target.resourceId;
                    g.setEdge(parent, child, {label: "", curve: d3.curveBasis});
                }
            })
        });
    });

    g.nodes().forEach(function (v) {
        var node = g.node(v);
        // Round the corners of the nodes
        node.rx = node.ry = 5;
    });

    // Run the renderer. This is what draws the final graph.
    //render(d3.select("svg g"), g);
    render(inner, g);

    //set Tooltip on Hover
    inner.selectAll("g.node").on('click', function (node) {
        showActionSheet(node);
    });

    // Center the graph
    // Zoom and scale to fit
    var graphWidth = g.graph().width + 80;
    var graphHeight = g.graph().height + 40;
    var width = parseInt(svg.style("width").replace(/px/, ""));
    var height = parseInt(svg.style("height").replace(/px/, ""));
    var zoomScale = Math.min(width / graphWidth, height / graphHeight);
    var translateX = (width / 2) - ((graphWidth * zoomScale) / 2)
    var translateY = (height / 2) - ((graphHeight * zoomScale) / 2);
    var svgZoom = true ? svg.transition().duration(2000) : svg;
    svgZoom.call(zoom.transform, d3.zoomIdentity.translate(translateX, translateY).scale(zoomScale));


    //var initialScale = 0.75;
    //svg.call(zoom.transform, d3.zoomIdentity.translate((svg.attr("width") - g.graph().width * initialScale) / 2, 20).scale(initialScale));
    //svg.attr('height', g.graph().height * initialScale + 40);
}

function removeGraph() {
    g.nodes().forEach(function (v) {
        // var node = g.node(v);
        g.removeNode(v);
    });
    render(inner, g);
}

function showActionSheet(node) {
    var selectedNode = g.node(node);
    if (selectedNode.class.indexOf("warn") >= 0) {
        weui.actionSheet([
            {
                label: '查看节点需要的反馈',
                onClick: function () {
                    console.log('拍照');
                }
            }, {
                label: '查看节点详细信息',
                onClick: function () {
                    console.log('从相册选择');
                }
            },
        ], [
            {
                label: '取消',
                onClick: function () {
                    console.log('取消');
                }
            }
        ], {
            className: 'custom-classname',
            onClose: function () {
                console.log('关闭');
            }
        });
    } else if (selectedNode.class.indexOf("completed") >= 0) {
        weui.actionSheet([
            {
                label: '查看完成时间',
                onClick: function () {
                    console.log('从相册选择');
                }
            }, {
                label: '查看节点详情',
                onClick: function () {
                    console.log('其他');
                }
            }
        ], [
            {
                label: '取消',
                onClick: function () {
                    console.log('取消');
                }
            }
        ], {
            className: 'custom-classname',
            onClose: function () {
                console.log('关闭');
            }
        });
    }

}





