#!bin/bash

if [ "$1" == "-clear" ]; then
    sudo docker stop $(sudo docker ps -aq) && sudo docker rm $(sudo docker ps -a -aq)

elif [ "$1" == "-start" ]; then
    sudo docker run -d --network host flask 

elif [ "$1" == "-build" ]; then
    sudo docker build . -t flask 

elif [ "$1" == "-clean" ]; then
    sudo docker system prune -a

# inspect daily access log
elif [ "$1" == "-inspect" ]; then
    sudo docker exec -it optimistic_cartwright /bin/bash
    # then: cat log/access.txt 

else
    echo "Usage: $0 <-rm | -start> <container_name> [start_command]"
    exit 1
fi