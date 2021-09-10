/* eslint-disable array-callback-return */
/* eslint-disable react/no-did-update-set-state */
import React, { Component } from 'react';
import './AddStory.css';
import {
	Row,
	Col,
	Form,
	Input,
	Select,
	DatePicker,
	Checkbox,
	Typography,
	Card,
	Button,
	Modal,
	Tooltip,
	InputNumber,
	Spin,
	message,
	Upload, Radio,
} from 'antd';
import {
	EnvironmentFilled,
	ExclamationCircleOutlined,
} from '@ant-design/icons';
import { CustIcon } from '../../Components/Svgs/Svgs';
import { withApollo } from 'react-apollo';
import {
	SAVESTORY_MUTATION,
	GET_ALL_ACTIVE_REPORTER_CATEGORY,
	GET_SETTINGS,
	GET_ALL_REPORTERS_WEB
} from '../../graphql/APIs';

import moment from 'moment';
import { MAPBOXTOKEN } from '../../Components/general/constant';
import { Loader } from '../../Components/Loader/Loader';
import axios from 'axios';
import { OnboardingTour } from '../../Components/ReporterOnboardingTour/OnboardingTour';
import {
	addBreadcrumb as SentryLog,
	captureException as SentryError,
	Severity
} from '@sentry/react';
import { MediaUploader } from '../../Components/Uploader';
import { Helmet } from 'react-helmet';

const { Dragger } = Upload;

const props = {
	name: 'file',
	multiple: true,
	action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
	onChange(info) {
		const { status } = info.file;
		if (status !== 'uploading') {

		}
		if (status === 'done') {
			message.success(`${info.file.name} file uploaded successfully.`);
		} else if (status === 'error') {
			message.error(`${info.file.name} file upload failed.`);
		}
	},
};
const { Option } = Select;
const { Title } = Typography;
const { TextArea } = Input;
class AddStory extends Component {
	constructor(props) {
		super(props);
		this.state = {
			uploadingInProgress: false,
			date: new Date(),
			loading: false,
			previewVisible: false,
			storyMedia: [],
			location: null,
			mediaSize: 0,
			lat: null,
			lng: null,
			storySubmitLoader: false,
			storyMaxPrice: 1,
			storyMinPrice: null,
			category: [],
			isLoaded: false,
			countryData: [],
			countryValue: '',
			fetchingLocation: false,
			priceMessage: null,
			showPrice: false
		};
		this.onDateChange = this.onDateChange.bind(this);
		this.cancelStory = this.cancelStory.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.handleSearch = this.handleSearch.bind(this);
	}

	formRef = React.createRef();

	componentDidMount() {
		this.getPriceRage();
		//	this.getAllActiveCategory();
	}

