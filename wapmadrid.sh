#!upstart                                                                                                        
description "wapmadrid"
author      "WapMadrid Api Server by Ismael Requena"
 
env PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
 
respawn
start on runlevel [2345]
stop on shutdown
 
script
    export NODE_ENV=develop   
    cd /var/www/vhosts/madridsalud.es/wapmadrid.madridsalud.es/wapmadrid/
    exec node server.js >> /var/log/wapmadrid.log
end script

