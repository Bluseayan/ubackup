/**
 * Created by bluseayan on 17-12-29.
 */

var fs = require("fs");
var callfile = require('child_process');
var code = require('./share/code');
var mysql = require('./share/mysql/mysql_pool');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var async = require('async');
var mystery = require('./share/mystery');
var Token = require('./share/token');

//var index = require('./routes/index');
//var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//app.use('/', index);
//app.use('/users', users);

//登录
app.use('/login',function (req,res,next) {
    var msg = req.body;
    var username = msg.username;
    var password = msg.password;
    if (!username || !password) {
        console.log("name or password is empty!");
        res.send({code:code.login.empty});
        return;
    }
    var sql = "select userID,password,userType from users where username=?;";
    mysql.query(sql,[username], function (err, rows) {
        if(!err){
            if (rows.length >= 1) {
                if (password === rows[0].password) {
                    userType = rows[0].userType;
                    userID = rows[0].userID;
                    res.send({code:code.login.ok,data:{userID:userID,userType:userType,token: Token.create(userID, Date.now())}});
                }
                else {
                    res.send({code:code.login.passwordErr});
                }
            }
            else
                res.send({code:code.login.noExist});
        }
        else{
            res.send({code:code.login.err});
            console.log(code.login.err+err);
        }

    });
});

//注册
app.use('/register',function (req,res,next) {
    var msg = req.body;
    var username = msg.username;
    var password = msg.password;
    if (!username || !password) {
        console.log("name or password is empty!");
        res.send({code:code.register.empty});
        return;
    }
    var queryUser = function (cb) {
        mysql.query('select username from users where username = ?', [username], function (err, rows) {
            if (!err) {
                if (rows.length == 0)
                    cb(null,0);
                else
                    cb(null,1);
            }
            else {
                console.log("database err!"+err);
                cb(err,1);
            }
        });
    };
    var createUser = function (para,cb) {
        if(para === 0){
            var path = __dirname + '/users/' + username;
            fs.mkdir(path,function (err) {
                if(!err)
                    cb(null,0);
                else
                    cb(err,1);
            });
        }
        else
            cb(null,1);
    }
    var register = function (para,cb) {
        if(para === 0){
            var sql = "insert into users (username,password) values (?,?);";
            mysql.query(sql, [username,password], function (err, rows) {
                if (!err) {
                    cb(null,0);
                }
                else {
                    console.log("database err!"+err);
                    cb(err,1);
                }
            });
        }
        else
            cb(null,1);
    };
    async.waterfall([queryUser,createUser,register],function (err,result) {
        if(!err){
            if(result === 0)
                res.send({code:code.register.ok});
            else
                res.send({code:code.register.exist});
        }
        else{
            console.log(code.register.err+err);
            res.send({code:code.register.err});
        }
    });
});

//
app.use('/home',function (req,res,next) {
    var token = req.body.token;
    if (Token.validate(token) === 0) {
        next('route');
    }
    else {
        res.send({code:code.authentication.failure});
    }
});

//
app.use('/home/updatePassword',function (req,res,next) {
    var userID = req.body.userID;
    var newPassword = req.body.newPassword;
    var sql = 'update users set password=? where userID=? ;';
    mysql.query(sql,[newPassword,userID],function (err,rows) {
        if(!err)
            res.send({code:code.updatePassword.ok});
        else {
            console.log(code.updatePassword.err+err);
            res.send({code:code.updatePassword.err});
        }
    });
});

//
app.use('/home/systems/refresh',function (req,res,next) {
    var userID = req.body.userID;
    var sql = 'select systemID,systemName,systemDescribe from systems where userID=?;';
    mysql.query(sql,[userID],function (err,rows) {
        if (!err){
            var data = new Array();
            for (var i = 0;i<rows.length;i++){
                data[i] = {
                    系统ID:rows[i].systemID,
                    系统名:rows[i].systemName,
                    系统描诉:rows[i].systemDescribe
                }
            }
            res.send({code: code.refresh.ok,data:data});
        }
        else {
            console.log(code.refresh.err+err);
            res.send({code: code.refresh.err});
        }
    })
})

