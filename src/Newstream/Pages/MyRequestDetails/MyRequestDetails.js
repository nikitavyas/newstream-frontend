/* eslint-disable array-callback-return */
import { EnvironmentOutlined } from '@ant-design/icons';
import {
	Avatar,
	Button,
	Card,
	Col,
	Modal,
	Row,
	Typography,
	message,
} from 'antd';
import moment from 'moment';
import React, { Component } from 'react';
import { withApollo } from 'react-apollo';
import { Link } from 'react-router-dom';
import { COULDBASEURL } from '../../Components/general/constant';
import { fullName } from '../../Components/general/general';
import { getStoryMediaCount } from '../../Components/general/getStoryMediaCount';
import { Loader } from '../../Components/Loader/Loader';
import { CustIcon } from '../../Components/Svgs';
import { ARCHIVE_REQUEST, GET_REQUEST_BY_ID } from '../../graphql/APIs';
import { analytics } from '../../utils/init-fcm';
import './MyRequestDetails.css';
import {
	addBreadcrumb as SentryLog,
	captureException as SentryError,
	Severity,
} from '@sentry/react';
const { Title } = Typography;

class MyRequestDetails extends Component {
	constructor(props) {
		super(props);
		analytics.setCurrentScreen('Request Details');
		this.state = {
			stories: { loaded: false, media: { image: [] } },
		};
		this.moveToArchive = this.moveToArchive.bind(this);
	}
	componentWillMount() {
		SentryLog({
			category: 'Request Details',
			message: 'Request Details Page Loaded',
			level: Severity.Info,
		});
		this.getData();
	}
	getData() {
		try {
			const { client } = this.props;
			client
				.query({
					query: GET_REQUEST_BY_ID,
					fetchPolicy: 'network-only',
					variables: {
						requestId: this.props.match.params.id,
					},
				})
				.then(({ data, loading }) => {
					this.loading = loading;
					if (data !== undefined) {
						data.getRequest.stories.map((data) => {
							data.storyMediaCount = getStoryMediaCount(data.storyMedia);
							data.imageData = data.storyMedia.filter((data1) => {
								let text = data1.type;
								text = text.toLowerCase();
								return text === 'image';
							});
							data.videoData = data.storyMedia.filter((data2) => {
								let text = data2.type;
								text = text.toLowerCase();
								return text === 'video';
							});
							data.audioData = data.storyMedia.filter((data3) => {
								let text = data3.type;
								text = text.toLowerCase();
								return text === 'audio';
							});
						});
						this.setState({ loaded: true, stories: data.getRequest });
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
	moveToArchive() {
		try {
			analytics.logEvent('storyArchive', {
				action: 'Click',
				label: 'Archived',
				value: 'Request Archived',
			});
			const { client } = this.props;
			let props = this.props;
			Modal.confirm({
				title: 'Are you sure you want to move it to archive',
				//'  icon: ,
				onOk() {
					client
						.mutate({
							variables: { requestId: props.match.params.id },
							mutation: ARCHIVE_REQUEST,
						})
						.then((result) => {
							if (result.data.moveToArchiveRequest.status) {
								Modal.success({
									className: 'notificationModal',
									width: 500,
									icon: (
										<div className="popDeleteicon">
											<img
												alt=""
												src={require('../../Assets/images/thumb-icon.svg')}
											/>
										</div>
									),
									content: result.data.moveToArchiveRequest.message,
									onOk() {
										props.history.push('/myRequest/archived');
									},
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
				},
			});
		} catch (error) {
			SentryError(error);
		}
	}
	render() {
		return (
			<React.Fragment>
				{this.state.loaded ? (
					<div className="container">
						<Row>
							<Col span={24}>
								<Title level={4} strong="false" className="pageTitle mt-4">
									{this.state.stories.isArchive === true
										? 'Archived Request'
										: 'Proposals'}
								</Title>
							</Col>
						</Row>
						<Row>
							<Col span={24}>
								<Card className="mb-4 proposalBox_blk">
									<div className="d-flex flex-md-row flex-column align-items-md-center justify-content-md-between mb-3">
										<div className="rbTitle">
											<h3 className="mb-0 text-break">
												{this.state.stories.title}
											</h3>
										</div>
										{this.state.stories.isArchive === false ? (
											<div className="d-flex flex-row align-items-center">
												<Button
													className="ml-md-2 mt-md-0 mt-2"
													shape="round"
													onClick={this.moveToArchive}>
													Archive Request
												</Button>
											</div>
										) : null}
									</div>

									<div className="row align-items-end justify-content-lg-between">
										<div className="col-lg-4 col-md-6 d-flex flex-column mb-md-0 mb-2">
											<div className="d-flex flex-column ">
												<div className="d-flex flex-row align-items-start mb-2 locTxt">
													<EnvironmentOutlined className="mr-2 mt-1" />
													<span className="text-break">
														{this.state.stories.location}
													</span>
												</div>
												<div className="d-flex flex-row align-items-center dateTxt">
													<img
														alt=""
														className="mr-2"
														src={require('../../Assets/images/cal-icon.png')}
													/>
													<span>
														{moment(
															new Date(
																parseFloat(this.state.stories.createdDate)
															)
														)
															.local()
															.format('MM/DD/YYYY')}
													</span>
												</div>
											</div>
										</div>
										<div className="col-lg-4 col-md-6 d-flex flex-row align-items-start">
											{this.state.stories.isOpen ? (
												<div className="d-flex align-items-center lbl-open">
													<img
														alt=""
														src={require('../../Assets/images/open-icon.png')}
													/>
													<span>Open</span>
												</div>
											) : (
												<div className="d-flex align-items-center lbl-assigned ">
													<img
														alt=""
														src={require('../../Assets/images/assign-icon.png')}
													/>
													<span>Assigned</span>
												</div>
											)}
										</div>
										<div className="col-lg-4 col-12 pt-lg-0 pt-2 d-flex flex-row align-items-center justify-content-lg-end">
											<div className="d-flex flex-row align-items-center mr-4">
												<span className="text-nowrap primary-text-color priceAmt">
													Price : <strong>${this.state.stories.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</strong>
												</span>
											</div>
											<div className="d-flex flex-row align-items-center praposalTxt">
												<span className="primary-text-color mr-2">
													{this.state.stories.stories &&
														this.state.stories.stories.length}
												</span>
												<span>Proposals</span>
											</div>
										</div>
									</div>
								</Card>
							</Col>
						</Row>
						{this.state.stories.stories &&
						this.state.stories.stories.length > 0 ? (
							<Row>
								<Col span={24}>
									<Title level={4} strong="false" className="pageTitle mt-4">
										Stories submitted by reporters
									</Title>
								</Col>
							</Row>
						) : null}
						<Row gutter={16}>
							{this.state.stories.stories &&
								this.state.stories.stories.map((data, index) => {
									return (
										<Col xs={24} sm={24} md={12} lg={12} xl={12} key={index}>
											<Card
												className={`storiesCard_blk mb-3 ${
													data.createdBy.isApplicant && 'applicantStory'
												}`}>
												<div className="storiesCardTop d-flex flex-xl-row flex-column align-items-xl-start justify-content-xl-between mb-3">
													<div className="user_blk d-flex flex-row align-items-start mb-xl-0 mb-2">
														<Link
															to={`/companyProfile/${data.createdBy.userId}`}></Link>
														<div className="uicAvatar d-flex align-items-center justify-content-center">
															{data.createdBy.profileImage ? (
																<Avatar
																	size={46}
																	src={
																		COULDBASEURL + data.createdBy.profileImage
																	}
																/>
															) : (
																<div className="profile_img_intial d-flex align-items-center justify-content-center">
																	<span>{fullName(data.createdBy.name)}</span>
																</div>
															)}
														</div>
														<div className="d-flex flex-column pl-3">
															<div className="userTop">
																{data.createdBy.name}
															</div>
															<div className="userBottom lightGray-text-color d-flex flex-row align-items-center">
																<span>{data.location} </span>
															</div>
														</div>
													</div>
													<div className="d-flex flex-column align-items-xl-end">
														<div className="viewCounter d-flex flex-row align-items-center">
															{data.storyMediaCount.audio > 0 && (
																<div className="d-flex flex-row align-items-center pl-xl-3 pr-xl-0 pr-3">
																	<span>{data.storyMediaCount.audio}</span>
																	<CustIcon type="voice" className="ml-1" />
																</div>
															)}
															{data.storyMediaCount.video > 0 && (
																<div className="d-flex flex-row align-items-center pl-xl-3 pr-xl-0 pr-3">
																	<span>{data.storyMediaCount.video}</span>
																	<CustIcon type="video" className="ml-1" />
																</div>
															)}
															{data.storyMediaCount.image > 0 && (
																<div className="d-flex flex-row align-items-center pl-xl-3 pr-xl-0 pr-3">
																	<span>{data.storyMediaCount.image}</span>
																	<CustIcon type="image" className="ml-1" />
																</div>
															)}
														</div>
														<div className="d-flex mt-xl-1 mt-2 align-items-center">
															{data.isPurchased ? (
																<div className=" mr-2 d-flex flex-row align-items-center  lbl-purchased">
																	<img
																		alt=""
																		src={require('../../Assets/images/purchased-icon.svg')}
																	/>
																	<span> Purchased</span>
																</div>
															) : null}
															<div className="lightGray-text-color">
																{moment(new Date(parseFloat(data.createdDate)))
																	.local()
																	.fromNow()}
															</div>
														</div>
													</div>
												</div>
												{this.state.stories.isLive ? (
													<Link to={`/live-stream-details/${data.storyId}`}>
														<div className="storiesCardBottom d-flex flex-column">
															<div className="storiesCardMedia">
																<img
																	alt=""
																	src={
																		data?.storyLiveStream?.thumbnail
																			? COULDBASEURL +
																			  data.storyLiveStream?.thumbnail
																			: require('../../Assets/images/ic_no_image.png')
																	}
																/>
															</div>
														</div>
													</Link>
												) : (
													<Link to={`/myRequest/${this.state.activeKey}/storyDetails/${data.storyId}`}>
														<div className="storiesCardBottom d-flex flex-column">
															<div className="storiesCardMedia">
																{data.storyMediaCount.image > 0 ? (
																	<img
																		alt=""
																		src={
																			COULDBASEURL + data.imageData[0].mediaName
																		}
																	/>
																) : data.storyMediaCount.audio > 0 ? (
																	<img
																		alt=""
																		src={require('../../Assets/images/audio-waves.png')}
																	/>
																) : data.storyMediaCount.video > 0 ? (
																	// <VideoThumbnail  alt=""
																	//                       className="brdrd"
																	// videoUrl={COULDBASEURL +data.storyMedia[0].mediaName}
																	// thumbnailHandler={(thumbnail) => console.log(thumbnail)}
																	// width={100} height={100}
																	// />
																	<div className="storiesCardvideo">
																		{/* <video style={{ 'width': '100%', 'height': 'auto' }} controls>
                              <source src={this.state.playVideoURL} type="video/mp4" />
                              Your browser does not support the video tag. </video> */}
																	</div>
																) : null}
															</div>
														</div>
													</Link>
												)}
											</Card>
										</Col>
									);
								})}
						</Row>
						<Row>
							<Col
								span={24}
								className="d-flex flex-row justify-content-end pt-3">
								{/* <Pagination defaultCurrent={1} total={50} /> */}
							</Col>
						</Row>
					</div>
				) : (
					<Loader />
				)}
			</React.Fragment>
		);
	}
}
MyRequestDetails = withApollo(MyRequestDetails);
export { MyRequestDetails };
