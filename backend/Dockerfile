FROM python:3.9

WORKDIR /app

COPY . .

RUN apt-get update && apt-get install -y python3-pip
RUN pip install -r requirements.txt
RUN python3 -m playwright install

EXPOSE 8080

CMD ["python", "server.py"]