//
app.use('/home/systems/add',function (req,res,next) {
    var userID = req.body.userID;
    var data = JSON.parse(req.body.data);

    var querySystem = function (cb) {
        mysql.query('select systemName from systems where systemName=? and userID=?', [data.systemName,userID], function (err, rows) {
            if (!err) {
                if (rows.length == 0)
                    cb(null,0);
                else
                    cb(null,1);
            }
            else {
                cb(err,1);
            }
        });
    };
    var createSystem = function (para,cb) {
        if(para === 0){
            var path = __dirname + '/users/' + data.username + '/' + data.systemName;
            fs.mkdir(path,function (err) {
                if(!err)
                    cb(null,0);
                else
                    cb(err,1);
            });
        }
        else
            cb(null,1);
    }
    var add = function (para,cb) {
        if(para === 0){
            var sql = 'insert into systems (userID,systemName,systemDescribe) values (?,?,?);';
            mysql.query(sql, [userID,data.systemName,data.systemDescribe], function (err, rows) {
                if (!err) {
                    cb(null,0);
                }
                else {
                    cb(err,1);
                }
            });
        }
        else
            cb(null,1);
    };
    async.waterfall([querySystem,createSystem,add],function (err,result) {
        if(!err){
            if(result === 0)
                res.send({code:code.systems.add.ok});
            else
                res.send({code:code.systems.add.exist});
        }
        else{
            console.log(code.systems.add.err+err);
            res.send({code:code.systems.add.err});
        }
    });
});
//
app.use('/home/systems/delete',function (req,res,next) {
    var username = req.body.username;
    var systemID = req.body.systemID;
    var systemName = req.body.systemName;

    var deleteDirectory = function (cb) {
        var dir = __dirname + '/users/' + username + '/' + systemName;
        var command = 'rm -r ' + dir;
        callfile.exec(command,function (err,stdout, stderr) {
            if(!err){
                cb(null,0);
            }
            else {
                cb(err,1);
            }
        });
    };
    var deleteSystem = function (para,cb) {
        var sql = 'delete from systems where systemID=?;';
        mysql.query(sql,[systemID],function (err,rows) {
            if(!err){
                cb(null,0);
            }
            else
                cb(err,1);
        })
    };
    async.waterfall([deleteDirectory,deleteSystem],function (err,result) {
        if(!err){
            res.send({code:code.systems.delete.ok});
        }
        else {
            console.dir(code.systems.delete.err+err);
            res.send({code:code.systems.delete.err});
        }
    })
});

//
app.use('/home/devices/delete',function (req,res,next) {
    var username = req.body.username;
    var systemName = req.body.systemName;
    var deviceID = req.body.deviceID;
    var deviceName = req.body.deviceName;
    var deleteDirectory = function (cb) {
        var dir = __dirname + '/users/' + username + '/' + systemName + '/' + deviceName;
        var command = 'rm -r ' + dir;
        callfile.exec(command,function (err,stdout, stderr) {
            if(!err){
                cb(null,0);
            }
            else
                cb(err,1);
        });
    };
    var deleteDevice = function (para,cb) {
        var sql = 'delete from devices where deviceID=?;';
        mysql.query(sql,[deviceID],function (err,rows) {
            if(!err){
                cb(null,0);
            }
            else
                cb(err,1);
        })
    };
    async.waterfall([deleteDirectory,deleteDevice],function (err,result) {
        if(!err){
            res.send({code:code.devices.delete.ok});
        }
        else {
            console.dir(code.devices.delete.err+err);
            res.send({code:code.devices.delete.err});
        }
    })
});

