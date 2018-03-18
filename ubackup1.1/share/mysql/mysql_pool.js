/**
 * Created by bluseayan on 17-12-1.
 */

var mysql = require('mysql');
var config = require('../config/mysql.json');

var pool  = mysql.createPool(config);

module.exports = pool;
