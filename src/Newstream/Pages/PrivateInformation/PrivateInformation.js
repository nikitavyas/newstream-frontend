import React, { Component } from 'react';
import './PrivateInformation.css';
import { Row, Col, Typography, Card, message } from 'antd';
import { ProfileSideMenu } from '../../Components/ProfileSideMenu';
import { GET_PAGE } from '../../graphql/APIs';
import { withApollo } from 'react-apollo';
import { analytics } from '../../utils/init-fcm';
import {
	addBreadcrumb as SentryLog,
	captureException as SentryError,
	Severity,
} from '@sentry/react';

const { Title } = Typography;

class PrivateInformation extends Component {
	constructor(props) {
		super(props);
		analytics.setCurrentScreen('Terms');
		this.state = {
			title: '',
			description: null,
		};
	}
	componentDidMount() {
		SentryLog({
			category: 'Notification Settings',
			message: 'Notification Settings Page Loaded',
			level: Severity.Info,
		});
		this.getData();
	}
	getData() {
		try {
			const { client } = this.props;
			client
				.query({
					query: GET_PAGE,
					variables: { slug: this.props.match.params.slug },
					fetchPolicy: 'network-only',
				})
				.then(({ data, loading }) => {
					this.loading = loading;
					if (data !== undefined) {
						this.setState({
							title: data.getPage.title,
							description: data.getPage.description,
						});
					}
				})
				.catch((error, result) => {
					if (error.graphQLErrors && error.graphQLErrors.length > 0) {
						message.destroy();
					} else {
						SentryError(error);
						message.destroy();
						message.error('Something went wrong please try again later');
					}
				});
		} catch (error) {
			SentryError(error);
		}
	}
	render() {
		return (
			<React.Fragment>
				<div className="container pt-3">
					<div className="d-flex flex-row align-items-center justify-content-between my-2">
						<Title level={4} strong="false" className="pageTitle m-0">
							{' '}
							<p dangerouslySetInnerHTML={{ __html: this.state.title }}></p>
						</Title>
					</div>
					<Row gutter={30} className="pt-2">
						<Col lg={6} className="d-none d-lg-block">
							<ProfileSideMenu page="terms" />
						</Col>
						<Col lg={18} xs={24}>
							<Card className="rightSideSetting myTerms_blk">
								<p dangerouslySetInnerHTML={{ __html: this.state.title }}></p>
								<p
									dangerouslySetInnerHTML={{
										__html: this.state.description,
									}}></p>
							</Card>
						</Col>
					</Row>
				</div>
			</React.Fragment>
		);
	}
}
PrivateInformation = withApollo(PrivateInformation);
export { PrivateInformation };
