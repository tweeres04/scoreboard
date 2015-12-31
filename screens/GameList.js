var React = require('react');
var $ = require('jquery');
var moment = require('moment');
var Link = require('react-router').Link;

function Player(){
	this.name = '';
	this.score = 0;
}

var NewGame = React.createClass({
	getInitialState: function(){
		return {
			players: [
				new Player()
			]
		};
	},
	render: function(){
		var playerNodes = this.state.players.map(function(player, i){
			return (
				<div className="field" key={i}>
					<label>Name</label>
					<input name="players" type="text" />
				</div>
			);
		});
		return (
			<form action="/games" method="POST" className="ui form" style={this.props.style}>
				{playerNodes}
				<div className="ui buttons">
					<button type="button" className="ui button" onClick={this.addPlayer}>Add player</button>
					<button className="ui button primary">Create game</button>
				</div>
			</form>
		);
	},
	addPlayer: function(e){
		var players = this.state.players;
		players.push(new Player());
		this.setState({ players: players });
	}
});

var ScoreboardSummary = React.createClass({
	render: function(){
		var game = this.props.game;
		var players = game.players;
		return (
			<div className="item">
				<Link to={'/games/' + game._id} key={game._id}>
					<div className="content">
						<div className="header">{moment(game.start).format('ll')}</div>
						<div className="ui statistics">
							{players.map(function(player, i){
								return (
									<div className="statistic" key={i}>
										<div className="label">{player.name}</div>
										<div className="value">{player.score}</div>
									</div>
								);
							})}
						</div>
					</div>
				</Link>
			</div>
		);
	}
});

var GameList = React.createClass({
	getInitialState: function(){
		return { games: [], showNew: false };
	},
	componentDidMount: function(){
		$.get('/games/me', function(games){
			this.setState({ games: games });
		}.bind(this));
	},
	render: function(){
		var gamesNodes = this.state.games.map(function(game){
			return (
				<ScoreboardSummary key={game._id} game={game}/>
			);
		});
		return (
			<div>
				<button className="ui right floated primary button" onClick={this.newGame}>New game</button>
				<NewGame style={{ display: this.state.showNew ? 'block' : 'none' }} />
				{this.state.games.length == 0 ?
					<div className="ui info message">
						<div className="header">No games yet</div>
						<p>Games will show here when theyre created</p>
					</div> :
					<h2 className="ui header">Your games</h2> }
				<div className="ui relaxed selection list">
					{gamesNodes}
				</div>
			</div>
		);
	},
	newGame: function(){
		var newState = this.state;
		newState.showNew = true;
		this.setState(newState);
	}
});

module.exports = GameList;