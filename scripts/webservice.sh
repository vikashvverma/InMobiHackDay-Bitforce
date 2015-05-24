#!/bin/bash
servervar="$1"
password=$(echo $servervar | cut -d : -f 1)
package=$(echo $servervar | cut -d : -f 2)


echo "WebService Call Execution"
echo "$servervar Server"
echo "$password * Server"
echo "$package ** Server"

docker load < $package.tar
