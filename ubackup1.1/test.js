/**
 * Created by bluseayan on 18-3-18.
 */
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
console.log(formatDate(1000000000));

var checkChar = function (str) {
    if(str == null){
        return false;
    }
    else {
        var m = new RegExp(/^[\u4e00-\u9fa5_. \-a-zA-Z0-9]+$/);
        return m.test(str);
    }
}

console.log(checkChar('asd ._-ss'));