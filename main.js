var React = require('react');
var ReactDOM = require('react-dom');

var reactRouter = require('react-router');
var Router = reactRouter.Router;
var Route = reactRouter.Route;
var IndexRedirect = reactRouter.IndexRedirect;
var Link = reactRouter.Link;

var GameList = require('./screens/GameList');
var MyGames = GameList.MyGames;
var AllGames = GameList.AllGames;
var Scoreboard = require('./screens/Scoreboard');
var Login = require('./screens/Login');

var App = React.createClass({
	getInitialState: function(){
		return { user: null };
	},
	componentDidMount: function(){
		$.get('/user').then(user => {
			if(!user){
				location.hash = '#/login';
			} else {
				this.setState({ user: user });
			}
		});
	},
	render: function(){
		return (
			<div className="scoreboard">
				{this.state.user ? <div className="ui stackable menu">
					<div className="item">
						<h2>{this.state.user}</h2>
					</div>
					<Link to="/" className="item">My Games</Link>
					<Link to="/games" className="item">Scoreboards</Link>
					<a className="right item" href="/logout">Log out</a>
				</div> : null}
				{this.props.children}
			</div>
		);
	}
});

ReactDOM.render(
	<Router>
		<Route path="/" component={App}>
			<IndexRedirect to="/games/me" />
			<Route path="login" component={Login} />
			<Route path="games/me" component={MyGames} />
			<Route path="games/:gameid" component={Scoreboard} />
			<Route path="games" component={AllGames} />
		</Route>
	</Router>,
	document.querySelector('.container')
);