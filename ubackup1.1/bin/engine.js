/**
 * Created by bluseayan on 17-11-24.
 */

//引入必要的模块
var connection = require('../share/mysql/mysql_pool');
var events = require('events');
var callfile = require('child_process');
var code = require('../share/engine_code');
var mystery = require('../share/mystery');

//三个主流程事件类
var backup = new events.EventEmitter();
var insertHistory = new events.EventEmitter();
var deleteExpired = new events.EventEmitter();

//任务成功或失败标志
var Success = 1;
var Failure = 0;

//
function formatDate(time) {
    var t = new Date(time);
    var year = t.getFullYear();
    var month = t.getMonth();
    var day = t.getDate();
    var hour = t.getHours();
    var minute = t.getMinutes();
    var second = t.getSeconds();
    var result = year+'-'+(month+1)+'-'+day+' '+hour+':'+minute+':'+second;
    return result;

}

//读任务函数
var read = function () {
    var sqlRead = "SELECT t.taskID,t.userID,t.state,t.count,t.taskTime,d.deviceType,t.fileID,f.filename,d.ip,d.deviceUsername,d.devicePassword," +
        "d.devicePort,f.remotePath,f.localPath,f.routeCommand,f.identifyKeywords FROM tasks t join devices d on t.deviceID=d.deviceID join files f on t.fileID=f.fileID " +
        "WHERE t.state<2 and t.count>0 and unix_timestamp()*1000>=t.taskTime;";

    connection.query(sqlRead,function (err,rows) {
        if (err) {
            console.log(new Date().toLocaleString()+err);
            backup.emit('backupLoop');
        }
        else {
            if (rows.length<1) {
                //console.log('no tasks!');
                backup.emit('backupLoop');
            }
            else {
                var min = 0;
                var min_state = rows[0].state;
                for(i=0;i<rows.length;i++){
                    if(rows[i].state<min_state)
                        min = i;
                }
                var taskID = rows[min].taskID;
                var userID = rows[min].userID;
                var state = rows[min].state;
                var count = rows[min].count;
                var taskTime = rows[min].taskTime;
                var deviceType = rows[min].deviceType;
                var fileID = rows[min].fileID;
                var filename = rows[min].filename;
                var ip = rows[min].ip;
                var deviceUsername = rows[min].deviceUsername;
                var devicePassword = mystery(rows[min].devicePassword);
                var devicePort = rows[min].devicePort;
                var remotePath = rows[min].remotePath;
                var localPath = rows[min].localPath;
                var routeCommand = rows[min].routeCommand;
                var identifyKeywords = rows[min].identifyKeywords;

                var progress = code.progress.readSuccess;
                backup.emit('progress',taskID,progress,0);

                if(deviceType===0)
                    backup.emit('executeHostScp',taskID,userID,state,count,taskTime,deviceType,fileID,filename,
                        ip,deviceUsername, devicePassword,devicePort,remotePath,localPath,progress);
                else
                    backup.emit('executeRouter',taskID,userID,state,count,taskTime,deviceType,fileID,filename,
                        ip,deviceUsername, devicePassword,devicePort,localPath,routeCommand,identifyKeywords,progress);
            }
        }
    })
}

//主机文件复制函数
var executeHostScp = function (taskID,userID,state,count,taskTime,deviceType,fileID,filename,
                               ip,deviceUsername,devicePassword,devicePort,remotePath,localPath,preProgress) {
    var filenameOnPath = remotePath+'/'+filename;
    callfile.execFile('./shell/scp.sh',[ip,deviceUsername,devicePassword,devicePort,filename,filenameOnPath,taskID],null,
        function(err,stdout,stderr)
        {
            if (err){
                console.log(new Date().toLocaleString()+err);
                var progress = preProgress + '#' + code.progress.hostScriptError;
                backup.emit('progress',taskID,progress,0);
                backup.emit('script',taskID,stderr.toString());
                backup.emit('updateState',taskID,state,count,progress,Failure);
            }
            else{
                var sucess_flag=/100%/;
                var deny_flag = new RegExp('Permission denied, please try again');
                if(sucess_flag.test(stdout)===true && deny_flag.test(stdout) === false){
                    var progress = preProgress + '#' + code.progress.hostScriptSuccess;
                    backup.emit('progress',taskID,progress,0);
                    backup.emit('script',taskID,stdout.toString());
                    backup.emit('executeHostMv',taskID,userID,state,count,taskTime,deviceType,fileID,filename,
                        ip,deviceUsername,devicePassword,remotePath,localPath,progress);
                }
                else {
                    var progress = preProgress + '#' + code.progress.hostScriptParameterError;
                    backup.emit('progress',taskID,progress,0);
                    backup.emit('script',taskID,stdout.toString());
                    backup.emit('updateState',taskID,state,count,progress,Failure);
                }
            }
        });
};

