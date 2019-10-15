angular.module("myApp")
    .controller("TaskActionResourceController",["$scope",function ($scope) {
        $scope.UserTableInit = function () {
            var oTableInit = new Object();
            //初始化Table
            oTableInit.Init = function () {
                $('#tb_user').bootstrapTable({
                    url: 'user/getUserByPage',         //请求后台的URL（*）
                    method: 'get',                      //请求方式（*）
                    toolbar: '#toolbar',                //工具按钮用哪个容器
                    striped: true,                      //是否显示行间隔色
                    cache: false,                       //是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
                    pagination: true,                   //是否显示分页（*）
                    sortable: true,                     //是否启用排序
                    sortOrder: "asc",                   //排序方式
                    queryParams: oTableInit.queryParams,//传递参数（*）
                    sidePagination: "server",           //分页方式：client客户端分页，server服务端分页（*）
                    pageNumber: 1,                       //初始化加载第一页，默认第一页
                    pageSize: 10,                       //每页的记录行数（*）
                    pageList: [10, 25, 50, 100],        //可供选择的每页的行数（*）
                    search: true,                       //是否显示表格搜索，此搜索是客户端搜索，不会进服务端，所以，个人感觉意义不大
                    strictSearch: true,
                    showColumns: true,                  //是否显示所有的列
                    showRefresh: true,                  //是否显示刷新按钮
                    minimumCountColumns: 2,             //最少允许的列数
                    clickToSelect: true,                //是否启用点击选中行
                    height: 500,                        //行高，如果没有设置height属性，表格自动根据记录条数觉得表格高度
                    uniqueId: "ID",                     //每一行的唯一标识，一般为主键列
                    showToggle: false,                    //是否显示详细视图和列表视图的切换按钮
                    cardView: false,                    //是否显示详细视图
                    detailView: false,                   //是否显示父子表
                    columns: [{
                        checkbox: true
                    }, {
                        field: "id",
                        title: "ID",
                        visible: false
                    }, {
                        field: 'userName',
                        title: '用户名'
                    }, {
                        field: 'email',
                        title: '邮箱'
                    }, {
                        field: 'password',
                        title: '密码'
                    }, {
                        field: 'longitude',
                        title: '经度'
                    }, {
                        field: 'latitude',
                        title: '纬度'
                    },{
                        field: 'puid',
                        title: '微信备注名'
                    },{
                        field: 'openId',
                        title: '微信公众号id'
                    },]
                });
            };

            //得到查询的参数
            oTableInit.queryParams = function (params) {
                var temp = {   //这里的键的名字和控制器的变量名必须一直，这边改动，控制器也需要改成一样的
                    limit: params.limit,   //页面大小
                    offset: params.offset,  //页码
                    email: $("#txt_search_email").val(),
                    remarkName: $("#txt_search_remark_name").val(),
                    search: params.search
                };
                return temp;
            };
            return oTableInit;
        };
    }]);