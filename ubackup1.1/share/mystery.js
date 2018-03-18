/**
 * Created by bluseayan on 17-12-24.
 */

var mystery = function (data) {
    var mi = '';
    for (var i = 0; i < data.length; i++) {
        mi = mi + String.fromCharCode(data.charCodeAt(i) ^ 1719);
    }
    return mi;
};

module.exports = mystery;