var React = require('react');
var moment = require('moment');
var Link = require('react-router').Link;

var NewGame = require('./NewGame');

var ScoreboardSummary = React.createClass({
	render: function(){
		var game = this.props.game;
		var players = game.players;
		return (
			<div className="item">
				<Link to={'/games/' + game._id} key={game._id}>
					<div className="content">
						<div className="header">
							{moment(game.start).format('ll')}
							{<div className="sub header">{game.description || 'No description'}</div>}
						</div>
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

var MyGames = React.createClass({
	getInitialState: function(){
		return { games: [], loading: true };
	},
	componentDidMount: function(){
		$.get('/games/me', function(games){
			this.setState({ games: games, loading: false });
		}.bind(this));
	},
	render: function(){
		return (
			<GameList games={this.state.games} header={'Your games'} loading={this.state.loading} />
		);
	}
});

var AllGames = React.createClass({
	getInitialState: function(){
		return { games: [], loading: true };
	},
	componentDidMount: function(){
		$.get('/games', function(games){
			this.setState({ games: games, loading: false });
		}.bind(this));
	},
	render: function(){
		return (
			<GameList games={this.state.games} header={'All games'} loading={this.state.loading} />
		);
	}
});

var GameList = React.createClass({
	getInitialState: function(){
		return { showNew: false };
	},
	render: function(){
		return (
			<div>
				<button className="ui right floated primary button" onClick={this.newGame} style={{marginBottom: '15px'}}><i className="trophy icon"></i>New game</button>
				<NewGame style={{ display: this.state.showNew ? 'block' : 'none' }} />
				{!this.props.loading && this.props.games.length == 0 ?
					<div className="ui info message" style={{ clear: 'right' }}>
						<div className="header">No games yet</div>
						<p>Games will show here when theyre created</p>
					</div> :
					<h2 className="ui header">{this.props.header}</h2> }
				<div className={'ui loader' + (this.props.loading ? ' active' : '')}></div>
				<div className="ui relaxed selection list">
					{this.props.games.map(function(game){
						return (
							<ScoreboardSummary key={game._id} game={game}/>
						);
					})}
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

module.exports = {
	MyGames: MyGames,
	AllGames: AllGames
};