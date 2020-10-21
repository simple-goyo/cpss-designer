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

    $scope.retreiveData = function () {
        let node_tempelate = {
                "id": "8",
                "labels": ["Project"],
                "properties": {
                    "name": "neo4jd3",
                    "title": "neo4jd3.js",
                    "description": "Neo4j graph visualization using D3.js.",
                    "url": "https://eisman.github.io/neo4jd3"
                }
            };
        let relationships_tempelate = {
            "id": "7",
            "type": "DEVELOPES",
            "startNode": "1",
            "endNode": "8",
            "properties": {
                "from": 1470002400000
            }
        };
        // bindDynamically: false,
        // type: "entity",
        // data: "",
        // text: "",
        // entity: "",
        // rule: ""
        let properties = $scope.getAllEntitySpecificProperties(scenes);

        return "neo4jData.json";
    }

    $scope.init = function () {
        let neo4jData = $scope.retreiveData();
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
