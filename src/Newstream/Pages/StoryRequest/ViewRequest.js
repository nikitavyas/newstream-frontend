import { withApollo } from 'react-apollo';
import React, { Component } from 'react';
import './Request.css';
import { Row, Col, Button, Card, Tag, message } from 'antd';
import moment from 'moment';
import { ACCEPT_REQUEST } from '../../graphql/mutation';
import mapboxgl from 'mapbox-gl';
import config from '../../../../src/appConfig';
import MapMarker from '../../Components/map/MapMarker';
import { GET_REQUEST_BY_ID } from '../../graphql/query';
import { CustIcon } from '../../Components/Svgs';
import { Loader } from '../../Components/Loader';
import { EnvironmentFilled, ClockCircleFilled } from '@ant-design/icons';
import { OnboardingTour } from '../../Components/OnboardingTour';
import { ContactButton } from '../../Components/Buttons';
import { ProfileAvatar } from '../../Components/Avatar';
import { Helmet } from 'react-helmet';
import { getAddress } from '../../Components/general/general';

import {
	addBreadcrumb as SentryLog,
	Severity,
	captureException as SentryError,
} from '@sentry/react';
import { Link } from 'react-router-dom';

mapboxgl.accessToken = config.mapbox_key;

class ViewRequest extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			request: {},
			lat: 0,
			lng: 0,
			totalDistance: null,
			isSubmitting: false,
		};
		this.acceptRequest = this.acceptRequest.bind(this);
	}

	async componentDidMount() {
		const {
			match: {
				params: { requestId },
			},
		} = this.props;
		SentryLog({
			category: 'page',
			message: `Request Detail Page Loaded for request ${requestId}`,
			level: Severity.Debug,
		});
		await this.getRequestDetails(requestId);
	}

	getRequestDetails = async (requestId) => {
		SentryLog({
			category: 'data-fetch',
			message: `Fetch Request Details Started`,
			level: Severity.Debug,
		});
		try {
			this.setState({ loading: true });
			const { client } = this.props;
			const {
				data: { getRequest },
			} = await client.query({
				query: GET_REQUEST_BY_ID,
				variables: {
					requestId,
				},
				fetchPolicy: 'no-cache',
			});
			SentryLog({
				category: 'data-fetch',
				message: `Request Details Fetch Successful`,
				level: Severity.Debug,
			});
			this.setState({ request: getRequest });
			this.setState({ loading: false });
			localStorage.setItem('request', JSON.stringify(getRequest));
		} catch (error) {
			SentryError(error);
			message.error('Failed to get request details');
			this.setState({ loading: false });
		}
	};

	acceptRequest = () => {
		if (this.state.request.isAccepted) {
			SentryLog({
				category: 'page',
				message: `Transfer to submit story page for Request Id : ${this.state.request.requestId}`,
				level: Severity.Debug,
			});
			localStorage.setItem('request', JSON.stringify(this.state.request));
			this.props.history.push(this.props.location.pathname+'/story');
		} else {
			SentryLog({
				category: 'data-mutate',
				message: `Accept Request Started for Request Id : ${this.state.request.requestId}`,
				level: Severity.Debug,
			});
			this.setState({ isSubmitting: true });
			const { client } = this.props;
			let values = {
				requestId: this.state.request.requestId,
			};
			client
				.mutate({
					variables: values,
					mutation: ACCEPT_REQUEST,
				})
				.then(async (result) => {
					await this.getRequestDetails(this.props.match.params.requestId);
					SentryLog({
						category: 'data-mutate',
						message: `Request accepted successfully`,
						level: Severity.Debug,
					});
					message.success(result.data.acceptRequest.message);
					this.setState({ isSubmitting: false });
					SentryLog({
						category: 'page',
						message: `Transfer to submit story page`,
						level: Severity.Debug,
					});
					localStorage.setItem('request', JSON.stringify(this.state.request));
					this.props.history.push(this.state.request.requestId+'/story');
				})
				.catch((error) => {
					// console.log(error)
					SentryError(error);
					if (error.graphQLErrors && error.graphQLErrors.length > 0) {
						message.destroy();
					} else {
						message.destroy();
						message.error('Something went wrong please try again later');
					}
				});
		}
	};f

	render() {
		const { request, loading } = this.state;
		return (
			<React.Fragment>
				<Helmet>
					{request.isAccepted ? (
						<title>Content Creators | Submit Request </title>
					) : (
						<title>Content Creators | Accept Request </title>
					)}
				</Helmet>
				{loading ? (
					<Loader />
				) : (
					<div className="request-container">
						<OnboardingTour tourName={['storyDetail']} />
						<div className="globaltitle mb-3">
							<h3 className="mb-lg-0">Posted by</h3>
						</div>
						<Card className="requestBox_blk boxshadow mb-3">
							<Row gutter={20}>
								<Col lg={6} md={12} sm={24} xs={24}>
									{request.createdBy && (
										<Link  to={"/companyProfile/"+request.publisherId}><div className="user_blk d-flex flex-row mb-lg-0 mb-2">
											<ProfileAvatar
												size={60}
												name={request.createdBy.publisher.title}
												imageUrl={request.createdBy.profileImage}
											/>
											<div className="d-flex flex-column justify-content-center pl-3">
												<h5 className="mb-0 userTop text-break font-weight-bold">
													{request.createdBy.publisher.title}
												</h5>
												<span>
													{moment(new Date()).to(
														moment(new Date(parseFloat(request.createdDate)))
													)}
												</span>
											</div>
										</div></Link>
									)}
								</Col>
								<Col lg={6} md={12} sm={12} xs={24}>
									<div className="d-flex flex-column mb-lg-0 mb-2">
										<div className="label_blk mb-1">Location</div>
										<div className="d-flex flex-row align-items-center dateTxt">
											<span className="font14">
												<EnvironmentFilled className="mr-2" />
												{request.createdBy.address
													? getAddress(request.createdBy.address)
													: 'No Location Detected'}
											</span>
										</div>
									</div>
								</Col>
								{request.createdBy.phoneNumber && (
								<Col lg={6} md={12} sm={12} xs={24}>
										<div className="d-flex flex-column mb-lg-0 mb-2">
											<div className="label_blk mb-1">Contact </div>
											<div className="d-flex flex-row align-items-center dateTxt">
												<span>
													<CustIcon type="callicon" className="mr-2" />
													<a href={"tel:"+request.createdBy.phoneNumber}>{request.createdBy.phoneNumber}</a>
												</span>
											</div>
										</div>
								</Col>
								)}
								{request.createdBy.phoneNumber && (
								<Col lg={6} md={12} sm={24} xs={24} className="text-lg-right">
									<ContactButton
										name={request.createdBy.name.split(' ')[0]}
										phoneNumber={request.createdBy.phoneNumber}
										slackUserId={request.createdBy.slackUserId}
									/>
								</Col>
								)}
							</Row>
						</Card>
						<div className="globaltitle mb-3">
							<h3 className="mb-lg-0">Request Details</h3>
						</div>
						<Card className="detailsBox_blk boxshadow mb-3">
							{request.isOpen ? (
								<div className="badge badge_open mb-3">Open</div>
							) : (
								<div className="badge badge_assign mb-3">Assigned</div>
							)}
							<div className="priceAmt">$ {request.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>
							<div className="font18 font-weight-bold mb-2">
								{request.title || 'N/A'}
							</div>
							<div className="locationtxt mb-1">
								<EnvironmentFilled className="mr-2" />
								{request.location}
							</div>
							<div className="locationtxt mb-3">
								<ClockCircleFilled className="mr-2" />
								Expires{' '}
								{moment(
									new Date(parseFloat(request.expiryDateTime))
								).fromNow()}
							</div>
							<div className="d-flex flex-column">
								<div className="font16 font-weight-bold mb-2">
									Media Requested
								</div>
								<div className="d-flex flex-row align-items-center mb-1 mediaRequest">
									{request.isAudio && (
										<Tag className="audioTag">
											<CustIcon type="audioicon" className="mr-2" />
											Audio
										</Tag>
									)}
									{request.isVideo && (
										<Tag className="videoTag">
											<CustIcon type="videoicon" className="mr-2" />
											Video
										</Tag>
									)}
									{request.isImage && (
										<Tag className="imageTag">
											<CustIcon type="imageicon" className="mr-2" />
											Image
										</Tag>
									)}
									{request.isArticle && (
										<Tag className="imageTag">
											<CustIcon type="imageicon" className="mr-2" />
											Article
										</Tag>
									)}
									{request.isLive && (
										<Tag className="liveTag">
											<CustIcon type="liveicon" className="mr-2" />
											Live
										</Tag>
									)}
								</div>
							</div>
							{!!request.note && (
								<div>
									<div className="font18 font-weight-bold mb-2">
										Special Notes
									</div>
									<div className="mb-2">{request.note}</div>
								</div>
							)}
							<hr />
							<div className="location-details">
								<div className="tour-storyDetail-map">
									<div className="font18 font-weight-bold mb-2">Location</div>
									<MapMarker
										metadata={request}
										location={request.location}
										lat={request.lat}
										lng={request.lng}
									/>
								</div>

								{request.isSubmitted && (
									<div className="mb-2">
										<span>*</span>
										{this.getMySubmittedStoryDate(request.stories)}
									</div>
								)}
							</div>
							<div className="text-right pt-lg-5 pt-0 mb-2 mb-lg-3">
								<Button
									type="primary"
									className="primary tour-storyDetail-accept"
									onClick={this.acceptRequest}
									size="large"
									loading={this.state.isSubmitting}>
									{this.getSubmitBtn(request)}
								</Button>
							</div>
						</Card>
					</div>
				)}
			</React.Fragment>
		);
	}

	getInitials = (fullName) => {
		const [fname, lname] = fullName.split(' ');
		return `${fname?.charAt(0)} ${lname?.charAt(0)}`;
	};

	getMySubmittedStoryDate = (storyList) => {
		const myUserId = localStorage.getItem('userId');
		var myStories = storyList.filter((singleStory) => {
			return singleStory?.createdBy?.userId === myUserId;
		});
		const sortedStories = myStories.sort((a, b) => {
			return (
				new Date(parseFloat(b.createdDate)) -
				new Date(parseFloat(a.createdDate))
			);
		});
		return (
			'You have already submitted a story on ' +
			moment(new Date(parseFloat(sortedStories[0].createdDate))).format(
				'DD MMMM YYYY'
			) +
			' at ' +
			moment(new Date(parseFloat(sortedStories[0].createdDate))).format(
				'HH:mm a'
			)
		);
	};

	getSubmitBtn = (request) => {
		return request?.isSubmitted
			? 'Submit again'
			: request.isAccepted
			? 'Submit story'
			: 'Accept';
	};
}

ViewRequest = withApollo(ViewRequest);
export { ViewRequest };
