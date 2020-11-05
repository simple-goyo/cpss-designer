var ConstraintController = ['$scope','$rootScope','$http', function ($scope, $rootScope, $http) {
    $scope.entities = [];
    // $scope.entities.push({id:"0",name:"User",icon:"socialentity/person.png"});

    let scenes = $scope.getScenes();
    let data_tempelate = {
        "results": [
        {
            "columns": ["user", "entity"],
            "data": [
                {
                    "graph": {
                        "nodes": [],
                        "relationships": []
                    }
                }
            ]
        }
    ],
        "errors": []
    };

    $scope.close = function (){
        $scope.$hide();
    }

    $scope.getKGNode = function(id, name, properties) {
        let nodeTemp = {
            "id":"1",
            "labels":["Room"],
            "properties":{}
        }

        nodeTemp["id"] = id;
        nodeTemp["labels"][0] = name;
        if(properties !== undefined)
            nodeTemp["properties"] = properties;
        return nodeTemp;
    };

    $scope.getKGRelationship = function (id, name, from, to) {
        let RelationTemp = {
            "id":"1",
            "type":"On",
            "startNode":"1",
            "endNode":"2",
            "properties":{}
        }

        RelationTemp["id"] = id;
        RelationTemp["type"] = name;
        RelationTemp["startNode"] = from;
        RelationTemp["endNode"] = to;

        return RelationTemp;
    }


    $scope.buildKGGraph = function (){
        let dataTemp = {
            "results":[{
                "columns":["user","entity"],
                "data":[{
                    "graph":{
                        "nodes":[],
                        "relationships":[]
                    }
                }]
            }],
            "errors":[]
        }

        let nodes = [];
        let relationships = [];

        let node1 = $scope.getKGNode("1", "Room");
        let node2 = $scope.getKGNode("2", "State", {"name":"Room.state"});
        let node3 = $scope.getKGNode("3", "Capacity", {"name":"Room.capacity"});
        nodes.push(node1);
        nodes.push(node2);
        nodes.push(node3);

        let rela1 = $scope.getKGRelationship("1", "On", "1","2");
        let rela2 = $scope.getKGRelationship("2", "GreaterThan", "1","3");
        relationships.push(rela1);
        relationships.push(rela2);

        dataTemp["results"][0]["data"][0]["graph"]["nodes"] = nodes;
        dataTemp["results"][0]["data"][0]["graph"]["relationships"] = relationships;
        return dataTemp;
    }

    $scope.retreiveData = function () {
        // bindDynamically: false,
        // type: "entity",
        // data: "",
        // text: "",
        // entity: "",
        // rule: ""
        // let properties = $scope.getAllEntitySpecificProperties(scenes);

        let data0 = {
            "results":[{
                "columns":["user","entity"],
                "data":[{
                    "graph":{
                        "nodes":[{
                            "id":"1",
                            "labels":["Room"],
                            "properties":{}
                        },{
                            "id":"2",
                            "labels":["State"],
                            "properties":{"name":"Room.state"}
                        },{
                            "id":"3",
                            "labels":["Capacity"],
                            "properties":{"name":"Room.capacity"}
                        }],
                        "relationships":[{
                            "id":"1",
                            "type":"On",
                            "startNode":"1",
                            "endNode":"2",
                            "properties":{}
                        },{
                            "id":"2",
                            "type":"GreaterThan",
                            "startNode":"1",
                            "endNode":"3",
                            "properties":{}
                        }
                        ]
                    }
                }]
            }],
            "errors":[]
        }

        data = $scope.buildKGGraph();
        return data;
    }

    $scope.init = function () {
        let neo4jData = $scope.retreiveData();
        console.log(JSON.stringify(neo4jData));
        let neo4jd3 = new Neo4jd3('#neo4jd3', {
            highlight: [
                {
                    class: 'Project',
                    property: 'name',
                    value: 'neo4jd3'
                }, {
                    class: 'User',
                    property: 'userId',
                    value: 'eisman'
                }
            ],
            icons: {
                'Api': 'gear',
                'BirthDate': 'birthday-cake',
                'Capacity': 'paw',
                'Email': 'at',
                'Git': 'git',
                'Github': 'github',
                'Ip': 'map-marker',
                'Issues': 'exclamation-circle',
                'Language': 'language',
                'State': 'sliders',
                'Password': 'asterisk',
                'Phone': 'phone',
                'Project': 'folder-open',
                'SecurityChallengeAnswer': 'commenting',
                'User': 'user',
                'zoomFit': 'arrows-alt',
                'zoomIn': 'search-plus',
                'zoomOut': 'search-minus'
            },
            images: {
                'Address': 'constraint-viewer/img/twemoji/1f3e0.svg',
                'BirthDate': 'constraint-viewer/img/twemoji/1f5d3.svg',
                'Capacity': 'constraint-viewer/img/twemoji/1f36a.svg',
                'CreditCard': 'constraint-viewer/img/twemoji/1f4b3.svg',
                'Room': 'constraint-viewer/img/twemoji/1f4bb.svg',
                'Email': 'constraint-viewer/img/twemoji/2709.svg',
                'Git': 'constraint-viewer/img/twemoji/1f5c3.svg',
                'Github': 'constraint-viewer/img/twemoji/1f5c4.svg',
                'icons': 'constraint-viewer/img/twemoji/1f38f.svg',
                'Ip': 'constraint-viewer/img/twemoji/1f4cd.svg',
                'Issues': 'constraint-viewer/img/twemoji/1f4a9.svg',
                'Language': 'constraint-viewer/img/twemoji/1f1f1-1f1f7.svg',
                'State': 'constraint-viewer/img/twemoji/2699.svg',
                'Password': 'constraint-viewer/img/twemoji/1f511.svg',
                'Project|name|d3': 'constraint-viewer/img/twemoji/32-20e3.svg',
                'Project|name|neo4j': 'constraint-viewer/img/twemoji/33-20e3.svg',
                'Project|name|neo4jd3': 'constraint-viewer/img/twemoji/31-20e3.svg',
                'User': 'constraint-viewer/img/twemoji/1f600.svg'
            },
            infoPanel: true,
            minCollision: 60,
            neo4jData: neo4jData,
            nodeRadius: 25,
            onRelationshipDoubleClick: function(relationship) {
                console.log('double click on relationship: ' + JSON.stringify(relationship));
            },
            zoomFit: true
        });
    }


    // LOAD the content of the current editor instance
    window.setTimeout(function(){
        $scope.init();
    }.bind(this), 500);
}];

var activitiModule = angular.module('activitiModeler');
activitiModule.controller('ConstraintController', ConstraintController);
