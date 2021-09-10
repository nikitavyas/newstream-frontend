import React, { Component } from 'react';
import './InviteesAvatar.css';
import { Avatar, Button } from 'antd';
class InviteesAvatar extends Component {
	render() {
		return (
			<React.Fragment>
				<div className="d-flex flex-row align-items-center px-4 invitedthumbs">
					<Avatar src={require('../../Assets/images/Tim-Carter.jpg')} />
					<Avatar src={require('../../Assets/images/John-Davis.jpg')} />
					<Avatar src={require('../../Assets/images/Mei-Hu.jpg')} />
					<Button type="primary" shape="circle">
						5+
					</Button>
				</div>
			</React.Fragment>
		);
	}
}

export default InviteesAvatar;
