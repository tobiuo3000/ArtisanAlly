FROM python:3.12.3-bookworm

ENV PYTHONUNBUFFERED True
RUN apt-get update
ENV APP_HOME /app
WORKDIR $APP_HOME
COPY . ./

RUN pip install --no-cache-dir -r requirements.txt

# Webサーバーを起動（gunicorn）
CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 main:app