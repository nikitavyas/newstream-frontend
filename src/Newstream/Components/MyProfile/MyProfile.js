/* eslint-disable array-callback-return */
import React, { Component } from 'react';
import './MyProfile.css';
import {
	Row,
	Col,
	Form,
	Input,
	Upload,
	Modal,
	message,
	Typography,
	Button,
	Card,
	Tooltip,
	Select,
	Table,
} from 'antd';
import {
	EnvironmentOutlined,
	PlusOutlined,
	EditOutlined,
	ExclamationCircleOutlined,CameraFilled
} from '@ant-design/icons';
import { COULDBASEURL } from '../../Components/general/constant';
import { getAddress } from '../../Components/general/general';
import {
	FILE_UPLOADS,
	UPDATE_PROFILE,
	GET_USER_CONTRACTS,
	GET_ALL_TIMEZONE,
	UPDATEREPORTERPROFILE_MUTATION,
} from '../../graphql/APIs';
import { withApollo } from 'react-apollo';
import axios from 'axios';
import { analytics } from '../../utils/init-fcm';
import PhoneInput from 'react-phone-input-2';
import { ProfileAvatar } from '../../Components/Avatar/Avatar';
import {
	addBreadcrumb as SentryLog,
	captureException as SentryError,
	Severity,
} from '@sentry/react';
import { Loader } from '../../Components/Loader/Loader';
import { DownloadOutlined } from '@ant-design/icons';
import { saveAs } from 'file-saver';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { MyInvoice } from '../MyInvoice/MyInvoice';
import { CustIcon } from '../Svgs';
// import {Helmet} from "react-helmet";
// import { indexOf } from 'lodash';
const { Title } = Typography;
const { Option } = Select;
const { Column } = Table;

class MyProfile extends Component {
	constructor(props) {
		SentryLog({
			category: 'My Profile',
			message: 'My Profile Page Loaded',
			level: Severity.Info,
		});
		super(props);
		analytics.setCurrentScreen('My Profile');
		this.state = {
			countryData: [],
			center: [],
			value: [],
			fetching: false,
			editProfile: true,
			imageLoading: false,
			imgObject: { name: null, type: null },
			imageUrl: null,
			phoneNumber: props.profileData.phoneNumber,
			profileData: props.profileData.profileData,
			contractData: [],
			dataLoading: true,
			timezoneLoading: true,
			timezone: [],
			isLoading:false
		};
		this.oneditProfile = this.oneditProfile.bind(this);
		this.onNumberChange = this.onNumberChange.bind(this);
		this.getAllContracts();
		this.getAllTimezone();
	}

 getBase64(img, callback) {
		const reader = new FileReader();
		reader.addEventListener('load', () => callback(reader.result));
		reader.readAsDataURL(img);
	}
	/**
	 * @name getAllContracts
	 * @description get all contracts belong to publisher
	 * */
	getAllContracts = async () => {
		try {
			const { client } = this.props;
			this.setState({ dataLoading: false });
			const {
				data: { getUserContracts },
			} = await client.query({
				query: GET_USER_CONTRACTS,
				fetchPolicy: 'no-cache',
			});
			
			this.setState({ dataLoading: false, contractData: getUserContracts });
		} catch (error) {
			this.setState({ dataLoading: false });
			if (error.graphQLErrors && error.graphQLErrors.length > 0) {
			} else {
				SentryError(error);
				message.destroy();
				message.error('Something went wrong please try again later');
			}
		}
	};
	getAllTimezone = async () => {
		try {
			const { client } = this.props;
			this.setState({ timezoneLoading: true });
			const {
				data: { getAllTimeZones },
			} = await client.query({
				query: GET_ALL_TIMEZONE,
				fetchPolicy: 'no-cache',
			});
			this.setState({ timezoneLoading: false, timezone: getAllTimeZones });
		} catch (error) {
			this.setState({ timezoneLoading: false });
			if (error.graphQLErrors && error.graphQLErrors.length > 0) {
			} else {
				SentryError(error);
				message.destroy();
				message.error('Something went wrong please try again later');
			}
		}
	};
	onDownloadContract = async (fileName) => {
		
		saveAs(
			COULDBASEURL + fileName,
			fileName.substring(fileName.indexOf('/') + 1)
		);
	};
	beforeUpload(file) {
		try {
			const isJpgOrPng =
				file.type === 'image/jpeg' || file.type === 'image/png';
			if (!isJpgOrPng) {
				message.error('You can only upload JPG/PNG file!');
			}
			const isLt2M = file.size / 1024 / 1024 < 2;
			if (!isLt2M) {
				message.error('Image must smaller than 2MB!');
			}
			return isJpgOrPng && isLt2M;
		} catch (error) {
			SentryError(error);
		}
	}
	oneditProfile() {
		this.setState({ editProfile: false });
	}

