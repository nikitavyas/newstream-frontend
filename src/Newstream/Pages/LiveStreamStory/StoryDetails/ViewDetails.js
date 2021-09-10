import React, { useState, useEffect } from 'react';
import {
	Row,
	Col,
	Typography,
	message,
	Rate,
	Tooltip,
	Progress,
	Avatar,
	Empty,
	Card,
	Form,
	Input,
	Button,
	Modal,
} from 'antd';
import {
	LiveStorySubmitterDetails,
	LiveStoryDetails,
} from '../../../Components/Cards/LiveStory';
import { useParams } from 'react-router-dom';
import { Loader } from '../../../Components/Loader/Loader';
import { useApolloClient } from 'react-apollo';
import {
	GET_LIVE_STORY,
	SAVE_RATINGS,
	REPORT_ABUSE,
} from '../../../graphql/APIs';
import {
	addBreadcrumb as SentryLog,
	captureException as SentryError,
	Severity,
} from '@sentry/react';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { ProfileAvatar } from '../../../Components/Avatar/Avatar';

const desc = ['Terrible', 'Poor', 'Average', 'Very good', 'Excellent'];

const { Title } = Typography;

const ViewLiveStoryDetails = () => {
	const [story, setStory] = useState(undefined);
	const [isLoading, setIsLoading] = useState(true);
	const[showRatingError,setShowRatingError] = useState(false)
	const [isRatingLoaded, setIsRatingLoaded] = useState(true);
	const [filteredRating, setRatings] = useState([]);
	const [ratingValue, setRatingValue] = useState(0);
	const [showAddRatings, setShowAddRatings] = useState(true);
	const client = useApolloClient();
	const { id } = useParams();

	useEffect(() => {
		SentryLog({
			category: 'Liverstream Details',
			level: Severity.Info,
			message: 'Live Stream Story Details Page Loaded',
			type: 'default',
		});
		getStory();
	}, [id]);

	const getStory = () => {
		try {
			setIsLoading(true);
			client
				.query({
					variables: {
						storyId: id,
					},
					query: GET_LIVE_STORY,
					fetchPolicy: 'network-only',
				})
				.then(({ data: { getStory } }) => {
					let filteredRating = getStory.ratings.filter((data) => {
						if (data.createdBy.userId == localStorage.getItem('userId')) {
							setShowAddRatings(false);
						}
						if (data.isHidden == false) {
							return data;
						}
					});
					let stories = filteredRating.forEach((data) => {
						const abusedReports = data.abusedReports;
						const reportedByMe = abusedReports.filter((data) => {
							return data.reportedBy.userId == localStorage.getItem('userId');
						});
						if (reportedByMe.length > 0) {
							data.isAbused = true;
						} else {
							data.isAbused = false;
						}
					});
					setRatings(filteredRating);
					setIsRatingLoaded(true);
					setStory(getStory);
					setIsLoading(false);
				})
				.catch((error) => {
					setIsLoading(false);
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
	};

	const onAbuseReport = (ratingId) => {
		try {
			client
				.mutate({
					variables: { ratingId: ratingId },
					mutation: REPORT_ABUSE,
				})
				.then((result) => {
					Modal.success({
						className: 'notificationModal',
						width: 500,
						icon: (
							<div className="popDeleteicon">
								<img
									alt=""
									src={require('../../../Assets/images/thumb-icon.svg')}
								/>
							</div>
						),
						content: result.data.reportAbuse.message,
						onOk() {
							//thisData.setState({ ratingValue: 0, isLoaded: false });
							getStory();
						},
					});
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
	};
	const onFinishFailed = (values) => {};
	const onFinish = (values) => {
		values.storyId = id;
		values.rating = ratingValue;
		if (values.rating == 0) {
			setShowRatingError(true)
		} else {
			setIsLoading(true);
			setShowRatingError(false)
			try {
				client
					.mutate({
						variables: values,
						mutation: SAVE_RATINGS,
					})
					.then((result) => {
						Modal.success({
							className: 'notificationModal',
							width: 500,
							title: '',
							icon: (
								<div className="popDeleteicon">
									<img
										alt=""
										src={require('../../../Assets/images/thumb-icon.svg')}
									/>
								</div>
							),
							content: result.data.addRating.message,
							onOk() {
								setRatingValue(0);
								setShowAddRatings(false);
								setIsRatingLoaded(false);
								getStory();
								setIsLoading(true);
							},
						});
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
	};

	const handleChange = (value) => {
		setRatingValue(value);
	};
	const avarageRating = () => {
		let avg = 0;
		if (filteredRating.length > 0) {
			avg = filteredRating.reduce((r, c) => r + c.rating, 0);
			avg = avg / filteredRating.length;
		}
		return avg.toFixed(1);
	};
	const convertToPerc = (value) => {
		let avg = 0;
		if (filteredRating.length > 0) {
			let filteredData = filteredRating.filter(
				({ rating }) => Math.round(rating) == value
			);
			avg = filteredData.reduce((r, c) => r + c.rating, 0);
			return (filteredData.length * 100) / filteredRating.length;
		}
		return avg;
	};
	const filteredRatingCount = (percent) => {
		return (percent * filteredRating.length) / 100;
	};
	const onPurchase = () => {
		getStory();
	};
	if (isLoading) {
		return <Loader />;
	}

	return (
		<div className="">
			<Row>
				<Col span={12}>
					<Title level={4} strong="false" className="pageTitle mt-4 text-break">
						Live Stream Details
					</Title>
				</Col>
			</Row>
			<Row gutter={12} className="flex-row-reverse">
				<Col xs={24} xl={6} lg={24}>
					<LiveStorySubmitterDetails
						storyCreatedBy={story?.createdBy}
						storyPrice={story?.price}
						scheduleDate={
							story?.storyLiveStream?.scheduleDate ||
							story?.request?.scheduleDate
						}
					/>
				</Col>
				<Col xs={24} xl={18} lg={24}>
					<LiveStoryDetails
						storyDetails={story}
						onPurchase={(e) => onPurchase()}
					/>
				</Col>
			</Row>
			{story?.isPurchased && (
				<Row className="mt-3">
					<Col xs={24} sm={24} md={24} lg={24} xl={24}>
						<Card className="rating_blk">
							<Row gutter={18}>
								<Col xs={24} sm={24} md={24} lg={12} xl={12}>
									<div className="d-flex flex-column">
										<Title className="pageTitle" level={4} strong="false">
											{' '}
											Average story ratings{' '}
										</Title>
										<Card className="averageStoryRating">
											<Row>
												<Col>
													<div className="d-flex flex-column overAllRating">
														<Avatar shape={'square'}>
															<h2>{avarageRating()}</h2>
															<p>{filteredRating.length} reviews</p>
														</Avatar>

														<div>
															<Rate
																tooltips={desc}
																value={+avarageRating()}
																disabled
																allowClear={false}
																allowHalf={true}
															/>
														</div>
													</div>
												</Col>
												<Col flex="auto">
													{desc.map((data, index) => {
														return (
															<Row className="d-flex pb-1">
																<Col>
																	<div className="status">{data}</div>
																</Col>
																<Col flex="auto">
																	<Progress
																		percent={+convertToPerc(index + 1)}
																		//format={+filteredRatingCount(index + 1)}
																		format={(percent) =>
																			`${filteredRatingCount(percent)}`
																		}
																	/>
																</Col>
															</Row>
														);
													})}
												</Col>
											</Row>
										</Card>
									</div>
								</Col>
								{showAddRatings && (
									<Col
										xs={24}
										sm={24}
										md={24}
										lg={12}
										xl={12}
										className="pt-lg-0 pt-3">
										<div className="d-flex flex-column">
											<div className="d-flex flex-row align-items-center justify-content-between">
												<Title className="pageTitle" level={4} strong="false">
													Add your ratings
												</Title>
												<Rate
													tooltips={desc}
													onChange={handleChange}
													value={ratingValue}
													allowClear={false}
													allowHalf
												/>
												{/* {this.state.ratingValue ? <span className="ant-rate-text">{desc[this.state.ratingValue - 1]}</span> : ''} */}
											</div>
											<Card>
												<Form
													onFinish={onFinish}
													onFinishFailed={onFinishFailed}>
													<Row>
														<Col>
															<div className="mr-3">
																<ProfileAvatar
																	size={40}
																	name={localStorage.getItem('name')}
																	imageUrl={localStorage.getItem(
																		'profileImage'
																	)}
																/>
															</div>
														</Col>
														<Col flex="auto" className="pb-2">
															<Form.Item label="" name="comment">
																<Input.TextArea rows={3} />
															</Form.Item>
															{showRatingError && 
																	<div className="errorLabel">Please add star ratings</div>}
														</Col>
													</Row>
													<div className="d-flex justify-content-end">
														<Button
															type="primary"
															shape="round"
															className="px-4"
															htmlType="submit">
															Submit
														</Button>
													</div>
												</Form>
											</Card>
										</div>
									</Col>
								)}
							</Row>
							<Row>
								<Col xs={24} sm={24} md={24} lg={24} xl={24}>
									<Title
										level={4}
										strong="false"
										className="pageTitle mt-4 text-break">
										Reviews and Ratings{' '}
										<small>({filteredRating.length} reviews)</small>
									</Title>
								</Col>
							</Row>
							{filteredRating.length > 0 ? (
								<Row>
									<Col xs={24} sm={24} md={24} lg={24} xl={24}>
										{filteredRating.length > 0 &&
											filteredRating.map((data, index) => {
												return (
													!data.isHidden && (
														<Card className="mb-3 reviewsAndRatings">
															<div className="d-flex flex-column">
																<div className="d-flex flex-md-row flex-column justify-content-between">
																	<div className="d-flex flex-row user_blk ">
																		<div className="mr-2">
																			<ProfileAvatar
																				size={40}
																				name={data.createdBy.name}
																				imageUrl={data.createdBy.profileImage}
																			/>
																		</div>
																		<div className="d-flex flex-column">
																			<strong className="uicTop">
																				{' '}
																				{data.createdBy &&
																					data.createdBy.name}{' '}
																			</strong>
																			<div className="userBottom">
																				reviewed on{' '}
																				{moment(
																					new Date(parseFloat(data.createdDate))
																				).fromNow()}
																			</div>
																		</div>
																	</div>
																	<div className="pt-md-0 pt-2">
																		<Rate
																			tooltips={desc}
																			disabled
																			allowHalf
																			defaultValue={data.rating}
																		/>
																		{data.rating ? (
																			<span className="ant-rate-text">
																				({desc[Math.round(data.rating) - 1]})
																			</span>
																		) : (
																			''
																		)}
																	</div>
																</div>
																<div className="py-2 reviewsTxt">
																	{data.comment}
																</div>
																{data.createdBy.userId !==
																localStorage.getItem('userId') ? (
																	data.isAbused ? (
																		'Reported Abused'
																	) : (
																		<div className="reportAbuse">
																			<Link
																				className="mr-2"
																				onClick={(e) =>
																					onAbuseReport(data.ratingId)
																				}>
																				Report abuse
																			</Link>
																			<Tooltip
																				placement="top"
																				title="If you find this content inappropriate and think it should be removed from the site, let us know by clicking this link">
																				<img
																					alt=""
																					className="infoIcon"
																					src={require('../../../Assets/images/info-icon.svg')}
																				/>
																			</Tooltip>
																		</div>
																	)
																) : null}
															</div>
														</Card>
													)
												);
											})}
									</Col>
								</Row>
							) : (
								<Empty />
							)}
						</Card>
					</Col>
				</Row>
			)}
		</div>
	);
};

export { ViewLiveStoryDetails };
