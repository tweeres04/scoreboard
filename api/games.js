var express = require('express');
var nedb = require('nedb');

var path = require('path');

var users;
var router = express.Router();

function init(db){
	users = db;
	return router;
};

var games = new nedb({
	filename: 'data/games.json',
	autoload: true
});

games.ensureIndex({ fieldName: 'players.name' });

function getGameViews(options){
	options = options || {};
	const username = options.username;
	const gameId = options.gameId;
	const includePublic = options.includePublic;
	if(!username && !gameId){
		throw 'getGameViews requires a username or a gameId';
	}
	var usersPromise = new Promise(function(resolve, reject){
		users.find({}, function(err, users){
			if(err){
				reject(err);
			} else {
				resolve(users);
			}
		});
	});
	var gamesPromise = new Promise(function(resolve, reject){
		const query = {
			end: {
				$exists: false
			},
			$or: [
				includePublic ? {
					'private': false
				} : null,
				{
					'players.name': username
				}
			]
		};
		games.find(gameId ? { _id: gameId } : query, (err, games) => {
			if(err){
				reject(err);
			} else {
				resolve(games);
			}
		});
	});
	return Promise.all([usersPromise, gamesPromise]).then(function(results){
		var users = results[0];
		var games = results[1];

		var result = games.map(function(game){
			game.players = game.players.map(function(player){
				var isUser = users.some(function(user){
					return user.username == player.name;
				});
				if(isUser){
					player.isUser = true;
				}
				return player;
			});
			return game;
		}).sort((a, b) => new Date(a.start) > new Date(b.start) ? -1 : 1);

		return result;
	});
}

router.get('/', (req, res) => {
	getGameViews({ username: req.user.username, includePublic: true }).then(gameViews => {
		res.send(gameViews);
	}, err => {
		res.status(500).send(err.message);
	})
});

router.post('/', function(req, res){
	var players = [].concat(req.body.players);
	if(players){
		games.insert({
			start: new Date(),
			description: req.body.description,
			players: players.map(function(player){
				return {
					name: player,
					score: 0
				};
			}),
			private: req.body.private == 'on' ? true : false
		}, (err, newGame) => {
			if(err){
				res.status(500).send('Couldn\'t create game', err.message);
				return;
			}
			
			res.redirect(`/#/games/${newGame._id}`);
		});
	} else {
		res.send(400);
	}
});

router.get('/me', function(req, res){
	getGameViews({ username: req.user.username }).then(gameViews => {
		res.send(gameViews);
	}, err => {
		res.status(500).send(err.message);
	});
});

router.get('/:id', function(req, res){
	games.findOne({ _id: req.params.id }, function(err, game){
		if(err){
			res.status(500).send(err.message);
		} else {
			res.send(game);
		}
	});
});

router.get('/:id/scoreboard', function(req, res){
	var id = req.params.id;

	var gamePromise = new Promise(function(resolve, reject){
		games.findOne({ _id: id }, function(err, game){
			if(err){
				reject(err);
			} else {
				resolve(game);
			}
		});
	});

	var usersPromise = new Promise(function(resolve, reject){
		users.find({}, function(err, users){
			if(err){
				reject(err);
			} else {
				resolve(users);
			}
		});
	});

	Promise.all([gamePromise, usersPromise]).then(function(result){
		var game = result[0],
			users = result[1];

		game.players = game.players.map(function(player){
			var isUser = users.some(function(user){
				return user.username == player.name;
			});

			player.isUser = isUser;

			return player;
		});

		res.send(game);
	}, function(err){
		res.status(500).send(err.message);
	});
});

router.patch('/:id/updatescore', function(req, res){
	games.findOne({ _id: req.params.id }, function(err, game){
		if(err){
			res.status(500).send(err.message);
		} else {
			var player = game.players.filter(function(player){
				return player.name == req.body.player;
			})[0];
			player.score = Number(req.body.score);
			games.update({ _id: req.params.id }, game, function(err, numReplaced, newDoc){
				if(err){
					res.status(500).send(err.message);
				} else {
					res.send(game);
				}
			});
		}
	});
});

router.patch('/:id/join', (req, res) => {
	const newPlayer = {
		name: req.user.username,
		score: 0
	};

	games.update({ _id: req.params.id }, { $push: { players: newPlayer } }, err => {
		if(err){
			res.status(500).send(err.message);
			return;
		}

		getGameViews({ gameId: req.params.id }).then(games => {
			res.send(games[0].players);
		}, err => {
			res.status(500).send(err.message);
		});
	});
});

router.patch('/:id/takeSpot', function(req, res){
	games.findOne({ _id: req.params.id }, { players: 1 }, function(err, game){
		var players = game.players.map(function(player){
			if(player.name == req.body.name){
				player.name = req.user.username;
			}
			return player;
		});
		games.update({ _id: req.params.id }, { $set: { players: players } }, function(err){
			if(err){
				res.status(500).send(err.message);
			} else {
				getGameViews({ gameId: req.params.id }).then(games => {
					res.send(games[0].players);
				}, err => {
					res.status(500).send(err.message);
				});
			}
		})
	});
});

router.patch('/:id/end', (req, res) => {
	games.update({ _id: req.params.id }, { $set: { end: new Date() } }, (err) => {
		if(err){
			res.status(500).send(err.message);
			return;
		}

		res.sendStatus(200);
	});
});

module.exports = init;