//
app.use('/home/files/delete',function (req,res,next) {
    var username = req.body.username;
    var systemName = req.body.systemName;
    var deviceName = req.body.deviceName;
    var deviceType = req.body.deviceType;
    var fileID = req.body.fileID;
    var filename = req.body.filename;
    var remotePath = req.body.remotePath;
    var filenameOnPath = deviceType==0? (remotePath + '/' + filename):filename;
    var name = filenameOnPath.replace(/\//g,'_');
    var dir = __dirname + '/users/' + username +'/'+systemName+'/'+deviceName+'/'+name;

    var deleteDirectory = function (cb) {
        var command = 'rm -r ' + dir;
        callfile.exec(command,function (err,stdout, stderr) {
            if(!err){
                cb(null,0);
            }
            else {
                cb(err,1)
            }
        });
    };
    var deleteFile = function (para,cb) {
        var sql = 'delete from files where fileID=?;';
        mysql.query(sql,[fileID],function (err,rows) {
            if(!err){
                cb(null,0);
            }
            else
                cb(err,1);
        })
    };
    async.waterfall([deleteDirectory,deleteFile],function (err,result) {
        if(!err){
            res.send({code:code.files.delete.ok});
        }
        else {
            console.dir(code.files.delete.err+err);
            res.send({code:code.files.delete.err});
        }
    })
});
//
app.use('/home/devices/refresh',function (req,res,next) {
    var systemID = req.body.systemID;
    var sql = 'select deviceID,deviceName,deviceType,ip,deviceUsername,devicePort from devices where systemID=? ;';
    mysql.query(sql,[systemID],function (err,rows) {
        if (!err){
            var data = new Array();
            for (var i = 0;i<rows.length;i++){
                data[i] = {
                设备ID:rows[i].deviceID,
                设备名:rows[i].deviceName,
                设备类型:rows[i].deviceType===0? 'linux主机':'路由器或交换机',
                设备ip:rows[i].ip,
                设备用户名:rows[i].deviceUsername,
                系统登录密码:'**********',
                设备ssh端口:rows[i].devicePort
                }
            }
            res.send({code: code.refresh.ok,data:data});
        }
        else {
            console.log(code.refresh.err+err);
            res.send({code: code.refresh.err});
        }
    })
})

//
app.use('/home/devices/add',function (req,res,next) {
    var userID = req.body.userID;
    var data = JSON.parse(req.body.data);

    var queryDevice = function (cb) {
        mysql.query('select deviceName from devices where deviceName=? and systemID=?', [data.deviceName,data.systemID], function (err, rows) {
            if (!err) {
                if (rows.length == 0)
                    cb(null,0);
                else
                    cb(null,1);
            }
            else {
                cb(err,1);
            }
        });
    };
    var createDevice = function (para,cb) {
        if(para === 0){
            var path = __dirname + '/users/' + data.username + '/' + data.systemName + '/' + data.deviceName;
            fs.mkdir(path,function (err) {
                if(!err)
                    cb(null,0);
                else
                    cb(err,1);
            });
        }
        else
            cb(null,1);
    }
    var add = function (para,cb) {
        if(para === 0){
            var sql = "insert into devices (userID,systemID,deviceName,deviceType,ip,deviceUsername,devicePassword,devicePort) values (?,?,?,?,?,?,?,?);";
            var bra = [userID,data.systemID,data.deviceName,data.deviceType,data.ip,data.deviceUsername,mystery(data.devicePassword),data.devicePort];
            mysql.query(sql,bra, function (err, rows) {
                if (!err) {
                    cb(null,0);
                }
                else {
                    cb(err,1);
                }
            });
        }
        else
            cb(null,1);
    };
    async.waterfall([queryDevice,createDevice,add],function (err,result) {
        if(!err){
            if(result === 0)
                res.send({code:code.devices.add.ok});
            else
                res.send({code:code.devices.add.exist});
        }
        else{
            console.log(code.devices.add.err+err);
            res.send({code:code.devices.add.err});
        }
    });
});

//
app.use('/home/files/refresh',function (req,res,next) {
    var deviceID = req.body.deviceID;
    var sql = 'select fileID,filename,fileType,remotePath,routeCommand,identifyKeywords from files where deviceID=? ;';
    mysql.query(sql,[deviceID],function (err,rows) {
        if (!err){
            var data = new Array();
            for (var i = 0;i<rows.length;i++){
                data[i] = {
                    文件ID:rows[i].fileID,
                    文件名:rows[i].filename,
                    文件类型:rows[i].fileType===0? '主机文件':'路由或交换机文件',
                    文件远程路径:rows[i].remotePath,
                    查看配置命令:rows[i].routeCommand,
                    配置信息关键字:rows[i].identifyKeywords
                }
            }
            res.send({code: code.refresh.ok,data:data});
        }
        else {
            console.log(code.refresh.err+err);
            res.send({code: code.refresh.err});
        }
    })
});
//
app.use('/home/files/add',function (req,res,next) {
    var userID = req.body.userID;
    var data = JSON.parse(req.body.data);
    var frequency,endtime;
    var haveStra = 0;
    var fileID;
    var filenameOnPath = data.deviceType==0? (data.remotePath + '/' + data.filename):data.filename;
    var name = filenameOnPath.replace(/\//g,'_');
    var localPath = __dirname + '/users/' + data.username +'/'+data.systemName+'/'+data.deviceName+'/'+name;

    var queryFile = function (cb) {
        var sql = 'select fileID from files where deviceID=? and filenameOnPath=?;';
        mysql.query(sql,[data.deviceID,filenameOnPath],function (err,rows) {
            if(!err){
                if(rows.length < 1)
                    cb(null,0);
                else
                    cb(null,1);
            }
            else
                cb(err,2);
        })
    }
    var createFile = function (para,cb) {
        if(para === 0){
            fs.mkdir(localPath,function (err) {
                if(!err)
                    cb(null,0);
                else
                    cb(err,2);
            });
        }
        else
            cb(null,para);
    }
    var add = function (para,cb) {
        if(para === 0){
            var sql = 'insert into files (userID,systemID,deviceID,filename,fileType,remotePath,localPath,filenameOnPath,routeCommand,identifyKeywords) values (?,?,?,?,?,?,?,?,?,?);';
            var para = [userID,data.systemID,data.deviceID,data.filename,data.deviceType,data.remotePath,localPath,filenameOnPath,data.routeCommand,data.identifyKeywords];
            mysql.query(sql,para, function (err, rows) {
                if (!err) {
                    cb(null,0);
                }
                else {
                    cb(err,2);
                }
            });
        }
        else {
            cb(null,para);
        }
    };
    var queryfileID = function (para,cb) {
        if(para === 0){
            var sql = 'select fileID from files where deviceID=? and filenameOnPath=?;';
            mysql.query(sql,[data.deviceID,filenameOnPath],function (err,rows) {
                if(!err){
                    fileID = rows[0].fileID;
                    cb(null,0);
                }
                else {
                    cb(err,1);
                }
            })
        }
        else {
            cb(null,para);
        }
    }

    var queryStra = function (para,cb) {
        if(para === 0){
            var sql = 'select frequency,endtime from systems where systemID=?;';
            mysql.query(sql,[data.systemID],function (err,rows) {
                if(!err){
                    frequency = rows[0].frequency;
                    endtime = rows[0].endtime;
                    if(frequency != null){
                        haveStra = 1;
                        cb(null,0);
                    }
                    else {
                        cb(null,1.5);
                    }
                }
                else {
                    cb(err,2);
                }
            })
        }
        else {
            cb(null,para);
        }
    }
    var writeTask = function (para,cb) {
        if(para === 0){
            var frequency_millisecond = 86400000 * frequency;
            var now = new Date().getTime();
            var n = parseInt((endtime-now)/frequency_millisecond);
            var time = [];
            time[0] = now;
            for(var i=1;i<=n;i++){
                time[i] = time[i-1]+frequency_millisecond;
            }

            var value = '';
            for(var i=0;i<=n;i++){
                value = value + ',('+userID+','+data.systemID+','+data.deviceID+','+fileID+','+'0'+','+'3'+','+time[i]+')';
            }

            var sql = 'insert into tasks (userID,systemID,deviceID,fileID,state,count,taskTime) values '+ value.slice(1,value.length) +';';
            mysql.query(sql,function (err,rows) {
                if(!err){
                    cb(null,0);
                }
                else{
                    cb(err,2);
                }
            })
        }
        else {
            cb(null,para);
        }
    }
    async.waterfall([queryFile,createFile,add,queryfileID,queryStra,writeTask],function (err,result) {
        if(!err){
            if(result === 0 || result === 1.5){
                res.send({code:code.files.add.ok,haveStra:haveStra});
            }
            else if(result === 1) {
                res.send({code:code.files.add.exist});
            }

        }
        else{
            console.log(code.files.add.err+err);
            res.send({code:code.files.add.err});
        }
    });
});

//
app.use('/home/strategy/refresh',function (req,res,next) {
    var userID = req.body.userID;
    var sql = 'select systemID,systemName,systemDescribe,frequency,endtime from systems where userID=?;';
    mysql.query(sql,[userID],function (err,rows) {
        if (!err){
            var data = new Array();
            for (var i = 0;i<rows.length;i++){
                data[i] = {
                    系统ID:rows[i].systemID,
                    系统名:rows[i].systemName,
                    系统描诉:rows[i].systemDescribe,
                    备份频率:rows[i].frequency==null? '无':rows[i].frequency+'天一次',
                    截止时间:rows[i].endtime==null? '无':new Date(rows[i].endtime).toLocaleString()
                }
            }
            res.send({code: code.refresh.ok,data:data});
        }
        else {
            console.log(code.refresh.err+err);
            res.send({code: code.refresh.err});
        }
    });
});
//
app.use('/home/strategy/update',function (req,res,next) {
    var userID = req.body.userID;
    var systemID = req.body.systemID;
    var systemName = req.body.systemName;
    var data = JSON.parse(req.body.data);
    var fileLength;
    var fileData = [];

    var deleteTasks = function (cb) {
        var sql = 'delete from tasks where systemID=? and state<1 and priority=1;';
        mysql.query(sql,[systemID],function (err,rows) {
            if(!err){
                cb(null,0);
            }
            else{
                cb(err,1);
            }
        })
    }

    var queryFile = function (para,cb) {
        var sql = 'select fileID,deviceID,systemID from files where systemID=?;';
        mysql.query(sql,[systemID],function (err,rows) {
            if(!err){
                fileLength = rows.length;
                if(fileLength !== 0){
                    for (var i=0;i<fileLength;i++){
                        fileData[i] = {
                            fileID:rows[i].fileID,
                            deviceID:rows[i].deviceID,
                            systemID:rows[i].systemID
                        }
                    }
                    cb(null,0);
                }
                else {
                    cb(null,1);
                }
            }
            else {
                cb(err,1);
            }
        })
    }

    var writeTasks = function (para,cb) {
        if(fileLength !== 0){
            var endtime = Date.parse(data.endtime);
            var frequency = 86400000 * data.frequency;
            var now = new Date().getTime();
            var n = parseInt((endtime-now)/frequency);
            var time = [];
            time[0] = now;
            for(var i=1;i<=n;i++){
                time[i] = time[i-1]+frequency;
            }

            var value = '';
            for(var i=0;i<=n;i++){
                for(var j=0;j<fileLength;j++)
                    value = value + ',('+userID+','+fileData[j].systemID+','+fileData[j].deviceID+','+fileData[j].fileID+','+'0'+','+'3'+','+time[i]+')';
            }

            var sql = 'insert into tasks (userID,systemID,deviceID,fileID,state,count,taskTime) values '+ value.slice(1,value.length) +';';
            mysql.query(sql,function (err,rows) {
                if(!err){
                    cb(null,0);

                }
                else{
                    cb(err,1);
                }
            })
        }
        else {
            cb(null,1);
        }
    }
    var updateSystem = function (para,cb) {
        var endtime = Date.parse(data.endtime);
        var sql = 'update systems set frequency=?,endtime=? where systemID=?;';
        mysql.query(sql,[data.frequency,endtime,systemID],function (err,rows) {
            if(!err){
                cb(null,0);
            }
            else
                cb(err,1);
        })
    }
    async.waterfall([deleteTasks,queryFile,writeTasks,updateSystem],function (err,result) {
        if(!err){
            res.send({code:code.strategy.ok});
        }
        else{
            console.log(code.strategy.err+err);
            res.send({code:code.strategy.err});
        }
    })
});

//
app.use('/home/progress/refresh',function (req,res,next) {
   var userID = req.body.userID;
   var data = req.body.data;
   var type = data[0];
   var id = parseInt(data.slice(1,data.length));
   var idName;

   if(type == 's'){
       idName = 't.systemID';
   }
   else if(type == 'd'){
       idName = 't.deviceID';
   }
   else if(type == 'f'){
       idName = 't.fileID';
   }
   else if(type == 'u'){
       idName = 't.userID';
   }

   var sql = 'select t.taskHistoryID,t.taskTime,t.state,s.systemName,d.deviceName,f.filename from tasksHistory t join systems s on t.systemID=s.systemID join devices d on t.deviceID=d.deviceID join files f on t.fileID=f.fileID where ' + idName + '=?;';
   mysql.query(sql,[id],function (err,rows) {
       if(!err){
           var data = new Array();
           for (var i = 0;i<rows.length;i++){
               data[i] = {
                   历史ID:rows[i].taskHistoryID,
                   系统名:rows[i].systemName,
                   设备名:rows[i].deviceName,
                   文件名:rows[i].filename,
                   备份时间:new Date(rows[i].taskTime).toLocaleString(),
                   状态:rows[i].state===9? '成功':'失败'
               }
           }
           res.send({code:code.progress.ok,data:data});
       }
       else{
           console.log(code.progress.err+err);
           res.send({code:code.progress.err});
       }
   })
});
//
app.use('/home/progress/download',function (req,res,next) {
    var taskHistoryID = req.body.taskHistoryID;
    var newName,localPath,data;

    var query = function (cb) {
        var sql = 'select t.newName,f.localPath from tasksHistory t join files f on t.fileID=f.fileID where t.taskHistoryID=?;';
        mysql.query(sql,[taskHistoryID],function (err,rows) {
            if(!err){
                newName = rows[0].newName;
                localPath = rows[0].localPath;
                data = '/download/' + rows[0].newName;
                cb(null,0);
            }
            else{
                cb(err,1);
            }
        })
    }
    var cpFile = function (para,cb) {
        var command = 'cp -r ' + '\"' + localPath + '\"' + '/' + '\"' + newName + '\"' + ' ' + __dirname + '/public/download';
        callfile.exec(command,function (err,stdout, stderr) {
            if(!err){
                cb(null,0);
            }
            else{
                cb(err,1);
            }
        });
    }
    async.waterfall([query,cpFile],function (err,sesult) {
        if(!err){
            res.send({code:code.progress.download.get,data:data});
        }
        else{
            console.log(code.progress.download.err+err);
            res.send({code:code.progress.download.err});
        }
    })
});

//
app.use('/home/progress/view',function (req,res,next) {
    var taskHistoryID = req.body.taskHistoryID;
    var sql = 'select progress,script from tasksHistory where taskHistoryID=?;';
    mysql.query(sql,[taskHistoryID],function (err,rows) {
        if(!err){
            var data = {
                progress:rows[0].progress,
                script:rows[0].script
            }
            res.send({code:code.progress.view.ok,data:JSON.stringify(data)});
        }
        else{
            console.log(code.progress.view.err+err);
            res.send({code:code.progress.view.err});
        }
    })
});

//
app.use('/home/fileTest/writeTask',function (req,res,next) {
    var userID = req.body.userID;
    var data = JSON.parse(req.body.data);
    var taskTime = new Date().getTime();
    var taskID;

    var writeTask = function (cb) {
        var sql = 'insert into tasks (userID,systemID,deviceID,fileID,taskTime,state,count,priority) values (?,?,?,?,?,?,?,?);';
        var bra = [userID,data.systemID,data.deviceID,data.fileID,taskTime,-1,1,0];
        mysql.query(sql,bra,function (err,rows) {
            if(!err){
                cb(null,0);
            }
            else
                cb(err,1);
        })
    }
    var queryID = function (para,cb) {
        var sql = 'select taskID from tasks where userID=? and fileID=? and taskTime=?;';
        mysql.query(sql,[userID,data.fileID,taskTime],function (err,rows) {
            if(!err){
                taskID = rows[0].taskID;
                cb(null,0);
            }
        else
            cb(err,1);
        })
    }
    async.waterfall([writeTask,queryID],function (err,result) {
        if(!err){
            res.send({code:code.fileTest.writeTask.ok,data:taskID});
        }
        else{
            console.log(code.fileTest.writeTask.err+err);
            res.send({code:code.fileTest.writeTask.err});
        }
    })
});

//
app.use('/home/fileTest/read',function (req,res,next) {
    var taskID = req.body.taskID;
    var sql = 'select progress,script,state from tasks where taskID=?;';
    mysql.query(sql,[taskID],function (err,rows) {
        if(!err){
            var data = {
                progress:rows[0].progress,
                script:rows[0].script,
                state:rows[0].state
            };
            res.send({code:code.fileTest.read.ok,data:JSON.stringify(data)});
        }
        else{
            console.log(code.fileTest.read.err+err);
            res.send({code:code.fileTest.read.err});
        }
    })
});
//
app.use('/home/users/list',function (req,res,next) {
    var userID = req.body.userID;
    var sql = 'select userID,username from users where userID!=? and userType=0;';
    mysql.query(sql,[userID],function (err,rows) {
        if (!err){
            var data = new Array();
            for (var i = 0;i<rows.length;i++){
                data[i] = {
                    userID:rows[i].userID,
                    username:rows[i].username
                }
            }
            res.send({code:code.users.list.ok,data:JSON.stringify(data)});
        }
        else {
            console.log(code.users.list.err+err);
            res.send({code: code.users.list.err});
        }
    })
});

//
app.use('/home/progress/again',function (req,res,next) {
    var userID = req.body.userID;
    var data = JSON.parse(req.body.data);
    var taskID,taskTime;
    var systemID,deviceID,fileID;
    var query = function (cb) {
        var sql = 'select systemID,deviceID,fileID from tasksHistory where taskHistoryID=?;';
        mysql.query(sql,[data.taskHistoryID],function (err,rows) {
            if(!err){
                fileID = rows[0].fileID;
                deviceID = rows[0].deviceID;
                systemID = rows[0].systemID;
                cb(null,0);
            }
            else {
                cb(err,1);
            }
        })
    }
    var writeAgain = function (para,cb) {
        taskTime = new Date().getTime();
        var sql = 'insert into tasks (userID,systemID,deviceID,fileID,taskTime,state,count) values (?,?,?,?,?,?,?);';
        var bra = [userID,systemID,deviceID,fileID,taskTime,0,1];
        mysql.query(sql,bra,function (err,rows) {
            if(!err){
                cb(null,0);
            }
            else
                cb(err,1);
        })
    }
    var queryID = function (para,cb) {
        var sql = 'select taskID from tasks where fileID=? and taskTime=?;';
        mysql.query(sql,[fileID,taskTime],function (err,rows) {
            if(!err){
                taskID = rows[0].taskID;
                cb(null,0);
            }
            else
                cb(err,1);
        })
    }
    async.waterfall([query,writeAgain,queryID],function (err,result) {
        if(!err){
            res.send({code:code.progress.again.ok,data:taskID});
        }
        else {
            console.log(code.progress.again.err+err);
            res.send({code:code.progress.again.err})
        }
    })
    
})
//
app.use('/home/progress/ignore',function (req,res,next) {
    var taskHistoryID = req.body.taskHistoryID;
    var sql = 'delete from tasksHistory where taskHistoryID=?;';
    mysql.query(sql,[taskHistoryID],function (err,rows) {
        if(!err){
            res.send({code:code.progress.ignore.ok});
        }
        else {
            res.send({code:code.progress.ignore.err});
        }
    })
})

//
app.use('/home/notice',function (req,res,next) {
    var userID = req.body.userID;
    var sql = 'select taskHistoryID from tasksHistory where userID=? and state=1;';
    mysql.query(sql,[userID],function (err,rows) {
        if(!err){
            var length = rows.length;
            res.send({code:code.notice.ok,data:length});
        }
        else {
            res.send({code:code.notice.err});
        }
    })
});

//
app.use('/home/files/update',function (req,res,next) {
    var data = JSON.parse(req.body.data);
    var filenameOnPath = data.deviceType==0? (data.remotePath + '/' + data.filename):data.filename;
    var oldFilenameOnPath = data.deviceType==0? (data.oldRemotePath + '/' + data.filename):data.filename;
    var sql,bra,path,olaPath;

    if(data.deviceType == 0){
        sql = 'update files set remotePath=?,filenameOnPath=? where fileID=?;';
        bra = [data.remotePath,filenameOnPath,data.fileID];
        olaPath = __dirname + '/users/' + data.username + '/' + data.systemName + '/' + data.deviceName + '/' + oldFilenameOnPath.replace(/\//g,'_');
        path = __dirname + '/users/' + data.username + '/' + data.systemName + '/' + data.deviceName + '/' + filenameOnPath.replace(/\//g,'_');
    }
    else {
        sql = 'update files set routeCommand=?,identifyKeywords=? where fileID=?;';
        bra = [data.routeCommand,data.identifyKeywords,data.fileID];
    }

    var updateDir = function (cb) {
        if(data.deviceType == 0){
            var command = 'mv -f ' + olaPath + ' ' + path;
            callfile.exec(command,function (err) {
                if(!err){
                    cb(null,0);
                }
                else {
                    cb(err,1);
                }
            })
        }
        else {
            cb(null,0);
        }
    }

    var update = function (para,cb) {
        mysql.query(sql,bra,function (err,row) {
            if(!err){
                cb(null,0);
            }
            else {
                cb(err,1);
            }
        })
    }

    async.waterfall([updateDir,update],function (err,result) {
        if(!err){
            res.send({code:code.files.update.ok});
        }
        else {
            console.log(code.files.update.err+err);
            res.send({code:code.files.update.err});
        }
    })
});
//
app.use('/home/devices/update',function (req,res,next) {
    var data = JSON.parse(req.body.data);
    var sql = 'update devices set ip=?,deviceUsername=?,devicePassword=?,devicePort=? where deviceID=?;';
    var bra = [data.ip,data.deviceUsername,mystery(data.devicePassword),data.devicePort,data.deviceID];

    mysql.query(sql,bra,function (err,row) {
        if(!err){
            res.send({code:code.devices.update.ok});
        }
        else {
            console.log(code.devices.update.err+err);
            res.send({code:code.devices.update.err});
        }
    })
});
//
app.use('/home/systems/update',function (req,res,next) {
    var data = JSON.parse(req.body.data);
    var sql = 'update systems set systemDescribe=? where systemID=?;';
    var bra = [data.systemDescribe,data.systemID];

    mysql.query(sql,bra,function (err,row) {
        if(!err){
            res.send({code:code.systems.update.ok});
        }
        else {
            console.log(code.systems.update.err+err);
            res.send({code:code.systems.update.err});
        }
    })
});
//
app.use('/home/progress/tree',function (req,res,next) {
    var userID = req.body.userID;
    var data = [];
    var querySys = function (cb) {
        var sql = 'select systemID,systemName from systems where userID=?;';
        mysql.query(sql,[userID],function (err,rows) {
            if(!err){
                for(var i=0;i<rows.length;i++){
                    var sys = {};
                    sys.id = 's'+rows[i].systemID;
                    sys.parent = '#';
                    sys.text = rows[i].systemName;
                    data.push(sys);
                }
                cb(null,0);
            }
            else {
                cb(err,1);
            }
        })
    }
    var queryDev = function (para,cb) {
        var sql = 'select deviceID,deviceName,systemID from devices where userID=?;';
        mysql.query(sql,[userID],function (err,rows) {
            if(!err){
                for(var i=0;i<rows.length;i++){
                    var sys = {};
                    sys.id = 'd'+rows[i].deviceID;
                    sys.parent = 's'+rows[i].systemID;
                    sys.text = rows[i].deviceName;
                    data.push(sys);
                }
                cb(null,0);
            }
            else {
                cb(err,1);
            }
        })
    }
    var queryFil = function (para,cb) {
        var sql = 'select fileID,filename,deviceID from files where userID=?;';
        mysql.query(sql,[userID],function (err,rows) {
            if(!err){
                for(var i=0;i<rows.length;i++){
                    var sys = {};
                    sys.id = 'f'+rows[i].fileID;
                    sys.parent = 'd'+rows[i].deviceID;
                    sys.text = rows[i].filename;
                    data.push(sys);
                }
                cb(null,0);
            }
            else {
                cb(err,1);
            }
        })
    }
    async.waterfall([querySys,queryDev,queryFil],function (err,result) {
        if(!err){
            res.send({code:code.tree.ok,data:JSON.stringify(data)});
        }
        else {
            console.log(code.tree.err+err);
            res.send({code:code.tree.err});
        }
    })
})


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


console.log('server running...');

module.exports = app;
