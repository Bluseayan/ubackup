#!/usr/bin/expect

set timeout 1800
set localName [lindex $argv 0]
set taskID [lindex $argv 1]

spawn mv -f ./transition/host/$taskID "$localName"

expect eof
exit