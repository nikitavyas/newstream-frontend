import React, { Component } from 'react';
import './Information.css';
import { Row, Col, Typography, Card, message } from 'antd';
import { GET_PAGE } from '../../graphql/APIs';
import { withApollo } from 'react-apollo';
import { analytics } from '../../utils/init-fcm';
import {
	addBreadcrumb as SentryLog,
	captureException as SentryError,
	Severity,
} from '@sentry/react';
const { Title } = Typography;

class Information extends Component {
	constructor(props) {
		super(props);
		analytics.setCurrentScreen('Terms');
		this.state = {
			title: '',
			description: null,
		};
	}
	componentDidMount() {
		this.getData();
	}
	getData() {
		const { client } = this.props;
		// console.log(this.props.match.params.slug);
		client
			.query({
				query: GET_PAGE,
				variables: { slug: this.props.match.params.slug },
				fetchPolicy: 'network-only',
			})
			.then(({ data, loading }) => {
				SentryLog({
					category: 'CMS Pages',
					message: `CMS pages API retrieved`,
					level: Severity.Info,
				});
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
						<Col lg={24} xs={24}>
							<Card className="rightSideSetting myTerms_blk">
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
Information = withApollo(Information);

export { Information };
