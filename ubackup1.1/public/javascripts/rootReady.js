/**
 * Created by bluseayan on 17-12-29.
 */
var username = sessionStorage.getItem("username");
var token = sessionStorage.getItem("token");
var userID = sessionStorage.getItem("userID");
var progressTable,systemTable,deviceTable,fileTable,strategyTable,errTable;
var current = 'systems';
var systemID,systemName;
var deviceID,deviceName,deviceType,ip,deviceUsername,devicePassword,devicePort;
var fileID,filename,remotePath,routeCommand,identifyKeywords;
var haveTest = 0;
var haveAgain = 0;
var haveNotice = 0;
var testID,testLoad;
var againID,againLoad;

$(function () {
    //
    $('#currentUser').text('超级管理员');
    $('#logout').click(function () {
        sessionStorage.clear();
        window.location.href = '/index.html';
    });
    $('#uNav').text('当前路径：用户-'+username);
    //
    $("#userSelect").find("option:selected").text(username);
    //
    $.post('/home/users/list',{userID:userID,token:token},function (data) {
        if(data.code === code.users.list.ok){
            var data = JSON.parse(data.data);
            for(var i=0;i<data.length;i++){
                $("#userSelect").append("<option value="+data[i].userID+">"+data[i].username+"</option>")
            }
        }
        else {
            layer.msg(data.code);
        }
    });
    //
    $('#userSelect').change(function () {
        var id = $("#userSelect").find("option:selected").val();
        sessionStorage.setItem('userID',id);
        sessionStorage.setItem('username',$("#userSelect").find("option:selected").text());
        location.reload();
    });

    //
    systemTable = $('#systemTable').DataTable({
        processing:true,
        lengthChange: false,
        ajax: {
            url: '/home/systems/refresh',
            type: 'POST',
            data:{userID:userID,token:token}
        },
        columns: [
            {data: '系统ID'},
            {data: '系统名'},
            {data: '系统描诉'}
        ]
    });
    //
    deviceTable = $('#deviceTable').DataTable({
        processing:true,
        lengthChange: false,
        columns: [
            {data: '设备ID'},
            {data: '设备名'},
            {data: '设备类型'},
            {data: '设备ip'},
            {data: '设备用户名'},
            {data: '系统登录密码'},
            {data: '设备ssh端口'}
        ]
    });
    //
    fileTable = $('#fileTable').DataTable({
        processing:true,
        lengthChange: false,
        columns: [
            {data: '文件ID'},
            {data: '文件名'},
            {data: '文件类型'},
            {data: '文件远程路径'},
            {data: '查看配置命令'},
            {data: '配置信息关键字'}
        ]
    });
    //
    progressTable = $('#progressTable').DataTable({
        processing:true,
        lengthChange: false,
        ajax:{
            url:'/home/progress/refresh',
            type: 'POST',
            data:{userID:userID,token:token,data:'u'+userID}
        },
        columns: [
            {data: '历史ID'},
            {data: '系统名'},
            {data: '设备名'},
            {data: '文件名'},
            {data: '备份时间'},
            {data: '状态'}
        ]
    });
    //
    strategyTable = $('#strategyTable').DataTable({
        processing:true,
        lengthChange: false,
        ajax: {
            url: '/home/strategy/refresh',
            type: 'POST',
            data:{userID:userID,token:token}
        },
        columns: [
            {data: '系统ID'},
            {data: '系统名'},
            {data: '系统描诉'},
            {data: '备份频率'},
            {data: '截止时间'}
        ]
    });
    //
    $('#jstree').jstree({
        'core' : {
            'data' : function (obj,cb) {
                $.post('/home/progress/tree',{userID:userID,token:token},function (data) {
                    if(data.code === code.tree.ok){
                        var data = JSON.parse(data.data);
                        cb.call(this,data);
                    }
                    else
                        layer.msg(data.code);
                })
            }
        }
    });
    var jstree = $.jstree.reference('#jstree');

    //
    $('#setting').click(function () {
        $('#progressDiv,#strategyDiv').hide();
        $('#settingDiv').show();
    });
    $('#strategy').click(function () {
        $('#progressDiv,#settingDiv').hide();
        $('#strategyDiv').show();
    });
    $('#progress').click(function () {
        $('#strategyDiv,#settingDiv').hide();
        $('#progressDiv').show();
        jstree.refresh();

    })
    //
    $('#systemTable tbody').on( 'click', 'tr', function () {
        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
        }
        else {
            systemTable.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
            var row = systemTable.row('.selected').data();
            $('#sNav').text('系统-'+row.系统名);
            if(current === 'systems'){
                $('#updateSystemDescribe').val(row.系统描诉);
            }
        }
    } );
    //
    $('#deviceTable tbody').on( 'click', 'tr', function () {
        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
        }
        else {
            deviceTable.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
            var row = deviceTable.row('.selected').data();
            $('#dNav').text('设备-'+row.设备名);
            if(current === 'devices'){
                $('#updateIp').val(row.设备ip);
                $('#updateDeviceUsername').val(row.设备用户名);
                $('#updateDevicePort').val(row.设备ssh端口);
            }
        }
    } );
    //
    $('#fileTable tbody').on( 'click', 'tr', function () {
        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
        }
        else {
            fileTable.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
            var row = fileTable.row('.selected').data();
            $('#fNav').text('文件-'+row.文件名);
            if(current === 'files'){
                if(deviceType === 0){
                    $('#updateRemotePath').val(row.文件远程路径);
                }
                else {
                    $('#updateRouteCommand').val(row.查看配置命令);
                    $('#updateIdentifyKeywords').val(row.配置信息关键字);
                }
            }
        }
    } );
    //
    $('#progressTable tbody').on( 'click', 'tr', function () {
        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
        }
        else {
            progressTable.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
            //$('#pNav').text('进度');
        }
    } );
    //
    $('#strategyTable tbody').on( 'click', 'tr', function () {
        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
        }
        else {
            strategyTable.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
            $('#updateStrategyModalLabel').text('编辑备份策略:' + strategyTable.row('.selected').data().系统名);
        }
    } );
    //
    $('#enter').click(function () {
        if(current === 'systems'){
            var row = systemTable.row('.selected').data();
            if(row != undefined){
                current = 'devices';
                $('#back').attr('disabled',false);
                $('#systems,#addSystemContent,#updateSystemContent').hide();
                $('#devices,#addDeviceContent,#updateDeviceContent').show();
                systemID = row.系统ID;
                systemName = row.系统名;
                deviceTable.settings()[0].ajax = {
                    url:'/home/devices/refresh',
                    type: 'POST',
                    data:{userID:userID,token:token,systemID:systemID}
                };
                deviceTable.ajax.reload();
            }
            else
                layer.msg('请先选中一个系统');

        }
        else if(current === 'devices'){
            var row = deviceTable.row('.selected').data();
            if(row != undefined){
                current = 'files';
                $('#enter').attr('disabled',true);
                $('#devices,#addDeviceContent,#updateDeviceContent').hide();
                $('#files,#test,#addFileContent,#updateFileContent').show();
                deviceID = row.设备ID;
                deviceName = row.设备名;
                deviceType = row.设备类型=='linux主机'? 0:1;
                ip = row.设备ip;
                deviceUsername = row.设备用户名;
                devicePassword = row.设备登录密码;
                devicePort = row.设备ssh端口;
                fileTable.settings()[0].ajax = {
                    url:'/home/files/refresh',
                    type: 'POST',
                    data:{userID:userID,token:token,deviceID:deviceID}
                };
                fileTable.ajax.reload();
                //
                if(deviceType === 0){
                    $('#addRouter,#updateRouter').hide();
                    $('#addHost,#updateHost').show();
                }
                else {
                    $('#addHost,#updateHost').hide();
                    $('#addRouter,#updateRouter').show();
                }
            }
            else
                layer.msg('请先选中一个设备');
        }
    });
    //
    $('#back').click(function () {
        if(current === 'devices'){
            current = 'systems';
            $('#back').attr('disabled',true);
            $('#devices,#addDeviceContent,#updateDeviceContent,#deleteDeviceContent').hide();
            $('#systems,#addSystemContent,#updateSystemContent,#deleteSystemContent').show();
            $('#dNav').text('');
        }
        else if(current === 'files'){
            current = 'devices';
            $('#enter').attr('disabled',false);
            $('#files,#test,#addFileContent,#updateFileContent,#deleteFileContent').hide();
            $('#devices,#addDeviceContent,#updateDeviceContent,#deleteDeviceContent').show();
            $('#fNav').text('');
        }
    });

    //
    $('#view').click(function () {
        var row = progressTable.row('.selected').data();
        if(row != undefined){
            $('#viewModalLabel').text('查看文件脚本结果：'+row.文件名);
            var data = {
                userID:userID,
                token:token,
                taskHistoryID:row.历史ID
            }
            $.post('/home/progress/view',data,function (data) {
                if(data.code === code.progress.view.ok){
                    var data = JSON.parse(data.data);
                    $('#progressContent').text(data.progress);
                    $('#scriptContent').text(data.script);
                }
                else
                    layer.msg(data.code);
            });
        }
        else{
            layer.msg('请先选中一个文件');
            $('#viewModalLabel').text('查看文件脚本结果：文件未选中');
        }
    });
    //
    $('#jstree').on("changed.jstree", function (e,data) {
        if(data.instance.get_node(data.selected[0]).id != null){
            var id = data.instance.get_node(data.selected[0]).id;
            progressTable.settings()[0].ajax = {
                url:'/home/progress/refresh',
                type: 'POST',
                data:{userID:userID,token:token,data:id}
            };
            progressTable.ajax.reload();
        }


    });
    //
    setInterval(function () {
        if(haveNotice === 0)
            haveNotice = 1;
        $.post('/home/notice',{userID:userID,token:token},function (data) {
            if(data.code === code.notice.ok){
                var time = new Date().toLocaleString();
                $('#noticeContent').text('动态消息栏：截止 '+ time + ' 系统运转良好。失败记录为： ' + data.data + ' 条。');
                haveNotice = 0;
            }
        })
    },1000);
});
//
