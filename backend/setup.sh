#!bin/bash

if [ "$1" == "-clear" ]; then
    sudo docker rm $(sudo docker ps -aq)

elif [ "$1" == "-start" ]; then
    sudo docker run -d --network host --name proxy_service flask >> log/log.txt 2>&1

elif [ "$1" == "-build" ]; then
    sudo docker pull mcr.microsoft.com/playwright:focal
    sudo docker build -t flask .

elif [ "$1" == "-clean" ]; then
    sudo docker images -q | xargs sudo docker rmi -f

else
    echo "Usage: $0 <-rm | -start> <container_name> [start_command]"
    exit 1
fi