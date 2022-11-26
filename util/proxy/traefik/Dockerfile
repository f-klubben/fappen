FROM traefik:latest

RUN apk update
RUN apk add openssl
RUN openssl req -x509 -newkey rsa:4096 -keyout /key.pem -out /cert.pem -days 10000 -nodes -subj "/C=DK/O=fit/OU=Domain Control Validated/CN=localhost"

