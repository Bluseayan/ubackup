/**
 * Created by bluseayan on 17-12-29.
 */
var username = sessionStorage.getItem("username");
var token = sessionStorage.getItem("token");
var userID = sessionStorage.getItem("userID");
var progressTable,systemTable,deviceTable,fileTable,strategyTable;
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
    $('#currentUser').text(username);
    $('#logout').click(function () {
        sessionStorage.clear();
        window.location.href = '/index.html';
    });
    $('#uNav').text('当前路径：用户-'+username);
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
        "themes":{
            "theme" : "classic",
            "dots" : true,
            "icons" : true
        },
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
            var row = progressTable.row('.selected').data();
            if(row != null){
                if(row.状态 === '失败'){
                    $('#download').attr('disabled',true);
                    $('#again,#ignore').attr('disabled',false);
                }
                else {
                    $('#download').attr('disabled',false);
                    $('#again,#ignore').attr('disabled',true);
                }
            }
            else {
                $('#again,#ignore,#download').attr('disabled',true);
            }
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
    $('#saveAddSystem').click(function () {
        var data = {
            username:username,
            systemName:$('#addSystemName').val().trim(),
            systemDescribe:$('#addSystemDescribe').val().trim()
        };
        if(checkChar(data.systemName) === true && checkChar(data.systemDescribe) === true){
            $.post('/home/systems/add',{userID:userID,token:token,data:JSON.stringify(data)},function (data) {
                if(data.code === code.systems.add.ok){
                    systemTable.ajax.reload();
                    strategyTable.ajax.reload();
                    layer.msg(data.code);
                }
                else
                    layer.msg(data.code);
            })
        }
        else
            layer.msg('系统名、系统描诉只能是英文、数字、汉字。')
    });
    //
    $('#saveAddDevice').click(function () {
        var flag = true;
        var data = {
            username:username,
            systemName:systemName,
            systemID:systemID,
            deviceName:$('#addDeviceName').val().trim(),
            deviceType:$("input[name='addDeviceType']:checked").val().trim(),
            ip:$('#addIp').val().trim(),
            deviceUsername:$('#addDeviceUsername').val().trim(),
            devicePassword:$('#addDevicePassword').val().trim(),
            devicePort:$('#addDevicePort').val().trim()
        };
        if(checkChar(data.deviceName)===false || checkChar(data.deviceUsername)===false || checkChar(data.devicePassword)===false){
            flag = false;
            layer.msg('系统名、用户名、密码只能是英文、数字、汉字。');
            return;
        }
        if(checkIp(data.ip)===false){
            flag = false;
            layer.msg('ip格式错误。');
            return;
        }
        if(checkNum(data.devicePort)===false){
            flag = false;
            layer.msg('端口必须是数字');
            return;
        }
        if(flag === true){
            $.post('/home/devices/add',{userID:userID,token:token,data:JSON.stringify(data)},function (data) {
                if(data.code === code.devices.add.ok){
                    deviceTable.ajax.reload();
                    layer.msg(data.code);
                }
                else
                    layer.msg(data.code);
            })
        }
    });
    //
    $('#saveAddFile').click(function () {
        var flag = true;
        if (deviceType == 0){
            var data = {
                username:username,
                systemName:systemName,
                deviceName:deviceName,
                systemID:systemID,
                deviceID:deviceID,
                deviceType:deviceType,
                //
                filename:$('#addHostFilename').val().trim(),
                remotePath:$('#addRemotePath').val().trim(),
                routeCommand:'不使用',
                identifyKeywords:'不使用'
            };
            if(checkChar(data.filename)===false){
                flag = false;
                layer.msg('文件名只能是英文、数字、汉字。')
                return;
            }
            if(checkPath(data.remotePath)===false){
                flag = false;
                layer.msg('远程路径格式不对。');
                return;
            }
        }
        else{
            var data = {
                username:username,
                //
                systemName:systemName,
                deviceName:deviceName,
                systemID:systemID,
                deviceID:deviceID,
                deviceType:deviceType,
                filename:$('#addRouterFilename').val().trim(),
                remotePath:'不使用',
                routeCommand:$('#addRouteCommand').val().trim(),
                identifyKeywords:$('#addIdentifyKeywords').val().trim()
            };
            if(checkChar(data.filename)===false || checkChar(data.remotePath)===false || checkChar(data.identifyKeywords)===false){
                flag = false;
                layer.msg('文件名、路由命令、配置信息关键字只能是英文、数字、汉字。')
            }
        }
        if(flag === true){
            $.post('/home/files/add',{userID:userID,token:token,data:JSON.stringify(data)},function (data) {
                if(data.code === code.files.add.ok && data.haveStra === 0){
                    fileTable.ajax.reload();
                    layer.msg(data.code);
                }
                else if(data.code === code.files.add.ok && data.haveStra === 1){
                    fileTable.ajax.reload();
                    layer.msg(data.code + '该系统已有备份策略，新添加的文件将自动应用其备份策略。');
                }
                else
                    layer.msg(data.code);
            })
        }
    });
    //
    $('#delete').click(function () {
        if(current == 'systems'){
            var row = systemTable.row('.selected').data();
            if(row != undefined){
                layer.confirm('删除系统将删除该系统的备份任务以及已经备份的文件，你确定吗？', {
                    btn: ['确认', '取消']
                }, function(index){
                    layer.close(index);
                    var load = layer.load('正在删除...');
                    $.post('/home/systems/delete',{userID:userID,token:token,username:username,systemID:row.系统ID,systemName:row.系统名},function (data) {
                        if(data.code === code.systems.delete.ok){
                            systemTable.ajax.reload();
                            strategyTable.ajax.reload();
                            layer.msg(data.code);
                        }
                        else
                            layer.msg(data.code);
                        layer.close(load);
                    });
                }, function(index){
                    layer.close(index);
                });
            }
            else
                layer.msg('请先选中一个系统');
        }
        else if (current === 'devices'){
            var row = deviceTable.row('.selected').data();
            if(row != undefined){
                layer.confirm('删除设备将删除该设备的备份任务以及已经备份的文件，你确定吗？', {
                    btn: ['确认', '取消']
                }, function(index){
                    layer.close(index);
                    var load = layer.load('正在删除...');
                    var data = {userID:userID,token:token,username:username,deviceID:row.设备ID,deviceName:row.设备名,systemName:systemName};
                    $.post('/home/devices/delete',data,function (data) {
                        if(data.code === code.devices.delete.ok){
                            layer.msg(data.code);
                        }
                        else
                            layer.msg(data.code);
                        deviceTable.ajax.reload();
                        layer.close(load);
                    });
                }, function(index){
                    layer.close(index);
                });
            }
            else
                layer.msg('请先选中一个设备');
        }
        else if (current === 'files'){
            var row = fileTable.row('.selected').data();
            if(row != undefined){
                layer.confirm('删除文件将删除该文件的备份任务以及已经备份的文件，你确定吗？', {
                    btn: ['确认', '取消']
                }, function(index){
                    layer.close(index);
                    var load = layer.load('正在删除...');
                    var data = {userID:userID,token:token,username:username,deviceName:deviceName,systemName:systemName,deviceType:deviceType,filename:row.文件名,fileID:row.文件ID,remotePath:row.文件远程路径};
                    $.post('/home/files/delete',data,function (data) {
                        if(data.code === code.files.delete.ok){
                            fileTable.ajax.reload();
                            layer.msg(data.code);
                        }
                        else
                            layer.msg(data.code);
                        layer.close(load);
                    });
                }, function(index){
                    layer.close(index);
                });
            }
            else
                layer.msg('请先选中一个文件');
        }
    });
    //
    $('#test').click(function () {
        var row = fileTable.row('.selected').data();
        if(row != undefined) {
            $('#testModalLabel').text('查看文件测试结果：' + row.文件名);
            //
            var data = {
                systemID:systemID,
                deviceID:deviceID,
                fileID:row.文件ID
            }
            $.post('/home/fileTest/writeTask',{userID:userID,token:token,data:JSON.stringify(data)},function (data) {
                if (data.code === code.fileTest.writeTask.ok) {
                    haveTest = 1;
                    testID = data.data;
                    layer.msg(data.code);
                    testLoad = layer.load('正在读取...');
                }
                else {
                    layer.msg(data.code);
                }
            })
        }
        else {
            layer.msg('请先选中一个文件');
            $('#testModalLabel').text('查看文件测试结果：文件未选中');
        }
    });
    //
    setInterval(function () {
        if(haveTest === 1){
            $.ajax({
                url: '/home/fileTest/read',
                type: 'POST',
                data: {userID:userID,token:token,taskID:testID},
                success: function (result) {
                    var bra = JSON.parse(result.data);
                    if(bra != null && bra.state > 0){
                        layer.close(testLoad);
                        $('#testProgress').text(bra.progress);
                        $('#testScript').text(bra.script);
                        haveTest = 0;
                    }
                    else {
                        $('#testProgress').text('等待测试任务结果...');
                    }

                }
            })
        }
    },1000);
    $('#closeFileTest').click(function () {
        $('#testProgress,#testScript').text(null);
    });
    //
    $('#frequency_30,#frequency_60').click(function () {
        $('#frequency').attr('disabled',true);
    });
    $('#frequency_custom').click(function () {
        $('#frequency').attr('disabled',false);
    });
    $('#endtime').datepicker();
    $('#saveUpdateStrategy').click(function () {
        var row = strategyTable.row('.selected').data();
        var data = {
            frequency:$("input[name='days']:checked").val()==='custom'? $('#frequency').val().trim():$("input[name='days']:checked").val(),
            endtime:$('#endtime').val().trim()
        }
        if(row != undefined){
            var flag = true;
            if(data.frequency<0 || parseInt(data.frequency)!==parseFloat(data.frequency)){
                flag = false;
                layer.msg('备份频率必须为整数且大于0');
            }
            else if(Date.parse(data.endtime) <= new Date().getTime()){
                flag = false;
                layer.msg('日期必须大于当前时间');
            }

            if(flag === true){
                layer.confirm('如果当前系统已有备份策略，将会覆盖它，同时旧的备份策略中还未执行到的备份任务将被删除。你确定吗？', {
                    btn: ['确认', '取消']
                }, function(index){
                    layer.close(index);
                    var load = layer.load('正在更新系统备份策略...');
                    $.post('/home/strategy/update',{userID:userID,token:token,username:username,systemID:row.系统ID,systemName:row.系统名,data:JSON.stringify(data)},function (data) {
                        if(data.code === code.strategy.ok)
                            layer.msg(data.code);
                        else
                            layer.msg(data.code);
                        strategyTable.ajax.reload();
                        layer.close(load);
                    });
                }, function(index){
                    layer.close(index);
                });
            }
        }
        else
            layer.msg('请先选中一个系统');
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
    $('#downloadUrl').click(function () {
        $(this).hide();
    })
    //
    $('#download').click(function () {
        var row = progressTable.row('.selected').data();
        if(row != undefined){
            if(row.状态 === '成功'){
                var data = {
                    userID:userID,
                    token:token,
                    taskHistoryID:row.历史ID
                }
                $.post('/home/progress/download',data,function (data) {
                    if(data.code === code.progress.download.get){
                        //window.open(data.data);
                        $('#downloadUrl').attr('href',data.data);
                        $('#downloadUrl').text('点击下载文件'+row.文件名+'(历史ID：'+row.历史ID+')');
                        $('#downloadUrl').show();
                        layer.msg(data.code);
                    }
                    else
                        layer.msg(data.code);
                });
            }
            else
                layer.msg('状态失败的文件不能下载');
        }
        else
            layer.msg('请先选中一个文件');

    });
    //
    $('#again').click(function () {
        var row = progressTable.row('.selected').data();
        if(row != undefined) {
            if(row.状态 == '失败'){
                $('#againModalLabel').text('查看立即重试结果：' + row.文件名);
                //
                var data = {
                    systemName:row.系统名,
                    deviceName:row.设备名,
                    taskHistoryID:row.历史ID
                }
                $.post('/home/progress/again',{userID:userID,token:token,data:JSON.stringify(data)},function (data) {
                    if (data.code === code.progress.again.ok) {
                        haveAgain = 1;
                        againID = data.data;
                        //
                        $('#againProgress').text('');
                        $('#againScript').text('');
                        //
                        layer.msg(data.code);
                        againLoad = layer.load('正在读取...');
                    }
                    else {
                        layer.msg(data.code);
                    }
                })
            }
            else {
                layer.msg('立即重试用于状态失败的文件');
            }
        }
        else {
            layer.msg('请先选中一个文件');
            $('#againModalLabel').text('查看立即重试结果：文件未选中');
        }
    })
    //
    setInterval(function () {
        if(haveAgain === 1){
            $.ajax({
                url: '/home/fileTest/read',
                type: 'POST',
                data: {userID: userID, token: token, taskID: againID},
                success: function (result) {
                    var bra = JSON.parse(result.data);
                    if(bra != null && bra.state > 0){
                        $('#againProgress').text(bra.progress);
                        $('#againScript').text(bra.script);
                        haveAgain = 0;
                        layer.close(againLoad);
                    }
                    else {
                        $('#againProgress').text('等待立即重试结果...');
                    }
                }
            })
        }
    },1000);
    //
    $('#ignore').click(function () {
        var row = progressTable.row('.selected').data();
        if(row != undefined) {
            if(row.状态 == '失败'){
                layer.confirm('忽略将删除该条错误记录，下次进入‘备份进度’栏将不会再看到它，你确定吗？', {
                    btn: ['确认', '取消']
                }, function(index){
                    layer.close(index);
                    var load = layer.load('正在删除...');
                    $.post('/home/progress/ignore',{userID:userID,token:token,taskHistoryID:row.历史ID},function (data) {
                        if(data.code === code.progress.ignore.ok){
                            progressTable.ajax.reload();
                            layer.msg(data.code);
                        }
                        else
                            layer.msg(data.code);
                        layer.close(load);
                    });
                }, function(index){
                    layer.close(index);
                });
            }
            else {
                layer.msg('状态为‘失败’才能使用忽略')
            }
        }
        else {
            layer.msg('请先选中一个文件');
        }
    })
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
            else {
                var time = new Date().toLocaleString();
                $('#noticeContent').text('动态消息栏：截止 '+ time + ' 系统运转异常，请联系管理员检查后台。');
                haveNotice = 0;
            }
        })
    },1000);
    //
    $('#saveUpdateFile').click(function () {
        var row = fileTable.row('.selected').data();
        if(row != undefined) {
            layer.confirm('更新文件时，受影响的还未执行到的文件备份任务将被删除，你确定吗？', {
                btn: ['确认', '取消']
            }, function(index){
                layer.close(index);
                var flag = true;
                if (deviceType == 0){
                    var data = {
                        username:username,
                        systemName:systemName,
                        deviceName:deviceName,
                        deviceType:deviceType,
                        //
                        fileID:row.文件ID,
                        filename:row.文件名,
                        oldRemotePath:row.文件远程路径,
                        //
                        remotePath:$('#updateRemotePath').val().trim(),
                        routeCommand:'不使用',
                        identifyKeywords:'不使用'
                    };
                    if(checkPath(data.remotePath)===false){
                        flag = false;
                        layer.msg('远程路径格式不对。');
                    }
                }
                else{
                    var data = {
                        username:username,
                        systemName:systemName,
                        deviceName:deviceName,
                        deviceType:deviceType,
                        //
                        fileID:row.文件ID,
                        remotePath:'不使用',
                        routeCommand:$('#updateRouteCommand').val().trim(),
                        identifyKeywords:$('#updateIdentifyKeywords').val().trim()
                    };
                    if(checkChar(data.remotePath)===false || checkChar(data.identifyKeywords)===false){
                        flag = false;
                        layer.msg('文件名、路由命令、配置信息关键字只能是英文、数字、汉字。')
                    }
                }
                if(flag === true){
                    var load = layer.load('正在更新...');
                    $.post('/home/files/update',{userID:userID,token:token,data:JSON.stringify(data)},function (data) {
                        if(data.code === code.files.update.ok){
                            fileTable.ajax.reload();
                            layer.msg(data.code);
                        }
                        else
                            layer.msg(data.code);
                        layer.close(load);
                    })
                }
            }, function(index){
                layer.close(index);
            });
        }
        else {
            layer.msg('请先选中一个文件');
        }
    });
    //
    $('#saveUpdateDevice').click(function () {
        var row = deviceTable.row('.selected').data();
        if(row != undefined) {
            layer.confirm('更新设备时，还未执行到的设备备份任务也将应用新的设备参数，你确定吗？', {
                btn: ['确认', '取消']
            }, function(index){
                layer.close(index);
                var flag = true;
                var data = {
                    deviceID:row.设备ID,
                    ip:$('#updateIp').val().trim(),
                    deviceUsername:$('#updateDeviceUsername').val().trim(),
                    devicePassword:$('#updateDevicePassword').val().trim(),
                    devicePort:$('#updateDevicePort').val().trim()
                }
                if(checkChar(data.deviceUsername)===false || checkChar(data.devicePassword)===false){
                    flag = false;
                    layer.msg('系统名、用户名、密码只能是英文、数字、汉字。');
                    return;
                }
                if(checkIp(data.ip)===false){
                    flag = false;
                    layer.msg('ip格式错误。');
                    return;
                }
                if(checkNum(data.devicePort)===false){
                    flag = false;
                    layer.msg('端口必须时数字');
                    return;
                }
                if(flag === true){
                    var load = layer.load('正在更新...');
                    $.post('/home/devices/update',{userID:userID,token:token,data:JSON.stringify(data)},function (data) {
                        if(data.code === code.devices.update.ok){
                            deviceTable.ajax.reload();
                            layer.msg(data.code);
                        }
                        else
                            layer.msg(data.code);
                        layer.close(load);
                    })
                }
            }, function(index){
                layer.close(index);
            });
        }
        else {
            layer.msg('请先选中一个设备');
        }
    });
    //
    $('#saveUpdateSystem').click(function () {
        var row = systemTable.row('.selected').data();
        if(row != undefined) {
            var data = {
                systemID:row.系统ID,
                systemDescribe:$('#updateSystemDescribe').val().trim()
            };

            if(checkChar(data.systemDescribe) === true){
                $.post('/home/systems/update',{userID:userID,token:token,data:JSON.stringify(data)},function (data) {
                    if(data.code === code.systems.update.ok){

                        systemTable.ajax.reload();
                        strategyTable.ajax.reload();
                        layer.msg(data.code);
                    }
                    else
                        layer.msg(data.code);
                })
            }
            else
                layer.msg('系统名、系统描诉只能是英文、数字、汉字。')
        }
        else {
            layer.msg('请先选中一个设备');
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
});
//