	getPriceRage = () => {
		const { client } = this.props;
		client
			.query({
				query: GET_SETTINGS,
				fetchPolicy: 'network-only',
			})
			.then(({ data, loading }) => {
				this.loading = loading;
				if (data !== undefined) {
					const msg =
						'Price must be between ' +
						data.getUserSettings.storyMinPrice +
						' to ' +
						data.getUserSettings.storyMaxPrice;
					this.setState({
						storyMaxPrice: data.getUserSettings.storyMaxPrice,
						storyMinPrice: data.getUserSettings.storyMinPrice,
						priceMessage: msg,
					});
				}
				this.getAllActiveCategory();
				this.getAllActiveReporters();
			})
			.catch((error) => {
				console.log(error)
				if (error.graphQLErrors && error.graphQLErrors.length > 0) {
					message.destroy();
				} else {
					SentryError(error);
					message.destroy();
					message.error('Something went wrong please try again later.');
				}
			});
	};

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
		this.setState({ location: result, lat: lat, lng: lng });
		this.formRef.current.setFieldsValue({ location: result });
	};
	handleSearch = (value) => {
		// console.log(value)
		try {
			SentryLog({
				category: 'Add New Request',
				message: 'Reset Password Page Country list retrieving using mapbox API',
				level: Severity.Info,
			});
			let thisData = this;
			this.formRef.current.setFieldsValue({
				countryData: [],
				location: null
			});
			this.setState({ fetchingLocation: true, countryData: [], countryValue: '' });
			if (value) {
				// fetch(value, data => this.setState({ data }));
				const url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/';
				axios
					.get(
						url +
						value +
						'.json?limit=10&language=en-EN&access_token=' +
						MAPBOXTOKEN
					)
					.then(async function (response) {
						// handle success
						// console.log(response)
						SentryLog({
							category: 'Add New Request',
							message: 'Country data retrieved from mapbox API',
							level: Severity.Info,
						});
						let countryData = [];
						await response.data.features.map((feat) => {
							countryData.push({ text: feat.place_name, center: feat.center });
						});
						// console.log(countryData)
						thisData.setState({
							countryData: countryData,
							fetchingLocation: false,
							countryValue: null
						});
					})
					.catch((error, result) => {
						thisData.setState({
							fetchingLocation: false,
						});
						if (error.graphQLErrors && error.graphQLErrors.length > 0) {
							message.destroy();
						} else {
							SentryError(error);
							message.destroy();
							message.error('Not able to find results for ' + value);
						}
					})
					.finally(function () {
						// always executed
					});
			} else {
				this.setState({ data: [] });
			}
		} catch (error) {
			SentryError(error);
		}
	};

	handleChange = (value) => {
		console.log(this.state.countryData[value].text)
		this.setState({
			countryValue: value,
			location: this.state.countryData[value].text,
			lat: this.state.countryData[value].center[1],
			lng: this.state.countryData[value].center[0],
			fetchingLocation: false
		});
	};

	getAllActiveCategory = () => {
		const { client } = this.props;
		client
			.query({
				query: GET_ALL_ACTIVE_REPORTER_CATEGORY,
				fetchPolicy: 'network-only',
			})
			.then(({ data, loading }) => {
				this.loading = loading;
				if (data !== undefined) {
					this.setState({
						category: data.getAllActiveCategory,
					});
				}
			})
			.catch((error) => {
				console.log(error)
				if (error.graphQLErrors && error.graphQLErrors.length > 0) {
					message.destroy();
					message.error(error.graphQLErrors[0].message);
				} else {
					SentryError(error);
					message.destroy();
					message.error('Something went wrong please try again later.');
				}
			});
	};
	getAllActiveReporters = () => {
		const { client } = this.props;
		client
			.query({
				query: GET_ALL_REPORTERS_WEB,
				fetchPolicy: 'network-only',
			})
			.then(({ data, loading }) => {
				this.loading = loading;
				if (data !== undefined) {
					this.setState({
						reporters: data.getAllReportersWeb.reporters,
						isLoaded: true,
					});
					this.formRef.current.setFieldsValue({
						isProposal: true
					})
				}
			})
			.catch((error) => {
				if (error.graphQLErrors && error.graphQLErrors.length > 0) {
					message.destroy();
					message.error(error.graphQLErrors[0].message);
				} else {
					SentryError(error);
					message.destroy();
					message.error('Something went wrong please try again later.');
				}
			});
	};

	onFinish = async (values) => {
		this.setState({ storySubmitLoader: true });
		values.isIndependant = true;
		values.storyDateTime = (values.storyDateTime
			? new Date(values.storyDateTime.toDate()).getTime()
			: new Date().getTime()
		).toString();
		values.storyMedia = this.state.storyMedia;
		values.lat = parseFloat(this.state.lat);
		values.lng = parseFloat(this.state.lng);
		values.price = values.price ? values.price.toString() : undefined;
		values.categoryId = values.categoryId
			? values.categoryId
			: this.state.category[0].categoryId;
		values.location = this.state.location;
		values.isGlobal = true;
		const { client } = this.props;
		if (this.state.lat === null) {
			Modal.error({
				content: 'Please select location from google location suggestion',
			});
			this.setState({ storySubmitLoader: false });
			return;
		}
		client
			.mutate({
				variables: values,
				mutation: SAVESTORY_MUTATION,
			})
			.then(() => {
				this.setState({ storySubmitLoader: false });
				Modal.success({
					className: 'notificationModal',
					width: 500,
					icon: (
						<div className="popDeleteicon">
							<img alt="" src={require('../../Assets/images/thumb-icon.svg')} />
						</div>
					),
					content: 'Story uploaded successfully.',
				});
				this.props.history.push(values.isProposal ? '/marketplace/proposal' : 'marketplace/full');
			})
			.catch((error) => {
				SentryError(error);
				this.setState({ storySubmitLoader: false });
				message.error('Oops! The story was not created. Please try again.');
			});
	};

	setUploadingFlag = (flag) => {
		this.setState({ uploadingInProgress: flag });
	};

	setUploadedMediaList = (mediaList) => {
		this.setState({ storyMedia: mediaList });
		this.formRef.current.setFieldsValue({ storyMedia: mediaList });
	};
	handleKeypress = (e) => {
		const characterCode = e.key;
		if (characterCode === 'Backspace') return;

		const characterNumber = Number(characterCode);
		if (characterNumber >= 0 && characterNumber <= 9) {
			if (e.currentTarget.value && e.currentTarget.value.length) {
				return;
			} else if (characterNumber === 0) {
				e.preventDefault();
			}
		} else {
			e.preventDefault();
		}
	};
	onWheel = () => {
		this.inputRef.current.blur();
	};
	render() {
		const { date, uploadingInProgress } = this.state;
		return (
			<React.Fragment>
				<Helmet>
					<title>Contetent Creator | Add New Story </title>
				</Helmet>

				{this.state.isLoaded ? (
					<div className="">
						<div className="pageTitle">
							<h3 className="mb-3">
								{'Add required details to create new story'}
							</h3>
						</div>
						{/* <Title level={4} strong="false" className="pageTitle">
							{requestId
								? 'Edit Request'
								: 'Add required details to create new request'}
						</Title> */}
						<Card className="boxshadow">
							<OnboardingTour tourName={['breakingStory']} />
							<Form
								className="tour-addRequest-form"
								layout="vertical"
								ref={this.formRef}
								onFinish={this.onFinish}
							//	onFinishFailed={onFinishFailed}
							>
								<Row gutter={30}>
									<Col xs={24}>
										<div className="ant-col ant-form-item-label d-flex flex-row">
											<label htmlFor="title" title="Title">
												Story Type
											</label>
										</div>
										<Form.Item name="isProposal">
											<Radio.Group
												initialvalues={true}
												disabled={this.state.isAccepted == true && true}
												value={true}
												onChange={(e) => {
													e.stopPropagation();
													this.setState({ showPrice: !e.target.value });
												}}
												className="tour-addRequest-type d-block">
												<Row>
													<Col xs={12} md={8} lg={4}>
														<Radio value={true} selected>
															<span>Proposal</span>
														</Radio>
													</Col>
													<Col xs={12} md={8} lg={4}>
														<Radio value={false}>
															<span>Full Story</span>
														</Radio>
													</Col>
												</Row>
											</Radio.Group>
										</Form.Item>
									</Col>
									<Col xs={24} className="tour-breakingStory-title">
										<div className="ant-col ant-form-item-label d-flex flex-row">
											<label htmlFor="title" title="Title">
												Title
											</label>
											<Tooltip
												placement="top"
												title="Add a title for your request">
												<ExclamationCircleOutlined className="infoIcon" />
											</Tooltip>
										</div>
										<Form.Item
											label=""
											name="title"
											rules={[
												{ required: true, message: 'Please enter title' },
												{
													min: 10,
													max: 100,
													message: 'Title must be between 10 to 100 characters',
												},
												{
													pattern: /^[A-Za-z0-9].*$/i,
													message: 'Title should start with alphabet/number',
												},
											]}>
											<Input
												placeholder="Enter Story Title"
											//disabled={requestId && true}
											/>
										</Form.Item>
									</Col>
									<Col xs={24} className="tour-breakingStory-note">
										<div className="ant-col ant-form-item-label d-flex flex-row">
											<label htmlFor="title" title="Speical Notes">
												Speical Notes
											</label>
											<Tooltip
												placement="top"
												title="Add special instructions for the content creators">
												<ExclamationCircleOutlined className="infoIcon" />
											</Tooltip>
										</div>
										<Form.Item
											name="notes"
											rules={[
												{
													//min: 10,
													max: 255,
													message:
														'Special instructions can not be more then 255 characters',
												},
											]}>
											<TextArea
												//disabled={requestId && true}
												placeholder="Enter Content Creator's Special Notes"
												autoSize={{ minRows: 2, maxRows: 6 }}
											/>
										</Form.Item>
									</Col>
									<Col xs={24} md={12} className="z-index0 tour-breakingStory-location" >
										<div className="ant-col ant-form-item-label d-flex flex-row">
											<label htmlFor="title" title="Title">
												Location
											</label>
											<Tooltip
												placement="top"
												title="Add the location of the request for the content creators to navigate easily">
												<ExclamationCircleOutlined className="infoIcon" />
											</Tooltip>
										</div>
										<Form.Item
											className="inputIcon"
											name="location"
											rules={[
												{
													required: true,
													message: 'Please enter location',
												},
											]}>
											<Select
												// suffixIcon={this.state.fetchingLocation ? (
												// 	<Spin size="small" />
												// ) : <EnvironmentFilled />}
												showSearch
												value={this.state.countryValue}
												loading={this.state.fetchingLocation}
												placeholder="Enter Story Location"
												//defaultActiveFirstOption={false}
												showArrow={false}
												filterOption={false}
												onSearch={this.handleSearch}
												onChange={e => this.handleChange(e)}
												notFoundContent={
													this.state.fetchingLocation ? (
														<Spin size="small" />
													) : null
												}>
												{this.state.countryData.map((d, index) => (
													<Option key={index} value={index}>
														{d.text}
													</Option>
												))}
											</Select>
										</Form.Item>
									</Col>

									<Col xs={24} md={12} className="tour-breakingStory-title">
										<div className="ant-col ant-form-item-label d-flex flex-row">
											<label htmlFor="title" title="Title">
												Story Category
											</label>
											<Tooltip
												placement="top"
												title="Select Story Category">
												<ExclamationCircleOutlined className="infoIcon" />
											</Tooltip>
										</div>
										<Form.Item className="mb-3" name="categoryId">
											<Select
												placeholder="Select Story Category"
											// defaultValue={this.state.category[0].categoryId}
											>
												{this.state.category.map((data, index) => {
													return (
														<Option key={index} value={data.categoryId}>
															{' '}
															{data.title}
														</Option>
													);
												})}
											</Select>
										</Form.Item>
									</Col>
									<Col xs={24} md={6} className="tour-breakingStory-date">
										<div className="ant-col ant-form-item-label d-flex flex-row">
											<label htmlFor="title" title="Story Date & Time">
												Story Date & Time
											</label>
											<Tooltip
												placement="top"
												title="Add the date on which the request will get expired">
												<ExclamationCircleOutlined className="infoIcon" />
											</Tooltip>
										</div>
										<Form.Item className="inputIcon" name="storyDateTime">
											<DatePicker
												suffixIcon={<CustIcon type="calendaricon" />}
												showTime
												format="MM-DD-YYYY HH:mm"
												disabledDate={(d) => !d || d.isAfter(new Date())}
												onChange={this.onDateChange}
												initialValues={moment(new Date(date))}
												value={new Date(date)}
												style={{ width: '100%' }}
											/>
										</Form.Item>
									</Col>
									{/* <Col xs={24} md={6} className="tour-breakingStory-date">
										<div className="ant-col ant-form-item-label d-flex flex-row">
											<label htmlFor="title" title="Story Date & Time">
												Story Time
											</label>
											<Tooltip
												placement="top"
												title="Add the time on which the request will get expired">
												<ExclamationCircleOutlined className="infoIcon" />
											</Tooltip>
										</div>
										<Form.Item className="inputIcon" name="storyDateTime">
											<DatePicker
												suffixIcon={<CustIcon type="clockicon" />}
												showTime
												format="MM-DD-YYYY HH:mm"
												disabledDate={(d) => !d || d.isAfter(new Date())}
												onChange={this.onDateChange}
												initialValues={moment(new Date(date))}
												value={new Date(date)}
												style={{ width: '100%' }}
											/>
										</Form.Item>
									</Col> */}
									{this.state.showPrice &&
										<Col xs={24} md={6} className="tour-breakingStory-price">
											<div className="ant-col ant-form-item-label d-flex flex-row">
												<label htmlFor="title" title="Set Price">
													Set Price (In USD)
												</label>
												<Tooltip
													placement="top"
													title="Set the price of the story">
													<ExclamationCircleOutlined className="infoIcon" />
												</Tooltip>
											</div>
											<Form.Item
												className=""
												name="price"
												placeholder="Enter Story Price"
												rules={[
													{
														required: true,
														message: 'Please enter price',
													},
													{
														type: 'number',
														min: this.state.storyMinPrice,
														max: this.state.storyMaxPrice,
														message: this.state.priceMessage,
													},
												]}>
												{/* <div className="dollarIcon">$</div> */}
												<InputNumber
													//onfocus="this.type='number';"
													onKeyDown={this.handleKeypress}
													ref={this.inputRef}
													onWheel={this.onWheel}
													// min={this.state.storyMinPrice}
													// max={this.state.storyMaxPrice}
													placeholder="Enter Story Price"
													step="1"
													style={{ width: '100%' }}
													formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
													parser={value => value.replace(/\$\s?|(,*)/g, '')}
												/>
											</Form.Item>
										</Col>}
									<Col xs={24} md={6} className="tour-breakingStory-title">
										<div className="ant-col ant-form-item-label d-flex flex-row">
											<label htmlFor="title" title="Title">
												Created By
											</label>
											<Tooltip
												placement="top"
												title="Select the category of the story">
												<ExclamationCircleOutlined className="infoIcon" />
											</Tooltip>
										</div>
										<Form.Item className="mb-3" name="createdBy">
											<Select
												placeholder="Select Content Creator"
											// defaultValue={this.state.category[0].categoryId}
											>
												{this.state.reporters.map((data, index) => {
													return (
														<Option key={index} value={data.userId}>
															{' '}
															{data.name}
														</Option>
													);
												})}
											</Select>
										</Form.Item>
									</Col>
									{this.state.isLiveChecked && (
										<Col md={12} xs={24} className=" tour-addRequest-price">
											<div className="ant-col ant-form-item-label d-flex flex-row">
												<label htmlFor="title" title="Schedule Date">
													Schedule Datetime
												</label>
												<Tooltip
													placement="top"
													title="Add the date and time at which the live stream will start">
													<ExclamationCircleOutlined className="infoIcon" />
												</Tooltip>
											</div>
											<Form.Item
												//	disabled={requestId && true}
												name="scheduleDate"
												rules={[
													{
														required: true,
														message: 'Please enter scheduled date and time',
													},
													() => ({
														validator(_rule, value) {
															if (
																value &&
																new Date(value) <
																new Date().setMinutes(
																	new Date().getMinutes() - 5
																)
															) {
																return Promise.reject(
																	'Please select schedule date greater than current date and time'
																);
															}
															return Promise.resolve();
														},
													}),
												]}>
												<DatePicker
													//disabled={requestId && true}
													format={'MM/DD/YYYY HH:mm:ss'}
													className="w-100"
													showTime={{
														initialValues: moment('00:00:00', 'HH:mm:ss'),
													}}
												/>
											</Form.Item>
										</Col>
									)}
								</Row>
								<div className="boxshadow p-4 rounded mb-3 tour-breakingStory-upload">
									<div className="font18 font-weight-bold mb-2 text-center">
										UPLOAD FILES
									</div>
									<div className="lightGray-text-color mb-2 mb-lg-3 text-center">
										Upload a JPEG, PNG, MP4, MP3 file here.
									</div>
									<Form.Item
										name="storyMedia"
										rules={[
											{ required: true, message: 'Please upload media' },
										]}>
										<MediaUploader
											className="fileUploader"
											uploaderText="Upload a JPEG, PNG, MP4, MP3 file here."
											allowMultiple
											allowedMediaTypes={['image', 'video', 'audio', 'article']}
											uploadFolderName="story"
											isUploading={this.setUploadingFlag}
											returnUploadedFiles={this.setUploadedMediaList}
										/>
									</Form.Item>
								</div>
								{/* <Form.Item
									name="agreement"
									valuePropName="checked"
									rules={[
										{
											validator: (_, value) =>
												value
													? Promise.resolve()
													: Promise.reject('Please grant the permission'),
										},
									]}>
									<Checkbox>
										I grant permission to use my uploaded content in any media
										for Newstream.
									</Checkbox>
								</Form.Item> */}
								<div className="text-right pt-2 pt-lg-5">
									<Button
										loading={
											this.state.storySubmitLoader || uploadingInProgress
										}
										disabled={uploadingInProgress}
										type="primary"
										size="large"
										htmlType="submit">
										{uploadingInProgress ? 'Uploading Files..' : 'Publish'}
									</Button>
									{/* <Button
										className="ml-2"
										onClick={this.cancelStory}
										size="large">
										Cancel
									</Button> */}
								</div>
							</Form>
						</Card>
					</div>
				) : (
					<Loader />
				)}
			</React.Fragment>
		);
	}
}
AddStory = withApollo(AddStory);
export { AddStory };
