var React = require('react');
var ReactDOM = require('react-dom');

var reactRouter = require('react-router');
var Router = reactRouter.Router;
var Route = reactRouter.Route;
var Link = reactRouter.Link;

var GameList = require('./screens/GameList');
var Scoreboard = require('./screens/Scoreboard');
var Login = require('./screens/Login');

var App = React.createClass({
	getInitialState: function(){
		return { loggedIn: false };
	},
	componentDidMount: function(){

	},
	tryLogin: function(){

	},
	render: function(){
		return (
			<div className="scoreboard">
				<h1>Scoreboard</h1>
				<Link to="/login">Login</Link>
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