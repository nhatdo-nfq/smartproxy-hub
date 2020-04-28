#!/bin/bash

mkdir -p /var/www/dev-php/cached
chmod -R 777 /var/www/dev-php/cached
#envsubst "${SHOP_URL} ${SHOP_HOST} ${NGINX_HOST} ${NGINX_PORT}" < /default.template > /etc/nginx/conf.d/default.conf
/bin/bash -c "envsubst \"${SHOP_URL} ${SHOP_HOST} ${NGINX_HOST} ${NGINX_PORT}\" < /default.template > /etc/nginx/conf.d/default.conf"
cat /nginx.conf > /etc/nginx/nginx.conf
#cat /default.conf > /etc/nginx/conf.d/default.conf
nginx -g 'daemon off;'
