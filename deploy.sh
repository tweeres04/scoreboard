#!/bin/bash

echo 'Deploying scoreboard...'

gulp build

scp -r dist root@scoreboardapp.net:~ && \
	ssh root@scoreboardapp.net 'bash -s' < deployscript.sh

echo 'Deploy complete!'
