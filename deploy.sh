#!/bin/bash

echo 'Deploying scoreboard...'

gulp build

scp -r dist root@tweeres.ca:dist && \
	ssh root@tweeres.ca 'bash -s' < deployscript.sh

echo 'Deploy complete!'