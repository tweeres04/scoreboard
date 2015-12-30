var express = require('express');
var nedb = require('nedb');

var router = express.Router();

var games = new nedb({
	filename: 'data/games.json',
	autoload: true
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
		}, function(err){
			if(err){
				res.status(500).send('Couldn\'t insert players');
			} else {
				res.redirect('/#/games');
			}
		});
	} else {
		res.send(400);
	}
});

router.get('/me', function(req, res){
	games.find({}, function(err, games){
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
				console.log(err, numReplaced, newDoc);
				if(err){
					res.status(500).send(err);
				} else {
					res.send(game);
				}
			});
		}
	});
});

module.exports = router;