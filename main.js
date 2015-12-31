var React = require('react');
var ReactDOM = require('react-dom');
var $ = require('jquery');

var reactRouter = require('react-router');
var Router = reactRouter.Router;
var Route = reactRouter.Route;
var Link = reactRouter.Link;

var GameList = require('./screens/GameList');
var Scoreboard = require('./screens/Scoreboard');
var Login = require('./screens/Login');

var App = React.createClass({
	getInitialState: function(){
		return { user: null };
	},
	componentDidMount: function(){
		$.get('/user').then(function(user){
			if(!user){
				location.hash = '#/login';
			} else {
				this.setState({ user: user });
				location.hash = '#/games'
			}
		}.bind(this));
	},
	render: function(){
		return (
			<div className="scoreboard">
				{this.state.user ? <div className="ui borderless menu">
					<div className="item">
						<h2>{this.state.user}</h2>
					</div>
					<Link to="/games" className="item">Games</Link>
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
			<Route path="games" component={GameList} />
			<Route path="games/:gameid" component={Scoreboard} />
			<Route path="login" component={Login} />
		</Route>
	</Router>,
	document.querySelector('.container')
);