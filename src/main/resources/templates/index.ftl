<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8"/>
    <title >CPSS Application Modeling Tool</title>
    <link rel="stylesheet" href="editor-app/libs/bootstrap_3.1.1/css/bootstrap.min.css"/>
</head>
<body>
<h2>
    <a href='/create?name=activiti&key=123456'>Design</a>
</h2>
<div>
    <table width="100%" class="table">
        <tr>
            <td width="10%">ModelId</td>
            <td width="10%">Version</td>
            <td width="20%">ModelName</td>
            <td width="20%">Modelkey</td>
            <td width="40%">Operation</td>
        </tr>
<#--            <#if modelList??>-->
<#--                <@paging_macro.paging pagingList=modelList url="/index"/>-->
<#--            </#if>-->
	        <#list modelList as model>
	        <tr>
                <td width="10%">${model.id}</td>
                <td width="10%">${model.version}</td>
                <td width="20%"><#if (model.name)??>${model.name}<#else> </#if></td>
                <td width="20%"><#if (model.key)??>${model.key}<#else> </#if></td>
                <td width="40%">
                    <a href="/editor?modelId=${model.id}">Edit</a>
                    <a href="/publish?modelId=${model.id}">Publish</a>
                    <a href="/revokePublish?modelId=${model.id}">Revoke</a>
<#--                    <a href="/delete?modelId=${model.id}">删除</a>-->
                    <a href="javascript:void(0)" onclick="deleteModel(${model.id})">Delete</a>
                    <script>
                        function deleteModel(id){
                            var url = "/delete?modelId=" + id;
                            var httpRequest = new XMLHttpRequest();//第一步：建立所需的对象
                            httpRequest.open('GET', url, true);//第二步：打开连接  将请求参数写在url中  ps:"./Ptest.php?name=test&nameone=testone"
                            httpRequest.send();//第三步：发送请求  将请求参数写在URL中

                            // 获取数据后的处理程序
                            httpRequest.onreadystatechange = function () {
                                if (httpRequest.readyState === 4 && httpRequest.status === 200) {
                                    var json = httpRequest.responseText;//获取到json字符串，还需解析
                                    if(json === "{\"code\":\"SUCCESS\"}"){
                                        alert("模型删除成功！");
                                    }
                                    window.location.reload();
                                }
                            };

                        }
                    </script>
                </td>
            </tr>
            </#list>
    </table>
</div>
</body>
</html>
