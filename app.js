var express = require('express');
var nedb = require('nedb');
var morgan = require('morgan');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
const bcrypt = require('bcrypt');

var port = process.env.SCOREBOARD_PORT || 3000;
const saltRounds = 10;

var users = new nedb({
	filename: 'data/users.json',
	autoload: true
});

var gamesRouter = require('./api/games')(users);

passport.use(new LocalStrategy(
	function(username, password, done){
		users.findOne({ username: username }, function(err, user){
			if(err){
				return done(err);
			}
			if(!user){
				return done(null, false);
			}
			bcrypt.compare(password, user.password, (err, res) => {
				return done(err, res ? user : false);
			});
		});
	}
));

passport.serializeUser(function(user, done){
	done(null, user.username);
});

passport.deserializeUser(function(username, done){
	users.findOne({ username: username }, function(err, user){
		done(null, user);
	});
});

var app = express();

app.use(morgan('dev'));

app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(session({
	secret: 'twylabeans',
	store: new FileStore({
		ttl: 604800 // 1 week
	}),
	cookie: {
		maxAge: 604800000
	}
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(__dirname));

app.post('/login/new', function(req, res){
	users.findOne({ username: req.body.username }, function(err, user){
		if(err){
			res.send(err.message);
		} else if(user){
			res.redirect('/#/login?exists=true');
		} else {
			bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
				if(err){
					res.send(err.message);
					return;
				}
				users.insert({
					username: req.body.username,
					password: hash
				});
				res.redirect('/#/games');
			});
		}
	});
});

app.post('/login', passport.authenticate('local', { successRedirect: '/#/games', failureRedirect: '/#/login?fail=true' }));

app.get('/logout', function(req, res){
	req.logout();
	res.redirect('/');
})

app.get('/user', function(req, res){
	res.send(req.user ? req.user.username : null);
});

app.get('/users/search', function(req, res){
	var re = new RegExp(req.query.q);
	users.find({ username: re }, function(err, users){
		if(err){
			res.status(500).send(err.message);
		} else {
			res.send({
				results: users.map(function(user){
					return {
						username: user.username
					};
				})
			});
		}
	});
});

app.use('/games', gamesRouter);

function start(){
	app.listen(port, function(err){
		console.log('Listening on port ' + port);
	});
};

if(require.main == module){
	start();
}

module.exports = start;
