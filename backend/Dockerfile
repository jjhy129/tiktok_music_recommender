FROM mcr.microsoft.com/playwright:focal

WORKDIR /app

COPY . .

RUN apt-get update && \
    apt-get install -y python3.9 python3.9-venv python3.9-dev python3-pip xvfb && \
    rm /usr/bin/python3 && \
    ln -s /usr/bin/python3.9 /usr/bin/python3

RUN python3 -m pip install --upgrade pip

RUN python3 -m pip install -r requirements.txt

RUN python3 -m playwright install

CMD xvfb-run python3 server.py
