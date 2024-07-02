#!bin/bash

if [ "$1" == "-rm" ]; then
    sudo docker rm $(sudo docker ps -aq)
elif [ "$1" == "-start" ]; then
    sudo docker run -d -p 8888:8888 --name proxy_service flask >> log/log.txt 2>&1
else
    echo "Usage: $0 <-rm | -start> <container_name> [start_command]"
    exit 1
fi