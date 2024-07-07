#!bin/bash

if [ "$1" == "-clear" ]; then
    sudo docker stop $(sudo docker ps -aq) && sudo docker rm $(sudo docker ps -a -aq)

elif [ "$1" == "-start" ]; then
    sudo docker run -d --network host flask >> log/log.txt 2>&1

elif [ "$1" == "-build" ]; then
    sudo docker build . -t flask 

elif [ "$1" == "-clean" ]; then
    sudo docker system prune -a

else
    echo "Usage: $0 <-rm | -start> <container_name> [start_command]"
    exit 1
fi