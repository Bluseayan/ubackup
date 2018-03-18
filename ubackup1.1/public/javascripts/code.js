/**
 * Created by xingyongkang on 2016/12/21.
 */

var code = {
    OK: 200,
    FAIL: 500,

    ENTRY: {
        FA_TOKEN_INVALID: 	1001,
        FA_TOKEN_EXPIRE: 	1002,
        FA_USER_NOT_EXIST: 	1003
    },

    GATE: {
        FA_NO_SERVER_AVAILABLE: 2001
    },

    CHAT: {
        FA_CHANNEL_CREATE: 		3001,
        FA_CHANNEL_NOT_EXIST: 	3002,
        FA_UNKNOWN_CONNECTOR: 	3003,
        FA_USER_NOT_ONLINE: 	3004
    },
    STATE: {
        INIT: 					0,
        WAIT: 					80,
        STARTBETTING: 			10,
        BETTING: 				20,
        STOPBETTING:			30,
        ANOUNCERESULT: 			40,
        CELEBRATE:				50,
        CLEAR: 					60,
        GENERATESCENE:			70
    },
    COMMAND:{
        HELLO:			88,
        OPERATE: 		0,
        LOGIN:			1,
        LOGOUT:			2,
        CHANGESTATE: 	3,
        SHOWTIME: 		4,
        SHOWBETTING:	5,
        SHOWALLBETTING: 6,
        SHOWUSERS:		7,
        USERLOGIN:		8,
        USERLOGOUT:	    9,
        SHOWSCENE:		10,
        SHOWRESULT:		11,
        UPSCORE:		12,
        DOWNSCORE:		13,
        LIVESTREAM:		14,
        CHAT:			15
    },
    DATAINDEX:{
        BALANCE:		0,
        SWITCHUNIT:		1,
        WINSCORE:		2,
        BONUS:			3,
        STATE:			4,
        BETSTART:		5
    },

    ACCOUNTOPERATION:{
        UPSCORE:		0,
        DOWNSCORE:		1,
        BET:			2,
        WIN:			3
    },
    USERTYPE:{
        USER:         0,
        BOSS:         1,
        LEVEL1:       2,
        LEVEL2:       3,
        LEVEL3:       4,
        LEVEL4:       5,
        LEVEL5:       6,
        PRINTER:      7,
        ANCHOR:       21,
        SECRETARY:    22,
        SUPERVISER:   88

    },
    ROOMTYPE:{
        EMPTY:      0,
        HALL:       1,
        CHATROOM:   2,
        GAMEROOM:   3,
        FULL:        4,
    },
    OPERATIONTYPE:{
        ADD:        0,
        GAME:       1,
        WIN:        2,
        TRANSFER:   3,
        BALANCE:    4
    },
    RETURNCODE:{
        OK:              200,
        EXPIRED:        300,
        NORIGHT:        400,
        DBERROR:        500,
        NAMEEXIST:      501,
        WRONGINTRODUCER:   502,
        NONAME:             503,
        WRONGPASS:          504,
        ROOMIDNULL:         505
    },

    login:{
        ok:'登录成功！',
        empty:'用户名或密码为空！',
        noExist:'用户名不存在！',
        passwordErr:'密码错误！',
        err:'系统错误！'
    },

    register:{
        ok:'注册成功！',
        empty:'用户名或密码为空！',
        exist:'用户名已存在！',
        err:'系统错误！'
    },

    nologin:'未登录！',

    updatePassword:{
        ok:'更新密码成功',
        err:'更新密码出错'
    },

    authentication:{
        ok:'验证成功！',
        failure:'会话超时，请重新登录！',
        err:'系统错误！'
    },

    systems:{
        add:{
            ok:'添加系统成功！',
            exist:'系统名已存在，请更换',
            err:'添加系统时出错！'
        },
        update:{
            ok:'修改系统成功！',
            err:'修改系统时出错！'
        },
        delete:{
            ok:'删除系统成功！',
            err:'删除系统时出错！'
        }
    },

    devices:{
        add:{
            ok:'添加设备成功！',
            exist:'设备名已存在，请更换',
            err:'添加设备时出错！'
        },
        delete:{
            ok:'删除设备成功！',
            err:'删除设备时出错！'
        },
        update:{
            ok:'更新设备成功！',
            err:'更新设备时出错！'
        }
    },

    files:{
        add:{
            ok:'添加文件成功！',
            exist:'该远程路径已有同名文件，请更换',
            err:'添加文件时出错！'
        },
        delete:{
            ok:'删除文件成功！',
            err:'删除文件时出错！'
        },
        update:{
            ok:'更新文件成功！',
            err:'更新文件时出错！'
        }
    },

    refresh:{
        ok:'刷新成功！',
        err:'刷新数据时出错！'
    },

    strategy:{
        ok:'更新系统备份策略成功',
        err:'更新系统备份策略出错'
    },

    tree:{
        ok:'加载树成功',
        err:'加载树出错'
    },

    progress:{
        ok:'加载文件进度成功',
        err:'加载文件进度出错',
        again:{
            ok:'写入立即重试任务成功！',
            err:'写入立即重试任务出错！'
        },
        ignore:{
            ok:'删除该条错误记录成功！',
            err:'删除该条错误记录出错！'
        },
        download:{
            get:'找到文件',
            noGet:'找不到文件',
            ok:'生成文件下载链接成功',
            err:'查找文件出错'
        },
        view:{
            ok:'查看文件脚本结果成功',
            err:'查看文件脚本结果出错'
        }
    },

    fileTest:{
        writeTask:{
            ok:'文件测试写入成功',
            err:'文件测试写入出错'
        },
        read:{
            ok:'读取测试结果成功',
            err:'读取测试结果出错'
        }
    },
    users:{
        list:{
            ok:'加载用户列表成功！',
            err:'加载用户列表出错！'
        },
        getPas:{
            ok:'切换用户成功！',
            err:'切换用户出错！'
        }
    },
    notice:{
        ok:'获取通知记录成功！',
        err:'获取通知记录出错！'
    }
};
