cd ~/dist && \
	npm update --production && \
	npm install --production

pm2 restart "scoreboard"
