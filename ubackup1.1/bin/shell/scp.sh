#!/usr/bin/expect

set timeout 10
set ip [lindex $argv 0]
set user [lindex $argv 1]
set password [lindex $argv 2]
set port [lindex $argv 3]
set filename [lindex $argv 4]
set filenameOnPath [lindex $argv 5]
set taskID [lindex $argv 6]

spawn scp -r -P $port $user@$ip:"$filenameOnPath" ./transition/host/$taskID
expect {
"yes/no" { send "yes\r";exp_continue }
"password" { send "$password\r" }
}

set flag 0
expect "$filename" { set flag 1 }
if {$flag!=0} {
set timeout 1800
}
expect eof

exit