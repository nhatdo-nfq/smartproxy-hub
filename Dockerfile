FROM ubuntu:18.04

ENV SERVERNAME=smartproxy.local \
    WORKDIR=/var/www/dev-php \
    DOCROOT=/var/www/dev-php/cached

COPY files/ /

RUN apt-get update && \
    apt-get -y dist-upgrade && \
    apt-get -y install curl gnupg2 ca-certificates lsb-release \
    --no-install-recommends nano ca-certificates unzip git && \
    echo "deb http://nginx.org/packages/ubuntu `lsb_release -cs` nginx" \
        | tee /etc/apt/sources.list.d/nginx.list && \
    curl -fsSL https://nginx.org/keys/nginx_signing.key | apt-key add - && \
    apt-get -y  update && \
    apt-get -y install nginx nginx-module-njs && \
    curl -sL https://deb.nodesource.com/setup_12.x | bash - && \
    apt-get install -y nodejs && \
    mkdir -p $DOCROOT && chown www-data:www-data $DOCROOT && \
    mkdir -p $WORKDIR && chown www-data:www-data $WORKDIR && \
    apt-get -y purge $BUILD_PACKAGES && \
    apt-get -y autoremove && \
    apt-get -y clean && \
    rm -rf /var/lib/apt/lists/* && \
    chmod +x /nginx-foreground.sh

RUN ln -sf /dev/stdout /var/log/nginx/access.log
RUN ln -sf /dev/stderr /var/log/nginx/error.log

VOLUME ["/var/www/dev-php/cached"]

EXPOSE 80/tcp \
       443/tcp

CMD ["/nginx-foreground.sh"]
