import React, { Component } from 'react';
import './ErrorMessages.css';
import { Row, Col, Typography, Card, Button } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';

const { Title } = Typography;

class ErrorMessages extends Component {
	render() {
		return (
			<React.Fragment>
				<div class="nodatapage">
					<div class="container">
						{(() => {
							switch (this.props.match.params.type) {
								case '502':
									return (<div class="nodatacontent">
										<img src={require('../../Assets/images/internal-server-error.png')} />
										<h3 class="my-4">Internal Server Error</h3>
										<p>We're experiencing some technical problems. Please try again later.</p>
										{/* <Button
											type="primary"
										//onClick={this.showModal}
										>
											Back to home
										</Button> */}
									</div>);
								case '404':
									return (<div class="nodatacontent">
										<img src={require('../../Assets/images/no-data-found.png')} />
										<h3 class="my-4">Sorry! No data found</h3>
										<p>No data to show right now, try again in some time.</p>
										{/* <Button
											type="primary"
										//onClick={this.showModal}
										>
											Back to home
										</Button> */}
									</div>);
								case 'noData':
									return (<div class="nodatacontent">
										<img src={require('../../Assets/images/no-data-found.png')} />
										<h3 class="my-4">Sorry! No data found</h3>
										<p>No data to show right now, try again in some time.</p>
										{/* <Button
											type="primary"
										//onClick={this.showModal}
										>
											Back to home
										</Button> */}
									</div>);
								case 'noInternet':
									return (<div class="nodatacontent">
										<img src={require('../../Assets/images/slow-or-no-internet-connection.png')} />
										<h3 class="my-4">Whoops!</h3>
										<p>Slow or no internet connection.<br /> Please check your internet settings.</p>
										{/* <Button
											type="primary"
										//onClick={this.showModal}
										>
											Back to home
										</Button> */}
									</div>);
								default:
									return (<div class="nodatacontent">
										<img src={require('../../Assets/images/Oops-something-went-wrong.png')} />
										<h3 class="my-4">Oops, something went wrong</h3>
										<p>This page is currently not available. We are working on the problem and appreciate your patience.</p>
										{/* <Button
											type="primary"
										//onClick={this.showModal}
										>
											Back to home
										</Button> */}
									</div>);
							}
						})()}
					</div>
				</div>
			</React.Fragment>
		);
	}
}

export { ErrorMessages };
