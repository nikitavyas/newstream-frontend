/* eslint-disable array-callback-return */
import {
	addBreadcrumb as SentryLog,
	captureException as SentryError,
	Severity,
} from '@sentry/react';
import {
	Button,
	Card,
	Checkbox,
	Col,
	DatePicker,
	Form,
	Input,
	message,
	Modal,
	Row,
	Tag,
	Typography,
} from 'antd';
import { EnvironmentFilled, ClockCircleFilled } from '@ant-design/icons';
import moment from 'moment';
import React, { Component } from 'react';
import { withApollo } from 'react-apollo';
import MapboxAutocomplete from 'react-mapbox-autocomplete';
import { Prompt } from 'react-router-dom';
import config from '../../../appConfig';
import { ProfileAvatar } from '../../Components/Avatar';
import { ContactButton } from '../../Components/Buttons';
import { SubmitLiveStory } from '../../Components/Forms/SubmitStory';
import { OnboardingTour } from '../../Components/OnboardingTour/OnboardingTour';
import { CustIcon } from '../../Components/Svgs';
import { LiveTag } from '../../Components/Tags';
import { MediaUploader } from '../../Components/Uploader';
import { SAVESTORY_MUTATION } from '../../graphql/mutation';
import { analytics } from '../../utils/init-fcm';
import './Request.css';
import queryString from 'query-string';
import { Helmet } from 'react-helmet';

import { getAddress } from '../../Components/general/general';
import momentCountdown from 'moment-countdown';

const { Text } = Typography;
const { TextArea } = Input;

class Story extends Component {
	formRef = React.createRef();
	constructor(props) {
		analytics.setCurrentScreen('/story/add');
		super(props);

		this.state = {
			request: JSON.parse(localStorage.getItem('request')),
			storyMedia: [],
			date: new Date(),
			storySubmitLoader: false,
			uploadingInProgress: false,
		};
		this.onDateChange = this.onDateChange.bind(this);
		this.cancelStory = this.cancelStory.bind(this);
	}
	componentDidMount() {
		SentryLog({
			category: 'page',
			message: 'Submit Story Page Loaded',
			level: Severity.Debug,
		});
	}

	cancelStory = () => {
		const props = this.props;
		Modal.confirm({
			// title: 'Cancel story ?',
			content: 'Are you sure want to cancel the submission?',
			width: 500,
			className: 'notificationModal',
			icon: (
				<div className="popimageBox">
					<img alt="" src={require('../../Assets/images/logout-img.png')} />
				</div>
			),
			onOk() {
				SentryLog({
					category: 'data-mutate',
					message: 'Cancelled Submitting Story',
					level: Severity.Debug,
				});
				props.history.goBack();
			},
		});
	};

	onDateChange = (date) => {
		if (date <= new Date()) {
			this.setState({ date: new Date(date) });
		} else {
			message.error('Story can not be future date.');
			this.setState({ date: new Date() });
		}
	};

	_suggestionSelect = (result, lat, lng) => {
		const requestData = { ...this.state.request };
		requestData.location = result;
		requestData.lat = lat;
		requestData.lng = lng;
		this.setState({ request: requestData });
		this.formRef.current.setFieldsValue({ location: result });
	};

