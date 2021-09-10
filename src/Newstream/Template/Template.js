import React, { Component } from 'react';
import { Switch, Redirect, Route } from 'react-router-dom';
import './Template.css';
import { Layout } from 'antd';
import { AppPolicy } from '../Components/PrivacyPolicy'
import { AppHeader } from '../Components/HeaderPage';
import { AppFooter } from '../Components/FooterPage';
import { AppSider } from '../Components/Sider';
import { ReporterSider } from '../Components/ReporterSider';
import { ApplicantReporterSider } from '../Components/ApplicantReporterSider';
import { Marketplace } from '../Pages/Marketplace/Marketplace';
import { PrivateRoutes } from '../Components/general/privateRoute';
import { messaging } from '../utils/init-fcm';
import { FCM_TOPIC_REGSITER } from '../graphql/APIs';
import { withApollo } from 'react-apollo';
import { Loader } from '../Components/Loader/Loader';
import { AddRequest } from '../Pages/AddRequest';
import { MyRequest } from '../Pages/MyRequest/MyRequest';
import { StoryDetails } from '../Pages/StoryDetails';
import { Transactions } from '../Pages/Transactions';
import { Notifications } from '../Pages/Notifications';
import { TransactionDetails } from '../Pages/TransactionDetails';
import { Policy } from '../Pages/Policy';
import { Reporters } from '../Pages/Reporters';
import { ReportersProfile } from '../Pages/ReportersProfile';
import { WhatsNewPage } from '../Pages/WhatsNew/WhatsNew';
import {
	LiveStreamStoryPage,
	ViewLiveStoryDetails,
} from '../Pages/LiveStreamStory';
import { Settings } from '../Pages/Settings/Settings';
import { ApplicantReporters } from '../Pages/ApplicantReporters';
import { InvitedReporters } from '../Pages/InvitedReporters';
import { Proposals } from '../Pages/Proposals/Proposals';
import { ReporterMarketplace } from '../Pages/ReporterMarketplace';
import { ReporterRequest } from '../Pages/ReporterRequest';
import { AddStory } from '../Pages/AddStory';
import { ReporterStoryDetails } from '../Pages/ReporterStoryDetails/ReporterStoryDetails';
import {
	TransactionDetailPage,
	TransactionListPage,
} from '../Pages/ReporterTransactions';
import { ViewRequest } from '../Pages/StoryRequest/ViewRequest'
import { Story } from '../Pages/StoryRequest/story'
import { NotFound } from '../Pages/NotFound/NotFound';
import { Modal, Button, Space } from 'antd';
import { from } from 'apollo-link';
import { ErrorMessages } from '../Pages/ErrorMessages';
import { CompanyProfile } from '../Pages/CompanyProfile';

const { Header, Content } = Layout;
class Template extends Component {
	state = {
		hamburgerClass: false,
	};

	async componentDidMount() {
		if (localStorage.getItem('access_token') && localStorage.getItem('access_token') != 'null') {
			// console.log('Notification permission '+Notification.permission)
			let thisData = this;
			if (messaging !== null && localStorage.getItem('isLoggedIn') == 'true') {
				if (Notification.permission == 'default' || Notification.permission == 'denied') {
					Modal.confirm({
						title: 'Enable notifications to get all important updates',
						//icon: <ExclamationCircleOutlined />,
						content: localStorage.getItem('role') === 'journalist' ? <ul>
							<li>Get updates from content creators when they submit stories</li>
							<li>Receive updates when content creators accept your requests</li>
						</ul> : <ul>
							<li>Get notifications when content creators assigns you new jobs</li>
							<li>Receive updates when content creators buys your stories</li>
							<li>Receive notifications when your stories get paid</li>
						</ul>,
						okText: 'Allow',
						cancelText: 'No Thanks',
						onOk() {
							thisData.askPermission();
						},
					});

				}
			}
			localStorage.setItem('isLoggedIn', false);
			if (this.props.isGeolocationEnabled) {
				localStorage.setItem(
					'lat',
					this.props.coords ? this.props.coords.latitude : 47.4808722
				);
				localStorage.setItem(
					'lng',
					this.props.coords ? this.props.coords.longitude : 18.8501225
				);
			} else {
				localStorage.setItem('lat', 47.4808722);
				localStorage.setItem('lng', 18.8501225);
			}
		}
	}
	askPermission = async () => {
		await messaging.requestPermission();
		const token = await messaging.getToken();
		await this.subscribeTokenToTopic(token);

	}
	componentWillMount() {
		//	this.checkInternet();
		if (this.props.isGeolocationEnabled) {
			localStorage.setItem(
				'lat',
				this.props.coords ? this.props.coords.latitude : 47.4808722
			);
			localStorage.setItem(
				'lng',
				this.props.coords ? this.props.coords.longitude : 18.8501225
			);
		} else {
			localStorage.setItem('lat', 47.4808722);
			localStorage.setItem('lng', 18.8501225);
		}
	}

