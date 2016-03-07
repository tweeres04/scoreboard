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

function getGameViews(gameId){
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
		games.find(gameId ? { _id: gameId } : { end: { $exists: false } }, (err, games) => {
			if(err){
				reject(err);
			} else {
				resolve(games.length ? games : [games]);
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
		});

		return result;
	});
}

router.get('/', (req, res) => {
	getGameViews().then(gameViews => {
		res.send(gameViews);
	}, err => {
		res.status(500).send(err);
	})
});

router.post('/', function(req, res){
	var players = req.body.players;
	if(players){
		games.insert({
			start: new Date(),
			players: req.body.players.map(function(player){
				return {
					name: player,
					score: 0
				};
			})
		}, (err, newGame) => {
			if(err){
				res.status(500).send('Couldn\'t insert players');
				return
			}
			
			res.redirect(`/#/games/${newGame._id}`);
		});
	} else {
		res.send(400);
	}
});

router.get('/me', function(req, res){
	games.find({ 'players.name': req.user.username, end: { $exists: false } }, function(err, games){
		if(err){
			res.status(500).send(err);
			return;
		}

		res.send(games);
	});
});

router.get('/:id', function(req, res){
	games.findOne({ _id: req.params.id }, function(err, game){
		if(err){
			res.status(500).send(err);
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
		res.status(500).send(err);
	});
});

router.patch('/:id/updatescore', function(req, res){
	games.findOne({ _id: req.params.id }, function(err, game){
		if(err){
			res.status(500).send(err);
		} else {
			var player = game.players.filter(function(player){
				return player.name == req.body.player;
			})[0];
			player.score = Number(req.body.score);
			games.update({ _id: req.params.id }, game, function(err, numReplaced, newDoc){
				if(err){
					res.status(500).send(err);
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
			res.status(500).send(err);
			return;
		}

		getGameViews(req.params.id).then(games => {
			res.send(games[0].players);
		}, err => {
			res.status(500).send(err);
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
				res.status(500).send(err);
			} else {
				getGameViews(req.params.id).then(games => {
					res.send(games[0].players);
				}, err => {
					res.status(500).send(err);
				});
			}
		})
	});
});

router.patch('/:id/end', (req, res) => {
	games.update({ _id: req.params.id }, { $set: { end: new Date() } }, (err) => {
		if(err){
			res.status(500).send(err);
			return;
		}

		res.sendStatus(200);
	});
});

module.exports = init;