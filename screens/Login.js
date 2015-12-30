var React = require('react');

module.exports = React.createClass({
	getInitialState: function(){
		return { create: false };
	},
	render: function(){
		var alreadyExistsStyle = {
			display: this.props.params.exists ? 'block' : 'none'
		};
		var errorStyle = {
			display: this.props.params.fail ? 'block' : 'none'
		}
		return (
			<div>
				<div className="ui negative message" style={alreadyExistsStyle}>That user already exists!</div>
				<div className="ui negative message" style={errorStyle}>Couldnt log you in</div>
				<div className="ui segment login">
					<form className="ui form" action={this.state.create ? '/login/new' : '/login'} method="POST">
						<div className="field">
							<label>Your username</label>
							<input name="username" placeholder="Enter your username" defaultValue="tweeres" />
						</div>
						<div className="field">
							<label>Password</label>
							<input name="password" type="password" placeholder="Enter your password" defaultValue="asdf" />
						</div>
						<button className="ui primary button">{this.state.create ? 'Create' : 'Login'}</button>
					</form>
					<div>
						<a style={{ cursor: 'pointer' }} onClick={this.toggleCreate}>{this.state.create ? 'Cancel' : 'Create account'}</a>
					</div>
				</div>
			</div>
		);
	},
	toggleCreate: function(){
		this.setState({
			create: !this.state.create
		});
	}
});