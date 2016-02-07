var React = require('react');

function Player(){
	this.name = '';
	this.id = null;
	this.score = 0;
}

var UserBox = React.createClass({
	componentDidMount: function(){
		$(this.element).search({
			apiSettings: {
				url: '/users/search?q={query}'
			},
			fields: {
				title: 'username'
			}
		});
	},
	render: function(){
		return (
			<div ref={ function(e){ this.element = e; }.bind(this) } className="ui search field">
				<input name="players" className="prompt" placeholder="Enter a player name" />
				<div className="results"></div>
			</div>
		);
	}
});

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
				<UserBox key={i} index={i} />
			);
		});
		return (
			<div className="ui segment" style={this.props.style}>
				<div className="ui header">New game</div>
				<form action="/games" method="POST" className="ui form">
					{playerNodes}
					<div className="ui buttons">
						<button type="button" className="ui button" onClick={this.addPlayer}><i className="add user icon"></i>Player</button>
					</div>
					<button className="ui right floated button primary"><i className="trophy icon"></i>Create</button>
				</form>
			</div>
		);
	},
	addPlayer: function(e){
		var players = this.state.players;
		players.push(new Player());
		this.setState({ players: players });
	},
	addGuest: function(e){
		console.log('This will add a guest');
	}
});

module.exports = NewGame;