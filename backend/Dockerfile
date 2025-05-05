FROM python:3.9-slim

COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

COPY server.py server.py

EXPOSE 5000

CMD ["python", "server.py"]
