var myApp = angular.module('myApp', ['ui.router']);

myApp.controller('NavbarCtrl', function ($scope, $http) {
    $http.get("/js/nav.json").success(function (json) {
        $scope.navbar = json;
    });
    $scope.clickMenu = function () {
        var li = $('ul.sidebar-menu li.active');
        li.removeClass('active');
        $(this).addClass('active');
    }
});