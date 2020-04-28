#!/bin/bash

mkdir -p /var/www/dev-php/cached
echo "nginx foreground"
exec chmod -R 777 /var/www/dev-php/cached
exec echo 'testing' > /test.txt
exec cat /default.conf > /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'
