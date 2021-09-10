import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

class Logout extends Component {
	constructor(props) {
		super(props);
		localStorage.setItem('access_token', '');
		this.props.history.push('/login');
	}
}
Logout = withRouter(withRouter);
export { Logout };
