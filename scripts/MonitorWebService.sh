#!/bin/bash
#echo "Service ServiceMonitoring"

username=$(echo $1 | cut -d : -f 1)
ip=$(echo $1 | cut -d : -f 2)
password=$(echo $1 | cut -d : -f 3)

webserviceScript="ServiceMonitor.sh"
credentials="$username@$ip"

#echo "WebService script copied"
#to copy to remote machine using scp connecting it without RSA key authorization
sshpass -p "$password" scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "./scripts/$webserviceScript"  "$credentials":./


#echo "WebService Call"
sshpass -p "$password" ssh -o StrictHostKeyChecking=no -x "$credentials" 'sh ServiceMonitor.sh'