	subscribeTokenToTopic = async (token) => {
		try {
			await this.props.client.mutate({
				mutation: FCM_TOPIC_REGSITER,
				variables: {
					token,
				},
			});
		} catch (err) { }
	};

	loading = () => (
		<div className="animated fadeIn pt-3 text-center">
			<Loader />
		</div>
	);
	// toggle class
	toggleClassFunction = () => {
		this.setState({ hamburgerClass: !this.state.hamburgerClass });
		// console.log('test', this.state.hamburgerClass);
	};
	// toggle class
	render() {
		if (this.props.isGeolocationEnabled === true) {
			localStorage.setItem('locationShared', true);
		} else {
			localStorage.setItem('locationShared', false);
		}
		if (localStorage.getItem('locationShared') === true) {
			localStorage.setItem(
				'lat',
				this.props.coords ? this.props.coords.latitude : 47.4808722
			);
			localStorage.setItem(
				'lng',
				this.props.coords ? this.props.coords.longitude : 18.8501225
			);
		} else {
			localStorage.setItem(
				'lat',
				localStorage.getItem('userLat') !== null
					? localStorage.getItem('userLat')
					: 47.4808722
			);
			localStorage.setItem(
				'lng',
				localStorage.getItem('userLng') !== null
					? localStorage.getItem('userLng')
					: 18.8501225
			);
		}
		return (
			<Layout>
				<Header className="customheader">
					<div
						onClick={this.toggleClassFunction}
						className={`${this.state.hamburgerClass ? 'showOverlay' : ''
							} menuOverlay`}></div>
					{localStorage.getItem('access_token') && localStorage.getItem('access_token') != 'null' &&
						<AppHeader toggleClassFunction={this.toggleClassFunction} />
					}
				</Header>
				<Layout className={`${this.state.hamburgerClass ? 'openNav' : ''}`}>
					{localStorage.getItem('access_token') && localStorage.getItem('access_token') != 'null' && (
						localStorage.getItem('role') === 'journalist' ? (
							<AppSider toggleClassFunction={this.toggleClassFunction} />
						) : localStorage.getItem('isApplicant') === 'true' ? (
							<ApplicantReporterSider toggleClassFunction={this.toggleClassFunction}   {...this.props} />
						) : <ReporterSider toggleClassFunction={this.toggleClassFunction}   {...this.props} />)}
					<Layout className="pageContainer">
						<Content className="wrapper">
							{localStorage.getItem('role') === 'journalist' ? (
								<Switch>
									<PrivateRoutes
										path="/myRequest/:tabId/editRequest/:id"
										component={AddRequest}
									/>
									<PrivateRoutes path="/AddNewRequest/:storyId" component={AddRequest} />
									<PrivateRoutes path="/AddNewRequest" component={AddRequest} />
									<PrivateRoutes
										path="/myRequest/:tabId/proposals/:id"
										name="My Proposals"
										component={Proposals}
									/>
									<PrivateRoutes
										path="/myRequest/:tabId/storyDetails/:id"
										name="Story Details"
										component={StoryDetails}
									/>
									<PrivateRoutes
										path="/myRequest/:tabId"
										component={MyRequest}
									/>
									<PrivateRoutes
										path="/marketplace/:type/storyDetails/:id"
										name=""
										component={StoryDetails}
									/>
									<PrivateRoutes
										path="/marketplace/:type"
										page="marketplace"
										component={Marketplace}
									/>
									<PrivateRoutes
										path="/transactions"
										name=""
										component={Transactions}
									/>
									<PrivateRoutes
										path="/notifications"
										name=""
										component={Notifications}
									/>
									<PrivateRoutes
										path="/marketplace/:type/storyDetails/:id"
										name=""
										component={StoryDetails}
									/>
									<PrivateRoutes
										path="/storyDetails/:id"
										name=""
										component={StoryDetails}
									/>
									<PrivateRoutes
										path="/transationDetails"
										name=""
										component={TransactionDetails}
									/>

									<PrivateRoutes path="/policy" name="" component={Policy} />
									{/* <PrivateRoutes
										path="/reporters/applicants/:id"
										name=""
										component={ReportersProfile}
									/>
									<PrivateRoutes
										path="/reporters/active/:id"
										name=""
										component={ReportersProfile}
									/>
									<PrivateRoutes
										path="/reporters/active"
										name="Reporters"
										component={Reporters}
									/>
									<PrivateRoutes
										path="/reporters/invited"
										name="Invited Reporters"
										component={InvitedReporters}
									/>
									<PrivateRoutes
										path="/reporters/applicants"
										name="Applicants"
										component={ApplicantReporters}
									/> */}
									<PrivateRoutes
										path="/reportersProfile/:id"
										name=""
										component={ReportersProfile}
									/>
									<PrivateRoutes
										path="/whatsNew"
										name=""
										component={WhatsNewPage}
									/>
									<PrivateRoutes
										path="/live-stream"
										name=""
										component={LiveStreamStoryPage}
									/>
									<PrivateRoutes
										path="/live-stream-details/:id"
										name=""
										component={ViewLiveStoryDetails}
									/>
									<PrivateRoutes
										path="/settings/:tabId"
										name=""
										component={Settings}
									/>
									<PrivateRoutes
										path="/cms/:slug"
										name=''
										component={AppPolicy}
									/>
									<PrivateRoutes
										path="/companyProfile/:id"
										name=''
										component={CompanyProfile}
									/>
									<PrivateRoutes path="/errorMessages/:type" component={ErrorMessages} />
									<Redirect from="/" to="/marketplace/proposal" />
									<Route component={NotFound} />
								</Switch>
							) : (
								<Switch>
									{' '}
									<PrivateRoutes
										path="/whatsNew"
										name=""
										component={WhatsNewPage}
									/>
									<PrivateRoutes
										path="/settings/:tabId"
										name=""
										component={Settings}
									/>
									<PrivateRoutes
										path="/marketplace/:type/storyDetails/:id"
										name=""
										component={ReporterStoryDetails}
									/>
									<PrivateRoutes
										path="/marketplace/:type"
										page="marketplace"
										component={ReporterMarketplace}
									/>
									<PrivateRoutes
										path="/requests/:tabId/:requestId/story"
										name="Requests"
										component={Story}
									/>
									<PrivateRoutes
										path="/requests/:tabId/storyDetails/:id"
										name="Requests"
										component={ReporterStoryDetails}
									/>
									<PrivateRoutes
										path="/requests/:tabId/:requestId"
										name="Requests"
										component={ViewRequest}
									/>
									<PrivateRoutes
										path="/requests/:tabId"
										component={ReporterRequest}
										matchProps={{ type: 'request' }}
									/>
									<PrivateRoutes
										path="/transactions/:transactionId"
										name="Transaction"
										component={TransactionDetailPage}
									/>
									<PrivateRoutes
										path="/transactions"
										name="Transactions"
										component={TransactionListPage}
									/>
									<PrivateRoutes path="/addNewStory" component={AddStory} />
									<PrivateRoutes
										path="/companyProfile/:id"
										name=''
										component={CompanyProfile}
									/>
									<PrivateRoutes
										path="/cms/:slug"
										name=''
										component={AppPolicy}
									/>
									<PrivateRoutes path="/errorMessages/:type" component={ErrorMessages} />
									<Redirect from="/" to="/marketplace/proposal" />
									<Route component={NotFound} />
									<PrivateRoutes
										path="/cms/:slug"
										name=''
										component={AppPolicy}
									/>
								</Switch>
							)}
						</Content>
					</Layout>
				</Layout>
				{localStorage.getItem('access_token') && localStorage.getItem('access_token') != 'null' && (<AppFooter />)}
			</Layout>
		);
	}
}
Template = withApollo(Template);

export { Template };
