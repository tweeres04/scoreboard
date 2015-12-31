var React = require('react');
var $ = require('jquery');
var moment = require('moment');
var debounce = require('debounce');

var PlayerScore = React.createClass({
	render: function(){
		var player = this.props.player;
		return (
			<div className="item">
				<div className="content">
					<div className="header">{player.name}</div>
					<div className="description">
						<div className="ui labeled input">
							<div className="ui label">Score</div>
							<input type="number" value={player.score} onChange={this.updateScore} />
						</div>
					</div>
				</div>
			</div>
		);
	},
	updateScore: function(e){
		var data = {
			player: this.props.player.name,
			score: Number(e.target.value)
		};
		this.props.updateScore(data);
	}
});

var Scoreboard = React.createClass({
	getInitialState: function(){
		return { game: { start: null, players: [] } }
	},
	componentDidMount: function(){
		$.get('/games/' + this.props.params.gameid, function(game){
			this.setState({ game: game });
		}.bind(this));
	},
	render: function(){
		var loading = !this.state.game;
		var loadingUi = (
			<div className={'ui loader' + (loading ? ' active' : '')}></div>
		);
		var gameUi = (
			<div className="scoreboard">
				<h1 className="ui header">{moment(this.state.game.start).format('ll')}</h1>
				<div className="ui items">
					{this.state.game.players.map(function(player, i){
						return <PlayerScore player={player} updateScore={this.updateScore} key={player.name} />
					}.bind(this))}
				</div>
			</div>
		);
		return loading ? loadingUi : gameUi;
	},
	updateScore: function(data){
		return $.ajax({
			url: '/games/' + this.state.game._id + '/updatescore',
			data: data,
			method: 'PATCH'
		}).then(function(game){
			this.setState({ game: game });
		}.bind(this));
	}
});

module.exports = Scoreboard;