var express = require('express');
var nedb = require('nedb');
var morgan = require('morgan');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');

var gamesRouter = require('./api/games');

var port = process.env.port || 3000;

var users = new nedb({
	filename: 'data/users.json',
	autoload: true
});

passport.use(new LocalStrategy(
	function(username, password, done){
		users.findOne({ username: username }, function(err, user){
			if(err){
				return done(err);
			}
			if(!user || password != user.password){
				return done(null, false);
			}
			return done(null, user);
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
	secret: 'twylabeans'
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname));

app.post('/login/new', function(req, res){
	users.findOne({ username: req.body.username }, function(err, user){
		if(err){
			res.send(err);
		} else if(user){
			res.redirect('/#/login?exists=true');
		} else {
			users.insert({
				username: req.body.username,
				password: req.body.password
			});
			res.redirect('/#/games');
		}
	});
});

app.post('/login', passport.authenticate('local', { successRedirect: '/#/games', failureRedirect: '/#/login?fail=true' }));

app.use('/games', gamesRouter);

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});	

function start(){
	app.listen(port, function(err){
		console.log('Listening on port ' + 3000);
	});
};

if(require.main == module){
	start();
}

module.exports = start;