	onFinish = async (values) => {
		this.setState({ storySubmitLoader: true });
		const { request, storyMedia } = this.state;
		const { client } = this.props;
		values.isIndependant = false;
		values.requestId = request.requestId;
		values.title = request.title;
		values.price = request.price.toString();
		values.location = request.location;
		values.storyDateTime = (values.storyDateTime
			? new Date(values.storyDateTime.toDate()).getTime()
			: new Date().getTime()
		).toString();
		values.storyMedia = storyMedia;
		values.lat = parseFloat(request.lat);
		values.lng = parseFloat(request.lng);
		values.storyId = request.stories[0]?.storyId;
		values.isProposal = false;
		SentryLog({
			category: 'data-mutate',
			message: `Started Submitting Story for variables ${JSON.stringify(
				values
			)}`,
			level: Severity.Debug,
		});
		client
			.mutate({
				variables: values,
				mutation: SAVESTORY_MUTATION,
			})
			.then(() => {
				SentryLog({
					category: 'data-mutate',
					message: `Story Submitted Successfully`,
					level: Severity.Debug,
				});
				this.setState({ storySubmitLoader: false });
				Modal.success({
					title: '',
					icon: (
						<div className="popDeleteicon">
						<img alt="" src={require('../../Assets/images/thumb-icon.svg')} />
						</div>
					),
					content: 'Story uploaded successfully.',
					className: 'notificationModal',
					width: 500,
				});
				var url = new URL(window.location.href);
				if(url.pathname.includes("/requests/open")){
                    this.props.history.push('/requests/open');
				}else{
					this.props.history.push('/requests/assigned');
				}
			})
			.catch((error) => {
				SentryError(error);
				this.setState({ storySubmitLoader: false });
				message.error('Oops! The story was not created. Please try again.');
			});
	};

	onFinishFailed = (errorInfo) => {
		errorInfo.errorFields.map((data) => {
			analytics.logEvent(data.name[0], {
				action: 'inError',
				label: 'message',
				value: data.errors[0],
			});
		});
	};

	setUploadingFlag = (flag) => {
		this.setState({ uploadingInProgress: flag });
	};

	setUploadedMediaList = (mediaList) => {
		this.setState({ storyMedia: mediaList });
		this.formRef.current.setFieldsValue({ storyMedia: mediaList });
	};

	render() {
		const { request, date, uploadingInProgress } = this.state;
		return (
			<React.Fragment>
				<Helmet>
					<title>Content Creator | Submit Story </title>
				</Helmet>
				<div className="request-container">
					<Prompt
						when={
							this.state.uploadingInProgress || this.state.storySubmitLoader
						}
						message={() => `Are you sure you want to leave?`}
					/>
					<OnboardingTour tourName={['submitStory']} />
					<div className="globaltitle mb-3">
						<h3 className="mb-lg-0">Posted by</h3>
					</div>
					<Card className="requestBox_blk boxshadow mb-3">
						<Row gutter={20}>
							<Col lg={6} md={12} sm={24} xs={24}>
								<div className="user_blk d-flex flex-row mb-lg-0 mb-2">
									<ProfileAvatar
										size={60}
										name={request.createdBy.name}
										imageUrl={request.createdBy.profileImage}
									/>
									<div className="d-flex flex-column justify-content-center pl-3">
										<h5 className="mb-0 userTop text-break font-weight-bold">
											{request.createdBy.name}
										</h5>
										<span>
											{moment(new Date()).to(
												moment(new Date(parseFloat(request.createdDate)))
											)}
										</span>
									</div>
								</div>
							</Col>
							<Col lg={6} md={12} sm={12} xs={24}>
								<div className="d-flex flex-column mb-lg-0 mb-2">
									<div className="label_blk mb-1">Location</div>
									<div className="d-flex flex-row align-items-center dateTxt">
										<span className="font14 pline-2">
											{request.createdBy.address ? (
												<>
													<EnvironmentFilled className="mr-2" />
													{getAddress(request.createdBy.address)}
												</>
											) : (
												'No Location Detected'
											)}
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
							<Col lg={6} md={12} sm={24} xs={24} className="text-right">
								<ContactButton
									name={request.createdBy.name.split(' ')[0]}
									phoneNumber={request.createdBy.phoneNumber}
									slackUserId={request.createdBy.slackUserId}
								/>
							</Col>
							)}
						</Row>
					</Card>

