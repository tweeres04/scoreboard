var React = require('react');
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

const EndModal = React.createClass({
	componentDidMount() {
		$(this.modalElement).modal({ detachable: false })
	},
	render() {
		return (
			<div className="ui small modal" ref={e => { this.modalElement = e; }}>
				<i className="close icon"></i>
				<div className="header">
					End game
				</div>
				<div className="content">
					<div className="ui message">End the game?</div>
				</div>
				<div className="actions">
					<button className="ui primary button" onClick={this.props.endGame}>End game</button>
				</div>
			</div>
		);
	},
	closeDim() {
		$(this.modalElement).modal('hide');
	}
});

// todo: figure out how to make this modal work while keeping it detachable
var JoinModal = React.createClass({
	componentDidMount() {
		$(this.modalElement).modal({ detachable: false });
	},
	render() {
		const playerList = this.props.players.filter(player => !player.isUser).map((player, i) => (
			<div className="item" key={i}>
				<div className="middle aligned content">
					<div className="header">{player.name}</div>
					<button className="ui right floated button" onClick={this.props.takeSpot.bind(null, player)}>Take {player.name}s spot</button>
				</div>
			</div>
		));
		return (
			<div className="ui small modal" ref={function(e){ this.modalElement = e }.bind(this)}>
				<i className="close icon"></i>
				<div className="header">
					Join game
				</div>
				<div className="content">
					{playerList.length > 0 ? 
						(
							<div className="ui items">
								{playerList}
							</div>
						) :
						(
							<div className="ui info message">
								<p>There are no unregistered players in this game! You can join as a new player below.</p>
							</div>
						)}
				</div>
				<div className="actions">
					<button className="ui secondary button" onClick={this.props.joinGame}>Join as new player</button>
					<button className="ui primary button" onClick={this.closeDim}>Done</button>
				</div>
			</div>
		);
	},
	closeDim() {
		$(this.modalElement).modal('hide');
	}
});

var Scoreboard = React.createClass({
	getInitialState: function(){
		return { game: { start: null, players: [] } }
	},
	componentDidMount: function(){
		$.get('/games/' + this.props.params.gameid + '/scoreboard', function(game){
			this.setState({ game: game });
		}.bind(this));
	},
	render: function(){
		var loading = !this.state.game.start;
		var loadingUi = (
			<div className={'ui loader' + (loading ? ' active' : '')}></div>
		);
		var inGame = false; // TODO finish this
		var gameUi = (
			<div className="scoreboard">
				{!inGame ?
				<div className="ui right floated buttons">
					<button className="ui primary button" onClick={this.showJoinGameModal}><i className="add user icon"></i>Join </button>
					<button className="ui button" onClick={this.showCloseGameModal}><i className="checkered flag icon"></i>End </button>
				</div> :
				null}
				<h1 className="ui header">{loading ? '' : moment(this.state.game.start).format('ll')}</h1>
				<div className="ui items">
					{this.state.game.players.map(function(player, i){
						return <PlayerScore player={player} updateScore={this.updateScore} key={i} />
					}.bind(this))}
				</div>
				<JoinModal ref={ref => this.joinModal = ref} players={this.state.game.players} takeSpot={this.takeSpot} joinGame={this.joinGame}></JoinModal>
				<EndModal ref={ref => this.endModal = ref} endGame={this.endGame}></EndModal>
			</div>
		);
		return loading ? loadingUi : gameUi;
	},
	takeSpot: function(player, event){
		var button = $(event.target).closest('button');
		button.addClass('disabled loading').attr('disabled', 'disabled');
		$.ajax({
			url: '/games/' + this.state.game._id + '/takeSpot',
			method: 'PATCH',
			data: player
		}).then(players => {
			var newState = this.state;
			newState.game.players = players;
			this.setState(newState);
			button.removeClass('disabled loading').removeAttr('disabled');
			this.joinModal.closeDim();

		});
	},
	joinGame: function(){
		var button = $(event.target).closest('button');
		button.addClass('disabled loading').attr('disabled', 'disabled');
		$.ajax({
			url: `/games/${this.state.game._id}/join`,
			method: 'PATCH'
		}).then(players => {
			var newState = this.state;
			newState.game.players = players;
			this.setState(newState);
			button.removeClass('disabled loading').removeAttr('disabled');
			this.joinModal.closeDim();
		});
	},
	followGame: function(){
		console.log('This would follow a game');
	},
	endGame(){
		var button = $(event.target).closest('button');
		button.addClass('disabled loading').attr('disabled', 'disabled');
		var component = this;
		$.ajax({
			url: `/games/${this.state.game._id}/end`,
			method: 'PATCH'
		}).then(response => {
			component.endModal.closeDim();
			window.location.hash = '#/games';
		});
	},
	showJoinGameModal: function(){
		$(this.joinModal.modalElement).modal('show');
	},
	showCloseGameModal(){
		$(this.endModal.modalElement).modal('show');
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