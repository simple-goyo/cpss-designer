<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8"/>
    <title>人机物融合应用</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="editor-app/libs/bootstrap_3.1.1/css/bootstrap.min.css"/>
    <link rel="stylesheet" href="css/navigation.css"/>
</head>
<body ng-app="navigation">
<div class="container">
    <div class="row" ng-controller="NavbarCtrl">
        <nav class="navbar navbar-default" role="navigation">
            <div class="navbar-header">
                <a class="navbar-brand" href="/" rel="external nofollow" >人机物融合应用平台</a>
            </div>
            <div class="collapse navbar-collapse navbar-ex1-collapse">
                <ul class="nav navbar-nav">
                    <li ng-repeat="a1 in navbar" class="dropdown">
                        <a ui-sref="{{ a1.link }}" rel="external nofollow" class="dropdown-toggle" data-toggle="dropdown">{{ a1.label }} <b class="caret"></b></a>
                        <ul class="dropdown-menu menu-top">
                            <li ng-repeat="a2 in a1.children" class="dropdown-submenu">
                                <a tabindex="-1" ui-sref="{{ a2.link }}"  rel="external nofollow" >{{ a2.label }}</a>
                                <ul ng-show="a2.children.length>0" class="dropdown-menu">
                                    <li ng-repeat="a3 in a2.children">
                                        <a ui-sref="{{ a3.link }}"  rel="external nofollow" ng-click="go(a3.link)">{{ a3.label }}</a>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
        </nav>
    </div>
    <div class="row" ui-view style="width: 100%;height: 500px">

    </div>
</div>

<script src="editor-app/libs/jquery_1.11.0/jquery.min.js"></script>
<script src="editor-app/libs/angular_1.2.13/angular.min.js"></script>
<script src="editor-app/libs/bootstrap_3.1.1/js/bootstrap.min.js"></script>
<script src="editor-app/libs/angular-ui-router.min.js"></script>
<script src="https://webapi.amap.com/maps?v=1.4.15&key=0527fc08a6b9ab7a0d2dacdf50ed20d6"></script>
<script src="js/app.js"></script>
</body>
</html>