var ConstraintController = ['$scope','$rootScope','$http', function ($scope, $rootScope, $http) {
    $scope.entities = [];
    $scope.entities.push({id:"0",name:"User",icon:"socialentity/person.png"});

    $scope.close = function (){
        $scope.$hide();
    }

    $scope.retreiveData = function () {
        return "neo4jData.json";
    }

    $scope.init = function () {
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
            neo4jDataUrl: 'constraint-viewer/json/neo4jData.json',
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
// Neo4j_Data_Json = {
//     "results": [
//     {
//         "columns": ["user", "entity"],
//         "data": [
//             {
//                 "graph": {
//                     "nodes": [
//                         {
//                             "id": "1",
//                             "labels": ["User"],
//                             "properties": {
//                                 "userId": "eisman"
//                             }
//                         },
//                         {
//                             "id": "8",
//                             "labels": ["Project"],
//                             "properties": {
//                                 "name": "neo4jd3",
//                                 "title": "neo4jd3.js",
//                                 "description": "Neo4j graph visualization using D3.js.",
//                                 "url": "https://eisman.github.io/neo4jd3"
//                             }
//                         }
//                     ],
//                     "relationships": [
//                         {
//                             "id": "7",
//                             "type": "DEVELOPES",
//                             "startNode": "1",
//                             "endNode": "8",
//                             "properties": {
//                                 "from": 1470002400000
//                             }
//                         }
//                     ]
//                 }
//             }
//         ]
//     }
// ],
//     "errors": []
// }
