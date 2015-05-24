#!/bin/bash

echo "Total RAM : $(free -m | grep -B1 'Mem'|  awk '{print $2}' | tail -n 1 )"

echo "Used RAM: $(free -m | grep -A1 'Mem'|  awk '{print $3}' | tail -n 1 )"