					<div className="globaltitle">
						<h3 className="mb-3">Submit story</h3>
					</div>
					<Card className="detailsBox_blk boxshadow mb-3">
						{/* {request.isOpen ? (
							<div className="badge badge_open mb-3">Open</div>
						) : (
							<div className="badge badge_assign mb-3">Assigned</div>
						)} */}
						<div className="priceAmt">${request.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>
						<div className="font18 font-weight-bold mb-2">{request.title}</div>
						<div className="locationtxt mb-1">
							<EnvironmentFilled className="mr-2" />
							{request.location}
						</div>
						<div className="locationtxt mb-3">
							<ClockCircleFilled className="mr-2" />
							Expires{' '}
							{moment(new Date(parseFloat(request.expiryDateTime))).fromNow()}
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
										<CustIcon type="articleicon" className="mr-2" />
										Article
									</Tag>
								)}
								{request.isLive && (
									<Tag className="liveTag">
										<CustIcon type="liveicon" className="mr-2" />
										Live
									</Tag>
								)}
								{request.isRaw && (
									<Tag className="liveTag">
										<CustIcon type="liveicon" className="mr-2" />
										Raw Data
									</Tag>
								)}
							</div>
						</div>
						<div className="font18 font-weight-bold mb-2">Special Notes</div>
						<div className="mb-2">{request.note}</div>
						<hr />
						{!request.isLive ? (
							<Form
								ref={this.formRef}
								onFinish={this.onFinish}
								onFinishFailed={this.onFinishFailed}
								className="newstoryForm">
								<Row gutter={[24]}>
									{/* <Col span={24}>
									<div className="label_blk mb-1">Title</div>
									<Form.Item name="title" className="mb-3">
										<Input disabled defaultValue={request.title} />
									</Form.Item>
								</Col>
								<Col lg={4} xs={24}>
									<div className="label_blk mb-1">Price</div>
									<Form.Item name="price">
										<Input
											disabled
											addonBefore="$"
											defaultValue={request.price}
										/>
									</Form.Item>
								</Col> */}
									<Col md={16} sm={12} xs={24} className="z-index1">
										<div className="label_blk mb-1">Location</div>
										<Form.Item
											name="location"
											initialValue={this.state.request.location}
											rules={[
												{
													required: true,
													message: 'Please select the location.',
												},
											]}>
											<MapboxAutocomplete
												publicKey={config.mapbox_key}
												inputClass="form-control search"
												onSuggestionSelect={this._suggestionSelect}
												resetSearch={false}
												query={request.location}
											/>
										</Form.Item>
									</Col>
									<Col md={8} sm={12} xs={24}>
										<div className="label_blk mb-1">Story Date & Time</div>
										<Form.Item name="storyDateTime"
												rules={[
													{
														required: true,
														message: 'Please select the Date & time.',
													},
												]}>
											<DatePicker
												disabledDate={(d) => !d || d.isAfter(new Date())}
												showTime
												format="MM-DD-YYYY hh:mm"
												onChange={this.onDateChange}
												initialValues={moment(new Date(date))}
												value={new Date(date)}
												
											/>
										</Form.Item>
									</Col>

									<Col span={24}>
										<div className="boxshadow p-4 rounded mb-3 tour-submitStory-upload">
											<div className="font18 font-weight-bold mb-2 text-center">
												UPLOAD FILES
											</div>
											<div className="lightGray-text-color mb-2 mb-lg-3 text-center">
												Upload a JPEG, PNG, MP4, MP3 file here.
											</div>
											<Form.Item
												name="storyMedia"
												rules={[
													{ required: true, message: 'Please upload media.' },
												]}>
												<MediaUploader
													uploaderText="Upload a JPEG, PNG, MP4, MP3 file here."
													allowMultiple
													allowedMediaTypes={['image', 'video', 'audio','article']}
													uploadFolderName="story"
													isUploading={this.setUploadingFlag}
													returnUploadedFiles={this.setUploadedMediaList}
												/>
											</Form.Item>
										</div>
									</Col>
									<Col span={24}>
										<div className="label_blk mb-1">Content's Note</div>
										<Form.Item name="note">
											<TextArea rows={4} />
										</Form.Item>
									</Col>
								</Row>
								<Form.Item
									name="agreement"
									valuePropName="checked"
									rules={[
										{
											validator: (_, value) =>
												value
													? Promise.resolve()
													: Promise.reject('Please grant the permission.'),
										},
									]}>
									<Checkbox>
										I grant permission to use my uploaded content in any media
										for Newstream.
									</Checkbox>
								</Form.Item>
								<div className="text-right pt-lg-5 pt-0">
									<Form.Item>
										<Button
											loading={
												this.state.storySubmitLoader || uploadingInProgress
											}
											disabled={uploadingInProgress}
											type="primary"
											size="large"
											htmlType="submit"
											className="tour-submitStory-button">
											{uploadingInProgress ? 'Uploading..' : 'Submit'}
										</Button>
										<Button
											className="ml-2"
											onClick={this.cancelStory}
											size="large">
											Cancel
										</Button>
									</Form.Item>
								</div>
							</Form>
						) : (
							<SubmitLiveStory />
						)}
					</Card>
					{/* <Card
					className="requestBox_blk boxshadow mb-3"
					bordered="true">
					<Row className="request-view-details">
						<Col
							xl={24}
							lg={8}
							md={12}
							sm={12}
							xs={24}
							className="story-details price_details mb-3">
							<div className="label_blk">Price</div>
							<div className="primary-text-color priceAmt">
								<strong>$ {request.price}</strong>
							</div>
						</Col>

						<Col
							xl={24}
							lg={8}
							md={12}
							sm={12}
							xs={12}
							className="story-details reqTypeDetails mb-4">
							<div className="label_blk mb-2">Request type</div>
							<div className="d-flex">
								{request.isOpen ? (
									<div className="d-inline-flex lbl lbl-open mr-2">
										<CustIcon type="unlock" className="mr-2" />
										<span>open</span>
									</div>
								) : (
									<div className="d-inline-flex lbl lbl-assigned mr-2">
										<CustIcon type="lock" className="mr-2" />
										<span>assigned</span>
									</div>
								)}
							</div>
						</Col>

						<Col
							xl={24}
							lg={8}
							md={12}
							sm={12}
							xs={24}
							className="story-details expiryDate_blk mb-4">
							<div className="label_blk mb-2">Expiry date</div>
							<div className="d-flex align-items-center w-100 gray-text-color">
								<CustIcon type="date" className="mr-1" />
								<Text className="">
									{moment(new Date(parseFloat(request.expiryDateTime))).format(
										'DD/MM/YYYY h:mm:ss a'
									)}
								</Text>
							</div>
						</Col>

						<Col
							xl={24}
							lg={8}
							md={12}
							sm={12}
							xs={24}
							className="story-details mb-4">
							<div className="label_blk mb-2">Media Requested</div>
							<div className="story-icon-label d-flex flex-wrap mediaRequest">
								{request.isLive && <LiveTag />}
								{request.isAudio ? (
									<Tag className="audio">
										<img
											alt="audio"
											src={require('../../Assets/icon/ic_audio_color.png')}
										/>{' '}
										Audio
									</Tag>
								) : undefined}
								{request.isVideo ? (
									<Tag className="video">
										<img
											alt="video"
											src={require('../../Assets/icon/ic_video_color.png')}
										/>{' '}
										Video
									</Tag>
								) : undefined}
								{request.isImage ? (
									<Tag className="image">
										<img
											alt="iconImage"
											src={require('../../Assets/icon/ic_image_color.png')}
										/>{' '}
										Image
									</Tag>
								) : undefined}
							</div>
						</Col>
						{request.note ? (
							<Col
								xl={24}
								lg={8}
								md={12}
								sm={12}
								xs={24}
								className="story-details">
								<div className="label_blk mb-2">Special Notes</div>
								<span>{request.note} </span>
							</Col>
						) : undefined}
					</Row>
				</Card> */}
				</div>
			</React.Fragment>
		);
	}
}
Story = withApollo(Story);
export { Story };
