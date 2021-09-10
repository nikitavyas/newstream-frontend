import React, { Component } from 'react';
import './Policy.css';
import { Row, Col, Typography, Card } from 'antd';
import { ProfileSideMenu } from '../../Components/ProfileSideMenu';
import { GET_APP_CONFIG } from '../../graphql/APIs';
import { withApollo } from 'react-apollo';
import { analytics } from '../../utils/init-fcm';

const { Title } = Typography;

class Policy extends Component {
	constructor(props) {
		super(props);
		analytics.setCurrentScreen('Policy');
		this.state = {
			title: 'dfgfgdgfgf',
			description: 'dffgfgfgfg',
		};
	}
	componentDidMount() {
		//this.getData();
	}
	getData() {
		const { client } = this.props;
		client
			.query({
				query: GET_APP_CONFIG,
				//  fetchPolicy: "cache-and-network",
			})
			.then(({ data, loading }) => {
				this.loading = loading;
				if (data !== undefined) {
					this.setState({
						title: data.getAppConfig.webPages.privacyPolicy.title,
						description: data.getAppConfig.webPages.privacyPolicy.description,
					});
				}
			});
	}
	render() {
		return (
			<React.Fragment>
				<div className="container pt-3">
					<div className="d-flex flex-row align-items-center justify-content-between my-2">
						<Title level={4} strong="false" className="pageTitle m-0">
							Privacy Policy
						</Title>
					</div>
					<Row gutter={30} className="pt-2">
						<Col lg={24} xs={24}>
							<Card className="rightSideSetting myPolicy_blk">
								<Title level={4}>{this.state.title}</Title>
								<Title>Aenean convallis vulputate viverra. Proin ut auctor felis</Title>
								{<Title>{this.state.description}
             </Title> }
								{/* <p dangerouslySetInnerHTML={{ __html: this.state.title }}></p>
								<p
									dangerouslySetInnerHTML={{
										__html: this.state.description,
									}}></p> */}
							</Card>
						</Col>
					</Row>
				</div>
			</React.Fragment>
		);
	}
}

Policy = withApollo(Policy);
export { Policy };
