import React, { Fragment, useState, useEffect } from 'react';
import { Row, Col, Form, Input, Button, Upload, message } from 'antd';
import Logo from '../../Assets/images/logo_newstream_v1.png';
import { FILE_UPLOADS, UPDATE_PROFILE } from '../../graphql/APIs';
import { useApolloClient } from 'react-apollo';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import './SetUpProfile.css';
import { ProfileAvatar } from '../../Components/Avatar/Avatar';
import {
	captureException as SentryError,

} from '@sentry/react';
const SetUpProfilePage = (props) => {
	const [imageObj, setImageObj] = useState({ name: null, type: null });
	const [imageUrl, setImageUrl] = useState(null);
	const [imageUploading, setImageUploading] = useState(false);
	const [uploadedFile, setUploadedFile] = useState(null);
	const [phoneNumber, setPhoneNumber] = useState(
		localStorage.getItem('phoneNumber')
	);

	//Form Variables
	const name = localStorage.getItem('name');
	const email = localStorage.getItem('email');
	const profileImage =
		localStorage.getItem('profileImage') !== 'null'
			? localStorage.getItem('profileImage')
			: null;
	const slackUserId = localStorage.getItem('slackUserId');
	const client = useApolloClient();
	const browserHistory = useHistory();

	useEffect(() => {
		uploadFileHandler();
	}, [imageUrl]);

	const uploadFileHandler = async () => {
		if (imageUrl) {
			const url = await gateUploadUrlHandler();
			const fileUploaded = await uploadFile(url);
			setUploadedFile(fileUploaded);
			setImageUploading(false);
		}
	};

	const gateUploadUrlHandler = async () => {
		return new Promise((resolve, _reject) => {
			client
				.mutate({
					variables: {
						fileName: 'journalist/' + imageObj.name,
						fileType: imageObj.type,
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
		});
	};

	const uploadFile = async (signedUrl) => {
		return new Promise((resolve, _reject) => {
			axios
				.put(signedUrl, imageObj, {
					headers: {
						'Content-Type': imageObj.type,
					},
				})
				.then(() => {
					resolve(signedUrl.split('?')[0].replace('s3.amazonaws.com/', ''));
				})
				.catch((_e) => resolve(null));
		});
	};

	const dummyRequest = ({ file,onSuccess }) => {
		setImageObj(file);
		setTimeout(() => {
			onSuccess('ok');
		}, 0);
	};

	const handleChange = (info) => {
		if (info.file.status === 'uploading') {
			setImageUploading(true);
			return;
		}
		if (info.file.status === 'done') {
			//setImageObj(info.file.originFileObj);
			getBase64(imageObj, (imageUrl) => {
				setImageUrl(imageUrl);
			});
		}
	};

	const getBase64 = (img, callback) => {
		const reader = new FileReader();
		reader.addEventListener('load', () => callback(reader.result));
		reader.readAsDataURL(img);
	};

	const beforeUpload = (file) => {
		const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
		if (!isJpgOrPng) {
			message.error('You can only upload JPG/PNG file!');
		}
		const isLt2M = file.size / 1024 / 1024 < 2;
		if (!isLt2M) {
			message.error('Image must smaller than 2MB!');
		}
		return isJpgOrPng && isLt2M;
	};

	const onProfileUpdate = (values) => {
		values.profileImage =
			uploadedFile?.split('.com/')[1] || profileImage?.split('.com/')[1] || '';
		values.slackUserId = values.slackUserId.toUpperCase();
		values.phoneNumber = phoneNumber;
		client
			.mutate({
				mutation: UPDATE_PROFILE,
				variables: values,
			})
			.then((result) => {
				if (result.data.updateJournalistProfile.status) {
					localStorage.setItem('profileImage', values.profileImage);
					localStorage.setItem('slackUserId', values.slackUserId);
					localStorage.removeItem('phoneNumber');
					if (localStorage.getItem('isContractsPending')) {
						browserHistory.push('/contracts');
					} else {
						browserHistory.push('/marketplace/inHouse');
					}
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
	};

	return (
		<Fragment>
			<div className="signupPage h-100 d-flex flex-row align-items-center justify-content-center">
				<div className="signupMain_blk">
					<div className="signUpLogo">
						<img alt="Newstream Logo" src={Logo} />
					</div>
					<div className="ant-card">
						<div className="ant-card-body p-0">
							<Row className="signupRow">
								<Col className="signupProfile_blk d-flex flex-row align-items-center justify-content-center">
									<div className="signupProfile">
										<Upload
											name="avatar"
											listType="picture-card"
											className="avatar-uploader"
											showUploadList={false}
											customRequest={dummyRequest}
											beforeUpload={beforeUpload}
											onChange={handleChange}>
											{uploadedFile || profileImage ? (
												<ProfileAvatar
													size={78}
													name={name}
													imageUrl={uploadedFile || profileImage}
												/>
											) : (
												<div>
													<div className="ant-upload-text">
														Upload
														<br />
														Profile
														<br />
														Picture
													</div>
												</div>
											)}
										</Upload>
										<h6>Setup your Profile</h6>
										<p>Add and verify your profile information</p>
									</div>
								</Col>
								<Col className="signupProfile_form">
									<Form
										layout="vertical"
										onFinish={onProfileUpdate}
										initialValues={{
											name: name,
											email: email,
											phoneNumber: phoneNumber,
											slackUserId: slackUserId,
											profileImage: profileImage,
										}}>
										<div className="row">
											<div className="col-sm-6 col-12">
												<Form.Item label="Full Name" name="name" value={name}>
													<Input defaultValue={name} disabled />
												</Form.Item>
											</div>
											<div className="col-sm-6 col-12">
												<Form.Item label="Email" name="email" value={email}>
													<Input defaultValue={email} disabled />
												</Form.Item>
											</div>
										</div>
										<div className="row">
											<div className="col-sm-6 col-12">
												<Form.Item
													label="Phone Number"
													name="phoneNumber"
													rules={[
														{
															required: true,
															message: 'Please enter your mobile number.',
														},
													]}
													extra={
														<p>
															*Please add phone number that is linked to your
															WhatsApp
														</p>
													}>
													<PhoneInput
														inputStyle={{ width: '100%' }}
														country={localStorage.getItem('countryCode')}
														value={phoneNumber}
														onChange={(value, country, e, phoneNumber) =>
															setPhoneNumber(phoneNumber)
														}
														defaultMask={'...-...-...-...'}
													/>
												</Form.Item>
											</div>
											<div className="col-sm-6 col-12">
												<Form.Item
													label="Slack Member Id"
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
													]}
													extra={
														<p>
															<p>
																*Please add Slack Member Id for{' '}
																<strong>newstream</strong> workspace
															</p>
														</p>
													}>
													<Input placeholder="Slack Member Id" />
												</Form.Item>
											</div>
										</div>
										<div className="row">
											<div className="col-sm-6 col-12">
												<Form.Item
													className="mb-2"
													label="Address1"
													name="address1"
													rules={[
														{
															required: true,
															message: 'Please enter address 1',
														},
														{
															min: 3,
															message: 'Address must have atleast 3 characters',
														},
														{
															pattern: /([A-z0-9\u0080-\u024F/ \\-])\w+/gi,
															message: 'Invalid Address format',
														},
													]}>
													<Input placeholder="Enter address1" />
												</Form.Item>
											</div>
											<div className="col-sm-6 col-12">
												<Form.Item
													className="mb-2"
													label="Address2"
													name="address2"
													rules={[
														{
															pattern: /([A-z0-9\u0080-\u024F/ \\-])\w+/gi,
															message: 'Invalid Address format',
														},
													]}>
													<Input placeholder="Enter address2" />
												</Form.Item>
											</div>
										</div>
										<div className="row">
											<div className="col-sm-6 col-12">
												<Form.Item
													className="mb-2"
													label="City"
													name="city"
													rules={[
														{ required: true, message: 'Please enter city' },
														{
															pattern: /^([a-zA-Z\u0080-\u024F]+(?:. |-| |'))*[a-zA-Z\u0080-\u024F]*$/gim,
															message: 'Invalid City Name',
														},
														{
															min: 3,
															message: 'City must have atleast 3 characters',
														},
													]}>
													<Input placeholder="Enter city" />
												</Form.Item>
											</div>
											<div className="col-sm-6 col-12">
												<Form.Item
													className="mb-2"
													label="State"
													name="state"
													rules={[
														{ required: true, message: 'Please enter state' },
														{
															pattern: /^[a-z A-Z]+$/i,
															message: 'The entry can only contain characters',
														},
														{
															min: 3,
															message: 'State must have atleast 3 characters',
														},
													]}>
													<Input placeholder="Enter state" />
												</Form.Item>
											</div>
										</div>
										<div className="row">
											<div className="col-sm-6 col-12">
												<Form.Item
													className="mb-2"
													label="Country"
													name="country"
													rules={[
														{ required: true, message: 'Please enter country' },
														{
															pattern: /^[a-z A-Z]+$/i,
															message: 'The entry can only contain characters',
														},
														{
															min: 3,
															message: 'Country must have atleast 3 characters',
														},
													]}>
													<Input placeholder="Enter country" />
												</Form.Item>
											</div>
											<div className="col-sm-6 col-12">
												<Form.Item
													className="mb-2"
													label="Pin Code"
													name="pincode"
													rules={[
														{ required: true, message: 'Please enter pincode' },
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
											</div>
										</div>
										<Form.Item className="mt-3">
											<Button
												type="primary"
												shape="round"
												htmlType="submit"
												loading={imageUploading}>
												{imageUploading ? 'Uploading Image' : 'Submit'}
											</Button>
										</Form.Item>
									</Form>
								</Col>
							</Row>
						</div>
					</div>
				</div>
			</div>
		</Fragment>
	);
};

export { SetUpProfilePage };
