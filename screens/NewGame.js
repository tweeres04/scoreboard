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
			<div className="ui clearing segment" style={this.props.style}>
				<div className="ui header">New game</div>
				<form action="/games" method="POST" className="ui form">
					<div className="field">
						<label>Description</label>
						<textarea rows="2" name="description" placeholder="Enter a description"></textarea>
					</div>
					{playerNodes}
					<div className="ui right floated buttons">
						<button type="button" className="ui button" onClick={this.addPlayer}><i className="add user icon"></i>Add player</button>
						<button className="ui button primary"><i className="trophy icon"></i>Create game</button>
					</div>
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