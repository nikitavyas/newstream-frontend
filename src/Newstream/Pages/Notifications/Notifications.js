import React, { Component } from 'react';
import './Notifications.css';
import { Typography, Card } from 'antd';
const { Title } = Typography;

class Notifications extends Component {
	render() {
		return (
			<React.Fragment>
				<div className="container">
					<div className="d-flex flex-row align-items-center justify-content-between my-2">
						<Title level={4} strong="false" className="pageTitle m-0">
							Notifications
						</Title>
					</div>
					<div className="d-flex flex-column my-2">
						<Card className="mb-2">
							<div className="d-flex flex-row justify-content-between">
								<div className="d-flex flex-column">
									<div>
										<Title level={4}>
											Brett Shaw has submitted a story for "Moments from
											Tomorrowland..."
										</Title>
									</div>
									<div>5 minutes ago</div>
								</div>
							</div>
						</Card>
						<Card className="mb-2">
							<div className="d-flex flex-row justify-content-between">
								<div className="d-flex flex-column">
									{' '}
									<div>
										<Title level={4}>
											Tim Carter has submitted a story for "Moments from
											Tomorrowland..."
										</Title>
									</div>
									<div>45 minutes ago</div>{' '}
								</div>
							</div>
						</Card>
						<Card className="mb-2">
							<div className="d-flex flex-row justify-content-between">
								<div className="d-flex flex-column">
									{' '}
									<div>
										<Title level={4}>
											Request reminder: Sue Martin has not accepted your request
											till now!
										</Title>
									</div>
									<div>2 hours ago</div>{' '}
								</div>
							</div>
						</Card>
					</div>
				</div>
			</React.Fragment>
		);
	}
}

export { Notifications };
