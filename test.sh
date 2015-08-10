#!/bin/bash

	echo "hello1" >> /var/log/wapmadrid.log
    export NODE_ENV=develop   
	echo "hello3" >> /var/log/wapmadrid.log
    chdir /var/www/vhosts/madridsalud.es/wapmadrid.madridsalud.es/wapmadrid/
	echo "hello2" >> /var/log/wapmadrid.log
    exec node server.js >> /var/log/wapmadrid.log