//主机文件移动到用户目录函数
var executeHostMv = function (taskID,userID,state,count,taskTime,deviceType,fileID,filename,
                              ip,deviceUsername,devicePassword,remotePath,localPath,preProgress) {
    var newName = '['+ formatDate(taskTime) + '__' + remotePath.replace(/\//g,'-')+']'+ filename;
    var localName = localPath + '/' + newName;
    callfile.execFile('./shell/mv.sh',[localName,taskID],null,
        function(err,stdout,stderr)
        {
            if (err){
                console.log(new Date().toLocaleString()+err);
                var progress = preProgress + '#' + code.progress.executeHostMvFailure;
                backup.emit('progress',taskID,progress,0);
                backup.emit('updateState',taskID,state,count,progress,Failure);
            }
            else{
                var progress = preProgress + '#' + code.progress.executeHostMvSuccess;
                backup.emit('progress',taskID,progress,0);
                backup.emit('updateState',taskID,state,count,progress,Success);
            }
        });
}

//路由器文件复制函数
var executeRouter = function (taskID,userID,state,count,taskTime,deviceType,fileID,filename,
                              ip,deviceUsername,devicePassword,devicePort,localPath,routeCommand,identifyKeywords,preProgress) {
    var localName = localPath + '/' + '['+ formatDate(taskTime) + ']' +filename;
    callfile.execFile('./shell/routing.sh', [ip,deviceUsername,devicePassword,devicePort,taskID,localName,routeCommand], null,
        function (err, stdout, stderr) {
            if (err){
                console.log(new Date().toLocaleString()+err);
                var progress = preProgress + '#' + code.progress.routerScriptError;
                backup.emit('progress',taskID,progress,0);
                backup.emit('script',taskID,stderr.toString());
                backup.emit('updateState',taskID,state,count,progress,Failure);
            }
            else{
                var success_flag = new RegExp(identifyKeywords);
                var deny_flag = new RegExp('Permission denied, please try again');
                if (success_flag.test(stdout) === true && deny_flag.test(stdout) === false) {
                    var progress = preProgress + '#' + code.progress.routerScriptSuccess;
                    backup.emit('progress',taskID,progress,0);
                    backup.emit('script',taskID,stdout.toString());
                    backup.emit('updateState',taskID,state,count,progress,Success);
                }
                else {
                    var progress = preProgress + '#' + code.progress.routerScriptFailure;
                    backup.emit('progress',taskID,progress,0);
                    backup.emit('script',taskID,stdout.toString());
                    backup.emit('updateState',taskID,state,count,progress,Failure);
                }
            }
        });
}

//更改任务状态函数
var updateState = function (taskID,state,count,preProgress,flag) {
    if (flag === Success)
        state = 9;
    else
        state = 1;
    var sql_update = 'update tasks set state = ? ,count = ? where taskID = ? ;';
    connection.query(sql_update,[state,count-1,taskID],function (err,rows) {
        if (err) {
            console.log(new Date().toLocaleString()+err);
            var progress = preProgress + '#' + code.progress.updateStateError;
            backup.emit('progress',taskID,progress,1);
            backup.emit('backupLoop');
        }
        else {
            if (state === 9) {
                var progress = preProgress + '#' + code.progress.updateSuccessState;
                backup.emit('progress',taskID,progress,1);
                backup.emit('backupLoop');
            }
            else {
                var progress = preProgress + '#' + code.progress.updateFailureState;
                backup.emit('progress',taskID,progress,1);
                backup.emit('backupLoop');
            }
        }
    });
};

//跟踪进度函数
var progress = function (taskID,progress,progressIsDone) {
    var sql_update = 'update tasks set progress = ? ,progressIsDone = ? where taskID = ? ;';
    connection.query(sql_update,[progress,progressIsDone,taskID],function (err,rows) {
        if (err)
            console.log(new Date().toLocaleString()+err);
        else
            console.log(new Date().toLocaleString()+'更新progress成功！');
    });
};

//保存脚本执行结果函数
var script = function (taskID,stdout) {
    var sql_update = 'update tasks set script = ? where taskID = ? ;';
    connection.query(sql_update,[stdout,taskID],function (err,rows) {
        if (err)
            console.log(new Date().toLocaleString()+err);
        else
            console.log(new Date().toLocaleString()+'更新script成功！');
    });
};

//读任务完成状态函数
var readState = function () {
    var sql = 'select t.taskID,t.userID,t.systemID,t.deviceID,t.fileID,t.taskTime,t.state,t.progress,t.script,' +
        'd.deviceType,f.filename,f.remotePath from tasks t join devices d on t.deviceID=d.deviceID join files f on t.fileID=f.fileID ' +
        'where state>0 and shift=0 and progressIsDone=1 and priority=1;';

    connection.query(sql,function (err,rows) {
        if (err)
            console.log(new Date().toLocaleString() + 'readState' + err);
        else {
            if (rows.length<1) {
                //console.log('no insert!');
                insertHistory.emit('insertHistoryLoop');
            }
            else {
                var taskID = rows[0].taskID;
                var userID = rows[0].userID;
                var systemID = rows[0].systemID;
                var deviceID = rows[0].deviceID;
                var fileID = rows[0].fileID;
                var taskTime = rows[0].taskTime;
                var state = rows[0].state;
                var progress = rows[0].progress;
                var script = rows[0].script;
                var deviceType = rows[0].deviceType;
                var filename = rows[0].filename;
                var remotePath = rows[0].remotePath;

                if(deviceType === 0)
                    var newName = '['+ formatDate(taskTime) + '__' + remotePath.replace(/\//g,'-')+']'+ filename;

                else
                    var newName = '['+ formatDate(taskTime) + ']'+ filename;

                insertHistory.emit('insert',taskID,userID,systemID,deviceID,fileID,taskTime,state,progress,script,newName);
            }
        }
    });
};

//把已完成任务插入到历史任务列表函数
var insert = function (taskID,userID,systemID,deviceID,fileID,taskTime,state,progress,script,newName) {
    var sql = 'insert into tasksHistory (userID,systemID,deviceID,fileID,taskTime,state,progress,script,newName) values (?,?,?,?,?,?,?,?,?);';
    connection.query(sql,[userID,systemID,deviceID,fileID,taskTime,state,progress,script,newName],function (err,rows) {
        if (err){
            throw err;
            //console.log(new Date().toLocaleString() + 'insert' + err);
        }
        else {
            console.log(new Date().toLocaleString() + 'insertSuccess');
            insertHistory.emit('insertFileMes',taskID,userID,systemID,deviceID,fileID);
        }
    })
}

//
var insertFileMes = function (taskID,userID,systemID,deviceID,fileID) {
    var b = '';
    for (var i=0;i<1000000;i++){
        b = b + '1';
    }
    var sql = 'insert into fileMes (userID,systemID,deviceID,fileID,data) values ('+userID+','+systemID+','+deviceID+','+fileID+','+'b\'' + b + '\''+');';
    connection.query(sql,function (err,rows) {
        if (err){
            throw err;
            //console.log(new Date().toLocaleString() + 'fileMes' + err);
        }
        else {
            console.log(new Date().toLocaleString() + 'insertFileMesSuccess');
            insertHistory.emit('updateShift',taskID);
        }
    })
}


//更新已完成任务到插入状态
var updateShift = function (taskID) {
    var sql = 'update tasks set shift = 1 where taskID = ? ;';
    connection.query(sql,taskID,function (err,rows) {
        if (err) {
            throw err;
            //console.log(new Date().toLocaleString() + 'updateShift' + err);
        }
        else {
            console.log(new Date().toLocaleString() + 'updateShiftSuccess');
            insertHistory.emit('insertHistoryLoop');
        }
    })
}

//删除已完成的过期一段时间的任务
var del = function () {
    var sql = 'delete from tasks where shift = 1 and unix_timestamp()*1000>(taskTime+10000);';
    connection.query(sql,function (err,rows) {
        if (err)
            throw err;
        else {
            //console.log(new Date().toLocaleString() + 'deleteExpiredSuccess');
            deleteExpired.emit('deleteExpiredLoop');
        }
    });
};


//
backup.on('backupLoop',function () {
    setTimeout(function () {
        backup.emit('read');
    },1000);
});
backup.on('read',read);
backup.on('executeHostScp',executeHostScp);
backup.on('executeRouter',executeRouter);
backup.on('executeHostMv',executeHostMv);
backup.on('updateState',updateState);
backup.on('progress',progress);
backup.on('script',script);

//
insertHistory.on('insertHistoryLoop',function () {
    setTimeout(function () {
        insertHistory.emit('readState',readState);
    },1000);
});
insertHistory.on('readState',readState);
insertHistory.on('insert',insert);
insertHistory.on('insertFileMes',insertFileMes);
insertHistory.on('updateShift',updateShift);

//
deleteExpired.on('deleteExpiredLoop',function () {
    setTimeout(function () {
        deleteExpired.emit('del');
    },60000);
});
deleteExpired.on('del',del);

//
var engine = function () {
    backup.emit('backupLoop');
    insertHistory.emit('insertHistoryLoop');
    deleteExpired.emit('deleteExpiredLoop');
};

console.log('engine running...');

module.exports = engine;
