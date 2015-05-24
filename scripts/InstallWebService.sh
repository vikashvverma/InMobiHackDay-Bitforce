#!/bin/bash
echo "Hello Everyone"

username=$(echo $1 | cut -d : -f 1)
ip=$(echo $1 | cut -d : -f 2)
password=$(echo $1 | cut -d : -f 3)
package=$(echo $1 | cut -d : -f 4)

webserviceScript="webservice.sh"
credentials="$username@$ip"

toServer="$password:$package"
echo "$toServer"

echo "WebService script copied"
#to copy to remote machine using scp connecting it without RSA key authorization
sshpass -p "$password" scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "./scripts/$webserviceScript"  "$credentials":./

#sshpass -p "$password" scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "./scripts/$package.tar"  "$credentials":./


#echo "WebService Call 1"
#sshpass -p "$password" ssh -o StrictHostKeyChecking=no -t "$credentials" 'export  servervariable='"'$toServer'"';sh webservice.sh'

echo "WebService Call"
sshpass -p "$password" ssh -x "$credentials" "sh webservice.sh $toServer"
