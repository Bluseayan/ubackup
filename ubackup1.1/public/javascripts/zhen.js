/**
 * Created by bluseayan on 17-12-30.
 */

var checkChar = function (str) {
    if(str == null){
        return false;
    }
    else {
        var m = new RegExp(/^[\u4e00-\u9fa5_. \-a-zA-Z0-9]+$/);
        return m.test(str);
    }
}
var checkNum = function (str) {
    if(str == null){
        return false;
    }
    else {
        var m = new RegExp(/^[0-9]+$/);
        return m.test(str);
    }
}
var checkPath = function (str) {
    if(str == null){
        return false;
    }
    else {
        var m = new RegExp(/^[\u4e00-\u9fa5_/a-zA-Z0-9]+$/);
        var mt = m.test(str);
        var ms = str[str.length-1] !== '/';
        var mp = str[0] === '/';
        return (mt && ms && mp);
    }
}
var checkIp = function (str) {
    if(str == null){
        return false;
    }
    else {
        var m = new RegExp("^(1\\d{2}|2[0-4]\\d|25[0-5]|[1-9]\\d|[1-9])\\."

            +"(1\\d{2}|2[0-4]\\d|25[0-5]|[1-9]\\d|\\d)\\."

            +"(1\\d{2}|2[0-4]\\d|25[0-5]|[1-9]\\d|\\d)\\."

            +"(1\\d{2}|2[0-4]\\d|25[0-5]|[1-9]\\d|\\d)$");
        return m.test(str);
    }
}

