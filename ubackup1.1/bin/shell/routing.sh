#!/usr/bin/expect

set timeout 10
set ip [lindex $argv 0]
set user [lindex $argv 1]
set password [lindex $argv 2]
set port [lindex $argv 3]
set taskID [lindex $argv 4]
set localName [lindex $argv 5]
set routeCommand [lindex $argv 6]

log_user 1

log_file ./transition/router/$taskID
spawn ssh -p $port $user@$ip "$routeCommand"
expect {
"yes/no" { send "yes\r"; exp_continue }
"password:" { send "$password\r" }
}
expect eof

log_user 0

spawn mv -f ./transition/router/$taskID "$localName"
expect eof

exit