	onNumberChange(value) {
		this.setState({ value : value });
	}
	handleChange = (info) => {
		try {
			// console.log('info',info)
		let	data = info;
			if (info.file.status === 'uploading') {
				this.setState({ imageLoading: false });
				return;
			}
			if (info.file.status === 'done') {
				// console.log('obj',this.state.imageObject)
				this.getBase64(this.state.imageObject, (imageUrl) => {
					this.setState({ imageUrl: imageUrl });
					this.setState({ imageLoading: false });
				//	this.setState({ imageObject: info.file.originFileObj });
				});
			}
		} catch (error) {
			SentryError(error);
		}
	};
	render() {
		const dummyRequest = ({file, onSuccess }) => {
			console.log('file',file)
			this.setState({ imageObject: file });
			this.setState({orjObj:file})
			setTimeout(() => {
				onSuccess('ok');
			}, 0);
		};
		
		const gateUploadUrlHandler = async () => {
			try {
				return new Promise((resolve) => {
					const { client } = this.props;
					client
						.mutate({
							variables: {
								fileName: 'userProfile/' + this.state.imageObject.name,
								fileType: this.state.imageObject.type,
							},
							mutation: FILE_UPLOADS,
						})
						.then((result) => {
							resolve(result.data.generateUrl);
						})
						.catch((error) => {
							if (error.graphQLErrors && error.graphQLErrors.length > 0) {
							} else {
								SentryError(error);
								message.destroy();
								message.error('Something went wrong please try again later');
							}
						});
					// uploadURL(payload)
					//   .then((res) => resolve(res.data.generateUrl))
					//   .catch(e => resolve(null))
				});
			} catch (error) {
				SentryError(error);
			}
		};

		const uploadFile = async (signedUrl) => {
			try {
				return new Promise((resolve) => {
					axios
						.put(signedUrl, this.state.imageObject, {
							headers: {
								'Content-Type': this.state.imageObject.type,
							},
						})
						.then(() => {
							// console.log(signedUrl);
							resolve(
								signedUrl
									.split('?')[0]
									.replace(
										'https://s3.amazonaws.com/assetsstage.thenewstream.com/',
										''
									)
							);
						})
						.catch(() => resolve(null));
				});
			} catch (error) {
				SentryError(error);
			}
		};
		const onReporterSubmit = async (values) => {
			try {
				const { client } = this.props;
				this.setState({isLoading:true})
				let thisPointer = this;
				let profileData = this.state.profileData;
				let url = null;
				let uploadedFile = null;
				if (this.state.imageUrl) {
					url = await gateUploadUrlHandler();
					uploadedFile = url ? await uploadFile(url) : '';
					// uploadedFile = uploadedFile.split('thenewstream.com/')[1];
			
				}
				client
					.mutate({
						variables: {
							phoneNumber: this.state.phoneNumber,
							name: values.name,
							email: values.email,
							address1: values.address1,
							address2: values.address2,
							city: values.city,
							state: values.state,
							profileImage: uploadedFile || profileData.profileImage,
							country: values.country,
							pincode: values.pincode,
							lat: localStorage.getItem('userLat'),
							lng: localStorage.getItem('userLng'),
							//slackUserId: values.slackUserId.toUpperCase(),
							timeZone: values.timeZone,
						},
						mutation: UPDATEREPORTERPROFILE_MUTATION,
					})
					.then((result) => {
						if (result.data.updateReporterProfile) {
							localStorage.setItem('name', values.name);
							localStorage.setItem('timeZone',values.timeZone);
							localStorage.setItem(
								'profileImage',
								uploadedFile
									? uploadedFile
									: profileData.profileImage
							);
							profileData.location = getAddress({
								address1: values.address1,
								address2: values.address2,
								city: values.city,
								state: values.state,
								country: values.country,
								pincode: values.pincode,
							});	
							profileData.phoneNumber = thisPointer.state.phoneNumber;
							profileData.name = values.name;
							profileData.email = values.email;
							profileData.address1 = values.address1;
							profileData.address2 = values.address2;
							profileData.city = values.city;
							profileData.state = values.state;
							profileData.country = values.country;
							profileData.pincode = values.pincode;
							// profileData.slackUserId = values.slackUserId.toUpperCase();
							profileData.profileImage =
								localStorage.getItem('profileImage') !== 'null'
									? localStorage.getItem('profileImage')
									: null;
							profileData.timeZone = values.timeZone;
						
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
								content: result.data.updateReporterProfile.message,
							});
							thisPointer.setState({
								editProfile: true,
								profileData: profileData,
								isLoading:false
							});
						}
					})
					.catch((error) => {
						thisPointer.setState({isLoading : false})
						if (error.graphQLErrors && error.graphQLErrors.length > 0) {
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
		const onFinish = async (values) => {
			try {
				const { client } = this.props;
				this.setState({isLoading:true})
				let thisPointer = this;
				let profileData = this.state.profileData;
				let url = null;
				let uploadedFile = null;
				if (this.state.imageUrl) {
					url = await gateUploadUrlHandler();

					uploadedFile = url ? await uploadFile(url) : '';
					//uploadedFile = uploadedFile.split('thenewstream.com/')[1];
				}
				client
					.mutate({
						variables: {
							phoneNumber: this.state.phoneNumber,
							name: values.name,
							email: values.email,
							address1: values.address1,
							address2: values.address2,
							city: values.city,
							state: values.state,
							profileImage: uploadedFile || profileData.profileImage,
							country: values.country,
							pincode: values.pincode,
							lat: localStorage.getItem('userLat'),
							lng: localStorage.getItem('userLng'),
							// slackUserId: values.slackUserId.toUpperCase(),
							timeZone: values.timeZone,
						},
						mutation: UPDATE_PROFILE,
					})
					.then((result) => {
						if (result.data.updateJournalistProfile.status) {
							localStorage.setItem('name', values.name);
							localStorage.setItem(
								'profileImage',
								uploadedFile
									?uploadedFile
									: profileData.profileImage
							);
							localStorage.setItem('timeZone',values.timeZone);
							profileData.location = getAddress({
								address1: values.address1,
								address2: values.address2,
								city: values.city,
								state: values.state,
								country: values.country,
								pincode: values.pincode,
							});
							profileData.phoneNumber = thisPointer.state.phoneNumber;
							profileData.name = values.name;
							profileData.email = values.email;
							profileData.address1 = values.address1;
							profileData.address2 = values.address2;
							profileData.city = values.city;
							profileData.state = values.state;
							profileData.country = values.country;
							profileData.pincode = values.pincode;
							//profileData.slackUserId = values.slackUserId.toUpperCase();
							profileData.profileImage =
								localStorage.getItem('profileImage') !== 'null'
									? localStorage.getItem('profileImage')
									: null;
							profileData.timeZone = values.timeZone;
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
								content: result.data.updateJournalistProfile.message,
							});
							thisPointer.setState({
								editProfile: true,
								profileData: profileData,
								isLoading:false
							});
						}
					})
					.catch((error) => {
						if (error.graphQLErrors && error.graphQLErrors.length > 0) {
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
		const onFinishFailed = (errorInfo) => {
			errorInfo.errorFields.map((data) => {
				analytics.logEvent(data.name[0], {
					action: 'inError',
					label: 'message',
					value: data.errors[0],
				});
			});
		};

		return (
			<React.Fragment>
				{this.state.profileData ? (
					<Card className="rightSideSetting myProfile_blk">
						{this.state.editProfile && (
							<div className="text-right mb-2 mb-lg-4">
								<Button
									type="primary"
									shape="round"
									onClick={this.oneditProfile}>
									<EditOutlined /> Edit Profile
								</Button>
							</div>
						)}
						{/* {console.log(COULDBASEURL + this.state.profileData.profileImage,"LLLLLLLLLLLLLLLL")} */}

						{this.state.editProfile && (
							<>
								<div className="myProfileDet">
									<div className="d-flex align-items-center mb-0 mb-lg-4 pb-2">
											<div className="">
												<ProfileAvatar
													shape="round"
													size={80}
													name={this.state.profileData.name}
													imageUrl={this.state.profileData.profileImage ? COULDBASEURL + this.state.profileData.profileImage :  this.state.profileData.profileImage}
												/>
											</div>
										
										<div className="d-flex flex-column pl-2 pl-lg-5">
											<h4>{this.state.profileData.name}</h4>
											{this.state.profileData.location && (
												<div className="profileLocation">
													<EnvironmentOutlined className="mr-2 mt-1" />
													{this.state.profileData.location}
												</div>
											)}
										</div>
									</div>
								</div>
								<hr />
							</>
						)}

						<div className="myProfileDetails">
							{this.state.editProfile ? (
								<div>
									<div className="profileTitle">General Information</div>
									<div className="pr-lg-3 pl-lg-3 pl-0 pr-0">
										<Row gutter={20}>
											<Col
												lg={8}
												sm={12}
												xs={24}
												className="pb-1 pt-1 pb-lg-3 pt-lg-3">
												<div className="profilelabel">Email Address</div>
												<div className="profiletxt">
													{this.state.profileData.email}
												</div>
											</Col>
											<Col
												lg={8}
												sm={12}
												xs={24}
												className="pb-1 pt-1 pb-lg-3 pt-lg-3">
												<div className="profilelabel">Phone Number</div>
												<div className="profiletxt">
													<a href={"tel:"+this.state.phoneNumber}>{this.state.phoneNumber}</a>
												</div>
											</Col>
											{/* <Col
												lg={8}
												sm={12}
												xs={24}
												className="pb-1 pt-1 pb-lg-3 pt-lg-3">
												<div className="profilelabel">Slack Member Id</div>
												<div className="profiletxt">
													{this.state.profileData.slackUserId}
												</div>
											</Col> */}
											{/* {localStorage.getItem("role") === 'journalist' && <Col
												lg={8}
												sm={12}
												xs={24}
												className="pb-1 pt-1 pb-lg-3 pt-lg-3">
												<div className="profilelabel">Managing Editor</div>
												<div className="profiletxt">
													{this.state.profileData.isManager ? 'Yes' : 'No'}
												</div>
											</Col>} */}
											<Col
												lg={8}
												sm={12}
												xs={24}
												className="pb-1 pt-1 pb-lg-3 pt-lg-3">
												<div className="profilelabel">Timezone</div>
												<div className="profiletxt">
													{this.state.profileData.timeZone}
												</div>
											</Col>
											{/* <Col
												lg={8}
												sm={12}
												xs={24}
												className="pb-1 pt-1 pb-lg-3 pt-lg-3">
												<div className="profilelabel">Password</div>
												<div className="profiletxt">*************</div>
											</Col> */}
										</Row>
									</div>
								
									{/* {localStorage.getItem("role") === 'journalist' &&<> */}
										{/* <hr />
										<div className="pt-3 pb-3 pr-lg-3 pl-lg-3 pl-0 pr-0">
										<div className="requestStatus d-flex flex-row align-items-center">
											<div className="requestStatus_blk completed">
												<h1>{this.state.profileData.completedRequest} </h1>
												<span>Completed Request</span>
											</div>
											<div className="requestStatus_blk ongoing">
												<h1>{this.state.profileData.ongoingRequest}</h1>
												<span>Ongoing Request</span>
											</div>
										</div>
									</div></>} */}
									{/* <hr />
									<div className="profileTitle">My Contract</div>
									<div className="pt-3 pb-3">
										<Table
											className="commontable applicantList"
											pagination={{
												defaultPageSize: 10,
												hideOnSinglePage: true,
											}}
											dataSource={this.state.contractData}
											loading={this.state.dataLoading}>
											<Column
												title="Document Title"
												key="title"
												dataIndex="title"
												ellipsis="true"
												sorter={{
													compare: (a, b) =>
														(a.contract.name.toLowerCase() >
															b.contract.name.toLowerCase()) *
															2 -
														1,
													multiple: 3,
												}}
												render={(rowData, record) => (
													<React.Fragment>
														{record.contract.name}
													</React.Fragment>
												)}
											/>
											<Column
												title="Version"
												key="title"
												dataIndex="title"
												sorter={{
													compare: (a, b) =>
														a.contract.version - b.contract.version,
													multiple: 3,
												}}
												render={(rowData, record) => (
													<React.Fragment>
														{record.contract.version}
													</React.Fragment>
												)}
											/>
											<Column
												title="Assigned Date"
												key="createdDate"
												dataIndex="title"
												sorter={{
													compare: (a, b) => a.createdDate - b.createdDate,
													multiple: 3,
												}}
												render={(createdBy, record) => (
													<React.Fragment>
														{moment(
															new Date(parseFloat(record.createdDate))
														).format('MM/DD/YYYY')}
													</React.Fragment>
												)}
											/>
											<Column
												title="Signed"
												dataIndex="signed"
												dataIndex="title"
												sorter={{
													compare: (a, b) => a.signedDate - b.signedDate,
													multiple: 3,
												}}
												key="signed"
												render={(signed, record) => (
													<React.Fragment>
														{record.signed
															? 'signed (' +
															  moment(
																	new Date(parseFloat(record.signedDate))
															  ).format('MM/DD/YYYY') +
															  ')'
															: 'Not Signed'}
													</React.Fragment>
												)}
											/>

											<Column
												className="text-center"
												title="Action"
												key="signed"
												render={(signed, record) => (
													<React.Fragment>
														{record.signed == true ? (
															record.contractPdf ? (
																<Button
																	className="downloadbtn"
																	type="primary"
																	shape="round"
																	title="Download"
																	onClick={(e) =>
																		this.onDownloadContract(record.contractPdf)
																	}
																	icon={
																		<CustIcon type="downloadicon1" />
																	}></Button>
															) : (
																'Not Signed'
															)
														) : (
															<Link to="/contracts">View & Sign </Link>
														)}
													</React.Fragment>
												)}
											/>
										</Table>
									</div> */}
									{localStorage.getItem('role') == 'reporter' && 
									<><hr />
									<div className="profileTitle">My Invoice</div>
									<div className="pt-3 pb-3">
										<MyInvoice />
									</div></>}
								</div>
							) : (
							
								<div>
										{/* {console.log("object")} */}
									<Form
										layout="vertical"
										initialValues={this.state.profileData}
										className="myProfileForm"
										onFinish={
											localStorage.getItem('role') === 'journalist'
												? onFinish
												: onReporterSubmit
										}
										onFinishFailed={onFinishFailed}>
										<Row gutter={20} className="onFinishmyProfileDetails">
											<Col xl={3} lg={4} md={6} xs={24} className="mb-2">
												<Upload
													name="avatar"
													listType="picture-card"
													className="avatar-uploader"
													showUploadList={false}
													customRequest={dummyRequest}
													beforeUpload={this.beforeUpload}
													onChange={e => this.handleChange(e)}>
													{
														this.state.imageUrl ||
														this.state.profileData.profileImage ? (
															// <ProfileAvatar
															// 	shape="square"
															// 	size={78}
															// 	name={this.state.profileData.name}
															// 	// imageUrl={
															// 	//	 this.state.imageUrl
															// 		 //||
															// 	// 	this.state.profileData.profileImage
															// 	// }
															// />
															<div>
																{/* {console.log(COULDBASEURL + this.state.profileData.profileImage,"TTTTTTTTTTTTTTTTTTTT")} */}
															<img
																src={
																	this.state.imageUrl ||
																	COULDBASEURL + this.state.profileData.profileImage
																}
																alt="avatar"
																style={{ width: '100%' }}
															/>
															<div className="profileCamera"><CameraFilled /></div>
															</div>

														) : (
															<div>
																<PlusOutlined />
																<div className="ant-upload-text">Upload</div>
															</div>
														)
													}
												</Upload>
											</Col>
											<Col xl={21} lg={20} md={18} xs={24}>
												<Row gutter={30}>
													<Col md={12} xs={24}>
														<div className="ant-col ant-form-item-label d-flex flex-row">
															<label htmlFor="title" title="Title">
																Name
															</label>
															<Tooltip placement="top" title="Add your name">
																<ExclamationCircleOutlined className="infoIcon" />
															</Tooltip>
														</div>
														<Form.Item
															//label="Name"
															name="name"
															rules={[
																{
																	required: true,
																	message: 'Please enter name ',
																},
																{
																	pattern: /^[a-z A-Z]+$/i,
																	message:
																		'The entry can only contain characters',
																},
															]}>
															<Input placeholder="Enter Name" />
														</Form.Item>
													</Col>
													<Col md={12} xs={24}>
														<div className="ant-col ant-form-item-label d-flex flex-row">
															<label htmlFor="title" title="Title">
																Email Address
															</label>
															<Tooltip
																placement="top"
																title="Add email address">
																<ExclamationCircleOutlined className="infoIcon" />
															</Tooltip>
														</div>
														<Form.Item name="email">
															<Input
																placeholder="Enter email address"
																disabled
															/>
														</Form.Item>
													</Col>
													<Col md={12} xs={24} className="phoneNumber">
														<div className="ant-col ant-form-item-label d-flex flex-row">
															<label htmlFor="title" title="Title">
																Phone Number
															</label>
															<Tooltip
																placement="top"
																title="Only numbers allowed. e.g. 9876543210">
																<ExclamationCircleOutlined className="infoIcon" />
															</Tooltip>
														</div>
														<Form.Item
															name="phoneNumber"
															rules={[
																{
																	required: true,
																	message: 'Please enter phone number',
																},
																//{ min: 8, max: 15, message: 'Phone number must be between 8 to 15 characters' }
															]}>
															<PhoneInput
																inputStyle={{ width: '100%' }}
																country={localStorage.getItem('countryCode')}
																value={this.state.phoneNumber}
																onChange={(value, country, e, phoneNumber) =>
																	this.setState({ phoneNumber })
																}
																defaultMask={'...-...-...-...'}
															/>
														</Form.Item>
													</Col>
													{/* <Col md={12} xs={24}>
														<div className="ant-col ant-form-item-label d-flex flex-row">
															<label htmlFor="title" title="Title">
																Slack Member Id
															</label>
															<Tooltip
																placement="top"
																title="Add slack member id">
																<ExclamationCircleOutlined className="infoIcon" />
															</Tooltip>
														</div>
														<Form.Item
															name="slackUserId"
															rules={[
																{
																	required: true,
																	message: 'Please enter slack member id',
																},
																{
																	pattern: new RegExp(
																		'[UuWw]([a-zA-Z0-9]{8}|[a-zA-Z0-9]{10})'
																	),
																	message: 'Enter valid slack member id',
																},
																{
																	max: 11,
																	message: 'Enter valid slack member id',
																},
															]}>
															<Input placeholder="Enter your Slack Member Id" />
														</Form.Item>
													</Col> */}
													<Col md={12} xs={24}>
														<div className="ant-col ant-form-item-label d-flex flex-row">
															<label htmlFor="title" title="Title">
																Address1
															</label>
															<Tooltip placement="top" title="Add address">
																<ExclamationCircleOutlined className="infoIcon" />
															</Tooltip>
														</div>
														<Form.Item
															name="address1"
															rules={[
																{
																	required: true,
																	message: 'Please enter address 1',
																},
																{
																	min: 3,
																	message:
																		'Address must have atleast 3 characters',
																},
																{
																	pattern: /([A-z0-9\u0080-\u024F/ \\-])\w+/gi,
																	message: 'Invalid Address format',
																},
															]}>
															<Input placeholder="Enter address1" />
														</Form.Item>
													</Col>
													<Col md={12} xs={24}>
														<div className="ant-col ant-form-item-label d-flex flex-row">
															<label htmlFor="title" title="Title">
																Address2
															</label>
															<Tooltip placement="top" title="Add address">
																<ExclamationCircleOutlined className="infoIcon" />
															</Tooltip>
														</div>
														<Form.Item
															rules={[
																{
																	pattern: /([A-z0-9\u0080-\u024F/ \\-])\w+/gi,
																	message: 'Invalid Address format',
																},
															]}
															name="address2">
															<Input placeholder="Enter address2" />
														</Form.Item>
													</Col>
													<Col md={12} xs={24}>
														<div className="ant-col ant-form-item-label d-flex flex-row">
															<label htmlFor="title" title="Title">
																City
															</label>
															<Tooltip placement="top" title="Add city name">
																<ExclamationCircleOutlined className="infoIcon" />
															</Tooltip>
														</div>
														<Form.Item
															name="city"
															rules={[
																{
																	required: true,
																	message: 'Please enter city',
																},
																{
																	pattern: /^([a-zA-Z\u0080-\u024F]+(?:. |-| |'))*[a-zA-Z\u0080-\u024F]*$/gim,
																	message: 'Invalid City Name',
																},
																{
																	min: 3,
																	message:
																		'City must have atleast 3 characters',
																},
															]}>
															<Input placeholder="Enter city" />
														</Form.Item>
													</Col>
													<Col md={12} xs={24}>
														<div className="ant-col ant-form-item-label d-flex flex-row">
															<label htmlFor="title" title="Title">
																State
															</label>
															<Tooltip placement="top" title="Add state name">
																<ExclamationCircleOutlined className="infoIcon" />
															</Tooltip>
														</div>
														<Form.Item
															name="state"
															rules={[
																{
																	required: true,
																	message: 'Please enter state',
																},
																{
																	pattern: /^[a-z A-Z]+$/i,
																	message:
																		'The entry can only contain characters',
																},
																{
																	min: 3,
																	message:
																		'State must have atleast 3 characters',
																},
															]}>
															<Input placeholder="Enter state" />
														</Form.Item>
													</Col>
													<Col md={12} xs={24}>
														<div className="ant-col ant-form-item-label d-flex flex-row">
															<label htmlFor="title" title="Title">
																Country
															</label>
															<Tooltip placement="top" title="Add country name">
																<ExclamationCircleOutlined className="infoIcon" />
															</Tooltip>
														</div>
														<Form.Item
															name="country"
															rules={[
																{
																	required: true,
																	message: 'Please enter country',
																},
																{
																	pattern: /^[a-z A-Z]+$/i,
																	message:
																		'The entry can only contain characters',
																},
																{
																	min: 3,
																	message:
																		'Country must have atleast 3 characters',
																},
															]}>
															<Input placeholder="Enter country" />
														</Form.Item>
													</Col>
													<Col md={12} xs={24}>
														<div className="ant-col ant-form-item-label d-flex flex-row">
															<label htmlFor="title" title="Title">
																Pin Code
															</label>
															<Tooltip placement="top" title="Add pincode">
																<ExclamationCircleOutlined className="infoIcon" />
															</Tooltip>
														</div>
														<Form.Item
															name="pincode"
															rules={[
																{
																	required: true,
																	message: 'Please enter pincode',
																},
																{
																	pattern: /^[A-Z0-9]+$/,
																	message:
																		'The entry can only contain numbers/upparcase letters',
																},
																{
																	min: 3,
																	max: 8,
																	message:
																		'Pincode must be between 3 to 8 characters',
																},
															]}>
															<Input placeholder="Enter pin code" />
														</Form.Item>
													</Col>
													<Col md={12} xs={24}>
														<div className="ant-col ant-form-item-label d-flex flex-row">
															<label htmlFor="title" title="Title">
																Timezone
															</label>
															<Tooltip placement="top" title="Select timezone">
																<ExclamationCircleOutlined className="infoIcon" />
															</Tooltip>
														</div>
														<Form.Item
															name="timeZone"
															rules={[
																{
																	required: true,
																	message: 'Please enter timezone',
																},
															]}>
															<Select
																showSearch
																placeholder="Select timezone"
																optionFilterProp="children"
																filterOption={(input, option) => {
																	return (
																		option.value
																			.toLowerCase()
																			.indexOf(input.toLowerCase()) >= 0
																	);
																}}>
																{this.state.timezone.map((data, index) => {
																	return (
																		<option key={index} value={data}>
																			{data}{' '}
																		</option>
																	);
																})}
															</Select>
														</Form.Item>
													</Col>
												</Row>
											</Col>
										</Row>
										<div className="text-center pt-0 pt-lg-5">
											<Form.Item>
												<Button
													type="default"
													size="large"
													onClick={() => this.setState({ editProfile: true })}>
													Cancel
												</Button>
												<Button
													className="ml-2 ml-lg-3"
													type="primary"
													size="large"
													loading={this.state.isLoading ? true : false}
													htmlType="submit">
													Save
												</Button>
											</Form.Item>
										</div>
									</Form>
								</div>
							)}
						</div>
					</Card>
				) : (
					<Loader />
				)}
			</React.Fragment>
		);
	}
}

MyProfile = withApollo(MyProfile);
export { MyProfile };
